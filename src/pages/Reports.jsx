import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import StatsCard from "../components/work/StatsCard";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Reports() {
  const { data: workItems } = useQuery({
    queryKey: ['work'],
    queryFn: () => base44.entities.Work.list(),
    initialData: [],
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.WorkSession.list(),
    initialData: [],
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list(),
    initialData: [],
  });

  // Status distribution
  const statusData = [
    { name: 'Pending', value: workItems.filter(w => w.status === 'pending').length },
    { name: 'In Progress', value: workItems.filter(w => w.status === 'in_progress').length },
    { name: 'Completed', value: workItems.filter(w => w.status === 'completed').length },
  ];

  // Priority distribution
  const priorityData = [
    { name: 'Low', value: workItems.filter(w => w.priority === 'low').length },
    { name: 'Medium', value: workItems.filter(w => w.priority === 'medium').length },
    { name: 'High', value: workItems.filter(w => w.priority === 'high').length },
    { name: 'Urgent', value: workItems.filter(w => w.priority === 'urgent').length },
  ];

  // Category distribution
  const categoryData = Object.entries(
    workItems.reduce((acc, work) => {
      acc[work.category] = (acc[work.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Time tracking
  const totalMinutes = sessions.filter(s => !s.is_active).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Expenses by category
  const expensesByCategory = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), amount: value }));

  // Project progress
  const projectProgress = projects.map(project => {
    const projectWork = workItems.filter(w => w.project_id === project.id);
    const completed = projectWork.filter(w => w.status === 'completed').length;
    const total = projectWork.length;
    return {
      name: project.name,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });

  const stats = {
    completionRate: workItems.length > 0 
      ? Math.round((workItems.filter(w => w.status === 'completed').length / workItems.length) * 100)
      : 0,
    totalHours: totalHours,
    totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    activeProjects: projects.filter(p => p.status === 'active').length
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Reports & Analytics
          </h1>
          <p className="text-slate-600">Insights into your work and productivity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatsCard
            title="Hours Tracked"
            value={stats.totalHours}
            icon={Clock}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Total Expenses"
            value={`$${stats.totalExpenses.toFixed(0)}`}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-red-500 to-red-600"
          />
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={AlertCircle}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Work Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Work by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {projectProgress.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}