import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Store, UtensilsCrossed, ShoppingBasket, Pill, Package, ChevronRight, CheckCircle, Loader2, Upload, Plus, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const businessTypes = [
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed, description: "Food delivery and dine-in" },
  { value: "grocery", label: "Grocery Store", icon: ShoppingBasket, description: "Fresh groceries and essentials" },
  { value: "pharmacy", label: "Pharmacy", icon: Pill, description: "Medicines and health products" },
  { value: "local_shop", label: "Local Shop", icon: Package, description: "General retail and services" }
];

const cuisineTypes = [
  "african", "fast_food", "chinese", "italian", "indian", "mediterranean", 
  "american", "french", "japanese", "mexican", "thai", "lebanese", 
  "moroccan", "pizza", "burgers", "seafood", "vegetarian", "desserts", "mixed"
];

const menuCategories = [
  "appetizers", "main_course", "daily_special", "chef_special", 
  "desserts", "beverages", "sides", "salads", "soups", 
  "breakfast", "lunch", "dinner"
];

export default function MarketplaceOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    business_type: "",
    name: "",
    description: "",
    cuisine_type: "african",
    address: "",
    city: "",
    country: "Senegal",
    phone: "",
    email: "",
    owner_email: "",
    open_hours: "",
    logo_url: "",
    cover_image_url: "",
    delivery_fee: "5",
    min_order: "0",
    avg_delivery_time: "30",
    delivery_zones: [],
    menu_items: []
  });

  const [newZone, setNewZone] = useState({ name: "", fee: "" });
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "main_course"
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const restaurantData = {
        ...data,
        owner_email: user.email,
        status: "active",
        rating: 0,
        total_orders: 0,
        commission_rate: 15
      };
      return base44.entities.Restaurant.create(restaurantData);
    },
    onSuccess: async (restaurant) => {
      // Create menu items if any
      if (formData.menu_items.length > 0) {
        // Route each menu item through the gated creator so the 'digital_menu'
        // entitlement + restaurant ownership are enforced server-side.
        await Promise.all(formData.menu_items.map((item) =>
          base44.functions.invoke('createGatedRecord', {
            entity_name: 'MenuItem', restaurant_id: restaurant.id,
            data: { ...item, available: true },
          }).catch((e) => console.error('MenuItem gated create failed:', e.message))
        ));
      }
      
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setSuccess(true);
      
      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        navigate(createPageUrl("RestaurantAdmin"));
      }, 2000);
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, logo_url: file_url });
    setUploadingLogo(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, cover_image_url: file_url });
    setUploadingCover(false);
  };

  const selectBusinessType = (type) => {
    setFormData({ ...formData, business_type: type });
    setCurrentStep(1);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const addDeliveryZone = () => {
    if (newZone.name && newZone.fee) {
      setFormData({
        ...formData,
        delivery_zones: [...formData.delivery_zones, newZone.name]
      });
      setNewZone({ name: "", fee: "" });
    }
  };

  const removeDeliveryZone = (zone) => {
    setFormData({
      ...formData,
      delivery_zones: formData.delivery_zones.filter(z => z !== zone)
    });
  };

  const addMenuItem = () => {
    if (newMenuItem.name && newMenuItem.price) {
      setFormData({
        ...formData,
        menu_items: [...formData.menu_items, { ...newMenuItem, price: parseFloat(newMenuItem.price) }]
      });
      setNewMenuItem({ name: "", description: "", price: "", category: "main_course" });
    }
  };

  const removeMenuItem = (index) => {
    setFormData({
      ...formData,
      menu_items: formData.menu_items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    createRestaurantMutation.mutate(formData);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to FoodHub! 🎉</h2>
          <p className="text-lg text-slate-600 mb-2">Your business has been successfully registered!</p>
          <p className="text-sm text-slate-500">Redirecting to your admin dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Join FoodHub Marketplace 🍽️
            </h1>
            <p className="text-lg text-slate-600">Choose your business type to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {businessTypes.map((type) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-2xl transition-all border-2 hover:border-orange-400"
                    onClick={() => selectBusinessType(type.value)}
                  >
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{type.label}</h3>
                      <p className="text-slate-600">{type.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { title: "Basic Info", icon: Store },
    { title: "Location & Hours", icon: Clock },
    { title: "Delivery Setup", icon: Package },
    { title: "Menu Items", icon: UtensilsCrossed },
    { title: "Branding", icon: Upload }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Registration</h1>
          <p className="text-slate-600">Step {currentStep} of {steps.length}</p>
        </div>

        <div className="flex items-center justify-between mb-8 min-w-0 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={index} className="flex items-center">
                <div className={`flex items-center gap-2 ${index < currentStep ? 'text-green-600' : index === currentStep ? 'text-orange-600' : 'text-slate-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index < currentStep ? 'bg-green-500 text-white' : index === currentStep ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>
                    {index < currentStep ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-slate-300'}`} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label>Business Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Chez Papa Restaurant"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Tell customers about your business..."
                        rows={3}
                      />
                    </div>
                    {formData.business_type === "restaurant" && (
                      <div className="space-y-2">
                        <Label>Cuisine Type</Label>
                        <Select value={formData.cuisine_type} onValueChange={(value) => setFormData({ ...formData, cuisine_type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cuisineTypes.map(type => (
                              <SelectItem key={type} value={type} className="capitalize">
                                {type.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Address *</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City *</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="City"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+221 XX XXX XXXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@yourbusiness.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Opening Hours *</Label>
                      <Input
                        value={formData.open_hours}
                        onChange={(e) => setFormData({ ...formData, open_hours: e.target.value })}
                        placeholder="e.g., Mon-Fri: 9:00 AM - 10:00 PM, Sat-Sun: 10:00 AM - 11:00 PM"
                      />
                      <p className="text-xs text-slate-500">You can update this later in settings</p>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Default Delivery Fee ($)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.delivery_fee}
                          onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Order Amount ($)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={formData.min_order}
                          onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-600">
                        ℹ️ Delivery times are automatically estimated based on distance and real-time conditions
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Delivery Zones (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Zone name (e.g., Dakar Centre)"
                          value={newZone.name}
                          onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Fee"
                          value={newZone.fee}
                          onChange={(e) => setNewZone({ ...newZone, fee: e.target.value })}
                          className="w-24"
                        />
                        <Button type="button" onClick={addDeliveryZone}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.delivery_zones.map((zone, idx) => (
                          <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeDeliveryZone(zone)}>
                            {zone} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">Add specific zones with custom fees, or skip to use default fee</p>
                    </div>
                  </>
                )}

                {currentStep === 4 && formData.business_type === "restaurant" && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-slate-700">
                        💡 Add a few sample menu items to get started. You can add more later in the admin panel.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          <Input
                            placeholder="e.g., Thieboudienne"
                            value={newMenuItem.name}
                            onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="12.50"
                            value={newMenuItem.price}
                            onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Input
                          placeholder="Brief description..."
                          value={newMenuItem.description}
                          onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newMenuItem.category} onValueChange={(value) => setNewMenuItem({ ...newMenuItem, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {menuCategories.map(cat => (
                              <SelectItem key={cat} value={cat} className="capitalize">
                                {cat.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="button" onClick={addMenuItem} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Menu Item
                      </Button>
                    </div>

                    {formData.menu_items.length > 0 && (
                      <div className="mt-6 space-y-2">
                        <Label>Added Items ({formData.menu_items.length})</Label>
                        {formData.menu_items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-slate-600">{item.category.replace('_', ' ')} • ${item.price}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeMenuItem(idx)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {currentStep === 5 && (
                  <>
                    <div className="space-y-2">
                      <Label>Business Logo</Label>
                      <div className="space-y-2">
                        {formData.logo_url && (
                          <div className="w-32 h-32 rounded-lg overflow-hidden border">
                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                        />
                        {uploadingLogo && <p className="text-sm text-slate-600">Uploading...</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Cover Image</Label>
                      <div className="space-y-2">
                        {formData.cover_image_url && (
                          <div className="w-full h-48 rounded-lg overflow-hidden border">
                            <img src={formData.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          disabled={uploadingCover}
                        />
                        {uploadingCover && <p className="text-sm text-slate-600">Uploading...</p>}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={prevStep} className="flex-1">
                      Back
                    </Button>
                  )}
                  {currentStep < steps.length ? (
                    <Button onClick={nextStep} className="flex-1">
                      Continue <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={createRestaurantMutation.isPending}
                      className="flex-1"
                    >
                      {createRestaurantMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Complete Registration'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}