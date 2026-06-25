const FIELD_MAP: Record<string, string> = {
  assigned_to: 'assignedTo',
  customer_id: 'customerId',
  lead_id: 'leadId',
  task_id: 'taskId',
  user_id: 'user',
  due_date: 'dueDate',
  password_hash: 'passwordHash',
  is_verified: 'isVerified',
  verification_token: 'verificationToken',
  reset_password_token: 'resetPasswordToken',
  reset_password_expires: 'resetPasswordExpires',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

export const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey =
      FIELD_MAP[key] || key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[newKey] = toCamelCase(value);
  }
  return result;
};
