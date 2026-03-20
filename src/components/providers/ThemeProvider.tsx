import { cn } from '@/lib/utils'

interface ThemeProviderProps {
  theme: string
  children: React.ReactNode
}

export const ThemeProvider = ({ theme, children }: ThemeProviderProps) => (
  <div
    className={cn(
      `theme-${theme}`,
      'bg-background text-foreground flex min-h-screen flex-col',
    )}>
    {children}
  </div>
)
