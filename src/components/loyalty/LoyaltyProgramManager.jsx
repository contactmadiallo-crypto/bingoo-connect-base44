import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Star, Award, Gift } from "lucide-react";

export default function LoyaltyProgramManager({ restaurant }) {
  const [editDialog, setEditDialog] = useState(false);
  const [tierDialog, setTierDialog] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [editingTierIndex, setEditingTierIndex] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: programs = [] } = useQuery({
    queryKey: ['loyalty-programs', restaurant?.id],
    queryFn: () => base44.entities.LoyaltyProgram.filter({ restaurant_id: restaurant?.id }),
    enabled: !!restaurant,
  });

  const program = programs[0];

  const [formData, setFormData] = useState({
    enabled: true,
    points_per_dollar: 10,
    welcome_bonus: 50,
    tiers: []
  });

  const [tierForm, setTierForm] = useState({
    name: "",
    points_required: "",
    discount_percentage: "",
    special_offer: "",
    color: "blue"
  });

  const createProgramMutation = useMutation({
    mutationFn: (data) => base44.entities.LoyaltyProgram.create({
      ...data,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] });
      setEditDialog(false);
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LoyaltyProgram.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] });
      setEditDialog(false);
    },
  });

  const openEditDialog = () => {
    if (program) {
      setFormData({
        enabled: program.enabled !== false,
        points_per_dollar: program.points_per_dollar || 10,
        welcome_bonus: program.welcome_bonus || 0,
        tiers: program.tiers || []
      });
    }
    setEditDialog(true);
  };

  const openTierDialog = (tier = null, index = null) => {
    if (tier) {
      setTierForm(tier);
      setEditingTier(tier);
      setEditingTierIndex(index);
    } else {
      setTierForm({
        name: "",
        points_required: "",
        discount_percentage: "",
        special_offer: "",
        color: "blue"
      });
      setEditingTier(null);
      setEditingTierIndex(null);
    }
    setTierDialog(true);
  };

  const saveTier = () => {
    const tier = {
      ...tierForm,
      points_required: parseInt(tierForm.points_required),
      discount_percentage: parseFloat(tierForm.discount_percentage)
    };

    let updatedTiers;
    if (editingTierIndex !== null) {
      updatedTiers = [...formData.tiers];
      updatedTiers[editingTierIndex] = tier;
    } else {
      updatedTiers = [...formData.tiers, tier];
    }

    setFormData({ ...formData, tiers: updatedTiers });
    setTierDialog(false);
    setEditingTier(null);
    setEditingTierIndex(null);
  };

  const removeTier = (index) => {
    const updatedTiers = formData.tiers.filter((_, i) => i !== index);
    setFormData({ ...formData, tiers: updatedTiers });
  };

  const saveProgram = () => {
    const data = {
      enabled: formData.enabled,
      points_per_dollar: parseFloat(formData.points_per_dollar),
      welcome_bonus: parseFloat(formData.welcome_bonus),
      tiers: formData.tiers.sort((a, b) => a.points_required - b.points_required)
    };

    if (program) {
      updateProgramMutation.mutate({ id: program.id, data });
    } else {
      createProgramMutation.mutate(data);
    }
  };

  const toggleEnabled = () => {
    if (program) {
      updateProgramMutation.mutate({
        id: program.id,
        data: { enabled: !program.enabled }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Loyalty Program</h3>
          <p className="text-sm text-slate-600">Reward your repeat customers</p>
        </div>
        <div className="flex gap-2">
          {program && (
            <div className="flex items-center gap-2">
              <span className="text-sm">{program.enabled ? 'Enabled' : 'Disabled'}</span>
              <Switch checked={program.enabled !== false} onCheckedChange={toggleEnabled} />
            </div>
          )}
          <Button onClick={openEditDialog}>
            {program ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {program ? 'Edit Program' : 'Create Program'}
          </Button>
        </div>
      </div>

      {program ? (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Points per $1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{program.points_per_dollar}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-500" />
                Welcome Bonus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{program.welcome_bonus}</p>
              <p className="text-xs text-slate-500">points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                Reward Tiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{program.tiers?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No loyalty program configured yet</p>
            <Button onClick={openEditDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create Loyalty Program
            </Button>
          </CardContent>
        </Card>
      )}

      {program?.tiers && program.tiers.length > 0 && (
        <div>
          <h4 className="font-semibold mb-4">Reward Tiers</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {program.tiers.map((tier, index) => (
              <Card key={index} className={`border-l-4 border-${tier.color}-500`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <p className="text-sm text-slate-600">{tier.points_required} points</p>
                    </div>
                    <Badge className={`bg-${tier.color}-100 text-${tier.color}-700`}>
                      {tier.discount_percentage}% off
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {tier.special_offer && (
                    <p className="text-sm text-slate-600 mb-3">{tier.special_offer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Loyalty Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Points per Dollar Spent</Label>
                <Input
                  type="number"
                  value={formData.points_per_dollar}
                  onChange={(e) => setFormData({ ...formData, points_per_dollar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Welcome Bonus Points</Label>
                <Input
                  type="number"
                  value={formData.welcome_bonus}
                  onChange={(e) => setFormData({ ...formData, welcome_bonus: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <Label>Reward Tiers</Label>
                <Button size="sm" onClick={() => openTierDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>
              <div className="space-y-2">
                {formData.tiers.map((tier, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{tier.name}</p>
                      <p className="text-sm text-slate-600">
                        {tier.points_required} pts • {tier.discount_percentage}% discount
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openTierDialog(tier, index)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeTier(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={saveProgram}>Save Program</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tierDialog} onOpenChange={setTierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit' : 'Add'} Reward Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tier Name *</Label>
              <Input
                placeholder="e.g., Bronze, Silver, Gold"
                value={tierForm.name}
                onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Points Required *</Label>
                <Input
                  type="number"
                  value={tierForm.points_required}
                  onChange={(e) => setTierForm({ ...tierForm, points_required: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount % *</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={tierForm.discount_percentage}
                  onChange={(e) => setTierForm({ ...tierForm, discount_percentage: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Special Offer (Optional)</Label>
              <Textarea
                placeholder="e.g., Free dessert with every order"
                value={tierForm.special_offer}
                onChange={(e) => setTierForm({ ...tierForm, special_offer: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="flex gap-2">
                {['blue', 'purple', 'green', 'orange', 'red', 'pink'].map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full bg-${color}-500 border-2 ${tierForm.color === color ? 'border-slate-900' : 'border-transparent'}`}
                    onClick={() => setTierForm({ ...tierForm, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialog(false)}>Cancel</Button>
            <Button onClick={saveTier}>Save Tier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}