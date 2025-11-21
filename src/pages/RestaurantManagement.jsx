import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, UtensilsCrossed, Star, Search, MapPin, Phone, Clock, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminAuthGuard from "../components/AdminAuthGuard";
import RestaurantForm from "../components/admin/RestaurantForm";
import RestaurantMenuEditor from "../components/admin/RestaurantMenuEditor";
import { toast } from "sonner";

function RestaurantManagementContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [menuDialog, setMenuDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date'),
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.RestaurantReview.list(),
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['all-menu-items'],
    queryFn: () => base44.entities.MenuItem.list(),
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id) => base44.entities.Restaurant.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      toast.success("Restaurant supprimé avec succès");
      setDeleteDialog(false);
      setSelectedRestaurant(null);
    },
  });

  const getRestaurantRating = (restaurantId) => {
    const reviews = allReviews.filter(r => r.restaurant_id === restaurantId);
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return { avg: avg.toFixed(1), count: reviews.length };
  };

  const getMenuItemsCount = (restaurantId) => {
    return menuItems.filter(m => m.restaurant_id === restaurantId).length;
  };

  const uniqueCities = [...new Set(restaurants.map(r => r.city).filter(Boolean))];

  const filteredRestaurants = restaurants.filter(r => {
    const matchSearch = !search || 
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine_type?.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchCuisine = cuisineFilter === "all" || r.cuisine_type === cuisineFilter;
    const matchBusinessType = businessTypeFilter === "all" || r.business_type === businessTypeFilter;
    const matchCity = cityFilter === "all" || r.city === cityFilter;
    
    return matchSearch && matchStatus && matchCuisine && matchBusinessType && matchCity;
  });

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditDialog(true);
  };

  const handleManageMenu = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenuDialog(true);
  };

  const handleDelete = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDeleteDialog(true);
  };

  const cuisineLabels = {
    african: "Africaine",
    italian: "Italienne",
    chinese: "Chinoise",
    indian: "Indienne",
    french: "Française",
    japanese: "Japonaise",
    mexican: "Mexicaine",
    thai: "Thaï",
    mediterranean: "Méditerranéenne",
    american: "Américaine",
    lebanese: "Libanaise",
    moroccan: "Marocaine",
    pizza: "Pizza",
    burgers: "Burgers",
    seafood: "Fruits de mer",
    fast_food: "Fast Food",
    vegetarian: "Végétarien",
    desserts: "Desserts",
    mixed: "Mixte"
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">🏪 Gestion des Restaurants</h1>
            <p className="text-slate-600">Gérez tous les restaurants de la plateforme</p>
          </div>
          <Button onClick={() => {
            setSelectedRestaurant(null);
            setEditDialog(true);
          }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Restaurant
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Restaurants</p>
                <p className="text-3xl font-bold text-blue-600">{restaurants.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Actifs</p>
                <p className="text-3xl font-bold text-green-600">
                  {restaurants.filter(r => r.status === 'active').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">En Attente</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {restaurants.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Menus</p>
                <p className="text-3xl font-bold text-purple-600">{menuItems.length}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, ville, cuisine, adresse..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Filtres:</span>
                </div>
                {(statusFilter !== "all" || cuisineFilter !== "all" || businessTypeFilter !== "all" || cityFilter !== "all") && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setStatusFilter("all");
                      setCuisineFilter("all");
                      setBusinessTypeFilter("all");
                      setCityFilter("all");
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Statut</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les Statuts</SelectItem>
                      <SelectItem value="active">✅ Actif</SelectItem>
                      <SelectItem value="pending">⏳ En Attente</SelectItem>
                      <SelectItem value="inactive">❌ Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Type de Cuisine</Label>
                  <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les Cuisines</SelectItem>
                      {Object.entries(cuisineLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Type d'Établissement</Label>
                  <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les Types</SelectItem>
                      <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                      <SelectItem value="grocery">🛒 Épicerie</SelectItem>
                      <SelectItem value="pharmacy">💊 Pharmacie</SelectItem>
                      <SelectItem value="local_shop">🏪 Commerce Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Ville</Label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les Villes</SelectItem>
                      {uniqueCities.map(city => (
                        <SelectItem key={city} value={city}>📍 {city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">{filteredRestaurants.length}</span> restaurant(s) trouvé(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => {
            const rating = getRestaurantRating(restaurant.id);
            const menuCount = getMenuItemsCount(restaurant.id);

            return (
              <Card key={restaurant.id} className="hover:shadow-xl transition-shadow">
                <CardHeader className="relative pb-2">
                  <div className="absolute top-4 right-4">
                    <Badge className={
                      restaurant.status === 'active' ? 'bg-green-100 text-green-700' :
                      restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {restaurant.status}
                    </Badge>
                  </div>
                  {restaurant.cover_image_url ? (
                    <img 
                      src={restaurant.cover_image_url} 
                      alt={restaurant.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-orange-200 to-amber-200 rounded-lg mb-3 flex items-center justify-center text-4xl">
                      🍽️
                    </div>
                  )}
                  <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant.city}, {restaurant.address}</span>
                    </div>
                    {restaurant.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{restaurant.phone}</span>
                      </div>
                    )}
                    {restaurant.open_hours && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.open_hours}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {cuisineLabels[restaurant.cuisine_type] || restaurant.cuisine_type}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3" />
                      {menuCount} plats
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{rating.avg}</span>
                    <span className="text-sm text-slate-500">({rating.count} avis)</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(restaurant)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleManageMenu(restaurant)}
                      className="flex-1"
                    >
                      <UtensilsCrossed className="w-4 h-4 mr-1" />
                      Menu
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(restaurant)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredRestaurants.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">Aucun restaurant trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>

      <RestaurantForm
        restaurant={selectedRestaurant}
        open={editDialog}
        onOpenChange={setEditDialog}
      />

      <RestaurantMenuEditor
        restaurant={selectedRestaurant}
        open={menuDialog}
        onOpenChange={setMenuDialog}
      />

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Êtes-vous sûr de vouloir supprimer <strong>{selectedRestaurant?.name}</strong> ?</p>
            <p className="text-sm text-red-600">Cette action est irréversible et supprimera également tous les menus associés.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialog(false)}>
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteRestaurantMutation.mutate(selectedRestaurant.id)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RestaurantManagement() {
  return (
    <AdminAuthGuard>
      <RestaurantManagementContent />
    </AdminAuthGuard>
  );
}