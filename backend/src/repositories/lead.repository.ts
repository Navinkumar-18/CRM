import { BaseRepository } from './base.repository';

class LeadRepository extends BaseRepository {
  constructor() {
    super('leads');
  }
}

export const leadRepository = new LeadRepository();
