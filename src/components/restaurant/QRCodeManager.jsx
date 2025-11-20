import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { QrCode, Download, Plus, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";

export default function QRCodeManager({ restaurant, tables = [] }) {
  const [addTableDialog, setAddTableDialog] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const queryClient = useQueryClient();

  const createTableMutation = useMutation({
    mutationFn: (data) => base44.entities.Table.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setAddTableDialog(false);
      setTableNumber("");
      toast.success("Table ajoutée!");
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id) => base44.entities.Table.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success("Table supprimée!");
    },
  });

  const generateQRCodeURL = (table) => {
    const orderURL = `${window.location.origin}/CustomerApp?restaurant=${restaurant.id}&table=${table.table_number}&type=dine_in`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderURL)}`;
  };

  const downloadQRCode = async (table) => {
    const qrURL = generateQRCodeURL(table);
    const response = await fetch(qrURL);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-${table.table_number}-qr.png`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("QR Code téléchargé!");
  };

  const printQRCode = (table) => {
    const qrURL = generateQRCodeURL(table);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${table.table_number} - QR Code</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 40px;
              border: 3px solid #000;
              border-radius: 20px;
            }
            h1 { 
              font-size: 48px; 
              margin: 0 0 20px 0;
              color: #1e293b;
            }
            p {
              font-size: 24px;
              margin: 20px 0;
              color: #475569;
            }
            img { 
              margin: 20px 0;
              border: 2px solid #e2e8f0;
              border-radius: 10px;
            }
            .footer {
              margin-top: 20px;
              font-size: 18px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${restaurant.name}</h1>
            <h2 style="font-size: 36px; margin: 10px 0; color: #0ea5e9;">Table ${table.table_number}</h2>
            <p>📱 Scannez pour commander</p>
            <img src="${qrURL}" alt="QR Code" />
            <p class="footer">Scan & Order</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleAddTable = () => {
    if (!tableNumber.trim()) {
      toast.error("Numéro de table requis");
      return;
    }

    createTableMutation.mutate({
      restaurant_id: restaurant.id,
      table_number: tableNumber.trim(),
      status: "available"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Codes QR des Tables</h3>
          <p className="text-sm text-slate-600">Générez des QR codes pour commandes sur table</p>
        </div>
        <Button onClick={() => setAddTableDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Table
        </Button>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Aucune table configurée</p>
            <Button onClick={() => setAddTableDialog(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre première table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <Card key={table.id} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center">
                  <span>Table {table.table_number}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteTableMutation.mutate(table.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                  <img
                    src={generateQRCodeURL(table)}
                    alt={`QR Code Table ${table.table_number}`}
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadQRCode(table)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Télécharger
                  </Button>
                  <Button
                    onClick={() => printQRCode(table)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Printer className="w-3 h-3 mr-1" />
                    Imprimer
                  </Button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Les clients scannent pour commander
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addTableDialog} onOpenChange={setAddTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Numéro de Table *</Label>
              <Input
                placeholder="Ex: 1, A1, VIP-1"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTableDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTable} disabled={createTableMutation.isPending}>
              {createTableMutation.isPending ? "Ajout..." : "Ajouter Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}