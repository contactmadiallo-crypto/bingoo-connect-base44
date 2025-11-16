import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bike, Car, Truck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DriverSignup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    vehicle_type: "",
    coverage_area: ["Dakar"],
    subscription_plan: "basic"
  });
  const [submitted, setSubmitted] = useState(false);

  const createPartnerMutation = useMutation({
    mutationFn: (data) => base44.entities.DeliveryPartner.create({
      ...data,
      status: "pending",
      commission_rate: data.subscription_plan === "premium" ? 12 : 15,
      is_available: true,
      total_deliveries: 0
    }),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPartnerMutation.mutate(formData);
  };

  const vehicleOptions = [
    { value: "bicycle", label: "Bicycle", icon: Bike, description: "Eco-friendly, perfect for nearby deliveries" },
    { value: "motorcycle", label: "Motorcycle", icon: Bike, description: "Fast & efficient for city deliveries" },
    { value: "car", label: "Car", icon: Car, description: "Large orders, long distance deliveries" }
  ];

  const plans = [
    {
      name: "Basic",
      value: "basic",
      commission: "15%",
      features: ["Standard support", "Weekly payouts", "Basic training", "Delivery kit"],
      color: "border-blue-300 bg-blue-50"
    },
    {
      name: "Premium",
      value: "premium",
      commission: "12%",
      features: ["Priority support", "Daily payouts", "Advanced training", "Premium delivery kit", "Insurance coverage", "Bonus incentives"],
      color: "border-green-300 bg-green-50",
      badge: "Best Value"
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="max-w-md">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to FoodHub!</h2>
              <p className="text-slate-600 mb-6">
                Your application has been submitted successfully. Our team will review it and contact you within 48 hours.
              </p>
              <Button onClick={() => window.location.href = "/"} className="w-full">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🏍️ Join FoodHub Drivers</h1>
          <p className="text-slate-600">Start earning with Senegal's fastest-growing delivery platform</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>Personal Info</span>
              <span>Vehicle</span>
              <span>Plan</span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name / Company Name *</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Your name or company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      placeholder="Main contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+221 XX XXX XX XX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your@email.com"
                    />
                  </div>
                  <Button type="button" onClick={() => setStep(2)} className="w-full" disabled={!formData.company_name || !formData.phone}>
                    Next Step
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Vehicle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {vehicleOptions.map((vehicle) => {
                      const Icon = vehicle.icon;
                      return (
                        <button
                          key={vehicle.value}
                          type="button"
                          onClick={() => setFormData({...formData, vehicle_type: vehicle.value})}
                          className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                            formData.vehicle_type === vehicle.value 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="w-6 h-6 text-slate-700 mt-1" />
                            <div className="flex-1">
                              <p className="font-semibold text-lg">{vehicle.label}</p>
                              <p className="text-sm text-slate-600">{vehicle.description}</p>
                            </div>
                            {formData.vehicle_type === vehicle.value && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep(3)} className="flex-1" disabled={!formData.vehicle_type}>
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {plans.map((plan) => (
                      <button
                        key={plan.value}
                        type="button"
                        onClick={() => setFormData({...formData, subscription_plan: plan.value})}
                        className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-lg ${
                          formData.subscription_plan === plan.value 
                            ? plan.color + ' border-2' 
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <p className="text-2xl font-bold text-green-600 mt-1">{plan.commission}</p>
                            <p className="text-xs text-slate-600">Platform commission</p>
                          </div>
                          {plan.badge && <Badge className="bg-green-600">{plan.badge}</Badge>}
                        </div>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                      Submit Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </form>

        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">💡 Why Join FoodHub?</h3>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="font-semibold">Best Earnings</p>
                  <p className="text-sm text-slate-600">Lower commission rates</p>
                </div>
                <div>
                  <p className="font-semibold">Weekly Payouts</p>
                  <p className="text-sm text-slate-600">Get paid on time</p>
                </div>
                <div>
                  <p className="font-semibold">Full Support</p>
                  <p className="text-sm text-slate-600">Training & equipment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}