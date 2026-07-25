import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";

export default function StockManagement({ restaurant, menuItems }) {
  const queryClient = useQueryClient();

  const [localMenuItems, setLocalMenuItems] = React.useState(menuItems);
  
  const { optimisticUpdate } = useOptimisticUpdate(
    (prevItems, { id, available }) => prevItems.map(item => item.id === id ? { ...item, available } : item),
    setLocalMenuItems
  );

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, available }) => base44.functions.invoke('createGatedRecord', { entity_name: 'MenuItem', restaurant_id: restaurant?.id, op: 'update', record_id: id, data: { available } }).then(r => r.data.record),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success(variables.available ? "✅ Article disponible" : "🚫 Article indisponible");
    },
  });

  const handleToggleAvailability = (id, available) => {
    optimisticUpdate(localMenuItems, { id, available });
    toggleAvailabilityMutation.mutate({ id, available });
  };

  const myMenuItems = menuItems.filter(m => m.restaurant_id === restaurant?.id);
  const availableItems = myMenuItems.filter(i => i.available);
  const unavailableItems = myMenuItems.filter(i => !i.available);

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📦 Gestion Simplifiée des Stocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-sm text-slate-600">Disponibles</p>
              </div>
              <p className="text-3xl font-bold text-green-700">{availableItems.length}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <X className="w-5 h-5 text-red-600" />
                <p className="text-sm text-slate-600">Indisponibles</p>
              </div>
              <p className="text-3xl font-bold text-red-700">{unavailableItems.length}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-slate-600">Total Articles</p>
              </div>
              <p className="text-3xl font-bold text-blue-700">{myMenuItems.length}</p>
            </div>
          </div>

          {unavailableItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <p className="font-semibold text-amber-900">Attention</p>
              </div>
              <p className="text-sm text-amber-800">
                {unavailableItems.length} article(s) marqué(s) comme indisponible(s). Les clients ne pourront pas les commander.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
              const categoryItems = myMenuItems.filter(i => i.category === categoryKey);
              if (categoryItems.length === 0) return null;

              return (
                <div key={categoryKey}>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-2xl">{categoryInfo.emoji}</span>
                    {categoryInfo.label}
                  </h3>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          item.available
                            ? 'bg-white border-slate-200 hover:border-green-300'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {item.image_url && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.name}</h4>
                            <p className="text-sm text-slate-600 line-clamp-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">${item.price}</Badge>
                              {item.preparation_time && (
                                <Badge variant="outline">{item.preparation_time} min</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right mr-4">
                            <p className={`text-sm font-semibold ${item.available ? 'text-green-600' : 'text-red-600'}`}>
                              {item.available ? '✅ Disponible' : '🚫 Indisponible'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.available ? 'Clients peuvent commander' : 'Masqué pour clients'}
                            </p>
                          </div>
                          <Switch
                            checked={item.available}
                            onCheckedChange={(checked) =>
                              handleToggleAvailability(item.id, checked)
                            }
                            className="data-[state=checked]:bg-green-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {myMenuItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-slate-600">Aucun article au menu</p>
              <p className="text-sm text-slate-500 mt-2">Ajoutez des articles pour gérer leur disponibilité</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils de Gestion des Stocks</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Marquez les articles comme indisponibles en cas de rupture de stock</li>
                <li>• Les articles indisponibles sont automatiquement masqués pour les clients</li>
                <li>• Réactivez rapidement les articles dès que le stock est reconstitué</li>
                <li>• Utilisez cette fonction pour gérer les plats saisonniers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}