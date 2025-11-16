import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Bike, User as UserIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RestaurantMenu from "../components/restaurant/RestaurantMenu";
import CustomerProfile from "../components/restaurant/CustomerProfile";
import CustomerOrders from "../components/restaurant/CustomerOrders";

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

export default function CustomerApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

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
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchCuisine && matchSearch;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (showProfile) {
    return <CustomerProfile user={user} onBack={() => setShowProfile(false)} onUserUpdate={checkAuth} />;
  }

  if (showOrders) {
    return <CustomerOrders user={user} onBack={() => setShowOrders(false)} />;
  }

  if (selectedRestaurant) {
    return <RestaurantMenu 
      restaurant={selectedRestaurant} 
      user={user} 
      onBack={() => setSelectedRestaurant(null)} 
      onShowProfile={() => setShowProfile(true)}
      onShowOrders={() => setShowOrders(true)}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-orange-600">🍽️ FoodHub</h1>
              <p className="text-sm text-slate-600">Discover restaurants near you</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowOrders(true)}>
                My Orders
              </Button>
              <Button variant="outline" onClick={() => setShowProfile(true)}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city === "all" ? "All Cities" : city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {cuisineCategories.map(cuisine => (
              <Button
                key={cuisine.value}
                variant={selectedCuisine === cuisine.value ? "default" : "outline"}
                onClick={() => setSelectedCuisine(cuisine.value)}
                className="whitespace-nowrap flex-shrink-0"
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
        {filteredRestaurants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">No restaurants found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id} 
                className="overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                <div className="h-48 bg-gradient-to-br from-orange-200 to-amber-200 relative">
                  {restaurant.cover_image_url ? (
                    <img src={restaurant.cover_image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                      {cuisineCategories.find(c => c.value === restaurant.cuisine_type)?.emoji || '🍽️'}
                    </div>
                  )}
                  {restaurant.logo_url && (
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full shadow-lg overflow-hidden border-4 border-white">
                      <img src={restaurant.logo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-xl mb-2">{restaurant.name}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{restaurant.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{restaurant.rating || 'New'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant.avg_delivery_time} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bike className="w-4 h-4" />
                      <span>${restaurant.delivery_fee}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      {cuisineCategories.find(c => c.value === restaurant.cuisine_type)?.emoji} {' '}
                      {cuisineCategories.find(c => c.value === restaurant.cuisine_type)?.label || restaurant.cuisine_type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span>{restaurant.city}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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