import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, TrendingUp, TrendingDown, ArrowUpDown, Download } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import StatsCard from "../components/work/StatsCard";

export default function Finance() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other",
    date: new Date().toISOString().split('T')[0],
    project_id: "",
    status: "pending"
  });

  const queryClient = useQueryClient();

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date'),
    initialData: [],
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDialogOpen(false);
      setFormData({
        description: "",
        amount: "",
        category: "other",
        date: new Date().toISOString().split('T')[0],
        project_id: "",
        status: "pending"
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createExpenseMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  const exportToCSV = () => {
    const headers = ["Date", "Description", "Category", "Amount", "Status", "Project"];
    const rows = expenses.map(exp => [
      format(new Date(exp.date), "yyyy-MM-dd"),
      exp.description,
      exp.category,
      exp.amount,
      exp.status,
      projects.find(p => p.id === exp.project_id)?.name || ""
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const stats = {
    totalExpenses: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    pendingExpenses: expenses.filter(e => e.status === 'pending').reduce((sum, exp) => sum + (exp.amount || 0), 0),
    paidExpenses: expenses.filter(e => e.status === 'paid').reduce((sum, exp) => sum + (exp.amount || 0), 0),
    thisMonthExpenses: expenses.filter(e => {
      const expDate = new Date(e.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).reduce((sum, exp) => sum + (exp.amount || 0), 0)
  };

  const categoryColors = {
    materials: "bg-blue-100 text-blue-700",
    software: "bg-purple-100 text-purple-700",
    services: "bg-green-100 text-green-700",
    travel: "bg-orange-100 text-orange-700",
    equipment: "bg-red-100 text-red-700",
    marketing: "bg-pink-100 text-pink-700",
    salary: "bg-indigo-100 text-indigo-700",
    other: "bg-gray-100 text-gray-700"
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700"
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Finance Dashboard
            </h1>
            <p className="text-slate-600">Track expenses and budgets</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Expenses"
            value={`$${stats.totalExpenses.toFixed(2)}`}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-red-500 to-red-600"
          />
          <StatsCard
            title="Pending"
            value={`$${stats.pendingExpenses.toFixed(2)}`}
            icon={TrendingDown}
            gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatsCard
            title="Paid"
            value={`$${stats.paidExpenses.toFixed(2)}`}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatsCard
            title="This Month"
            value={`$${stats.thisMonthExpenses.toFixed(2)}`}
            icon={ArrowUpDown}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No expenses recorded yet</p>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{expense.description}</h3>
                        <Badge className={categoryColors[expense.category]}>
                          {expense.category}
                        </Badge>
                        <Badge className={statusColors[expense.status]}>
                          {expense.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                        {expense.project_id && (
                          <span>• {projects.find(p => p.id === expense.project_id)?.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">${expense.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project (Optional)</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-600">
                  Add Expense
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}