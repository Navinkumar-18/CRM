import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Settings, Trash2, ChevronRight, Database, Hash, Calendar, ToggleLeft, List, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface CustomField {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  required: boolean;
  options?: string[];
  sortOrder: number;
}

interface CustomModule {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sector: string;
  fields?: CustomField[];
  createdAt: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Hash },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'boolean', label: 'Boolean', icon: ToggleLeft },
  { value: 'select', label: 'Select', icon: List },
];

const emptyModule = { name: '', slug: '', icon: 'cube', sector: 'general' };
const emptyField = { label: '', field_key: '', field_type: 'text', required: false, options: [] as string[], sort_order: 0 };

export const CustomModules = () => {
  const queryClient = useQueryClient();

  // Module state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState(emptyModule);
  const [moduleFormError, setModuleFormError] = useState('');
  const [moduleSaving, setModuleSaving] = useState(false);
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<CustomModule | null>(null);

  // Active module / field state
  const [activeModule, setActiveModule] = useState<CustomModule | null>(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldForm, setFieldForm] = useState(emptyField);
  const [fieldFormError, setFieldFormError] = useState('');
  const [fieldSaving, setFieldSaving] = useState(false);
  const [deleteFieldTarget, setDeleteFieldTarget] = useState<CustomField | null>(null);
  const [optionInput, setOptionInput] = useState('');

  // Fetch all modules
  const { data: modules, isLoading } = useQuery<CustomModule[]>({
    queryKey: ['custom-modules'],
    queryFn: async () => {
      const res = await api.get('/custom/modules');
      return (res as unknown as { data: CustomModule[] }).data;
    },
  });

  // Fetch single module with fields
  const { data: moduleDetail } = useQuery<CustomModule>({
    queryKey: ['custom-module', activeModule?.slug],
    queryFn: async () => {
      const res = await api.get(`/custom/modules/${activeModule!.slug}`);
      return (res as unknown as { data: CustomModule }).data;
    },
    enabled: !!activeModule?.slug,
  });

  // Create module mutation
  const createModule = useMutation({
    mutationFn: async (data: typeof emptyModule) => {
      const res = await api.post('/custom/modules', data);
      return (res as unknown as { data: CustomModule }).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-modules'] });
      setModuleModalOpen(false);
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/custom/modules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-modules'] });
      setActiveModule(null);
      setDeleteModuleTarget(null);
    },
  });

  // Add field mutation
  const addField = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: typeof emptyField }) => {
      const res = await api.post(`/custom/modules/${slug}/fields`, data);
      return (res as unknown as { data: CustomField }).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-module', activeModule?.slug] });
      setFieldModalOpen(false);
    },
  });

  // Delete field mutation
  const deleteFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/custom/fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-module', activeModule?.slug] });
      setDeleteFieldTarget(null);
    },
  });

  const handleCreateModule = async () => {
    if (!moduleForm.name.trim()) { setModuleFormError('Module name is required'); return; }
    if (!moduleForm.slug.trim()) { setModuleFormError('Slug is required'); return; }
    if (!/^[a-z0-9_]+$/.test(moduleForm.slug)) { setModuleFormError('Slug must be lowercase letters, numbers, or underscores'); return; }
    setModuleSaving(true);
    setModuleFormError('');
    try {
      await createModule.mutateAsync(moduleForm);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setModuleFormError(error?.response?.data?.message || error?.message || 'Failed to create module');
    } finally {
      setModuleSaving(false);
    }
  };

  const handleAddField = async () => {
    if (!fieldForm.label.trim()) { setFieldFormError('Label is required'); return; }
    if (!fieldForm.field_key.trim()) { setFieldFormError('Field key is required'); return; }
    if (!/^[a-z0-9_]+$/.test(fieldForm.field_key)) { setFieldFormError('Field key must be lowercase letters, numbers, or underscores'); return; }
    setFieldSaving(true);
    setFieldFormError('');
    try {
      await addField.mutateAsync({ slug: activeModule!.slug, data: fieldForm });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setFieldFormError(error?.response?.data?.message || error?.message || 'Failed to add field');
    } finally {
      setFieldSaving(false);
    }
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setFieldForm({ ...fieldForm, options: [...fieldForm.options, optionInput.trim()] });
    setOptionInput('');
  };

  const removeOption = (index: number) => {
    setFieldForm({ ...fieldForm, options: fieldForm.options.filter((_, i) => i !== index) });
  };

  const getFieldTypeIcon = (type: string) => {
    const ft = FIELD_TYPES.find(f => f.value === type);
    return ft?.icon || Hash;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191b23]">Custom Modules</h1>
          <p className="text-[#565e74]">Create and manage custom data modules with custom fields.</p>
        </div>
        <button onClick={() => { setModuleForm(emptyModule); setModuleFormError(''); setModuleModalOpen(true); }} className="btn-primary flex items-center shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Module
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module List */}
        <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-700">Modules</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-6 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></div>
            ) : modules?.length === 0 ? (
              <div className="p-8 text-center">
                <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No custom modules yet</p>
                <p className="text-slate-400 text-xs mt-1">Create a module to get started.</p>
              </div>
            ) : (
              modules?.map(mod => (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors",
                    activeModule?.id === mod.id && "bg-blue-50 border-l-2 border-blue-600"
                  )}
                >
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{mod.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">/{mod.slug}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Module Detail / Fields */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
          {!activeModule ? (
            <div className="p-12 text-center">
              <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Select a module to manage its fields</p>
              <p className="text-slate-400 text-xs mt-1">Or create a new module to get started.</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-700">{activeModule.name}</h2>
                  <p className="text-xs text-slate-500">Slug: {activeModule.slug} · Sector: {activeModule.sector}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFieldForm(emptyField); setFieldFormError(''); setFieldModalOpen(true); }}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Field
                  </button>
                  <button
                    onClick={() => setDeleteModuleTarget(activeModule)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {!moduleDetail?.fields || moduleDetail.fields.length === 0 ? (
                  <div className="p-8 text-center">
                    <Hash className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No fields defined</p>
                    <p className="text-slate-400 text-xs mt-1">Add fields to define the data structure for this module.</p>
                  </div>
                ) : (
                  moduleDetail.fields.map(field => {
                    const Icon = getFieldTypeIcon(field.fieldType);
                    return (
                      <div key={field.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{field.label}</p>
                            <p className="text-xs text-slate-500">
                              {field.fieldKey} · {FIELD_TYPES.find(f => f.value === field.fieldType)?.label || field.fieldType}
                              {field.required && <span className="text-red-500 ml-1">*required</span>}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteFieldTarget(field)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Module Modal */}
      <Modal open={moduleModalOpen} onClose={() => setModuleModalOpen(false)} title="Create Custom Module">
        {moduleFormError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{moduleFormError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Module Name *</label>
            <input
              value={moduleForm.name}
              onChange={e => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
                setModuleForm({ ...moduleForm, name, slug });
              }}
              className="input-field"
              placeholder="e.g. Invoices"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Slug *</label>
            <input value={moduleForm.slug} onChange={e => setModuleForm({ ...moduleForm, slug: e.target.value })} className="input-field font-mono text-sm" placeholder="e.g. invoices" />
            <p className="text-xs text-slate-400 mt-1">Lowercase letters, numbers, underscores only.</p>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={() => setModuleModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleCreateModule} disabled={moduleSaving} className="btn-primary text-sm">{moduleSaving ? 'Creating...' : 'Create Module'}</button>
          </div>
        </div>
      </Modal>

      {/* Add Field Modal */}
      <Modal open={fieldModalOpen} onClose={() => setFieldModalOpen(false)} title="Add Field">
        {fieldFormError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{fieldFormError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Label *</label>
            <input
              value={fieldForm.label}
              onChange={e => {
                const label = e.target.value;
                const field_key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
                setFieldForm({ ...fieldForm, label, field_key });
              }}
              className="input-field"
              placeholder="e.g. Invoice Number"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Field Key *</label>
              <input value={fieldForm.field_key} onChange={e => setFieldForm({ ...fieldForm, field_key: e.target.value })} className="input-field font-mono text-sm" placeholder="invoice_number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Type</label>
              <select value={fieldForm.field_type} onChange={e => setFieldForm({ ...fieldForm, field_type: e.target.value })} className="input-field">
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={fieldForm.required}
              onChange={e => setFieldForm({ ...fieldForm, required: e.target.checked })}
              className="rounded border-slate-300"
              id="field-required"
            />
            <label htmlFor="field-required" className="text-sm text-slate-700">Required field</label>
          </div>
          {fieldForm.field_type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Options</label>
              <div className="flex gap-2 mb-2">
                <input value={optionInput} onChange={e => setOptionInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())} className="input-field flex-1" placeholder="Type option and press Enter" />
                <button onClick={addOption} className="btn-secondary text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {fieldForm.options.map((opt, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                    {opt}
                    <button onClick={() => removeOption(i)} className="ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button onClick={() => setFieldModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleAddField} disabled={fieldSaving} className="btn-primary text-sm">{fieldSaving ? 'Adding...' : 'Add Field'}</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmations */}
      <ConfirmDialog
        open={!!deleteModuleTarget}
        onConfirm={() => deleteModuleTarget && deleteModuleMutation.mutate(deleteModuleTarget.id)}
        onCancel={() => setDeleteModuleTarget(null)}
        title="Delete Module"
        message={`Are you sure you want to delete module "${deleteModuleTarget?.name}"? All fields and records will be lost.`}
      />
      <ConfirmDialog
        open={!!deleteFieldTarget}
        onConfirm={() => deleteFieldTarget && deleteFieldMutation.mutate(deleteFieldTarget.id)}
        onCancel={() => setDeleteFieldTarget(null)}
        title="Delete Field"
        message={`Are you sure you want to delete field "${deleteFieldTarget?.label}"?`}
      />
    </div>
  );
};
