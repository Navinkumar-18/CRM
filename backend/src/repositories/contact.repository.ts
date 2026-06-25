import { BaseRepository } from './base.repository';

export class ContactRepository extends BaseRepository {
  constructor() {
    super('contacts');
  }
}

export const contactRepository = new ContactRepository();
