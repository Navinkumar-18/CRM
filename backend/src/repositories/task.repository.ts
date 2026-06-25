import { BaseRepository } from './base.repository';

class TaskRepository extends BaseRepository {
  constructor() {
    super('tasks');
  }
}

export const taskRepository = new TaskRepository();
