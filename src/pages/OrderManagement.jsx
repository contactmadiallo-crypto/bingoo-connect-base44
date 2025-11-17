import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, Download, Package, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminAuthGuard from "../components/AdminAuthGuard";
import { toast } from "sonner";

function OrderManagementContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants-list'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers-list'],
    queryFn: () => base44.entities.DeliveryPartner.list(),
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        order.order_number?.toLowerCase().includes(searchLower) ||
        order.customer_name?.toLowerCase().includes(searchLower) ||
        order.customer_phone?.toLowerCase().includes(searchLower) ||
        order.restaurant_name?.toLowerCase().includes(searchLower);

      // Status filter
      const matchStatus = statusFilter === "all" || order.status === statusFilter;

      // Restaurant filter
      const matchRestaurant = restaurantFilter === "all" || order.restaurant_id === restaurantFilter;

      // Driver filter
      const matchDriver = driverFilter === "all" || order.delivery_partner_id === driverFilter;

      // Date filter
      let matchDate = true;
      if (dateFilter !== "all") {
        const orderDate = new Date(order.created_date);
        const now = new Date();
        
        if (dateFilter === "today") {
          matchDate = orderDate.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchDate = orderDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchDate = orderDate >= monthAgo;
        }
      }

      return matchSearch && matchStatus && matchRestaurant && matchDriver && matchDate;
    });
  }, [orders, searchQuery, statusFilter, restaurantFilter, driverFilter, dateFilter]);

  const stats = useMemo(() => {
    return {
      total: filteredOrders.length,
      revenue: filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      completed: filteredOrders.filter(o => o.status === 'delivered').length,
    };
  }, [filteredOrders]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setRestaurantFilter("all");
    setDriverFilter("all");
    setDateFilter("all");
  };

  const exportOrders = () => {
    const csv = [
      ['Numéro', 'Date', 'Restaurant', 'Client', 'Montant', 'Statut', 'Chauffeur'].join(','),
      ...filteredOrders.map(o => [
        o.order_number,
        new Date(o.created_date).toLocaleDateString(),
        o.restaurant_name,
        o.customer_name,
        o.total_amount,
        o.status,
        o.driver_name || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString()}.csv`;
    a.click();
    toast.success("Export réussi");
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    ready: "bg-indigo-100 text-indigo-700",
    out_for_delivery: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700"
  };

  const statusLabels = {
    pending: "En Attente",
    confirmed: "Confirmé",
    preparing: "En Préparation",
    ready: "Prêt",
    out_for_delivery: "En Livraison",
    delivered: "Livré",
    cancelled: "Annulé"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📦 Gestion des Commandes</h1>
          <p className="text-slate-600">Recherche avancée et filtrage des commandes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Revenu</p>
                  <p className="text-3xl font-bold text-green-600">{stats.revenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">En Attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Livrés</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtres et Recherche
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
                <Button variant="outline" size="sm" onClick={exportOrders}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher par numéro de commande, client, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les Statuts</SelectItem>
                    <SelectItem value="pending">En Attente</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="preparing">En Préparation</SelectItem>
                    <SelectItem value="ready">Prêt</SelectItem>
                    <SelectItem value="out_for_delivery">En Livraison</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Restaurant</Label>
                <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les Restaurants</SelectItem>
                    {restaurants.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chauffeur</Label>
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les Chauffeurs</SelectItem>
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Période</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les Dates</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette Semaine</SelectItem>
                    <SelectItem value="month">Ce Mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedOrder(order);
                    setDetailsDialog(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold">{order.order_number}</p>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {new Date(order.created_date).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-green-600">{order.total_amount?.toFixed(0)} CFA</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Restaurant</p>
                      <p className="font-semibold">{order.restaurant_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Client</p>
                      <p className="font-semibold">{order.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Téléphone</p>
                      <p className="font-semibold">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Chauffeur</p>
                      <p className="font-semibold">{order.driver_name || "Non assigné"}</p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p>Aucune commande trouvée</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Commande</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Numéro</p>
                  <p className="font-bold">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Statut</p>
                  <Badge className={statusColors[selectedOrder.status]}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.created_date).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Montant Total</p>
                  <p className="font-bold text-green-600">{selectedOrder.total_amount?.toFixed(0)} CFA</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Restaurant</p>
                <p>{selectedOrder.restaurant_name}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Client</p>
                <p>{selectedOrder.customer_name}</p>
                <p className="text-sm text-slate-600">{selectedOrder.customer_phone}</p>
                <p className="text-sm text-slate-600">{selectedOrder.customer_address}</p>
              </div>

              {selectedOrder.driver_name && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Chauffeur</p>
                  <p>{selectedOrder.driver_name}</p>
                  <p className="text-sm text-slate-600">{selectedOrder.driver_phone}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3">Articles</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">{(item.price * item.quantity).toFixed(0)} CFA</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.special_instructions && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Instructions Spéciales</p>
                  <p className="text-sm text-slate-600">{selectedOrder.special_instructions}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrderManagement() {
  return (
    <AdminAuthGuard>
      <OrderManagementContent />
    </AdminAuthGuard>
  );
}