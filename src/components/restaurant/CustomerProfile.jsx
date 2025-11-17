
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, MapPin, LogOut, User, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LoyaltyCard from "./LoyaltyCard";

export default function CustomerProfile({ user, onBack, onUserUpdate }) {
  const [personalInfo, setPersonalInfo] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    email: user?.email || ""
  });
  const [newPayment, setNewPayment] = useState({
    type: "credit_card",
    card_number: "",
    card_holder_name: "",
    expiration_date: "",
    cvv: ""
  });
  const [newAddress, setNewAddress] = useState({ label: "", address: "" });

  const queryClient = useQueryClient();

  const { data: loyalties = [] } = useQuery({
    queryKey: ['customer-loyalty', user?.email],
    queryFn: () => base44.entities.CustomerLoyalty.filter({ customer_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants-with-loyalty'],
    queryFn: () => base44.entities.Restaurant.filter({ loyalty_enabled: true }),
    enabled: !!user?.email,
  });

  const { data: restaurantFavorites = [] } = useQuery({
    queryKey: ['favorites-restaurants', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ customer_email: user.email, type: 'restaurant' }),
    enabled: !!user?.email,
  });

  const { data: menuFavorites = [] } = useQuery({
    queryKey: ['favorites-menu', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ customer_email: user.email, type: 'menu_item' }),
    enabled: !!user?.email,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      onUserUpdate();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['favorites-menu'] });
    },
  });

  const handleUpdatePersonalInfo = () => {
    if (!personalInfo.full_name || !personalInfo.phone) {
      alert("Please fill in your name and phone number");
      return;
    }
    updateUserMutation.mutate(personalInfo);
    alert("Personal information updated!");
  };

  const handleAddPayment = () => {
    if (!newPayment.card_number || !newPayment.card_holder_name || !newPayment.expiration_date || !newPayment.cvv) {
      alert("Please fill all card details");
      return;
    }
    const payments = user.payment_methods || [];
    const last_four = newPayment.card_number.slice(-4);
    updateUserMutation.mutate({
      payment_methods: [...payments, { ...newPayment, last_four, is_default: payments.length === 0 }]
    });
    setNewPayment({ type: "credit_card", card_number: "", card_holder_name: "", expiration_date: "", cvv: "" });
  };

  const handleAddAddress = () => {
    if (!newAddress.address) return;
    const addresses = user.addresses || [];
    updateUserMutation.mutate({
      addresses: [...addresses, { ...newAddress, is_default: addresses.length === 0 }]
    });
    setNewAddress({ label: "", address: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-orange-600">Profile & Settings</h1>
              <p className="text-sm text-slate-600">{user?.full_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="personal">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                </div>

                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Your full name"
                    value={personalInfo.full_name}
                    onChange={(e) => setPersonalInfo({...personalInfo, full_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="Your phone number"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="Your email"
                    value={personalInfo.email}
                    disabled
                    className="bg-slate-100"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>

                <Button onClick={handleUpdatePersonalInfo} className="w-full bg-orange-600 hover:bg-orange-700">
                  Update Personal Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">❤️ Favorite Restaurants</h3>
                {restaurantFavorites.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No favorite restaurants yet</p>
                ) : (
                  <div className="space-y-3">
                    {restaurantFavorites.map((fav) => (
                      <div key={fav.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{fav.restaurant_name}</p>
                          <p className="text-xs text-slate-500">Added {new Date(fav.created_date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteFavoriteMutation.mutate(fav.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">⭐ Favorite Dishes</h3>
                {menuFavorites.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No favorite dishes yet</p>
                ) : (
                  <div className="space-y-3">
                    {menuFavorites.map((fav) => (
                      <div key={fav.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{fav.menu_item_name}</p>
                          <p className="text-xs text-slate-500">{fav.restaurant_name}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteFavoriteMutation.mutate(fav.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-4">
            {loyalties.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No loyalty memberships yet</p>
                  <p className="text-sm text-slate-500">Order from restaurants with loyalty programs to start earning rewards!</p>
                </CardContent>
              </Card>
            ) : (
              loyalties.map((loyalty) => {
                const restaurant = restaurants.find(r => r.id === loyalty.restaurant_id);
                return <LoyaltyCard key={loyalty.id} loyalty={loyalty} restaurant={restaurant} />;
              })
            )}
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="space-y-3">
              {user?.payment_methods?.map((pm, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <div>
                          <p className="font-semibold">{pm.type.replace('_', ' ')}</p>
                          <p className="text-sm text-slate-600">**** **** **** {pm.last_four}</p>
                        </div>
                      </div>
                      {pm.is_default && <Badge>Default</Badge>}
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>Card Holder: {pm.card_holder_name}</p>
                      <p>Expires: {pm.expiration_date}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-semibold">Add Payment Method</h3>

                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <Select value={newPayment.type} onValueChange={(value) => setNewPayment({...newPayment, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={newPayment.card_number}
                    onChange={(e) => setNewPayment({...newPayment, card_number: e.target.value.replace(/\s/g, '')})}
                    maxLength={16}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Card Holder Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={newPayment.card_holder_name}
                    onChange={(e) => setNewPayment({...newPayment, card_holder_name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiration Date</Label>
                    <Input
                      placeholder="MM/YY"
                      value={newPayment.expiration_date}
                      onChange={(e) => setNewPayment({...newPayment, expiration_date: e.target.value})}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      placeholder="123"
                      value={newPayment.cvv}
                      onChange={(e) => setNewPayment({...newPayment, cvv: e.target.value})}
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>

                <Button onClick={handleAddPayment} className="w-full">Add Payment Method</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <div className="space-y-3">
              {user?.addresses?.map((addr, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 mt-1" />
                        <div>
                          {addr.label && <p className="font-semibold">{addr.label}</p>}
                          <p className="text-sm text-slate-600">{addr.address}</p>
                        </div>
                      </div>
                      {addr.is_default && <Badge>Default</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="pt-4 space-y-3">
                <h3 className="font-semibold">Add Address</h3>
                <Input
                  placeholder="Label (e.g., Home, Work)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                />
                <Textarea
                  placeholder="Full address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                />
                <Button onClick={handleAddAddress} className="w-full">Add Address</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <Button variant="outline" onClick={() => base44.auth.logout()} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
