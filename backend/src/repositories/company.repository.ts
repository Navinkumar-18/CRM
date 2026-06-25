import { BaseRepository } from './base.repository';

export class CompanyRepository extends BaseRepository {
  constructor() {
    super('companies');
  }
}

export const companyRepository = new CompanyRepository();
