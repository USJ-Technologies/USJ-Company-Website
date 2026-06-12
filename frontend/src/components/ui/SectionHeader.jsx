/**
 * Reusable section header with label, title, and subtitle
 * @param {{
 *   label?: string,
 *   title: string,
 *   subtitle?: string,
 *   align?: 'left'|'center',
 *   className?: string,
 * }} props
 */
export default function SectionHeader({ label, title, subtitle, align = 'left', className = '' }) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col ${alignClass} mb-10 ${className}`}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-2">
          {label}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-[#4A5568] max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
      <div
        className="mt-3 h-0.5 w-12 bg-[#C9A84C] rounded-full"
        style={{ alignSelf: align === 'center' ? 'center' : 'flex-start' }}
      />
    </div>
  );
}
