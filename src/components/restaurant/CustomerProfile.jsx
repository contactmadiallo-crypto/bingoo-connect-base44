import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, MapPin, LogOut, User, Award, Heart, Trash2, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LoyaltyCard from "./LoyaltyCard";
import UserPreferences from "./UserPreferences";
import NotificationPreferences from "./NotificationPreferences"; // New import

export default function CustomerProfile({ user, onBack, onUserUpdate, language = "en" }) {
  const [personalInfo, setPersonalInfo] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    email: user?.email || ""
  });
  const [newPayment, setNewPayment] = useState({
    type: "mobile_wallet",
    card_number: "",
    card_holder_name: "",
    expiration_date: "",
    cvv: "",
    wallet_provider: "",
    wallet_phone: ""
  });
  const [newAddress, setNewAddress] = useState({ label: "", address: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const queryClient = useQueryClient();

  // Simple placeholder for translation function
  const t = (key) => {
    const translations = {
      'back': 'Retour',
      'profile': 'Mon Profil',
      'manage_your_profile': 'Gérez vos informations et préférences',
      'personal_info': 'Infos Personnelles',
      'preferences': 'Préférences',
      'notifications': 'Notifications',
      'favorites': 'Favoris',
      'loyalty': 'Fidélité',
      'payment_methods': 'Paiement',
      'addresses': 'Adresses'
    };
    return translations[key] || key.replace(/_/g, ' '); // Fallback to key with underscores replaced by spaces
  };


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
    if (newPayment.type === "mobile_wallet") {
      if (!newPayment.wallet_provider || !newPayment.wallet_phone) {
        alert("Veuillez remplir tous les détails du portefeuille mobile");
        return;
      }
      const payments = user.payment_methods || [];
      const last_four = newPayment.wallet_phone.slice(-4);
      updateUserMutation.mutate({
        payment_methods: [...payments, { 
          type: newPayment.type,
          wallet_provider: newPayment.wallet_provider,
          wallet_phone: newPayment.wallet_phone,
          last_four, 
          is_default: payments.length === 0 
        }]
      });
      setNewPayment({ type: "mobile_wallet", wallet_provider: "", wallet_phone: "", card_number: "", card_holder_name: "", expiration_date: "", cvv: "" });
    } else {
      if (!newPayment.card_number || !newPayment.card_holder_name || !newPayment.expiration_date || !newPayment.cvv) {
        alert("Please fill all card details");
        return;
      }
      const payments = user.payment_methods || [];
      const last_four = newPayment.card_number.slice(-4);
      updateUserMutation.mutate({
        payment_methods: [...payments, { ...newPayment, last_four, is_default: payments.length === 0 }]
      });
      setNewPayment({ type: "mobile_wallet", card_number: "", card_holder_name: "", expiration_date: "", cvv: "", wallet_provider: "", wallet_phone: "" });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">👤 {t('profile')}</h1>
          <p className="text-slate-600">{t('manage_your_profile')}</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="personal">{t('personal_info')}</TabsTrigger>
            <TabsTrigger value="preferences">{t('preferences')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger> {/* Added new trigger */}
            <TabsTrigger value="favorites">{t('favorites')}</TabsTrigger>
            <TabsTrigger value="loyalty">{t('loyalty')}</TabsTrigger>
            <TabsTrigger value="payment">{t('payment_methods')}</TabsTrigger>
            <TabsTrigger value="addresses">{t('addresses')}</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4"> {/* Changed value from "info" to "personal" */}
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

          <TabsContent value="preferences">
            <UserPreferences user={user} onUpdate={onUserUpdate} />
          </TabsContent>

          {/* New TabsContent for Notifications */}
          <TabsContent value="notifications">
            <NotificationPreferences user={user} onUserUpdate={onUserUpdate} />
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
                          <Trash2 className="w-4 h-4 text-red-500" />
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
                          <Trash2 className="w-4 h-4 text-red-500" />
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
                          <p className="font-semibold capitalize">
                            {pm.type === 'mobile_wallet' ? `${pm.wallet_provider || 'Mobile Wallet'}` : pm.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-slate-600">
                            {pm.type === 'mobile_wallet' 
                              ? `${pm.wallet_phone || `****${pm.last_four}`}` 
                              : `**** **** **** ${pm.last_four}`
                            }
                          </p>
                        </div>
                      </div>
                      {pm.is_default && <Badge>Default</Badge>}
                    </div>
                    {pm.type !== 'mobile_wallet' && (
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>Card Holder: {pm.card_holder_name}</p>
                        <p>Expires: {pm.expiration_date}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-semibold">Add Payment Method</h3>

                <div className="space-y-2">
                  <Label>Type de Paiement</Label>
                  <Select value={newPayment.type} onValueChange={(value) => setNewPayment({...newPayment, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_wallet">📱 Portefeuille Mobile</SelectItem>
                      <SelectItem value="credit_card">💳 Carte de Crédit</SelectItem>
                      <SelectItem value="debit_card">💳 Carte de Débit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newPayment.type === "mobile_wallet" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Fournisseur de Portefeuille</Label>
                      <Select value={newPayment.wallet_provider} onValueChange={(value) => setNewPayment({...newPayment, wallet_provider: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un fournisseur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Orange Money">🟠 Orange Money</SelectItem>
                          <SelectItem value="MTN Mobile Money">🟡 MTN Mobile Money</SelectItem>
                          <SelectItem value="Wave">🔵 Wave</SelectItem>
                          <SelectItem value="Free Money">🔴 Free Money</SelectItem>
                          <SelectItem value="Moov Money">🟢 Moov Money</SelectItem>
                          <SelectItem value="Wizall">🟣 Wizall</SelectItem>
                          <SelectItem value="E-Money">⚪ E-Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Numéro de Téléphone</Label>
                      <Input
                        placeholder="+221 XX XXX XX XX"
                        value={newPayment.wallet_phone}
                        onChange={(e) => setNewPayment({...newPayment, wallet_phone: e.target.value})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Numéro de Carte</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={newPayment.card_number}
                        onChange={(e) => setNewPayment({...newPayment, card_number: e.target.value.replace(/\s/g, '')})}
                        maxLength={16}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nom sur la Carte</Label>
                      <Input
                        placeholder="John Doe"
                        value={newPayment.card_holder_name}
                        onChange={(e) => setNewPayment({...newPayment, card_holder_name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date d'Expiration</Label>
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
                  </>
                )}

                <Button onClick={handleAddPayment} className="w-full">
                  Ajouter Moyen de Paiement
                </Button>
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
          <CardContent className="pt-6 space-y-3">
            <Button variant="outline" onClick={() => base44.auth.logout()} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-4 border-red-100">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-red-600 mb-1 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
            {!showDeleteConfirm ? (
              <Button variant="outline" onClick={() => setShowDeleteConfirm(true)}
                className="w-full border-red-200 text-red-600 hover:bg-red-50">
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm font-semibold text-red-700">Type <strong>DELETE</strong> to confirm:</p>
                <Input
                  placeholder="Type DELETE"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  className="border-red-300 focus:ring-red-400"
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                    className="flex-1">Cancel</Button>
                  <Button
                    disabled={deleteInput !== "DELETE"}
                    onClick={() => {
                      if (deleteInput === "DELETE") {
                        base44.auth.logout();
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40">
                    Confirm Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}