
import React from 'react';
import { cn } from '@/lib/utils';

type MotionProps = {
  children: React.ReactNode;
  className?: string;
  animate?: 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'pulse' | 'bounce';
  delay?: 'none' | 'short' | 'medium' | 'long';
  duration?: 'fast' | 'normal' | 'slow';
  repeat?: boolean;
};

export const motion = {
  div: ({
    children,
    className,
    animate = 'fadeIn',
    delay = 'none',
    duration = 'normal',
    repeat = false,
    ...props
  }: MotionProps & React.HTMLAttributes<HTMLDivElement>) => {
    const getDelayClass = () => {
      switch (delay) {
        case 'short':
          return 'delay-100';
        case 'medium':
          return 'delay-300';
        case 'long':
          return 'delay-500';
        default:
          return 'delay-0';
      }
    };

    const getDurationClass = () => {
      switch (duration) {
        case 'fast':
          return 'duration-200';
        case 'slow':
          return 'duration-700';
        default:
          return 'duration-300';
      }
    };

    const getAnimationClass = () => {
      switch (animate) {
        case 'fadeIn':
          return 'animate-fade-in';
        case 'fadeOut':
          return 'animate-fade-out';
        case 'slideIn':
          return 'animate-slide-in-right';
        case 'slideOut':
          return 'animate-slide-out-right';
        case 'pulse':
          return 'animate-pulse-slow';
        case 'bounce':
          return 'animate-bounce';
        default:
          return '';
      }
    };

    return (
      <div
        className={cn(
          getAnimationClass(),
          getDelayClass(),
          getDurationClass(),
          repeat && 'animation-iteration-count-infinite',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
};

export default motion;
