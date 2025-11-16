import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, ListChecks, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { differenceInMinutes } from "date-fns";
import StatsCard from "../components/work/StatsCard";
import WorkItem from "../components/work/WorkItem";
import WorkFilters from "../components/work/WorkFilters";
import QuickAddButton from "../components/work/QuickAddButton";
import ActiveTimer from "../components/work/ActiveTimer";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    search: ""
  });

  const queryClient = useQueryClient();

  const { data: workItems, isLoading } = useQuery({
    queryKey: ['work'],
    queryFn: () => base44.entities.Work.list('-created_date'),
    initialData: [],
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.WorkSession.list('-created_date'),
    initialData: [],
  });

  const createWorkMutation = useMutation({
    mutationFn: (data) => base44.entities.Work.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work'] });
    },
  });

  const updateWorkMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Work.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work'] });
    },
  });

  const deleteWorkMutation = useMutation({
    mutationFn: (id) => base44.entities.Work.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work'] });
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkSession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkSession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const activeSession = sessions.find(s => s.is_active);

  const handleQuickAdd = async (data) => {
    const newWork = await createWorkMutation.mutateAsync({
      ...data,
      status: "in_progress"
    });
    
    // Automatically start timer for the new work
    await createSessionMutation.mutateAsync({
      work_id: newWork.id,
      work_title: newWork.title,
      start_time: new Date().toISOString(),
      is_active: true
    });
  };

  const handleStartTimer = async (work) => {
    // Stop any active session first
    if (activeSession) {
      await handleStopTimer(activeSession, "");
    }

    // Update work status to in_progress
    await updateWorkMutation.mutateAsync({
      id: work.id,
      data: { ...work, status: "in_progress" }
    });

    // Create new session
    await createSessionMutation.mutateAsync({
      work_id: work.id,
      work_title: work.title,
      start_time: new Date().toISOString(),
      is_active: true
    });
  };

  const handleStopTimer = async (session, notes) => {
    const endTime = new Date();
    const startTime = new Date(session.start_time);
    const durationMinutes = differenceInMinutes(endTime, startTime);

    await updateSessionMutation.mutateAsync({
      id: session.id,
      data: {
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        is_active: false,
        notes: notes || undefined
      }
    });
  };

  const handleStatusChange = (work) => {
    const statusOrder = ['pending', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(work.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    updateWorkMutation.mutate({
      id: work.id,
      data: { ...work, status: nextStatus }
    });
  };

  const handleEdit = (work) => {
    const url = `${createPageUrl("AddWork")}?id=${work.id}`;
    window.location.href = url;
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this work item?")) {
      deleteWorkMutation.mutate(id);
    }
  };

  const getWorkTotalHours = (workId) => {
    const workSessions = sessions.filter(s => s.work_id === workId && !s.is_active);
    const totalMinutes = workSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    return totalMinutes / 60;
  };

  const filteredWork = workItems.filter(work => {
    const matchesStatus = filters.status === "all" || work.status === filters.status;
    const matchesPriority = filters.priority === "all" || work.priority === filters.priority;
    const matchesCategory = filters.category === "all" || work.category === filters.category;
    const matchesSearch = !filters.search || 
      work.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      work.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  const stats = {
    total: workItems.length,
    pending: workItems.filter(w => w.status === 'pending').length,
    inProgress: workItems.filter(w => w.status === 'in_progress').length,
    completed: workItems.filter(w => w.status === 'completed').length,
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Work Dashboard
            </h1>
            <p className="text-slate-600">Track and manage your pending work items</p>
          </div>
          <Link to={createPageUrl("AddWork")}>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 w-full md:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Add New Work
            </Button>
          </Link>
        </div>

        <ActiveTimer 
          session={activeSession} 
          onStop={handleStopTimer}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard 
            title="Total Work" 
            value={stats.total}
            icon={ListChecks}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatsCard 
            title="Pending" 
            value={stats.pending}
            icon={Clock}
            gradient="bg-gradient-to-br from-slate-500 to-slate-600"
            delay={0.1}
          />
          <StatsCard 
            title="In Progress" 
            value={stats.inProgress}
            icon={AlertCircle}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            delay={0.2}
          />
          <StatsCard 
            title="Completed" 
            value={stats.completed}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            delay={0.3}
          />
        </div>

        <WorkFilters filters={filters} onFilterChange={setFilters} />

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          </div>
        ) : filteredWork.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListChecks className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No work items found</h3>
            <p className="text-slate-600 mb-6">
              {workItems.length === 0 
                ? "Use the quick add button below to get started" 
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence>
              {filteredWork.map((work) => (
                <WorkItem
                  key={work.id}
                  work={work}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onStartTimer={handleStartTimer}
                  onStopTimer={handleStopTimer}
                  isTimerActive={activeSession?.work_id === work.id}
                  totalHours={getWorkTotalHours(work.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <QuickAddButton 
          onQuickAdd={handleQuickAdd}
          isSubmitting={createWorkMutation.isPending || createSessionMutation.isPending}
        />
      </div>
    </div>
  );
}