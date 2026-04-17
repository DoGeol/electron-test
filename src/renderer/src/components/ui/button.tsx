import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--success)] text-white hover:bg-[var(--success-bright)]',
        secondary: 'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[#484f58] hover:bg-[#21262d]',
        outline: 'border border-[var(--border)] bg-transparent text-[var(--text)] hover:border-[#484f58] hover:bg-[var(--surface-2)]',
        ghost: 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
        danger: 'border border-[var(--error)]/40 bg-transparent text-[var(--error)] hover:bg-[var(--error)]/10',
      },
      size: {
        default: 'h-8 px-3',
        sm: 'h-7 px-2.5 text-xs',
        lg: 'h-10 px-4',
        icon: 'h-7 w-7 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, type = 'button', ...props }, ref) => (
  <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));

Button.displayName = 'Button';

export { Button, buttonVariants };
