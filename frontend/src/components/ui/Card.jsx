/**
 * Base card component
 * @param {{ children: React.ReactNode, className?: string, hover?: boolean, style?: object }} props
 */
export default function Card({ children, className = '', hover = true, style = {}, ...props }) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-[8px] ${hover ? 'card-hover' : ''} ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
