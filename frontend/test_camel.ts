const FIELD_MAP: Record<string, string> = {
  assigned_to: 'assignedTo',
  customer_id: 'customer',
  lead_id: 'lead',
  task_id: 'task',
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

function toCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const newKey = FIELD_MAP[key] || key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[newKey] = toCamelCase(value);
  }
  return result;
}

const input = {
  success: true,
  data: {
    data: [{ id: 1, name: 'Customer' }],
    total: 10,
    page: 1,
    pages: 1
  }
};

console.log(JSON.stringify(toCamelCase(input), null, 2));
