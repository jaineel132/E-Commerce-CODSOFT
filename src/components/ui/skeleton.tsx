import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  name?: string;
  children?: React.ReactNode;
}

function Skeleton({
  className,
  loading = false,
  children,
  ...props
}: SkeletonProps) {
  if (loading) {
    return (
      <div className={cn("space-y-4 w-full", className)} {...props}>
        <div className="animate-pulse rounded-md bg-muted h-8 w-1/3" />
        <div className="animate-pulse rounded-md bg-muted h-32 w-full" />
        <div className="animate-pulse rounded-md bg-muted h-64 w-full" />
      </div>
    )
  }

  return <>{children}</>
}

export { Skeleton }
