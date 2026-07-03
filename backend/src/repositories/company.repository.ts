import { BaseRepository } from './base.repository';

export class CompanyRepository extends BaseRepository {
  constructor() {
    super('companies', 'owner_id');
  }
}

export const companyRepository = new CompanyRepository();
