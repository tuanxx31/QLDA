import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';

const uploadsDir = join(process.cwd(), 'uploads');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@ApiTags('Comments')
@Controller('tasks/:taskId/comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách bình luận của task' })
  @ApiResponse({ status: 200, description: 'Danh sách bình luận đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Param('taskId') taskId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.commentsService.findAll(taskId, pageNum, limitNum);
  }

  @Post()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Tạo bình luận mới' })
  @ApiResponse({ status: 201, description: 'Bình luận đã được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub ?? null;
    return this.commentsService.create(taskId, userId, dto);
  }

  @Patch(':commentId')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Chỉnh sửa bình luận' })
  @ApiResponse({ status: 200, description: 'Bình luận đã được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Chỉ người tạo mới có thể sửa' })
  update(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub ?? null;
    return this.commentsService.update(commentId, userId, dto);
  }

  @Delete(':commentId')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa bình luận' })
  @ApiResponse({ status: 200, description: 'Bình luận đã được xóa thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Chỉ người tạo hoặc chủ dự án mới có thể xóa' })
  remove(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.sub ?? null;
    return this.commentsService.remove(commentId, userId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `comment-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        const allowedExts = /\.(jpg|jpeg|png|pdf|docx|xlsx)$/i;
        
        if (allowedExts.test(file.originalname) || allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Chỉ chấp nhận file: jpg, png, pdf, docx, xlsx'), false);
        }
      },
    }),
  )
  @ApiBearerAuth('jwt')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload file đính kèm cho bình luận' })
  @ApiResponse({ status: 201, description: 'File đã được upload thành công' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  uploadFile(
    @Param('taskId') taskId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File không được tìm thấy');
    }
    const fileUrl = `/uploads/${file.filename}`;
    return { fileUrl, filename: file.originalname, size: file.size };
  }
}

