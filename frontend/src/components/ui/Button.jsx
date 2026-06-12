import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const variantClasses = {
  primary: 'bg-[#0A1628] text-white hover:bg-[#1A2E4A] border border-[#0A1628]',
  secondary: 'bg-transparent text-[#0A1628] border border-[#0A1628] hover:bg-[#0A1628] hover:text-white',
  accent: 'bg-[#C9A84C] text-[#0A1628] hover:bg-[#B8973B] border border-[#C9A84C]',
  ghost: 'bg-transparent text-[#0A1628] border border-transparent hover:bg-gray-100',
  danger: 'bg-[#C53030] text-white hover:bg-red-700 border border-[#C53030]',
  'outline-white': 'bg-transparent text-white border border-white hover:bg-white hover:text-[#0A1628]',
};

/**
 * @param {{
 *   variant?: 'primary'|'secondary'|'accent'|'ghost'|'danger'|'outline-white',
 *   size?: 'sm'|'md'|'lg',
 *   isLoading?: boolean,
 *   leftIcon?: React.ReactNode,
 *   rightIcon?: React.ReactNode,
 *   as?: string|React.ComponentType,
 *   className?: string,
 *   disabled?: boolean,
 *   children: React.ReactNode,
 * }} props
 */
const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      as: Component = 'button',
      className = '',
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClass =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-[6px] transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

    return (
      <Component
        ref={ref}
        className={`${baseClass} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : leftIcon ? (
          <span className="flex items-center">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? <span className="flex items-center">{rightIcon}</span> : null}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;
