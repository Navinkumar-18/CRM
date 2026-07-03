import { customRepository } from '../repositories/custom.repository';
import { AuthUser } from '../types/database';
import { NotFoundError } from '../utils/AppError';
import {
  CreateCustomModuleInput,
  CreateCustomFieldInput,
  CreateCustomRecordInput,
  UpdateCustomRecordInput,
} from '../schemas/custom.schema';

export const listModules = async () => {
  return customRepository.listModules();
};

export const getModuleBySlug = async (slug: string) => {
  const module = await customRepository.getModuleBySlug(slug);
  if (!module) throw new NotFoundError('Module not found');
  return module;
};

export const createModule = async (
  user: AuthUser,
  body: CreateCustomModuleInput,
) => {
  return customRepository.createModule({
    name: body.name,
    slug: body.slug,
    icon: body.icon ?? 'cube',
    sector: body.sector ?? 'general',
    created_by: user.id,
  });
};

export const updateModule = async (
  id: string,
  data: Partial<CreateCustomModuleInput>,
) => {
  const module = await customRepository.getModuleById(id);
  if (!module) throw new NotFoundError('Module not found');
  return customRepository.updateModule(id, data);
};

export const deleteModule = async (id: string) => {
  const module = await customRepository.getModuleById(id);
  if (!module) throw new NotFoundError('Module not found');
  await customRepository.deleteModule(id);
};

export const addField = async (
  slug: string,
  user: AuthUser,
  body: CreateCustomFieldInput,
) => {
  const module = await customRepository.getModuleBySlug(slug);
  if (!module) throw new NotFoundError('Module not found');
  return customRepository.addField(module.id, {
    label: body.label,
    field_key: body.field_key,
    field_type: body.field_type,
    required: body.required ?? false,
    options: body.options ?? null,
    sort_order: body.sort_order ?? 0,
  });
};

export const removeField = async (fieldId: string) => {
  await customRepository.removeField(fieldId);
};

export const listRecords = async (
  slug: string,
  page: number,
  limit: number,
  user: AuthUser,
) => {
  const module = await customRepository.getModuleBySlug(slug);
  if (!module) throw new NotFoundError('Module not found');
  return customRepository.listRecords(module.id, page, limit, user);
};

export const createRecord = async (
  slug: string,
  user: AuthUser,
  body: CreateCustomRecordInput,
) => {
  const module = await customRepository.getModuleBySlug(slug);
  if (!module) throw new NotFoundError('Module not found');
  return customRepository.createRecord({
    module_id: module.id,
    data: body.data,
    owner_id: body.owner_id || user.id,
    created_by: user.id,
  });
};

export const updateRecord = async (
  id: string,
  body: UpdateCustomRecordInput,
  user: AuthUser,
) => {
  return customRepository.updateRecord(
    id,
    body.data as Record<string, unknown>,
    user,
  );
};

export const deleteRecord = async (id: string, user: AuthUser) => {
  await customRepository.deleteRecord(id, user);
};
