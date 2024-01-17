import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }
  //
  // getTasksWithFilters(filterDto: GetTasksFilterDto) {
  //   const { status, search } = filterDto;
  //
  //   let tasks = this.getAllTasks();
  //
  //   if (status) {
  //     tasks = tasks.filter((task) => task.status === status);
  //   }
  //   if (search) {
  //     tasks = tasks.filter(
  //       (task) => task.title.includes(search) || task.descr.includes(search),
  //     );
  //   }
  //   return tasks;
  // }
  //

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found!`);
    }
    return found;
  }

  // getTaskById(id: string): Task {
  //   const found = this.tasks.find((task) => task.id === id);
  //
  //   if (!found) {
  //     throw new NotFoundException(`Task with ID "${id}" not found!`);
  //   }
  //
  //   return found;
  // }
  //

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  // createTask(createTaskDto: CreateTaskDto): Task {
  //   const { title, descr } = createTaskDto;
  //
  //   const task: Task = {
  //     id: uuid(),
  //     title,
  //     descr,
  //     status: TaskStatus.OPEN,
  //   };
  //
  //   this.tasks.push(task);
  //   return task;
  // }
  //

  async deleteTask(id: number, user: User) {
    const result = await this.taskRepository.delete({ id, userId: user.id });
    console.log(result);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found!`);
    }
  }

  // deleteTaskById(id: string) {
  //   const found = this.getTaskById(id);
  //   this.tasks = this.tasks.filter((task) => task.id !== found.id);
  // }
  //

  async updateTaskStatus(id: number, status: TaskStatus, user: User) {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }

  // updateStatus(id: string, status: TaskStatus) {
  //   return (this.tasks.find((task) => task.id === id).status = status);
  // }
}
