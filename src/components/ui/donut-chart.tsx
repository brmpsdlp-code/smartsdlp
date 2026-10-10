"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface DonutChartSegment {
  value: number;
  color: string;
  label: string;
  percentage?: number;
  [key: string]: any;
}

export interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DonutChartSegment[];
  totalValue?: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
  animationDelayPerSegment?: number;
  highlightOnHover?: boolean;
  centerContent?: React.ReactNode;
  activeSegmentLabel?: string | null;
  onSegmentHover?: (segment: DonutChartSegment | null) => void;
  onSegmentClick?: (segment: DonutChartSegment) => void;
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data,
      totalValue: propTotalValue,
      size = 200,
      strokeWidth = 20,
      animationDuration = 1,
      animationDelayPerSegment = 0.05,
      highlightOnHover = true,
      centerContent,
      activeSegmentLabel,
      onSegmentHover,
      onSegmentClick,
      className,
      ...props
    },
    ref
  ) => {
    const [internalHovered, setInternalHovered] =
      React.useState<DonutChartSegment | null>(null);

    const activeHovered = React.useMemo(() => {
      if (activeSegmentLabel !== undefined) {
        return data.find((s) => s.label === activeSegmentLabel) || null;
      }
      return internalHovered;
    }, [activeSegmentLabel, data, internalHovered]);

    const internalTotalValue = React.useMemo(
      () =>
        propTotalValue || data.reduce((sum, segment) => sum + segment.value, 0),
      [data, propTotalValue]
    );

    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const visibleSegments = data.filter((segment) => segment.value > 0);
    const minimumAngle = visibleSegments.length
      ? Math.min(2, 360 / visibleSegments.length)
      : 0;
    const rawAngles = data.map((segment) =>
      internalTotalValue > 0 ? (segment.value / internalTotalValue) * 360 : 0,
    );
    const excessAngle = rawAngles.reduce(
      (sum, angle) => sum + Math.max(angle - minimumAngle, 0),
      0,
    );
    const remainingAngle = 360 - visibleSegments.length * minimumAngle;
    const excessScale = excessAngle > 0 ? remainingAngle / excessAngle : 0;
    let cumulativeAngle = 0;

    React.useEffect(() => {
      onSegmentHover?.(internalHovered);
    }, [internalHovered, onSegmentHover]);

    const handleMouseLeave = () => {
      setInternalHovered(null);
      if (onSegmentHover) {
        onSegmentHover(null);
      }
    };

    const hasActiveSelection = Boolean(activeHovered);

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible -rotate-90"
        >
          {/* Base background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="hsl(215 20% 92%)"
            strokeWidth={strokeWidth}
          />

          {/* Data Segments */}
          <AnimatePresence>
            {data.map((segment, index) => {
              if (segment.value === 0) return null;
               const rawAngle = rawAngles[index];
               const visualAngle =
                 rawAngle >= minimumAngle
                   ? minimumAngle + (rawAngle - minimumAngle) * excessScale
                   : minimumAngle;
               const strokeDasharray = `${(visualAngle / 360) * circumference} ${circumference}`;
               const strokeDashoffset = (cumulativeAngle / 360) * circumference;

              const isActive = activeHovered?.label === segment.label;
              const isDimmed = hasActiveSelection && !isActive;

              cumulativeAngle += visualAngle;

              return (
                <motion.circle
                  key={segment.label || index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={isActive ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-strokeDashoffset}
                  strokeLinecap="round"
                  initial={{ opacity: 0, strokeDashoffset: circumference }}
                  animate={{
                    opacity: isDimmed ? 0.4 : 1,
                    strokeDashoffset: -strokeDashoffset,
                  }}
                  transition={{
                    opacity: { duration: 0.2 },
                    strokeDashoffset: {
                      duration: animationDuration,
                      delay: index * animationDelayPerSegment,
                      ease: "easeOut",
                    },
                  }}
                  className={cn(
                    "origin-center transition-all duration-200",
                    highlightOnHover && "cursor-pointer"
                  )}
                  style={{
                    filter: isActive
                      ? `drop-shadow(0px 0px 8px ${segment.color}) brightness(1.12)`
                      : isDimmed
                      ? "grayscale(25%) opacity(0.45)"
                      : "none",
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transition: "filter 0.2s ease-out, transform 0.2s ease-out, opacity 0.2s ease-out",
                  }}
                  onMouseEnter={() => {
                    setInternalHovered(segment);
                    onSegmentHover?.(segment);
                  }}
                  onClick={() => {
                    onSegmentClick?.(segment);
                  }}
                />
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Center Content */}
        {centerContent && (
          <div
            className="absolute flex flex-col items-center justify-center pointer-events-none text-center px-2"
            style={{
              width: size - strokeWidth * 2.4,
              height: size - strokeWidth * 2.4,
            }}
          >
            {centerContent}
          </div>
        )}
      </div>
    );
  }
);

DonutChart.displayName = "DonutChart";

export { DonutChart };


