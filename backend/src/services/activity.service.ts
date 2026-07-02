import { supabase } from '../config/supabase';
import { ActivityType } from '../types/database';
import { logger } from '../config/logger';

interface LogActivityParams {
  type: ActivityType;
  userId: string;
  description: string;
  customerId?: string | null;
  leadId?: string | null;
  dealId?: string | null;
  contactId?: string | null;
  companyId?: string | null;
  taskId?: string | null;
  metadata?: Record<string, unknown>;
}

export const logActivity = async (params: LogActivityParams) => {
  // 1. Insert into main activities table
  const { error } = await supabase.from('activities').insert({
    type: params.type,
    user_id: params.userId,
    description: params.description,
    customer_id: params.customerId || null,
    lead_id: params.leadId || null,
    deal_id: params.dealId || null,
    contact_id: params.contactId || null,
    company_id: params.companyId || null,
    task_id: params.taskId || null,
    metadata: params.metadata || null,
  });

  if (error) {
    logger.warn({ err: error, type: params.type }, 'Failed to log activity');
  }

  // 2. Insert into staff_activities table
  const { error: staffError } = await supabase.from('staff_activities').insert({
    staff_id: params.userId,
    type: params.type,
    description: params.description,
    metadata: params.metadata || null,
  });

  if (staffError) {
    logger.warn({ err: staffError, userId: params.userId }, 'Failed to log staff activity');
  }
};
