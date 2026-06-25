export const Contacts = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Contact
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 text-center text-slate-500">
          {/* TODO: Add Contacts Table or Grid here */}
          <p>Contact list will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};
