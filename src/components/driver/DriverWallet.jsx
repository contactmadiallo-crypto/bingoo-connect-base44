import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Wallet, CreditCard, Plus, CheckCircle, Clock, XCircle, TrendingUp, ArrowUpRight, Smartphone } from "lucide-react";
import { format } from "date-fns";

const paymentIcons = {
  wave: "🌊",
  orange_money: "🍊",
  free_money: "📱",
  bank_account: "🏦"
};

export default function DriverWallet({ driver, open, onOpenChange }) {
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    type: "wave",
    account_holder_name: "",
    phone_number: "",
    bank_name: "",
    account_number: "",
    routing_number: "",
    is_default: false
  });

  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['wallet-orders', driver?.id],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: !!driver?.id && open,
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts', driver?.id],
    queryFn: () => base44.entities.Payout.filter({ driver_id: driver.id }, '-created_date'),
    enabled: !!driver?.id && open,
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods', driver?.id],
    queryFn: () => base44.entities.DriverPaymentMethod.filter({ driver_id: driver.id }),
    enabled: !!driver?.id && open,
  });

  const completedOrders = useMemo(() => {
    return orders.filter(o => o.delivery_partner_id === driver?.id && o.status === 'delivered');
  }, [orders, driver]);

  const totalEarnings = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.driver_earnings || 0) + (o.tip_amount || 0), 0);
  }, [completedOrders]);

  const totalPayouts = useMemo(() => {
    return payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payouts]);

  const pendingPayouts = useMemo(() => {
    return payouts
      .filter(p => ['pending', 'processing'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payouts]);

  const availableBalance = totalEarnings - totalPayouts - pendingPayouts;

  const requestPayoutMutation = useMutation({
    mutationFn: async (data) => {
      const method = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
      return base44.entities.Payout.create({
        driver_id: driver.id,
        driver_name: driver.full_name,
        amount: parseFloat(data.amount),
        status: 'pending',
        payment_method_id: method.id,
        payment_method_type: method.type,
        payment_details: method.last_four || (method.phone_number?.slice(-4)) || method.account_number?.slice(-4),
        requested_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      setPayoutAmount("");
      setSelectedPaymentMethod("");
      alert("Demande de retrait envoyée avec succès! Le traitement prend généralement 2-3 jours ouvrables.");
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: (data) => {
      const isMobileMoney = ['wave', 'orange_money', 'free_money'].includes(data.type);
      const lastFour = isMobileMoney 
        ? data.phone_number?.slice(-4) 
        : data.account_number?.slice(-4);
      
      return base44.entities.DriverPaymentMethod.create({
        ...data,
        driver_id: driver.id,
        last_four: lastFour,
        verified: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setShowAddPaymentMethod(false);
      setPaymentMethodForm({
        type: "wave",
        account_holder_name: "",
        phone_number: "",
        bank_name: "",
        account_number: "",
        routing_number: "",
        is_default: false
      });
    },
  });

  const handlePayoutRequest = () => {
    const amount = parseFloat(payoutAmount);
    
    if (!amount || amount <= 0) {
      alert("Veuillez entrer un montant valide");
      return;
    }

    if (amount > availableBalance) {
      alert("Solde insuffisant");
      return;
    }

    if (!selectedPaymentMethod) {
      alert("Veuillez sélectionner un moyen de paiement");
      return;
    }

    requestPayoutMutation.mutate({ amount: payoutAmount });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      processing: TrendingUp,
      completed: CheckCircle,
      failed: XCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getPaymentMethodDisplay = (method) => {
    const icon = paymentIcons[method.type] || "💳";
    if (['wave', 'orange_money', 'free_money'].includes(method.type)) {
      return `${icon} ${method.type.replace('_', ' ').toUpperCase()} - ${method.phone_number}`;
    }
    return `${icon} ${method.bank_name} - ...${method.last_four}`;
  };

  const isMobileMoney = ['wave', 'orange_money', 'free_money'].includes(paymentMethodForm.type);

  const isMobile = useIsMobile();
  const Wrapper = isMobile ? Drawer : Dialog;
  const WrapperContent = isMobile ? DrawerContent : DialogContent;
  const WrapperHeader = isMobile ? DrawerHeader : DialogHeader;
  const WrapperTitle = isMobile ? DrawerTitle : DialogTitle;

  return (
    <Wrapper open={open} onOpenChange={onOpenChange}>
      <WrapperContent className={isMobile ? "max-h-[90vh] overflow-y-auto" : "max-w-4xl max-h-[90vh] overflow-y-auto"}>
        <WrapperHeader>
          <WrapperTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-600" />
            Portefeuille Chauffeur
          </WrapperTitle>
        </WrapperHeader>

        <div className={`space-y-6 ${isMobile ? "px-4 pb-safe" : ""}`}>
          {/* Balance Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 opacity-80" />
                  <p className="text-sm opacity-90">Solde Disponible</p>
                </div>
                <p className="text-3xl font-bold">{availableBalance.toFixed(0)} CFA</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 opacity-80" />
                  <p className="text-sm opacity-90">Total Gagné</p>
                </div>
                <p className="text-3xl font-bold">{totalEarnings.toFixed(0)} CFA</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 opacity-80" />
                  <p className="text-sm opacity-90">En Attente</p>
                </div>
                <p className="text-3xl font-bold">{pendingPayouts.toFixed(0)} CFA</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="payout">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payout">Retrait</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="methods">Moyens de Paiement</TabsTrigger>
            </TabsList>

            <TabsContent value="payout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Demander un Retrait</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Montant (CFA)</Label>
                    <Input
                      type="number"
                      step="100"
                      placeholder="0"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Disponible: {availableBalance.toFixed(0)} CFA
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Moyen de Paiement</Label>
                    <MobileSelect
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                      options={paymentMethods.map((method) => ({
                        value: method.id,
                        label: `${getPaymentMethodDisplay(method)}${method.is_default ? " (Par défaut)" : ""}`
                      }))}
                      placeholder="Sélectionnez un moyen de paiement"
                      ariaLabel="Payment method"
                    />
                    {paymentMethods.length === 0 && (
                      <p className="text-sm text-amber-600">Aucun moyen de paiement ajouté. Ajoutez-en un dans l'onglet Moyens de Paiement.</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Les retraits sont traités sous 2-3 jours ouvrables. Des frais de traitement peuvent s'appliquer.
                    </p>
                  </div>

                  <Button 
                    onClick={handlePayoutRequest}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!payoutAmount || !selectedPaymentMethod || availableBalance <= 0}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Demander un Retrait
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {payouts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Aucun historique de retrait</p>
                  </CardContent>
                </Card>
              ) : (
                payouts.map((payout) => (
                  <Card key={payout.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(payout.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(payout.status)}
                                {payout.status}
                              </span>
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {format(new Date(payout.requested_date || payout.created_date), 'dd MMM yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {paymentIcons[payout.payment_method_type]} {payout.payment_method_type?.replace('_', ' ')} - ...{payout.payment_details}
                          </p>
                          {payout.completed_date && (
                            <p className="text-xs text-green-600 mt-1">
                              Complété: {format(new Date(payout.completed_date), 'dd MMM yyyy')}
                            </p>
                          )}
                          {payout.notes && (
                            <p className="text-xs text-slate-500 mt-1">{payout.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{payout.amount.toFixed(0)} CFA</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="methods" className="space-y-4">
              {!showAddPaymentMethod ? (
                <>
                  {paymentMethods.map((method) => (
                    <Card key={method.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                              {paymentIcons[method.type]}
                            </div>
                            <div>
                              <p className="font-semibold capitalize">{method.type.replace('_', ' ')}</p>
                              {['wave', 'orange_money', 'free_money'].includes(method.type) ? (
                                <>
                                  <p className="text-sm text-slate-600">{method.account_holder_name}</p>
                                  <p className="text-xs text-slate-500">{method.phone_number}</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-slate-600">{method.bank_name}</p>
                                  <p className="text-xs text-slate-500">...{method.last_four}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {method.is_default && <Badge>Par défaut</Badge>}
                            {method.verified && <Badge variant="outline" className="bg-green-50 text-green-700">Vérifié</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={() => setShowAddPaymentMethod(true)} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un Moyen de Paiement
                  </Button>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Ajouter un Moyen de Paiement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <MobileSelect
                        value={paymentMethodForm.type}
                        onValueChange={(value) => setPaymentMethodForm({...paymentMethodForm, type: value})}
                        options={[
                          { value: "wave", label: "🌊 Wave" },
                          { value: "orange_money", label: "🍊 Orange Money" },
                          { value: "free_money", label: "📱 Free Money" },
                          { value: "bank_account", label: "🏦 Compte Bancaire" },
                        ]}
                        ariaLabel="Payment method type"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nom Complet *</Label>
                      <Input
                        value={paymentMethodForm.account_holder_name}
                        onChange={(e) => setPaymentMethodForm({...paymentMethodForm, account_holder_name: e.target.value})}
                        placeholder="Nom sur le compte"
                      />
                    </div>

                    {isMobileMoney ? (
                      <div className="space-y-2">
                        <Label>Numéro de Téléphone *</Label>
                        <Input
                          value={paymentMethodForm.phone_number}
                          onChange={(e) => setPaymentMethodForm({...paymentMethodForm, phone_number: e.target.value})}
                          placeholder="77 XXX XX XX"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Nom de la Banque</Label>
                          <Input
                            value={paymentMethodForm.bank_name}
                            onChange={(e) => setPaymentMethodForm({...paymentMethodForm, bank_name: e.target.value})}
                            placeholder="Ex: UBA, Ecobank, CBAO"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Numéro de Compte *</Label>
                          <Input
                            value={paymentMethodForm.account_number}
                            onChange={(e) => setPaymentMethodForm({...paymentMethodForm, account_number: e.target.value})}
                            placeholder="Numéro de compte"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Code SWIFT/BIC</Label>
                          <Input
                            value={paymentMethodForm.routing_number}
                            onChange={(e) => setPaymentMethodForm({...paymentMethodForm, routing_number: e.target.value})}
                            placeholder="Code SWIFT"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={paymentMethodForm.is_default}
                        onChange={(e) => setPaymentMethodForm({...paymentMethodForm, is_default: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label>Définir comme moyen de paiement par défaut</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddPaymentMethod(false)}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={() => addPaymentMethodMutation.mutate(paymentMethodForm)}
                        className="flex-1"
                        disabled={!paymentMethodForm.account_holder_name || (!paymentMethodForm.phone_number && !paymentMethodForm.account_number)}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </WrapperContent>
    </Wrapper>
  );
}