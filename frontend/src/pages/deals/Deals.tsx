export const Deals = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Deals Pipeline</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Deal
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="text-center text-slate-500">
          {/* TODO: Add Kanban Board or Deals List here */}
          <p>Deals Kanban board or list view will be placed here.</p>
        </div>
      </div>
    </div>
  );
};
