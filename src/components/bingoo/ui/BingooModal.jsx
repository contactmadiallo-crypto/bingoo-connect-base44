import { useEffect } from 'react';
import { X } from 'lucide-react';

const NAVY = '#0b2149', _ORANGE = '#f97316';

export default function BingooModal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(11,33,73,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeMap[size]} bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-black" style={{ color: NAVY }}>{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-4 sm:px-5 py-4 overflow-y-auto overscroll-contain">{children}</div>
        {footer && (
          <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-2 justify-end">{footer}</div>
        )}
      </div>
    </div>
  );
}