import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';
import type { ToasterProps } from 'sonner'; // ✅ type-only import for types

type SonnerTheme = 'light' | 'dark' | 'system';

const Toaster = (props: Partial<ToasterProps>) => {
  const { theme = 'system' } = useTheme();

  return (
    <SonnerToaster
      theme={theme as SonnerTheme}
      className="toaster group"
      style={
        {
          '--toast-bg': 'var(--popover)',
          '--toast-color': 'var(--popover-foreground)',
          '--toast-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
