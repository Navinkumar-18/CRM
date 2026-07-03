import { noteRepository } from '../repositories/note.repository';
import { leadRepository } from '../repositories/lead.repository';
import { dealRepository } from '../repositories/deal.repository';
import { contactRepository } from '../repositories/contact.repository';
import { companyRepository } from '../repositories/company.repository';
import { AuthUser } from '../types/database';
import { logActivity } from './activity.service';
import { CreateNoteInput, UpdateNoteInput } from '../schemas/note.schema';
import { ForbiddenError } from '../utils/AppError';

export const getNotes = async (
  user: AuthUser,
  filters: {
    lead_id?: string;
    deal_id?: string;
    contact_id?: string;
    company_id?: string;
  },
  page: number,
  limit: number,
) => {
  if (filters.lead_id) {
    const parent = await leadRepository.findByIdScoped(filters.lead_id, user);
    if (!parent) throw new ForbiddenError('Access denied to parent entity');
  }
  if (filters.deal_id) {
    const parent = await dealRepository.findByIdScoped(filters.deal_id, user);
    if (!parent) throw new ForbiddenError('Access denied to parent entity');
  }
  if (filters.contact_id) {
    const parent = await contactRepository.findByIdScoped(
      filters.contact_id,
      user,
    );
    if (!parent) throw new ForbiddenError('Access denied to parent entity');
  }
  if (filters.company_id) {
    const parent = await companyRepository.findByIdScoped(
      filters.company_id,
      user,
    );
    if (!parent) throw new ForbiddenError('Access denied to parent entity');
  }

  return noteRepository.findAll(user, filters, page, limit);
};

export const createNote = async (user: AuthUser, body: CreateNoteInput) => {
  if (body.lead_id) {
    const parent = await leadRepository.findByIdScoped(body.lead_id, user);
    if (!parent) throw new ForbiddenError('Access denied to parent entity');
  }
  if (body.deal_id) {
    const parent = await dealRepository.findByIdScoped(body.deal_id, user);
    if (!parent) throw new ForbiddenError('Access denied to parent entity');
  }
  if (body.contact_id) {
    const parent = await contactRepository.findByIdScoped(
      body.contact_id,
      user,
    );
    if (!parent) throw new ForbiddenError('Access denied to parent entity');
  }
  if (body.company_id) {
    const parent = await companyRepository.findByIdScoped(
      body.company_id,
      user,
    );
    if (!parent) throw new ForbiddenError('Access denied to parent entity');
  }

  const data = await noteRepository.create({
    body: body.body,
    author_id: user.id,
    lead_id: body.lead_id || null,
    deal_id: body.deal_id || null,
    contact_id: body.contact_id || null,
    company_id: body.company_id || null,
  });

  // Determine the parent entity name for the activity log
  const entityRef = body.lead_id
    ? `lead ${body.lead_id}`
    : body.deal_id
      ? `deal ${body.deal_id}`
      : body.contact_id
        ? `contact ${body.contact_id}`
        : `company ${body.company_id}`;

  void logActivity({
    type: 'note_added',
    userId: user.id,
    description: `Added note to ${entityRef}`,
    leadId: body.lead_id,
    dealId: body.deal_id,
    contactId: body.contact_id,
    companyId: body.company_id,
  });

  return data;
};

export const updateNote = async (
  user: AuthUser,
  id: string,
  body: UpdateNoteInput,
) => {
  return noteRepository.update(id, user.id, body.body);
};

export const deleteNote = async (user: AuthUser, id: string) => {
  await noteRepository.remove(id, user);
};
