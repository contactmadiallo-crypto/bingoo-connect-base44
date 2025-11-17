import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RestaurantMenuEditor({ restaurant, open, onOpenChange }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "main_course",
    available: true,
    preparation_time: 15
  });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: menuItems = [] } = useQuery({
    queryKey: ['restaurant-menu', restaurant?.id],
    queryFn: () => base44.entities.MenuItem.filter({ restaurant_id: restaurant.id }),
    enabled: !!restaurant?.id && open,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const itemData = {
        ...data,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name
      };

      if (editingItem) {
        return base44.entities.MenuItem.update(editingItem.id, itemData);
      } else {
        return base44.entities.MenuItem.create(itemData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['all-menu-items'] });
      toast.success(editingItem ? "Plat mis à jour" : "Plat ajouté");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MenuItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      queryClient.invalidateQueries({ queryKey: ['all-menu-items'] });
      toast.success("Plat supprimé");
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast.success("Image uploadée");
    } catch (error) {
      toast.error("Erreur d'upload");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setShowForm(false);
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "main_course",
      available: true,
      preparation_time: 15
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    saveMutation.mutate(formData);
  };

  const categories = {
    appetizers: "Entrées",
    main_course: "Plats Principaux",
    daily_special: "Spécialité du Jour",
    chef_special: "Spécialité du Chef",
    desserts: "Desserts",
    beverages: "Boissons",
    sides: "Accompagnements",
    salads: "Salades",
    soups: "Soupes",
    breakfast: "Petit-Déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner"
  };

  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (!restaurant) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) resetForm();
    }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Menu de {restaurant.name}</DialogTitle>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "Annuler" : "Ajouter un Plat"}
            </Button>
          </div>
        </DialogHeader>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du Plat *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Prix (CFA) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Temps de Préparation (min)</Label>
                <Input
                  type="number"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  )}
                  <Button type="button" variant="outline" onClick={() => document.getElementById('menu-image-upload').click()} disabled={uploading}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Upload..." : "Télécharger Image"}
                  </Button>
                  <input
                    id="menu-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{categories[category] || category}</span>
                <Badge variant="outline">{items.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <Badge className={item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                              {item.available ? "Disponible" : "Indisponible"}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-orange-600">{item.price} CFA</p>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(item.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {menuItems.length === 0 && !showForm && (
            <div className="text-center py-12 text-slate-500">
              <p>Aucun plat dans le menu</p>
              <p className="text-sm">Cliquez sur "Ajouter un Plat" pour commencer</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}