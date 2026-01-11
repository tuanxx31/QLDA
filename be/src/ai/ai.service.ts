import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import OpenAI from 'openai';
import { Task } from '../tasks/entities/task.entity';
import {
    ScheduleSuggestionResponse,
    WorkloadAnalysisResponse,
    TaskSuggestion,
} from './dto/suggest-schedule.dto';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Task)
        private taskRepo: Repository<Task>,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY not configured - AI features will be disabled');
        } else {
            this.openai = new OpenAI({ apiKey });
        }
    }

    
    private async getUserTasksForDate(userId: string, date: Date): Promise<Task[]> {
        this.logger.log(`Getting tasks for user ${userId} on date ${date.toISOString()}`);

        
        const tasks = await this.taskRepo
            .createQueryBuilder('task')
            .innerJoin('task.assignees', 'assignee', 'assignee.id = :userId', { userId })
            .leftJoinAndSelect('task.column', 'column')
            .leftJoinAndSelect('column.project', 'project')
            .leftJoinAndSelect('task.labels', 'labels')
            .where('task.status != :doneStatus', { doneStatus: 'done' })
            .andWhere('task.dueDate IS NOT NULL')
            .orderBy('task.priority', 'DESC')
            .addOrderBy('task.dueDate', 'ASC')
            .getMany();

        this.logger.log(`Found ${tasks.length} non-done tasks for user ${userId}`);
        tasks.forEach(t => {
            this.logger.log(`Task: "${t.title}", startDate: ${t.startDate?.toISOString()}, dueDate: ${t.dueDate?.toISOString()}, status: ${t.status}`);
        });

        return tasks;
    }

    
    private async getUserTasksForRange(
        userId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<Task[]> {
        const tasks = await this.taskRepo
            .createQueryBuilder('task')
            .innerJoin('task.assignees', 'assignee', 'assignee.id = :userId', { userId })
            .leftJoinAndSelect('task.column', 'column')
            .leftJoinAndSelect('column.project', 'project')
            .leftJoinAndSelect('task.labels', 'labels')
            .andWhere(
                '((task.startDate BETWEEN :startDate AND :endDate) OR (task.dueDate BETWEEN :startDate AND :endDate) OR (task.startDate <= :startDate AND task.dueDate >= :endDate))',
                { startDate, endDate },
            )
            .orderBy('task.dueDate', 'ASC')
            .getMany();

        return tasks;
    }

    
    async suggestDailySchedule(
        userId: string,
        date: Date,
    ): Promise<ScheduleSuggestionResponse> {
        if (!this.openai) {
            throw new HttpException(
                'AI service is not configured. Please set OPENAI_API_KEY.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        const tasks = await this.getUserTasksForDate(userId, date);

        if (tasks.length === 0) {
            return {
                suggestions: [],
                warnings: [],
                summary: 'Không có task nào cần làm trong ngày hôm nay. Bạn có thể nghỉ ngơi hoặc làm việc trước các task sắp tới!',
            };
        }

        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });

        const tasksInfo = tasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            dueDate: t.dueDate?.toISOString().split('T')[0] || 'Không có',
            startDate: t.startDate?.toISOString().split('T')[0] || 'Không có',
            status: t.status,
            projectName: t.column?.project?.name || 'Không xác định',
            labels: t.labels?.map((l) => l.name) || [],
        }));

        const prompt = `Bạn là trợ lý lập kế hoạch công việc cho sinh viên.

NHIỆM VỤ: Sắp xếp các task sau theo thứ tự ưu tiên để làm trong ngày hôm nay.

CONTEXT:
- Ngày hiện tại: ${currentDate}
- Giờ hiện tại: ${currentTime}


DANH SÁCH TASKS:
${JSON.stringify(tasksInfo, null, 2)}

YÊU CẦU:
1. Sắp xếp theo thứ tự nên làm từ sáng đến tối
2. Giải thích ngắn gọn lý do cho mỗi task (bằng tiếng Việt)
3. Cảnh báo nếu có task không kịp deadline
4. Đề xuất task nào có thể dời sang ngày khác

RESPONSE FORMAT (JSON only, no markdown):
{
  "suggestions": [
    {
      "taskId": "xxx",
      "taskTitle": "Task name",
      "order": 1,
      "suggestedStartTime": "09:00",
      "reason": "Deadline hôm nay, cần làm ngay",
      "priority": "high"
    }
  ],
  "warnings": ["Task X có thể không kịp deadline"],
  "summary": "Có 5 task cần làm hôm nay, ưu tiên 2 task deadline gấp"
}`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'Bạn là trợ lý AI chuyên về quản lý thời gian và lập kế hoạch công việc. Luôn trả lời bằng tiếng Việt. Chỉ trả về JSON hợp lệ, không có markdown hay text thêm.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            });

            const content = response.choices[0]?.message?.content || '';

            
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.slice(7);
            } else if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.slice(3);
            }
            if (cleanContent.endsWith('```')) {
                cleanContent = cleanContent.slice(0, -3);
            }
            cleanContent = cleanContent.trim();

            const result: ScheduleSuggestionResponse = JSON.parse(cleanContent);
            return result;
        } catch (error) {
            this.logger.error('Error calling OpenAI:', error);

            
            const fallbackSuggestions: TaskSuggestion[] = tasks.map((task, index) => ({
                taskId: task.id,
                taskTitle: task.title,
                order: index + 1,
                suggestedStartTime: `${8 + index * 2}:00`,
                reason: this.getPriorityReason(task),
                priority: task.priority,
            }));

            return {
                suggestions: fallbackSuggestions,
                warnings: tasks
                    .filter((t) => t.dueDate && new Date(t.dueDate) <= new Date())
                    .map((t) => `Task "${t.title}" đã qua deadline!`),
                summary: `Có ${tasks.length} task cần làm. Đã sắp xếp theo độ ưu tiên (AI tạm thời không khả dụng).`,
            };
        }
    }

    private getPriorityReason(task: Task): string {
        const now = new Date();
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;

        if (dueDate) {
            const diffDays = Math.ceil(
                (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (diffDays < 0) {
                return 'Đã quá deadline! Cần hoàn thành ngay.';
            } else if (diffDays === 0) {
                return 'Deadline hôm nay, ưu tiên cao.';
            } else if (diffDays === 1) {
                return 'Deadline ngày mai, nên hoàn thành sớm.';
            } else if (diffDays <= 3) {
                return 'Còn vài ngày, có thể linh hoạt.';
            }
        }

        switch (task.priority) {
            case 'high':
                return 'Độ ưu tiên cao, nên làm sớm.';
            case 'medium':
                return 'Độ ưu tiên trung bình.';
            default:
                return 'Độ ưu tiên thấp, có thể dời nếu cần.';
        }
    }

    
    async analyzeWorkload(
        userId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<WorkloadAnalysisResponse> {
        const tasks = await this.getUserTasksForRange(userId, startDate, endDate);
        const now = new Date();

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'done').length;
        const overdueTasks = tasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done',
        ).length;

        
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const upcomingDeadlines = tasks
            .filter(
                (t) =>
                    t.dueDate &&
                    new Date(t.dueDate) >= now &&
                    new Date(t.dueDate) <= threeDaysFromNow &&
                    t.status !== 'done',
            )
            .map((t) => ({
                taskId: t.id,
                taskTitle: t.title,
                dueDate: t.dueDate!.toISOString().split('T')[0],
                priority: t.priority,
            }));

        
        const pendingTasks = totalTasks - completedTasks;
        const daysInRange = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const tasksPerDay = pendingTasks / daysInRange;

        let workloadLevel: 'low' | 'medium' | 'high' | 'overloaded';
        if (tasksPerDay <= 2) {
            workloadLevel = 'low';
        } else if (tasksPerDay <= 4) {
            workloadLevel = 'medium';
        } else if (tasksPerDay <= 6) {
            workloadLevel = 'high';
        } else {
            workloadLevel = 'overloaded';
        }

        
        const recommendations: string[] = [];

        if (overdueTasks > 0) {
            recommendations.push(
                `Bạn có ${overdueTasks} task đã quá hạn. Hãy ưu tiên hoàn thành ngay!`,
            );
        }

        if (upcomingDeadlines.length > 0) {
            const highPriorityCount = upcomingDeadlines.filter(
                (t) => t.priority === 'high',
            ).length;
            if (highPriorityCount > 0) {
                recommendations.push(
                    `Có ${highPriorityCount} task quan trọng sắp đến hạn trong 3 ngày tới.`,
                );
            }
        }

        if (workloadLevel === 'overloaded') {
            recommendations.push(
                'Khối lượng công việc quá lớn. Hãy xem xét dời một số task hoặc chia sẻ với người khác.',
            );
        } else if (workloadLevel === 'high') {
            recommendations.push(
                'Khối lượng công việc khá nhiều. Hãy tập trung vào các task ưu tiên cao.',
            );
        } else if (workloadLevel === 'low') {
            recommendations.push(
                'Khối lượng công việc nhẹ. Bạn có thể nhận thêm task hoặc làm trước các công việc sắp tới.',
            );
        }

        return {
            totalTasks,
            completedTasks,
            overdueTasks,
            upcomingDeadlines,
            workloadLevel,
            recommendations,
        };
    }
}
