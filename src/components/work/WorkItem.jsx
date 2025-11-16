import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Clock, Pencil, Trash2, Play, Square } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";

const priorityConfig = {
  low: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Low" },
  medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Medium" },
  high: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "High" },
  urgent: { color: "bg-red-100 text-red-700 border-red-200", label: "Urgent" }
};

const statusConfig = {
  pending: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Pending" },
  in_progress: { color: "bg-purple-100 text-purple-700 border-purple-200", label: "In Progress" },
  completed: { color: "bg-green-100 text-green-700 border-green-200", label: "Completed" }
};

const categoryConfig = {
  development: { emoji: "💻" },
  design: { emoji: "🎨" },
  meeting: { emoji: "👥" },
  documentation: { emoji: "📄" },
  bug_fix: { emoji: "🐛" },
  testing: { emoji: "🧪" },
  review: { emoji: "👀" },
  research: { emoji: "🔍" },
  other: { emoji: "📌" }
};

export default function WorkItem({ work, onEdit, onDelete, onStatusChange, onStartTimer, onStopTimer, isTimerActive, totalHours }) {
  const isOverdue = work.due_date && isPast(new Date(work.due_date)) && work.status !== 'completed';
  const daysUntilDue = work.due_date ? differenceInDays(new Date(work.due_date), new Date()) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border ${
        isTimerActive ? 'border-green-400 ring-2 ring-green-400/30' : isOverdue ? 'border-red-300' : 'border-slate-200'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{categoryConfig[work.category]?.emoji}</span>
                <h3 className="font-semibold text-slate-900 text-lg">{work.title}</h3>
              </div>
              {work.description && (
                <p className="text-slate-600 text-sm line-clamp-2">{work.description}</p>
              )}
            </div>
            <div className="flex gap-1">
              {isTimerActive ? (
                <Button
                  size="icon"
                  onClick={() => onStopTimer(work)}
                  className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={() => onStartTimer(work)}
                  className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(work)}
                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(work.id)}
                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge 
              className={`${priorityConfig[work.priority].color} border font-medium`}
              variant="secondary"
            >
              {priorityConfig[work.priority].label}
            </Badge>
            <button
              onClick={() => onStatusChange(work)}
              className="transition-all duration-200 hover:scale-105"
            >
              <Badge 
                className={`${statusConfig[work.status].color} border font-medium cursor-pointer`}
                variant="secondary"
              >
                {statusConfig[work.status].label}
              </Badge>
            </button>
            <Badge variant="outline" className="text-slate-600 border-slate-300">
              {work.category.replace(/_/g, ' ')}
            </Badge>
            {isTimerActive && (
              <Badge className="bg-green-100 text-green-700 border-green-200 border animate-pulse">
                ⏱️ Active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {work.due_date && (
              <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(work.due_date), "MMM d, yyyy")}</span>
                {daysUntilDue !== null && !isOverdue && daysUntilDue <= 3 && daysUntilDue >= 0 && (
                  <span className="text-orange-600 font-medium">({daysUntilDue}d left)</span>
                )}
                {isOverdue && <span className="font-medium">(Overdue)</span>}
              </div>
            )}
            {totalHours > 0 && (
              <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>{totalHours.toFixed(1)}h tracked</span>
              </div>
            )}
            {work.estimated_hours && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{work.estimated_hours}h est.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}