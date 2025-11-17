import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function RestaurantForm({ restaurant, open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "Senegal",
    phone: "",
    email: "",
    owner_email: "",
    cuisine_type: "african",
    business_type: "restaurant",
    status: "active",
    delivery_fee: 5,
    min_order: 0,
    avg_delivery_time: 30,
    open_hours: "",
    commission_rate: 15
  });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (restaurant) {
      setFormData(restaurant);
    } else {
      setFormData({
        name: "",
        description: "",
        address: "",
        city: "",
        country: "Senegal",
        phone: "",
        email: "",
        owner_email: "",
        cuisine_type: "african",
        business_type: "restaurant",
        status: "active",
        delivery_fee: 5,
        min_order: 0,
        avg_delivery_time: 30,
        open_hours: "",
        commission_rate: 15
      });
    }
  }, [restaurant, open]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (restaurant) {
        return base44.entities.Restaurant.update(restaurant.id, data);
      } else {
        return base44.entities.Restaurant.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success(restaurant ? "Restaurant mis à jour" : "Restaurant créé");
      onOpenChange(false);
    },
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [field]: file_url });
      toast.success("Image uploadée");
    } catch (error) {
      toast.error("Erreur d'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.city || !formData.owner_email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{restaurant ? "Modifier" : "Nouveau"} Restaurant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Nom du Restaurant *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Type de Business</Label>
              <Select value={formData.business_type} onValueChange={(v) => setFormData({ ...formData, business_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="grocery">Épicerie</SelectItem>
                  <SelectItem value="pharmacy">Pharmacie</SelectItem>
                  <SelectItem value="local_shop">Boutique Locale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type de Cuisine</Label>
              <Select value={formData.cuisine_type} onValueChange={(v) => setFormData({ ...formData, cuisine_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="african">Africaine</SelectItem>
                  <SelectItem value="italian">Italienne</SelectItem>
                  <SelectItem value="chinese">Chinoise</SelectItem>
                  <SelectItem value="indian">Indienne</SelectItem>
                  <SelectItem value="french">Française</SelectItem>
                  <SelectItem value="japanese">Japonaise</SelectItem>
                  <SelectItem value="mexican">Mexicaine</SelectItem>
                  <SelectItem value="thai">Thaï</SelectItem>
                  <SelectItem value="mediterranean">Méditerranéenne</SelectItem>
                  <SelectItem value="american">Américaine</SelectItem>
                  <SelectItem value="lebanese">Libanaise</SelectItem>
                  <SelectItem value="moroccan">Marocaine</SelectItem>
                  <SelectItem value="pizza">Pizza</SelectItem>
                  <SelectItem value="burgers">Burgers</SelectItem>
                  <SelectItem value="seafood">Fruits de mer</SelectItem>
                  <SelectItem value="fast_food">Fast Food</SelectItem>
                  <SelectItem value="vegetarian">Végétarien</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                  <SelectItem value="mixed">Mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Adresse *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ville *</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email du Propriétaire *</Label>
              <Input
                type="email"
                value={formData.owner_email}
                onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Horaires d'Ouverture</Label>
              <Input
                placeholder="Ex: 9:00 AM - 10:00 PM"
                value={formData.open_hours}
                onChange={(e) => setFormData({ ...formData, open_hours: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Frais de Livraison (CFA)</Label>
              <Input
                type="number"
                value={formData.delivery_fee}
                onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Commande Minimale (CFA)</Label>
              <Input
                type="number"
                value={formData.min_order}
                onChange={(e) => setFormData({ ...formData, min_order: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Temps de Livraison Moyen (min)</Label>
              <Input
                type="number"
                value={formData.avg_delivery_time}
                onChange={(e) => setFormData({ ...formData, avg_delivery_time: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Taux de Commission (%)</Label>
              <Input
                type="number"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En Attente</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded" />
                )}
                <Button type="button" variant="outline" onClick={() => document.getElementById('logo-upload').click()} disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Upload..." : "Télécharger Logo"}
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'logo_url')}
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Image de Couverture</Label>
              <div className="flex items-center gap-3">
                {formData.cover_image_url && (
                  <img src={formData.cover_image_url} alt="Cover" className="w-32 h-20 object-cover rounded" />
                )}
                <Button type="button" variant="outline" onClick={() => document.getElementById('cover-upload').click()} disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Upload..." : "Télécharger Couverture"}
                </Button>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'cover_image_url')}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {restaurant ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}