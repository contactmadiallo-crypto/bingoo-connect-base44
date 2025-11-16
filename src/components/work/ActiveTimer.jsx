import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Square, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInSeconds } from "date-fns";

export default function ActiveTimer({ session, onStop }) {
  const [elapsed, setElapsed] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!session) return;

    const updateElapsed = () => {
      const seconds = differenceInSeconds(new Date(), new Date(session.start_time));
      setElapsed(seconds);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Clock className="w-8 h-8" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-sm opacity-90">Currently Working On</p>
                <p className="font-bold text-xl">{session.work_title}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-mono text-4xl font-bold">
              {formatTime(elapsed)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNotes(!showNotes)}
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                {showNotes ? 'Hide Notes' : 'Add Notes'}
              </Button>
              <Button
                onClick={() => onStop(session, notes)}
                className="bg-white text-green-600 hover:bg-white/90"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Timer
              </Button>
            </div>
          </div>

          {showNotes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4"
            >
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this work session..."
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 resize-none"
                rows={3}
              />
            </motion.div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}