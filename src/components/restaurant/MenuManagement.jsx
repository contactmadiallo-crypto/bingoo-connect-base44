import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Sparkles, Zap, Image as ImageIcon, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

export default function MenuManagement({ restaurant, menuItems }) {
  const [menuDialog, setMenuDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "main_course",
    image_url: "",
    preparation_time: "",
    available: true,
    ingredients: [],
    allergens: []
  });

  const queryClient = useQueryClient();

  const createMenuMutation = useMutation({
    mutationFn: (data) => base44.entities.MenuItem.create({ ...data, restaurant_id: restaurant?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setMenuDialog(false);
      resetMenuForm();
      toast.success("Article ajouté au menu!");
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MenuItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setMenuDialog(false);
      resetMenuForm();
      toast.success("Article mis à jour!");
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (id) => base44.entities.MenuItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success("Article supprimé!");
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, available }) => base44.entities.MenuItem.update(id, { available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success(available ? "Article maintenant disponible" : "Article marqué indisponible");
    },
  });

  const resetMenuForm = () => {
    setMenuForm({
      name: "",
      description: "",
      price: "",
      category: "main_course",
      image_url: "",
      preparation_time: "",
      available: true,
      ingredients: [],
      allergens: []
    });
    setEditingItem(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMenuForm({ ...menuForm, image_url: file_url });
      toast.success("Image uploadée!");
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const generateDescription = async () => {
    if (!menuForm.name) {
      toast.error("Entrez d'abord le nom du plat");
      return;
    }

    setGeneratingAI(true);
    try {
      const prompt = `Generate a compelling, mouth-watering menu description for a dish called "${menuForm.name}". 
      The description should be 2-3 sentences, appetizing, and highlight what makes this dish special. 
      Write in an elegant, professional style suitable for a restaurant menu.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setMenuForm({ ...menuForm, description: response });
      toast.success("Description générée!");
    } catch (error) {
      toast.error("Erreur lors de la génération");
    } finally {
      setGeneratingAI(false);
    }
  };

  const suggestPrice = async () => {
    if (!menuForm.name || !menuForm.category) {
      toast.error("Entrez le nom et la catégorie d'abord");
      return;
    }

    setGeneratingAI(true);
    try {
      const prompt = `Based on market trends and typical restaurant pricing in 2024, suggest an optimal price in USD for a ${menuForm.category} dish called "${menuForm.name}". 
      Consider average market prices, ingredient costs, and mid-range casual dining positioning.
      Return ONLY a single number (the price in dollars), nothing else.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const price = parseFloat(response.trim());
      if (!isNaN(price)) {
        setMenuForm({ ...menuForm, price: price.toString() });
        toast.success(`Prix suggéré: $${price}`);
      }
    } catch (error) {
      toast.error("Erreur lors de la suggestion");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...menuForm,
      price: parseFloat(menuForm.price),
      preparation_time: menuForm.preparation_time ? parseInt(menuForm.preparation_time) : undefined
    };

    if (editingItem) {
      updateMenuMutation.mutate({ id: editingItem.id, data });
    } else {
      createMenuMutation.mutate(data);
    }
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || "",
      preparation_time: item.preparation_time?.toString() || "",
      available: item.available,
      ingredients: item.ingredients || [],
      allergens: item.allergens || []
    });
    setMenuDialog(true);
  };

  const myMenuItems = menuItems.filter(m => m.restaurant_id === restaurant?.id);

  const groupedByCategory = myMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = {
    appetizers: { label: "Entrées", emoji: "🥗" },
    main_course: { label: "Plats Principaux", emoji: "🍽️" },
    desserts: { label: "Desserts", emoji: "🍰" },
    beverages: { label: "Boissons", emoji: "🥤" },
    sides: { label: "Accompagnements", emoji: "🍟" }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>📋 Gestion du Menu</CardTitle>
          <Button onClick={() => { resetMenuForm(); setMenuDialog(true); }} disabled={!restaurant}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un Article
          </Button>
        </CardHeader>
        <CardContent>
          {myMenuItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-slate-600 mb-4">Aucun article au menu</p>
              <Button onClick={() => { resetMenuForm(); setMenuDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Créer votre premier article
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">{categories[category]?.emoji || '🍽️'}</span>
                    {categories[category]?.label || category}
                    <Badge variant="outline">{items.length}</Badge>
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <Card key={item.id} className="hover:shadow-lg transition-shadow">
                        {item.image_url && (
                          <div className="h-40 overflow-hidden relative">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2">
                              <Badge className={item.available ? "bg-green-500" : "bg-red-500"}>
                                {item.available ? "Disponible" : "Indisponible"}
                              </Badge>
                            </div>
                          </div>
                        )}
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg">{item.name}</h4>
                          </div>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-xl font-bold text-green-600">${item.price}</span>
                            </div>
                            {item.preparation_time && (
                              <div className="flex items-center gap-1 text-sm text-slate-500">
                                <Clock className="w-4 h-4" />
                                {item.preparation_time} min
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(item)} className="flex-1">
                              <Pencil className="w-3 h-3 mr-1" />
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant={item.available ? "outline" : "default"}
                              onClick={() => toggleAvailabilityMutation.mutate({ id: item.id, available: !item.available })}
                            >
                              {item.available ? "🚫" : "✓"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              if (confirm('Supprimer cet article?')) deleteMenuMutation.mutate(item.id);
                            }}>
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier" : "Ajouter"} un Article au Menu</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMenuSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Image</Label>
              {menuForm.image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border mb-2">
                  <img src={menuForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="flex-1"
                />
                {uploadingImage && <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du Plat *</Label>
                <Input value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select value={menuForm.category} onValueChange={(value) => setMenuForm({ ...menuForm, category: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([value, { label, emoji }]) => (
                      <SelectItem key={value} value={value}>{emoji} {label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={generateDescription}
                  disabled={generatingAI || !menuForm.name}
                >
                  {generatingAI ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  ✨ AI Générer
                </Button>
              </div>
              <Textarea
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder="Description appétissante du plat..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prix (CFA) *</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={suggestPrice}
                    disabled={generatingAI || !menuForm.name}
                  >
                    {generatingAI ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                    💡 Suggérer
                  </Button>
                </div>
                <Input type="number" step="0.01" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Temps de Préparation (min)</Label>
                <Input type="number" value={menuForm.preparation_time} onChange={(e) => setMenuForm({ ...menuForm, preparation_time: e.target.value })} />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span><strong>Assistant IA:</strong> Utilisez l'IA pour générer des descriptions professionnelles et suggérer des prix optimaux basés sur le marché.</span>
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                checked={menuForm.available}
                onChange={(e) => setMenuForm({ ...menuForm, available: e.target.checked })}
                className="w-5 h-5"
              />
              <Label>Article disponible à la commande</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMenuDialog(false)}>Annuler</Button>
              <Button type="submit" disabled={uploadingImage || generatingAI}>
                {editingItem ? "Mettre à Jour" : "Ajouter au Menu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}