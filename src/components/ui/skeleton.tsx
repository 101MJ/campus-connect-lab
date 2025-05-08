
import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Optional animation effect:
   * - pulse: opacity changes in a pulsing effect (default)
   * - wave: gradient wave flowing across the skeleton
   * - none: no animation
   */
  animation?: "pulse" | "wave" | "none";
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animation = "pulse", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md bg-muted",
          {
            "animate-pulse": animation === "pulse",
            "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent": 
              animation === "wave"
          },
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
