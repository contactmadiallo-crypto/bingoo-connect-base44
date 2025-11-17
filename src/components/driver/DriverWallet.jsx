import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, Plus, CheckCircle, Clock, XCircle, TrendingUp, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

export default function DriverWallet({ driver, open, onOpenChange }) {
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    type: "bank_account",
    account_holder_name: "",
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
        payment_details: method.last_four || method.account_number.slice(-4),
        requested_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      setPayoutAmount("");
      setSelectedPaymentMethod("");
      alert("Payout request submitted successfully! Processing typically takes 2-3 business days.");
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: (data) => {
      const lastFour = data.account_number.slice(-4);
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
        type: "bank_account",
        account_holder_name: "",
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
      alert("Please enter a valid amount");
      return;
    }

    if (amount > availableBalance) {
      alert("Insufficient balance");
      return;
    }

    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-600" />
            Driver Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 opacity-80" />
                  <p className="text-sm opacity-90">Available Balance</p>
                </div>
                <p className="text-3xl font-bold">${availableBalance.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 opacity-80" />
                  <p className="text-sm opacity-90">Total Earned</p>
                </div>
                <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 opacity-80" />
                  <p className="text-sm opacity-90">Pending</p>
                </div>
                <p className="text-3xl font-bold">${pendingPayouts.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="payout">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payout">Request Payout</TabsTrigger>
              <TabsTrigger value="history">Payout History</TabsTrigger>
              <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            </TabsList>

            <TabsContent value="payout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Request Payout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Available: ${availableBalance.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.type.replace('_', ' ')} - {method.bank_name || method.account_holder_name} (...{method.last_four})
                            {method.is_default && " (Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {paymentMethods.length === 0 && (
                      <p className="text-sm text-amber-600">No payment methods added. Add one in the Payment Methods tab.</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Payouts are processed within 2-3 business days. A small processing fee may apply.
                    </p>
                  </div>

                  <Button 
                    onClick={handlePayoutRequest}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!payoutAmount || !selectedPaymentMethod || availableBalance <= 0}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Request Payout
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {payouts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No payout history yet</p>
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
                              {format(new Date(payout.requested_date || payout.created_date), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {payout.payment_method_type?.replace('_', ' ')} - ...{payout.payment_details}
                          </p>
                          {payout.completed_date && (
                            <p className="text-xs text-green-600 mt-1">
                              Completed: {format(new Date(payout.completed_date), 'MMM dd, yyyy')}
                            </p>
                          )}
                          {payout.notes && (
                            <p className="text-xs text-slate-500 mt-1">{payout.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${payout.amount.toFixed(2)}</p>
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
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold capitalize">{method.type.replace('_', ' ')}</p>
                              <p className="text-sm text-slate-600">{method.bank_name || method.account_holder_name}</p>
                              <p className="text-xs text-slate-500">...{method.last_four}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {method.is_default && <Badge>Default</Badge>}
                            {method.verified && <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={() => setShowAddPaymentMethod(true)} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={paymentMethodForm.type} onValueChange={(value) => setPaymentMethodForm({...paymentMethodForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_account">Bank Account</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Holder Name *</Label>
                      <Input
                        value={paymentMethodForm.account_holder_name}
                        onChange={(e) => setPaymentMethodForm({...paymentMethodForm, account_holder_name: e.target.value})}
                        placeholder="Full name on account"
                      />
                    </div>

                    {paymentMethodForm.type === 'bank_account' && (
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          value={paymentMethodForm.bank_name}
                          onChange={(e) => setPaymentMethodForm({...paymentMethodForm, bank_name: e.target.value})}
                          placeholder="Bank name"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Account Number / Phone *</Label>
                      <Input
                        value={paymentMethodForm.account_number}
                        onChange={(e) => setPaymentMethodForm({...paymentMethodForm, account_number: e.target.value})}
                        placeholder={paymentMethodForm.type === 'mobile_money' ? 'Phone number' : 'Account number'}
                      />
                    </div>

                    {paymentMethodForm.type === 'bank_account' && (
                      <div className="space-y-2">
                        <Label>Routing Number / SWIFT Code</Label>
                        <Input
                          value={paymentMethodForm.routing_number}
                          onChange={(e) => setPaymentMethodForm({...paymentMethodForm, routing_number: e.target.value})}
                          placeholder="Routing number"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={paymentMethodForm.is_default}
                        onChange={(e) => setPaymentMethodForm({...paymentMethodForm, is_default: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label>Set as default payment method</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddPaymentMethod(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => addPaymentMethodMutation.mutate(paymentMethodForm)}
                        className="flex-1"
                        disabled={!paymentMethodForm.account_holder_name || !paymentMethodForm.account_number}
                      >
                        Add Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}