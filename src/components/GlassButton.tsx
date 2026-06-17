import type { ButtonHTMLAttributes, ReactNode } from 'react';

type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function GlassButton({ children, variant = 'secondary', className = '', ...props }: GlassButtonProps) {
  return (
    <button className={`glass-button glass-button--${variant} ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}
