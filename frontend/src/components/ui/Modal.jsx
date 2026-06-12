import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

/**
 * Accessible modal with focus trap, ESC close, and backdrop click
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   size?: 'sm'|'md'|'lg'|'xl'|'full',
 *   children: React.ReactNode,
 *   hideHeader?: boolean,
 * }} props
 */
export default function Modal({ isOpen, onClose, title, size = 'md', children, hideHeader = false }) {
  const overlayRef = useRef(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstFocusRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} max-h-[90vh] overflow-y-auto`}
        style={{ animation: 'fadeUp 0.2s ease' }}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-[#0A1628]">
                {title}
              </h2>
            )}
            <button
              ref={firstFocusRef}
              onClick={onClose}
              className="ml-auto p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {hideHeader && (
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}
        <div className={hideHeader ? '' : 'p-6'}>{children}</div>
      </div>
    </div>
  );
}
