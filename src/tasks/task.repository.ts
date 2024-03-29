import { DataSource, Repository } from 'typeorm';
import { Task } from './task.entity';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';
import { use } from 'passport';

@Injectable()
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');
  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere('(task.title LIKE :search OR task.descr LIKE :search)', {
        search: `%${search}%`,
      });
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (e) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }", Filters: ${JSON.stringify(filterDto)}`,
        e.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, descr } = createTaskDto;

    const task = new Task();
    task.title = title;
    task.descr = descr;
    task.status = TaskStatus.OPEN;
    task.user = user;
    try {
      await task.save();
    } catch (e) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }", Data: ${JSON.stringify(createTaskDto)}`,
        e.stack,
      );
      throw new InternalServerErrorException();
    }

    delete task.user;
    return task;
  }
}
