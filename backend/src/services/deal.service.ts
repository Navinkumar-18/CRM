import { dealRepository } from '../repositories/deal.repository';
import { AuthUser } from '../types/database';
import { logActivity } from './activity.service';
import {
  CreateDealInput,
  UpdateDealInput,
  UpdateDealStageInput,
} from '../schemas/deal.schema';

const STAGE_PROBABILITIES: Record<string, number> = {
  prospecting: 10,
  qualification: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0,
};

export const getDeals = async (
  user: AuthUser,
  page: number,
  limit: number,
  search: string,
  stage?: string,
  companyId?: string,
) => {
  const filters: Record<string, string> = {};
  if (stage) filters.stage = stage;
  if (companyId) filters.company_id = companyId;

  return dealRepository.findScoped(
    user,
    { page, limit },
    filters,
    search ? { fields: ['title'], query: search } : undefined,
  );
};

export const getDealById = async (user: AuthUser, id: string) => {
  return dealRepository.findByIdScoped(id, user);
};

export const getPipelineSummary = async (user: AuthUser) => {
  return dealRepository.pipelineSummary(user);
};

export const createDeal = async (user: AuthUser, body: CreateDealInput) => {
  const data = (await dealRepository.create({
    title: body.title,
    value: body.value ?? 0,
    stage: body.stage ?? 'prospecting',
    probability:
      body.probability ?? STAGE_PROBABILITIES[body.stage ?? 'prospecting'],
    expected_close_dt: body.expected_close_dt || null,
    lead_id: body.lead_id || null,
    company_id: body.company_id || null,
    contact_id: body.contact_id || null,
    assigned_to: body.assigned_to || user.id,
    created_by: user.id,
    lost_reason: null,
  })) as Record<string, string>;

  void logActivity({
    type: 'deal_created',
    userId: user.id,
    description: `Created deal "${body.title}" (${body.stage ?? 'prospecting'})`,
    dealId: data.id,
  });

  return data;
};

export const updateDeal = async (
  user: AuthUser,
  id: string,
  body: UpdateDealInput,
) => {
  const allowed = [
    'title',
    'value',
    'stage',
    'probability',
    'expected_close_dt',
    'lead_id',
    'company_id',
    'contact_id',
    'assigned_to',
    'lost_reason',
  ] as const;

  const updateData: Record<string, unknown> = {};
  for (const field of allowed) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const data = (await dealRepository.update(id, updateData, user)) as Record<
    string,
    string
  >;

  void logActivity({
    type: 'deal_updated',
    userId: user.id,
    description: `Updated deal "${data.title}"`,
    dealId: data.id,
  });

  return data;
};

export const updateDealStage = async (
  user: AuthUser,
  id: string,
  body: UpdateDealStageInput,
) => {
  const updateData: Record<string, unknown> = {
    stage: body.stage,
    probability: body.probability ?? STAGE_PROBABILITIES[body.stage],
  };

  if (body.lost_reason) updateData['lost_reason'] = body.lost_reason;
  if (body.actual_close_dt)
    updateData['actual_close_dt'] = body.actual_close_dt;

  // Auto-set close date on terminal stages
  if (
    (body.stage === 'closed_won' || body.stage === 'closed_lost') &&
    !body.actual_close_dt
  ) {
    updateData['actual_close_dt'] = new Date().toISOString().slice(0, 10);
  }

  const data = (await dealRepository.update(id, updateData, user)) as Record<
    string,
    string
  >;

  void logActivity({
    type: 'deal_stage_changed',
    userId: user.id,
    description: `Deal "${data.title}" moved to stage "${body.stage}"`,
    dealId: data.id,
    metadata: { stage: body.stage },
  });

  return data;
};

export const deleteDeal = async (user: AuthUser, id: string) => {
  await dealRepository.remove(id, user);
};
