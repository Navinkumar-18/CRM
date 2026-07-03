import { contactRepository } from '../repositories/contact.repository';
import { AuthUser } from '../types/database';
import { logActivity } from './activity.service';
import {
  CreateContactInput,
  UpdateContactInput,
} from '../schemas/contact.schema';

export const getContacts = async (
  user: AuthUser,
  page: number,
  limit: number,
  search: string,
  companyId?: string,
) => {
  const filters: Record<string, string> = {};
  if (companyId) filters.company_id = companyId;

  return contactRepository.findScoped(
    user,
    { page, limit },
    filters,
    search
      ? { fields: ['first_name', 'last_name', 'email'], query: search }
      : undefined,
  );
};

export const getContactById = async (user: AuthUser, id: string) => {
  return contactRepository.findByIdScoped(id, user);
};

export const createContact = async (
  user: AuthUser,
  body: CreateContactInput,
) => {
  const data = (await contactRepository.create({
    first_name: body.first_name,
    last_name: body.last_name || null,
    email: body.email || null,
    phone: body.phone || null,
    title: body.title || null,
    company_id: body.company_id || null,
    owner_id: body.owner_id || user.id,
    created_by: user.id,
  })) as Record<string, string>;

  void logActivity({
    type: 'contact_created',
    userId: user.id,
    description: `Created contact "${(body.first_name + ' ' + (body.last_name ?? '')).trim()}"`,
    contactId: data.id,
  });

  return data;
};

export const updateContact = async (
  user: AuthUser,
  id: string,
  body: UpdateContactInput,
) => {
  const allowed = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'title',
    'company_id',
    'owner_id',
  ] as const;

  const updateData: Record<string, unknown> = {};
  for (const field of allowed) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const data = (await contactRepository.update(id, updateData, user)) as Record<
    string,
    string
  >;

  void logActivity({
    type: 'contact_updated',
    userId: user.id,
    description: `Updated contact "${data.first_name}"`,
    contactId: data.id,
  });

  return data;
};

export const deleteContact = async (user: AuthUser, id: string) => {
  await contactRepository.remove(id, user);
};
