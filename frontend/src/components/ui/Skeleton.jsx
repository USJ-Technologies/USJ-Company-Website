/**
 * Skeleton loading components
 */

export function Skeleton({ width = '100%', height = 16, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: 4 }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-[8px] p-5 ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      aria-hidden="true"
    >
      <Skeleton height={180} className="mb-4 rounded" />
      <Skeleton height={20} width="70%" className="mb-2" />
      <Skeleton height={14} width="50%" className="mb-2" />
      <Skeleton height={14} width="90%" />
    </div>
  );
}

export function SkeletonProductCard({ className = '' }) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      aria-hidden="true"
    >
      <Skeleton height={220} className="rounded-none" />
      <div className="p-4">
        <Skeleton height={14} width="40%" className="mb-2" />
        <Skeleton height={18} width="80%" className="mb-1" />
        <Skeleton height={14} width="60%" className="mb-3" />
        <Skeleton height={16} width="30%" className="mb-3" />
        <Skeleton height={36} className="rounded-[6px]" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export default Skeleton;
