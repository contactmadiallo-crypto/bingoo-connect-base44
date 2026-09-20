import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * RouteTransition
 *
 * Wraps <Routes> in a Framer Motion layout that plays a clean horizontal
 * slide-in on page enter. Keying the motion container on the pathname remounts
 * it on navigation, so each new page slides in from the right while the
 * previous page is removed. Query-only changes (same pathname) do not remount,
 * so in-page view switches stay transition-free.
 */
export default function RouteTransition({ children }) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      {React.cloneElement(children, { location })}
    </motion.div>
  );
}