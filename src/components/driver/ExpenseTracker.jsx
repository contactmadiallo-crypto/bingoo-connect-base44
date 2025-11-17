import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Fuel, Wrench, Shield, CreditCard, ParkingCircle, Receipt } from "lucide-react";
import { toast } from "sonner";

const expenseTypes = [
  { value: "fuel", label: "Carburant", icon: Fuel, color: "bg-red-100 text-red-700" },
  { value: "maintenance", label: "Entretien", icon: Wrench, color: "bg-blue-100 text-blue-700" },
  { value: "insurance", label: "Assurance", icon: Shield, color: "bg-green-100 text-green-700" },
  { value: "vehicle_payment", label: "Paiement Véhicule", icon: CreditCard, color: "bg-purple-100 text-purple-700" },
  { value: "parking", label: "Stationnement", icon: ParkingCircle, color: "bg-yellow-100 text-yellow-700" },
  { value: "tolls", label: "Péages", icon: Receipt, color: "bg-orange-100 text-orange-700" },
  { value: "other", label: "Autre", icon: FileText, color: "bg-slate-100 text-slate-700" }
];

export default function ExpenseTracker({ driver }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    expense_type: "fuel",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    odometer_reading: ""
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: expenses = [] } = useQuery({
    queryKey: ['driver-expenses', driver?.id],
    queryFn: () => base44.entities.DriverExpense.filter({ driver_id: driver.id }, '-date'),
    enabled: !!driver?.id,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data) => {
      let receiptUrl = null;
      if (receiptFile) {
        const upload = await base44.integrations.Core.UploadFile({ file: receiptFile });
        receiptUrl = upload.file_url;
      }
      return base44.entities.DriverExpense.create({
        ...data,
        driver_id: driver.id,
        driver_name: driver.full_name,
        receipt_url: receiptUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-expenses'] });
      setShowAddDialog(false);
      setNewExpense({
        expense_type: "fuel",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        odometer_reading: ""
      });
      setReceiptFile(null);
      toast.success("Dépense ajoutée!");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => base44.entities.DriverExpense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-expenses'] });
      toast.success("Dépense supprimée!");
    },
  });

  const handleSubmit = () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.error("Montant invalide");
      return;
    }
    createExpenseMutation.mutate({
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      odometer_reading: newExpense.odometer_reading ? parseFloat(newExpense.odometer_reading) : undefined
    });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesByType = expenses.reduce((acc, e) => {
    acc[e.expense_type] = (acc[e.expense_type] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">📊 Suivi des Dépenses</h3>
          <p className="text-sm text-slate-600">Gérez vos dépenses pour calculer le revenu net</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Dépense
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-600 mb-2">Total des Dépenses</p>
          <p className="text-3xl font-bold text-red-700">{totalExpenses.toFixed(0)} CFA</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {expenseTypes.map((type) => {
          const amount = expensesByType[type.value] || 0;
          const Icon = type.icon;
          return (
            <Card key={type.value}>
              <CardContent className="pt-4">
                <Icon className="w-5 h-5 mb-2 text-slate-600" />
                <p className="text-xs text-slate-600">{type.label}</p>
                <p className="text-lg font-bold">{amount.toFixed(0)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>Aucune dépense enregistrée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => {
                const expenseType = expenseTypes.find(t => t.value === expense.expense_type);
                const Icon = expenseType?.icon || FileText;
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="w-5 h-5 text-slate-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{expenseType?.label}</p>
                        <p className="text-xs text-slate-600">{new Date(expense.date).toLocaleDateString('fr-FR')}</p>
                        {expense.description && (
                          <p className="text-xs text-slate-500 mt-1">{expense.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-red-600">{expense.amount.toFixed(0)} CFA</p>
                      {expense.receipt_url && (
                        <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Receipt className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteExpenseMutation.mutate(expense.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une Dépense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type de Dépense *</Label>
              <Select value={newExpense.expense_type} onValueChange={(value) => setNewExpense({...newExpense, expense_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Montant (CFA) *</Label>
              <Input
                type="number"
                placeholder="5000"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Kilométrage (optionnel)</Label>
              <Input
                type="number"
                placeholder="Ex: 25000"
                value={newExpense.odometer_reading}
                onChange={(e) => setNewExpense({...newExpense, odometer_reading: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Détails supplémentaires..."
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Reçu (optionnel)</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={createExpenseMutation.isPending}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}