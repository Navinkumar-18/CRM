import { useState } from 'react';
import { verifyGst } from '../../api/companies';
import type { GstDetails } from '../../api/companies';

export const Companies = () => {
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedDetails, setVerifiedDetails] = useState<GstDetails | null>(null);

  const handleVerify = async () => {
    if (!gstNumber || gstNumber.length !== 15) {
      setError('Please enter a valid 15-character GSTIN');
      return;
    }

    setLoading(true);
    setError(null);
    setVerifiedDetails(null);

    try {
      const details = await verifyGst(gstNumber);
      setVerifiedDetails(details);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to verify GST');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Company
        </button>
      </div>

      {/* GST Verification Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick GST Verification</h2>
        <div className="flex gap-4 items-start">
          <div className="flex-1 max-w-sm">
            <input 
              type="text" 
              placeholder="Enter 15-digit GSTIN (e.g. 29ABCDE1234F1Z5)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <button 
            onClick={handleVerify}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Verifying...' : 'Verify GST'}
          </button>
        </div>

        {verifiedDetails && (
          <div className="mt-6 bg-slate-50 border border-slate-100 rounded-lg p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-700">Verified Details</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                {verifiedDetails.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Legal Name</p>
                <p className="font-medium text-slate-900">{verifiedDetails.legalName}</p>
              </div>
              <div>
                <p className="text-slate-500">Trade Name</p>
                <p className="font-medium text-slate-900">{verifiedDetails.tradeName}</p>
              </div>
              <div>
                <p className="text-slate-500">State / City</p>
                <p className="font-medium text-slate-900">{verifiedDetails.state} / {verifiedDetails.city}</p>
              </div>
              <div>
                <p className="text-slate-500">Address</p>
                <p className="font-medium text-slate-900">{verifiedDetails.address}, {verifiedDetails.pincode}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-sm px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors">
                Create Company from Details
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 text-center text-slate-500">
          {/* TODO: Add Companies Table or Grid here */}
          <p>Company list will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};
