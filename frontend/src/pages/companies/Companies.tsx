import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RecordDetailDrawer } from '../../components/common/RecordDetailDrawer';
import { useCompaniesApi } from '../../hooks/useApi';
import { SECTORS, getSectorColor } from '../../constants';
import { verifyGst } from '../../api/companies';
import type { GstDetails } from '../../api/companies';
import type { Company } from '../../types';

const emptyCompany = {
  name: '', industry: '', website: '', phone: '', email: '',
  address: '', city: '', state: '', country: 'India',
  gst_number: '', iso_certificate: '', sector: 'general' as Company['sector'],
};

export const Companies = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState(emptyCompany);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompanyForDrawer, setSelectedCompanyForDrawer] = useState<Company | null>(null);

  // GST Verification
  const [gstInput, setGstInput] = useState('');
  const [gstLoading, setGstLoading] = useState(false);
  const [gstError, setGstError] = useState<string | null>(null);
  const [verifiedDetails, setVerifiedDetails] = useState<GstDetails | null>(null);

  const { useList, useCreate, useUpdate, useDelete } = useCompaniesApi();
  const { data, isLoading } = useList({ page, limit: 10, search });
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCompany);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditing(company);
    setForm({
      name: company.name,
      industry: company.industry || '',
      website: company.website || '',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      country: company.country || 'India',
      gst_number: company.gstNumber || '',
      iso_certificate: company.isoCertificate || '',
      sector: company.sector,
    });
    setFormError('');
    setModalOpen(true);
    setActionDropdown(null);
  };

  const createFromGst = () => {
    if (!verifiedDetails) return;
    setForm({
      ...emptyCompany,
      name: verifiedDetails.legalName || verifiedDetails.tradeName || '',
      address: verifiedDetails.address || '',
      city: verifiedDetails.city || '',
      state: verifiedDetails.state || '',
      gst_number: verifiedDetails.gstin || gstInput,
    });
    setEditing(null);
    setFormError('');
    setModalOpen(true);
  };

  const handleGstVerify = async () => {
    if (!gstInput || gstInput.length !== 15) {
      setGstError('Please enter a valid 15-character GSTIN');
      return;
    }
    setGstLoading(true);
    setGstError(null);
    setVerifiedDetails(null);
    try {
      const details = await verifyGst(gstInput);
      setVerifiedDetails(details);
    } catch (err: any) {
      setGstError(err.response?.data?.message || err.message || 'Failed to verify GST');
    } finally {
      setGstLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Company name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form as any });
      } else {
        await createMutation.mutateAsync(form as any);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete company');
    }
  };

  const selectedCompany = (data?.data as Company[])?.find(c => c.id === selectedCompanyForDrawer?.id) || selectedCompanyForDrawer;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191b23]">Companies</h1>
          <p className="text-[#565e74]">Manage your organization's company accounts.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex w-full items-center justify-center shrink-0 sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </button>
      </div>

      {/* GST Verification Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick GST Verification</h2>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 sm:max-w-sm">
            <input
              type="text"
              placeholder="Enter 15-digit GSTIN"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 uppercase"
              value={gstInput}
              onChange={(e) => setGstInput(e.target.value.toUpperCase())}
            />
            {gstError && <p className="text-red-500 text-xs mt-1">{gstError}</p>}
          </div>
          <button
            onClick={handleGstVerify}
            disabled={gstLoading}
            className={cn("px-4 py-2 text-white rounded-lg text-sm transition-colors", gstLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700')}
          >
            {gstLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {verifiedDetails && (
          <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm text-slate-700">Verified Details</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">{verifiedDetails.status}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500 text-xs">Legal Name</p><p className="font-medium text-slate-900">{verifiedDetails.legalName}</p></div>
              <div><p className="text-slate-500 text-xs">Trade Name</p><p className="font-medium text-slate-900">{verifiedDetails.tradeName}</p></div>
              <div><p className="text-slate-500 text-xs">Location</p><p className="font-medium text-slate-900">{verifiedDetails.state} / {verifiedDetails.city}</p></div>
              <div><p className="text-slate-500 text-xs">Address</p><p className="font-medium text-slate-900">{verifiedDetails.address}, {verifiedDetails.pincode}</p></div>
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={createFromGst} className="w-full sm:w-auto text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Company from Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Company</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Contact Info</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Location</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Sector</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Added</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div></td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No companies found</p>
                  <p className="text-slate-400 text-xs mt-1">Add a company to get started.</p>
                </td></tr>
              ) : (
                (data?.data as Company[])?.map(company => (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
                          {company.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => {
                              setSelectedCompanyForDrawer(company);
                              setDrawerOpen(true);
                            }}
                            className="font-semibold text-slate-900 hover:text-blue-600 hover:underline text-left block focus:outline-none"
                          >
                            {company.name}
                          </button>
                          {company.industry && <div className="text-slate-500 text-xs mt-0.5">{company.industry}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="text-slate-800 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{company.email || '-'}</div>
                        <div className="text-slate-500 flex items-center text-xs"><Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{company.phone || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-600 text-sm">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {[company.city, company.state].filter(Boolean).join(', ') || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("badge", getSectorColor(company.sector))}>
                        {SECTORS.find(s => s.value === company.sector)?.label || company.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(company.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActionDropdown(actionDropdown === company.id ? null : company.id)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {actionDropdown === company.id && (
                        <div className="absolute right-4 top-12 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                          <button onClick={() => openEdit(company)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
                          <button onClick={() => { setDeleteTarget(company); setActionDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > 10 && (
          <div className="p-4 border-t border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-slate-700">{Math.min(page * 10, data.total)}</span> of <span className="font-medium text-slate-700">{data.total}</span>
            </span>
            <div className="flex gap-2 self-end sm:self-auto">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total} className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Company' : 'Add Company'}>
        {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{formError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Company Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Company name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Industry</label>
              <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="input-field" placeholder="Software, Real Estate..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Website</label>
              <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="input-field" placeholder="https://example.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="info@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="Phone number" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="Street address" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">City</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">State</label>
              <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-field" placeholder="State" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Country</label>
              <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="input-field" placeholder="Country" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">GST Number</label>
              <input value={form.gst_number} onChange={e => setForm({ ...form, gst_number: e.target.value.toUpperCase() })} className="input-field uppercase" placeholder="GSTIN" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Sector</label>
              <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value as any })} className="input-field">
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editing ? 'Update Company' : 'Create Company'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />

      {selectedCompany && (
        <RecordDetailDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedCompanyForDrawer(null);
          }}
          recordId={selectedCompany.id}
          recordType="company"
          recordName={selectedCompany.name}
          additionalDetails={
            <div className="grid grid-cols-2 gap-3 text-sm">
              {selectedCompany.email && (
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs font-medium">Email</p>
                  <p className="font-semibold text-slate-800 mt-0.5 break-all">{selectedCompany.email}</p>
                </div>
              )}
              {selectedCompany.phone && (
                <div>
                  <p className="text-slate-500 text-xs font-medium">Phone</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedCompany.phone}</p>
                </div>
              )}
              {selectedCompany.website && (
                <div>
                  <p className="text-slate-500 text-xs font-medium">Website</p>
                  <p className="font-semibold text-slate-800 mt-0.5 break-all">{selectedCompany.website}</p>
                </div>
              )}
              {selectedCompany.gstNumber && (
                <div>
                  <p className="text-slate-500 text-xs font-medium">GSTIN</p>
                  <p className="font-semibold text-slate-800 mt-0.5 uppercase">{selectedCompany.gstNumber}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 text-xs font-medium">Sector</p>
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border mt-1 inline-block capitalize", getSectorColor(selectedCompany.sector))}>
                  {SECTORS.find(s => s.value === selectedCompany.sector)?.label || selectedCompany.sector}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    openEdit(selectedCompany);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Edit Company Details
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};
