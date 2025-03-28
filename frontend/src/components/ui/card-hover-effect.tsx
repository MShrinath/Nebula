
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ComponentProps, useState } from "react";

export interface CardHoverEffectProps extends ComponentProps<typeof motion.div> {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const CardHoverEffect = ({
  children,
  className,
  containerClassName,
  ...rest
}: CardHoverEffectProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn("relative group", containerClassName)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl",
          className
        )}
        style={{
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
        }}
        animate={{
          scale: hovered ? 1.05 : 1,
        }}
        transition={{
          duration: 0.3,
        }}
        {...rest}
      />
      {children}
    </div>
  );
};
