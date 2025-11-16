import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, MapPin, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CustomerProfile({ user, onBack, onUserUpdate }) {
  const [newPayment, setNewPayment] = useState({ type: "credit_card", last_four: "" });
  const [newAddress, setNewAddress] = useState({ label: "", address: "" });

  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      onUserUpdate();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleAddPayment = () => {
    if (!newPayment.last_four) return;
    const payments = user.payment_methods || [];
    updateUserMutation.mutate({
      payment_methods: [...payments, { ...newPayment, is_default: payments.length === 0 }]
    });
    setNewPayment({ type: "credit_card", last_four: "" });
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
        <Tabs defaultValue="payment">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-4">
            <div className="space-y-3">
              {user?.payment_methods?.map((pm, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">{pm.type.replace('_', ' ')}</p>
                        <p className="text-sm text-slate-600">**** {pm.last_four}</p>
                      </div>
                    </div>
                    {pm.is_default && <Badge>Default</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="pt-4 space-y-3">
                <h3 className="font-semibold">Add Payment Method</h3>
                <Select value={newPayment.type} onValueChange={(value) => setNewPayment({...newPayment, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Last 4 digits" 
                  value={newPayment.last_four}
                  onChange={(e) => setNewPayment({...newPayment, last_four: e.target.value})}
                  maxLength={4}
                />
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