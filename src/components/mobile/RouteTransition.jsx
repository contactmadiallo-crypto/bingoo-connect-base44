import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * RouteTransition
 *
 * Wraps <Routes> with a slide-in / slide-out animation using Framer Motion
 * AnimatePresence (mode="wait"). The current location is cloned into the
 * <Routes> element so the exiting route keeps rendering its old content
 * during the exit animation (otherwise React Router would re-render the
 * new route immediately).
 */
export default function RouteTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="w-full"
      >
        {React.cloneElement(children, { location })}
      </motion.div>
    </AnimatePresence>
  );
}