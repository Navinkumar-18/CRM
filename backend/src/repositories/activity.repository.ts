import { BaseRepository } from './base.repository';

class ActivityRepository extends BaseRepository {
  constructor() {
    super('activities');
  }
}

export const activityRepository = new ActivityRepository();
