import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban, DollarSign, Calendar, Users, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors = {
  planning: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

const projectColors = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#06B6D4", "#6366F1", "#EF4444"
];

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    start_date: "",
    end_date: "",
    budget: "",
    color: projectColors[0]
  });

  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
    initialData: [],
  });

  const { data: allWork } = useQuery({
    queryKey: ['work'],
    queryFn: () => base44.entities.Work.list(),
    initialData: [],
  });

  const createProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "planning",
      start_date: "",
      end_date: "",
      budget: "",
      color: projectColors[0]
    });
    setEditingProject(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined
    };

    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: dataToSubmit });
    } else {
      createProjectMutation.mutate(dataToSubmit);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "planning",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      budget: project.budget || "",
      color: project.color || projectColors[0]
    });
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this project? Work items will not be deleted.")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const getProjectStats = (projectId) => {
    const projectWork = allWork.filter(w => w.project_id === projectId);
    return {
      total: projectWork.length,
      completed: projectWork.filter(w => w.status === 'completed').length,
      pending: projectWork.filter(w => w.status === 'pending').length
    };
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Projects
            </h1>
            <p className="text-slate-600">Organize your work into projects</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">Create your first project to get started</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-blue-500 to-blue-600">
              <Plus className="w-5 h-5 mr-2" />
              Create First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((project) => {
                const stats = getProjectStats(project.id);
                const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3" style={{ borderTop: `4px solid ${project.color}` }}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                            <Badge className={statusColors[project.status]}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEdit(project)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(project.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {project.description && (
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>
                        )}

                        <div className="space-y-3">
                          {project.budget && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">Budget: ${project.budget.toLocaleString()}</span>
                            </div>
                          )}

                          {project.end_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">Due: {format(new Date(project.end_date), "MMM d, yyyy")}</span>
                            </div>
                          )}

                          <div className="pt-3 border-t border-slate-200">
                            <div className="flex justify-between items-center mb-2 text-sm">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-semibold text-slate-900">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${progress}%`,
                                  backgroundColor: project.color
                                }}
                              />
                            </div>
                            <div className="flex gap-3 mt-2 text-xs text-slate-500">
                              <span>{stats.total} total</span>
                              <span>{stats.completed} done</span>
                              <span>{stats.pending} pending</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Color</Label>
                <div className="flex gap-2">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600">
                  {editingProject ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}