import { companyRepository } from '../repositories/company.repository';
import { AuthUser } from '../types/database';
import { logActivity } from './activity.service';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
} from '../schemas/company.schema';

export const getCompanies = async (
  user: AuthUser,
  page: number,
  limit: number,
  search: string,
  sector?: string,
) => {
  const filters: Record<string, string> = {};
  if (sector) filters.sector = sector;

  return companyRepository.findScoped(
    user,
    { page, limit },
    filters,
    search
      ? { fields: ['name', 'email', 'industry'], query: search }
      : undefined,
  );
};

export const getCompanyById = async (id: string) => {
  return companyRepository.findById(id);
};

export const createCompany = async (
  user: AuthUser,
  body: CreateCompanyInput,
) => {
  const data = (await companyRepository.create({
    name: body.name,
    industry: body.industry || null,
    website: body.website || null,
    phone: body.phone || null,
    email: body.email || null,
    address: body.address || null,
    city: body.city || null,
    state: body.state || null,
    country: body.country || 'India',
    gst_number: body.gst_number || null,
    iso_certificate: body.iso_certificate || null,
    sector: body.sector ?? 'general',
    owner_id: body.owner_id || user.id,
    created_by: user.id,
  })) as Record<string, string>;

  void logActivity({
    type: 'company_created',
    userId: user.id,
    description: `Created company "${body.name}"`,
    companyId: data.id,
  });

  return data;
};

export const updateCompany = async (
  user: AuthUser,
  id: string,
  body: UpdateCompanyInput,
) => {
  const allowed = [
    'name',
    'industry',
    'website',
    'phone',
    'email',
    'address',
    'city',
    'state',
    'country',
    'gst_number',
    'iso_certificate',
    'sector',
    'owner_id',
    'verified',
  ] as const;

  const updateData: Record<string, unknown> = {};
  for (const field of allowed) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const data = (await companyRepository.update(id, updateData, user)) as Record<
    string,
    string
  >;

  void logActivity({
    type: 'company_updated',
    userId: user.id,
    description: `Updated company "${data.name}"`,
    companyId: data.id,
  });

  return data;
};

export const deleteCompany = async (user: AuthUser, id: string) => {
  await companyRepository.remove(id, user);
};
