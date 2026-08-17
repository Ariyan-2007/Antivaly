import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase">
            <span className="size-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
        )}
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref as never}
          className="group/link inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {viewAllLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
