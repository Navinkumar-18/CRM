import { leadRepository } from '../repositories/lead.repository';
import { AuthUser } from '../types/database';
import { logActivity } from './activity.service';
import { CreateLeadInput, UpdateLeadInput } from '../schemas/lead.schema';

export const getLeads = async (
  user: AuthUser,
  page: number,
  limit: number,
  search: string,
  status?: string,
) => {
  const filters: Record<string, string> = {};
  if (status) filters.status = status;

  return leadRepository.findScoped(
    user,
    { page, limit },
    filters,
    search ? { fields: ['name', 'email'], query: search } : undefined,
  );
};

export const createLead = async (user: AuthUser, body: CreateLeadInput) => {
  const data = (await leadRepository.create({
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    source: body.source || null,
    status: body.status || 'new',
    sector: body.sector || 'general',
    notes: body.notes || null,
    assigned_to: body.assignedTo || user.id,
    created_by: user.id,
  })) as Record<string, string>;

  void logActivity({
    type: 'lead_created',
    userId: user.id,
    description: `Created lead "${body.name}"`,
    leadId: data.id,
  });

  return data;
};

export const updateLead = async (
  user: AuthUser,
  id: string,
  body: UpdateLeadInput,
) => {
  const updateData: Record<string, unknown> = {};
  const fields = [
    'name',
    'email',
    'phone',
    'source',
    'status',
    'sector',
    'notes',
  ] as const;

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  // Only admin/manager can reassign leads to other users
  if (body.assignedTo) {
    updateData['assigned_to'] = body.assignedTo;
  }

  const data = (await leadRepository.update(id, updateData, user)) as Record<
    string,
    string
  >;

  void logActivity({
    type: 'lead_updated',
    userId: user.id,
    description: `Updated lead "${data.name}"`,
    leadId: data.id,
  });

  return data;
};

export const deleteLead = async (user: AuthUser, id: string) => {
  await leadRepository.remove(id, user);
};
