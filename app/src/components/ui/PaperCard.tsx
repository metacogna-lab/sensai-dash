import { cn } from "@/lib/cn";

interface PaperCardProps extends React.HTMLAttributes<HTMLElement> {
  /** Dim to 0.6 until hover/tap/focus — the "stacked physical files" effect. */
  dim?: boolean;
  /** Emerald edge glow for active/kinetic state. */
  active?: boolean;
  as?: "div" | "article" | "li";
}

/**
 * Dark-Paper container. Elevation via a sharp 1px border, never a soft shadow.
 * Unfocused cards sit at opacity 0.6 and snap to 1.0 on hover/tap/focus at 0ms.
 */
export function PaperCard({
  dim = false,
  active = false,
  as: Tag = "div",
  className,
  children,
  ...rest
}: PaperCardProps) {
  const Component = Tag as React.ElementType;
  return (
    <Component
      className={cn(
        "relative rounded-lg border bg-paper p-4 shadow-none transition-opacity duration-0",
        "border-edge",
        dim ? "opacity-60 hover:opacity-100 focus-within:opacity-100" : "opacity-100",
        active && "border-emerald/60 shadow-[0_0_0_1px_var(--color-emerald)]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
