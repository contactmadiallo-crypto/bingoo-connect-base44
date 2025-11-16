import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Bike, User as UserIcon, Phone, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import RestaurantMenu from "../components/restaurant/RestaurantMenu";
import CustomerProfile from "../components/restaurant/CustomerProfile";
import CustomerOrders from "../components/restaurant/CustomerOrders";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ScrollToTop from "../components/ScrollToTop";
import { useTranslation } from "../components/translations";

const cuisineCategories = [
  { value: "all", label: "All", emoji: "🍽️" },
  { value: "african", label: "African", emoji: "🌍" },
  { value: "italian", label: "Italian", emoji: "🍕" },
  { value: "chinese", label: "Chinese", emoji: "🥢" },
  { value: "indian", label: "Indian", emoji: "🍛" },
  { value: "french", label: "French", emoji: "🥐" },
  { value: "japanese", label: "Japanese", emoji: "🍣" },
  { value: "mexican", label: "Mexican", emoji: "🌮" },
  { value: "thai", label: "Thai", emoji: "🍜" },
  { value: "mediterranean", label: "Mediterranean", emoji: "🫒" },
  { value: "american", label: "American", emoji: "🍔" },
  { value: "lebanese", label: "Lebanese", emoji: "🥙" },
  { value: "moroccan", label: "Moroccan", emoji: "🍲" },
  { value: "pizza", label: "Pizza", emoji: "🍕" },
  { value: "burgers", label: "Burgers", emoji: "🍔" },
  { value: "seafood", label: "Seafood", emoji: "🦞" },
  { value: "fast_food", label: "Fast Food", emoji: "🍟" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { value: "desserts", label: "Desserts", emoji: "🍰" },
  { value: "mixed", label: "Mixed", emoji: "🌐" }
];

const businessTypes = [
  { value: "all", label: "All", emoji: "🏪" },
  { value: "restaurant", label: "Restaurants", emoji: "🍽️" },
  { value: "grocery", label: "Groceries", emoji: "🛒" },
  { value: "pharmacy", label: "Pharmacies", emoji: "💊" },
  { value: "local_shop", label: "Local Shops", emoji: "🏪" }
];

export default function CustomerApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [selectedBusinessType, setSelectedBusinessType] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDeliveryFee: 100,
    maxDeliveryTime: 120
  });

  const { t } = useTranslation(language);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
    if (language === "ar") {
      document.dir = "rtl";
    } else {
      document.dir = "ltr";
    }
  }, [language]);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.filter({ status: 'active' }),
    initialData: [],
    enabled: !!user,
  });

  const cities = ["all", ...new Set(restaurants.map(r => r.city).filter(Boolean))];

  const filteredRestaurants = restaurants.filter(r => {
    const matchCity = selectedCity === "all" || r.city === selectedCity;
    const matchCuisine = selectedCuisine === "all" || r.cuisine_type === selectedCuisine;
    const matchBusinessType = selectedBusinessType === "all" || r.business_type === selectedBusinessType;
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchRating = (r.rating || 0) >= filters.minRating;
    const matchDeliveryFee = (r.delivery_fee || 0) <= filters.maxDeliveryFee;
    const matchDeliveryTime = (r.avg_delivery_time || 0) <= filters.maxDeliveryTime;
    return matchCity && matchCuisine && matchBusinessType && matchSearch && matchRating && matchDeliveryFee && matchDeliveryTime;
  });

  // Sort by rating
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
  }

  if (showProfile) {
    return <CustomerProfile user={user} onBack={() => setShowProfile(false)} onUserUpdate={checkAuth} language={language} />;
  }

  if (showOrders) {
    return <CustomerOrders user={user} onBack={() => setShowOrders(false)} language={language} />;
  }

  if (selectedRestaurant) {
    return <RestaurantMenu 
      restaurant={selectedRestaurant} 
      user={user} 
      onBack={() => setSelectedRestaurant(null)} 
      onShowProfile={() => setShowProfile(true)}
      onShowOrders={() => setShowOrders(true)}
      language={language}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-orange-600">🍽️ FoodHub</h1>
              <p className="text-xs md:text-sm text-slate-600">{t('discover_restaurants')}</p>
            </div>
            <div className="flex gap-2">
              <LanguageSwitcher language={language} onLanguageChange={setLanguage} compact />
              <Button variant="outline" onClick={() => setShowOrders(true)} size="sm" className="text-xs md:text-sm">
                {t('orders')}
              </Button>
              <Button variant="outline" onClick={() => setShowProfile(true)} size="sm" className="text-xs md:text-sm">
                <UserIcon className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t('profile')}</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t('search_restaurants')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(true)} className="h-12 px-4">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
                <SelectTrigger className="flex-1 h-12">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="flex-1 h-12">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>
                      {city === "all" ? t('all_cities') : city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBusinessType === "restaurant" && (
                <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                  <SelectTrigger className="flex-1 h-12">
                    <SelectValue placeholder="Cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineCategories.map(cuisine => (
                      <SelectItem key={cuisine.value} value={cuisine.value}>
                        {cuisine.emoji} {cuisine.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
            {cuisineCategories.slice(0, 8).map(cuisine => (
              <Button
                key={cuisine.value}
                variant={selectedCuisine === cuisine.value ? "default" : "outline"}
                onClick={() => setSelectedCuisine(cuisine.value)}
                className="whitespace-nowrap flex-shrink-0 h-10"
                size="sm"
              >
                <span className="mr-1.5">{cuisine.emoji}</span>
                {cuisine.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-slate-600">
            {sortedRestaurants.length} {sortedRestaurants.length === 1 ? 'result' : 'results'} found
          </p>
          {(filters.minRating > 0 || filters.maxDeliveryFee < 100 || filters.maxDeliveryTime < 120) && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ minRating: 0, maxDeliveryFee: 100, maxDeliveryTime: 120 })}>
              Clear Filters
            </Button>
          )}
        </div>

        {sortedRestaurants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">{t('no_restaurants')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sortedRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id} 
                className="overflow-hidden hover:shadow-xl transition-all"
              >
                <div 
                  className="h-40 md:h-48 bg-gradient-to-br from-orange-200 to-amber-200 relative cursor-pointer"
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  {restaurant.cover_image_url ? (
                    <img src={restaurant.cover_image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl md:text-6xl">
                      {businessTypes.find(t => t.value === restaurant.business_type)?.emoji || 
                       cuisineCategories.find(c => c.value === restaurant.cuisine_type)?.emoji || '🍽️'}
                    </div>
                  )}
                  {restaurant.logo_url && (
                    <div className="absolute bottom-3 left-3 w-14 h-14 md:w-16 md:h-16 bg-white rounded-full shadow-lg overflow-hidden border-4 border-white">
                      <img src={restaurant.logo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-4 md:pt-6 p-4">
                  <h3 className="font-bold text-lg md:text-xl mb-2">{restaurant.name}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{restaurant.description}</p>
                  
                  <div className="flex items-center gap-3 md:gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{restaurant.rating || 'New'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant.avg_delivery_time} {t('min')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bike className="w-4 h-4" />
                      <span>${restaurant.delivery_fee}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="text-xs">
                      {businessTypes.find(t => t.value === restaurant.business_type)?.emoji} {' '}
                      {businessTypes.find(t => t.value === restaurant.business_type)?.label || restaurant.business_type}
                    </Badge>
                    {restaurant.cuisine_type && (
                      <Badge variant="outline" className="text-xs">
                        {cuisineCategories.find(c => c.value === restaurant.cuisine_type)?.emoji} {' '}
                        {cuisineCategories.find(c => c.value === restaurant.cuisine_type)?.label}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span>{restaurant.city}</span>
                    </div>
                  </div>

                  {restaurant.phone && (
                    <a 
                      href={`tel:${restaurant.phone}`}
                      className="block w-full"
                    >
                      <Button 
                        variant="outline" 
                        className="w-full"
                        size="sm"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call to Order
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ScrollToTop />

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Minimum Rating: {filters.minRating > 0 ? filters.minRating : 'Any'}</Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => setFilters({...filters, minRating: value[0]})}
                min={0}
                max={5}
                step={0.5}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Delivery Fee: ${filters.maxDeliveryFee}</Label>
              <Slider
                value={[filters.maxDeliveryFee]}
                onValueChange={(value) => setFilters({...filters, maxDeliveryFee: value[0]})}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Delivery Time: {filters.maxDeliveryTime} min</Label>
              <Slider
                value={[filters.maxDeliveryTime]}
                onValueChange={(value) => setFilters({...filters, maxDeliveryTime: value[0]})}
                min={15}
                max={120}
                step={5}
              />
            </div>
            <Button onClick={() => setShowFilters(false)} className="w-full">
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}