import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bike, Car, CheckCircle, Upload, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DriverSignup() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    national_id: "",
    address: "",
    date_of_birth: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    vehicle_type: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_color: "",
    license_plate: "",
    driver_license_number: "",
    insurance_number: "",
    coverage_area: ["Dakar"],
    subscription_plan: "basic",
    profile_photo_url: "",
    id_document_url: "",
    license_document_url: "",
    vehicle_photo_url: ""
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

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading({ ...uploading, [field]: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [field]: file_url });
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading({ ...uploading, [field]: false });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createPartnerMutation.mutate(formData);
  };

  const vehicleOptions = [
    { value: "bicycle", label: "Bicycle", icon: Bike, description: "Eco-friendly, nearby deliveries" },
    { value: "motorcycle", label: "Motorcycle", icon: Bike, description: "Fast & efficient" },
    { value: "car", label: "Car", icon: Car, description: "Large orders, long distance" }
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
      features: ["Priority support", "Daily payouts", "Advanced training", "Premium kit", "Insurance", "Bonuses"],
      color: "border-green-300 bg-green-50",
      badge: "Best Value"
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-md">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to FoodHub!</h2>
              <p className="text-slate-600 mb-6">
                Your application has been submitted. We'll review it and contact you within 48 hours.
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
          <p className="text-slate-600">Complete registration to start earning</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    step >= s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>Personal</span>
              <span>Vehicle</span>
              <span>Documents</span>
              <span>Plan</span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="space-y-2">
                    <Label>National ID / Driver License Number</Label>
                    <Input
                      value={formData.national_id}
                      onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                      placeholder="ID number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Residential Address</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Your full address"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-3">Emergency Contact</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contact Name</Label>
                        <Input
                          value={formData.emergency_contact_name}
                          onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Input
                          value={formData.emergency_contact_phone}
                          onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                          placeholder="Emergency contact phone"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="button" onClick={() => setStep(2)} className="w-full" disabled={!formData.full_name || !formData.phone}>
                    Next Step
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Vehicle Type *</Label>
                    {vehicleOptions.map((vehicle) => {
                      const Icon = vehicle.icon;
                      return (
                        <button
                          key={vehicle.value}
                          type="button"
                          onClick={() => setFormData({...formData, vehicle_type: vehicle.value})}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                            formData.vehicle_type === vehicle.value 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-6 h-6" />
                            <div className="flex-1">
                              <p className="font-semibold">{vehicle.label}</p>
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

                  {(formData.vehicle_type === 'motorcycle' || formData.vehicle_type === 'car') && (
                    <>
                      <div className="border-t pt-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Make (Manufacturer)</Label>
                            <Input
                              value={formData.vehicle_make}
                              onChange={(e) => setFormData({...formData, vehicle_make: e.target.value})}
                              placeholder="e.g., Toyota, Honda, Yamaha"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Model</Label>
                            <Input
                              value={formData.vehicle_model}
                              onChange={(e) => setFormData({...formData, vehicle_model: e.target.value})}
                              placeholder="e.g., Corolla, Wave"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Year</Label>
                            <Input
                              type="number"
                              value={formData.vehicle_year}
                              onChange={(e) => setFormData({...formData, vehicle_year: e.target.value})}
                              placeholder="2020"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Input
                              value={formData.vehicle_color}
                              onChange={(e) => setFormData({...formData, vehicle_color: e.target.value})}
                              placeholder="Black"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>License Plate</Label>
                            <Input
                              value={formData.license_plate}
                              onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                              placeholder="DK-1234-A"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Driver License Number</Label>
                            <Input
                              value={formData.driver_license_number}
                              onChange={(e) => setFormData({...formData, driver_license_number: e.target.value})}
                              placeholder="License number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Insurance Number</Label>
                            <Input
                              value={formData.insurance_number}
                              onChange={(e) => setFormData({...formData, insurance_number: e.target.value})}
                              placeholder="Insurance policy number"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

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
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Profile Photo</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'profile_photo_url')}
                          disabled={uploading.profile_photo_url}
                          className="flex-1"
                        />
                        {uploading.profile_photo_url && <Loader2 className="w-5 h-5 animate-spin" />}
                      </div>
                      {formData.profile_photo_url && (
                        <img src={formData.profile_photo_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>ID Document</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, 'id_document_url')}
                          disabled={uploading.id_document_url}
                          className="flex-1"
                        />
                        {uploading.id_document_url && <Loader2 className="w-5 h-5 animate-spin" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Driver License</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, 'license_document_url')}
                          disabled={uploading.license_document_url}
                          className="flex-1"
                        />
                        {uploading.license_document_url && <Loader2 className="w-5 h-5 animate-spin" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Vehicle Photo</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'vehicle_photo_url')}
                          disabled={uploading.vehicle_photo_url}
                          className="flex-1"
                        />
                        {uploading.vehicle_photo_url && <Loader2 className="w-5 h-5 animate-spin" />}
                      </div>
                      {formData.vehicle_photo_url && (
                        <img src={formData.vehicle_photo_url} alt="Vehicle" className="w-32 h-20 rounded object-cover" />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep(4)} className="flex-1">
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
                    <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
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
      </div>
    </div>
  );
}