import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Upload, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RestaurantOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine_type: "african",
    address: "",
    city: "",
    country: "Senegal",
    phone: "",
    email: "",
    owner_email: "",
    logo_url: "",
    cover_image_url: "",
    delivery_fee: 5,
    min_order: 0,
    avg_delivery_time: 30,
    open_hours: "9:00 AM - 10:00 PM",
    commission_rate: 15
  });

  const createRestaurantMutation = useMutation({
    mutationFn: (data) => base44.entities.Restaurant.create(data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("CustomerApp"));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    createRestaurantMutation.mutate({
      ...formData,
      status: 'pending',
      rating: 0,
      total_orders: 0
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
            <p className="text-slate-600">Your restaurant has been submitted for review. You'll be notified once approved.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Join Our Marketplace</h1>
          <p className="text-slate-600">Register your restaurant and start receiving orders</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-slate-200'}`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-orange-600' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-slate-200'}`}>2</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-orange-600' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-slate-200'}`}>3</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Restaurant Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Cuisine Type *</Label>
                  <Select value={formData.cuisine_type} onValueChange={(value) => setFormData({...formData, cuisine_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="african">African</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="thai">Thai</SelectItem>
                      <SelectItem value="lebanese">Lebanese</SelectItem>
                      <SelectItem value="moroccan">Moroccan</SelectItem>
                      <SelectItem value="pizza">Pizza</SelectItem>
                      <SelectItem value="burgers">Burgers</SelectItem>
                      <SelectItem value="seafood">Seafood</SelectItem>
                      <SelectItem value="fast_food">Fast Food</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Owner Email *</Label>
                  <Input type="email" value={formData.owner_email} onChange={(e) => setFormData({...formData, owner_email: e.target.value})} required />
                </div>

                <Button type="button" onClick={() => setStep(2)} className="w-full">Next</Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Location & Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Opening Hours</Label>
                  <Input value={formData.open_hours} onChange={(e) => setFormData({...formData, open_hours: e.target.value})} placeholder="e.g., 9:00 AM - 10:00 PM" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Delivery Fee ($)</Label>
                    <Input type="number" step="0.1" value={formData.delivery_fee} onChange={(e) => setFormData({...formData, delivery_fee: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Order ($)</Label>
                    <Input type="number" step="0.1" value={formData.min_order} onChange={(e) => setFormData({...formData, min_order: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Time (min)</Label>
                    <Input type="number" value={formData.avg_delivery_time} onChange={(e) => setFormData({...formData, avg_delivery_time: parseInt(e.target.value)})} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button type="button" onClick={() => setStep(3)} className="flex-1">Next</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Branding & Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Restaurant Logo</Label>
                  {formData.logo_url && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border mb-2">
                      <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    {uploadingLogo && <Loader2 className="w-5 h-5 animate-spin" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  {formData.cover_image_url && (
                    <div className="w-full h-48 rounded-lg overflow-hidden border mb-2">
                      <img src={formData.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
                    {uploadingCover && <Loader2 className="w-5 h-5 animate-spin" />}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Platform Commission</h4>
                  <p className="text-sm text-blue-700">Standard commission rate: {formData.commission_rate}% per order</p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button type="submit" disabled={createRestaurantMutation.isPending || uploadingLogo || uploadingCover} className="flex-1">
                    {createRestaurantMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}