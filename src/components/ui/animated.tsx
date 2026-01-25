'use client';

import { motion } from 'framer-motion';

interface AnimatedProps {
  children: React.ReactNode;
  [key: string]: any;
}

export const FadeIn = ({ children, delay = 0, ...props }: AnimatedProps & { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideIn = ({
  children,
  direction = 'left',
  ...props
}: AnimatedProps & { direction?: 'left' | 'right' | 'up' | 'down' }) => {
  const directions = {
    left: { x: -50 },
    right: { x: 50 },
    up: { y: -50 },
    down: { y: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn = ({ children, ...props }: AnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerChildren = ({ children, ...props }: AnimatedProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      visible: { transition: { staggerChildren: 0.1 } },
    }}
    {...props}
  >
    {children}
  </motion.div>
);
