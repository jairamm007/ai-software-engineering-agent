import Tilt from "react-parallax-tilt";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  tiltMax?: number;
  scale?: number;
  glareColor?: string;
  glareOpacity?: number;
  perspective?: number;
}

export default function TiltCard({
  children,
  className,
  innerClassName,
  tiltMax = 7,
  scale = 1.02,
  glareColor = "#8b5cf6",
  glareOpacity = 0.1,
  perspective = 1100,
}: TiltCardProps) {
  return (
    <Tilt
      tiltMaxAngleX={tiltMax}
      tiltMaxAngleY={tiltMax}
      perspective={perspective}
      scale={scale}
      transitionSpeed={700}
      glareEnable
      glareMaxOpacity={glareOpacity}
      glareColor={glareColor}
      glarePosition="all"
      className={cn("rounded-2xl", className)}
    >
      <div className={cn("h-full w-full", innerClassName)}>{children}</div>
    </Tilt>
  );
}
