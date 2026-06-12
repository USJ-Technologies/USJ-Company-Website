/**
 * Category / status badge component
 * @param {{
 *   type?: 'govt'|'defence'|'gem'|'tech'|'legal'|'travel'|'private'|'custom',
 *   color?: string,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
const typeStyles = {
  govt: { bg: '#EBF4FF', text: '#1A3A5C' },
  defence: { bg: '#FFF3CD', text: '#6B4C00' },
  gem: { bg: '#D4EDDA', text: '#155724' },
  tech: { bg: '#E8D5F5', text: '#4A235A' },
  legal: { bg: '#FEE2E2', text: '#991B1B' },
  travel: { bg: '#DCFCE7', text: '#166534' },
  private: { bg: '#F1F5F9', text: '#475569' },
  success: { bg: '#D4EDDA', text: '#155724' },
  warning: { bg: '#FFF3CD', text: '#856404' },
  danger: { bg: '#FEE2E2', text: '#991B1B' },
  info: { bg: '#EBF4FF', text: '#1A3A5C' },
};

export default function Badge({ type = 'govt', color, children, className = '' }) {
  const style = typeStyles[type] || typeStyles.private;
  const bgColor = color ? `${color}20` : style.bg;
  const textColor = color || style.text;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wide rounded ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {children}
    </span>
  );
}
