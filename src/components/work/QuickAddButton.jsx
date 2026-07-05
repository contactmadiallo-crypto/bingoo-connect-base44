import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickAddButton({ onQuickAdd, isSubmitting }) {
  const [open, setOpen] = useState(false);
  const [quickData, setQuickData] = useState({
    title: "",
    priority: "medium",
    category: "other"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quickData.title.trim()) return;
    
    await onQuickAdd(quickData);
    setQuickData({ title: "", priority: "medium", category: "other" });
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Quick Add Work
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="What needs to be done?"
              value={quickData.title}
              onChange={(e) => setQuickData({ ...quickData, title: e.target.value })}
              autoFocus
              className="text-base"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <MobileSelect
                value={quickData.priority}
                onValueChange={(value) => setQuickData({ ...quickData, priority: value })}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
                ariaLabel="Priority"
              />

              <MobileSelect
                value={quickData.category}
                onValueChange={(value) => setQuickData({ ...quickData, category: value })}
                options={[
                  { value: "development", label: "💻 Dev" },
                  { value: "design", label: "🎨 Design" },
                  { value: "meeting", label: "👥 Meeting" },
                  { value: "bug_fix", label: "🐛 Bug" },
                  { value: "other", label: "📌 Other" },
                ]}
                ariaLabel="Category"
              />
            </div>

            <Button
              type="submit"
              disabled={!quickData.title.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Add & Start Work
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}