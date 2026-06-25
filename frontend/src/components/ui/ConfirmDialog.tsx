interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export const ConfirmDialog = ({ open, onConfirm, onCancel, title, message, confirmLabel = 'Delete' }: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-[#191b23] mb-2">{title}</h3>
        <p className="text-[#565e74] text-sm mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="btn-secondary text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
