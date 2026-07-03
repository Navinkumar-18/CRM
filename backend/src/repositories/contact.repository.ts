import { BaseRepository } from './base.repository';

export class ContactRepository extends BaseRepository {
  constructor() {
    super('contacts', 'owner_id');
  }
}

export const contactRepository = new ContactRepository();
