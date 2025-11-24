import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(taskId: string, userId: string, dto: CreateCommentDto) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['column', 'column.project', 'column.project.owner'],
    });

    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    const mentionUsers: User[] = [];
    if (dto.mentionIds && dto.mentionIds.length > 0) {
      const users = await this.userRepo.find({
        where: { id: In(dto.mentionIds) },
      });
      mentionUsers.push(...users);
    }

    const comment = this.commentRepo.create({
      content: dto.content,
      userId,
      taskId,
      fileUrl: dto.fileUrl,
      mentions: mentionUsers,
    });

    const saved = await this.commentRepo.save(comment);

    if (mentionUsers.length > 0) {
      this.sendMentionNotification(mentionUsers.map((u) => u.id), saved);
    }

    return this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['user', 'mentions'],
    });
  }

  async findAll(taskId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentRepo.findAndCount({
      where: { taskId },
      relations: ['user', 'mentions'],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'mentions', 'task'],
    });

    if (!comment) {
      throw new NotFoundException('Comment không tồn tại');
    }

    return comment;
  }

  async update(id: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment không tồn tại');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('Chỉ người tạo mới có thể chỉnh sửa');
    }

    if (dto.content) {
      comment.content = dto.content;
    }

    if (dto.fileUrl !== undefined) {
      comment.fileUrl = dto.fileUrl;
    }

    if (dto.mentionIds) {
      const mentionUsers = await this.userRepo.find({
        where: { id: In(dto.mentionIds) },
      });
      comment.mentions = mentionUsers;

      if (mentionUsers.length > 0) {
        this.sendMentionNotification(mentionUsers.map((u) => u.id), comment);
      }
    }

    const saved = await this.commentRepo.save(comment);

    return this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['user', 'mentions'],
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.task', 'task')
      .leftJoinAndSelect('task.column', 'column')
      .leftJoinAndSelect('column.project', 'project')
      .leftJoinAndSelect('project.owner', 'owner')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException('Comment không tồn tại');
    }

    const projectOwnerId = (comment.task as any)?.column?.project?.owner?.id || null;

    if (comment.userId !== userId && projectOwnerId !== userId) {
      throw new ForbiddenException(
        'Chỉ người tạo hoặc chủ dự án mới có thể xóa',
      );
    }

    await this.commentRepo.remove(comment);
    return { message: 'Đã xóa comment thành công' };
  }

  detectMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];
    return matches.map((match) => match.substring(1));
  }

  sendMentionNotification(mentionedUserIds: string[], comment: Comment) {
    console.log(
      `[Notification] Users ${mentionedUserIds.join(', ')} được mention trong comment ${comment.id}`,
    );
  }
}

