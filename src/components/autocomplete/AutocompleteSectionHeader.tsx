interface AutocompleteSectionHeaderProps {
  children: React.ReactNode
  className?: string
}

export const AutocompleteSectionHeader = ({
  children,
  className = '',
}: AutocompleteSectionHeaderProps) => (
  <div
    className={`text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase ${className}`}>
    {children}
  </div>
)
