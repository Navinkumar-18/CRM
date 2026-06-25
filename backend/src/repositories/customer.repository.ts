import { BaseRepository } from './base.repository';

class CustomerRepository extends BaseRepository {
  constructor() {
    super('customers');
  }
}

export const customerRepository = new CustomerRepository();
