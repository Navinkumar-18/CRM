import { customerRepository } from '../repositories/customer.repository';
import { AuthUser } from '../types/database';
import { logActivity } from './activity.service';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from '../schemas/customer.schema';

export const getCustomers = async (
  user: AuthUser,
  page: number,
  limit: number,
  search: string,
  sector?: string,
) => {
  const filters: Record<string, string> = {};
  if (sector) filters.sector = sector;

  return customerRepository.findScoped(
    user,
    { page, limit },
    filters,
    search
      ? { fields: ['name', 'email', 'company'], query: search }
      : undefined,
  );
};

export const createCustomer = async (
  user: AuthUser,
  body: CreateCustomerInput,
) => {
  const data = (await customerRepository.create({
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    company: body.company || null,
    address: body.address || null,
    status: body.status || 'prospect',
    sector: body.sector || 'general',
    notes: body.notes || null,
  })) as Record<string, string>;

  void logActivity({
    type: 'customer_created',
    userId: user.id,
    description: `Created customer "${body.name}"`,
    customerId: data.id,
  });

  return data;
};

export const updateCustomer = async (
  user: AuthUser,
  id: string,
  body: UpdateCustomerInput,
) => {
  const updateData: Record<string, unknown> = {};
  const fields = [
    'name',
    'email',
    'phone',
    'company',
    'address',
    'status',
    'sector',
    'notes',
  ] as const;

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  // Removed assignedTo logic due to missing column in DB schema

  const data = (await customerRepository.update(
    id,
    updateData,
    user,
  )) as Record<string, string>;

  void logActivity({
    type: 'customer_updated',
    userId: user.id,
    description: `Updated customer "${data.name}"`,
    customerId: data.id,
  });

  return data;
};

export const deleteCustomer = async (user: AuthUser, id: string) => {
  await customerRepository.remove(id, user);
};
