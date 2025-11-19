import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Bike, User as UserIcon, Phone, SlidersHorizontal, MessageSquare, MessageCircle, TrendingUp, Bell } from "lucide-react";
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
import ConversationsList from "../components/chat/ConversationsList";
import ChatWindow from "../components/chat/ChatWindow";
import NotificationCenter from "../components/restaurant/NotificationCenter";
import NotificationProvider from "../components/notifications/NotificationProvider";

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
  const [showConversations, setShowConversations] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);
  const [chatDialog, setChatDialog] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDeliveryFee: 100,
    maxDeliveryTime: 120
  });

  const { t } = useTranslation(language);
  const queryClient = useQueryClient();

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

  // Handle reorder from session storage
  useEffect(() => {
    const reorderData = sessionStorage.getItem('reorder');
    if (reorderData && restaurants && restaurants.length > 0) {
      try {
        const { restaurantId } = JSON.parse(reorderData);
        const restaurant = restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
          setSelectedRestaurant(restaurant);
        }
      } catch (e) {
        console.error('Reorder error:', e);
      }
    }
  }, [restaurants]);

  const { data: allRestaurantReviews = [] } = useQuery({
    queryKey: ['all-restaurant-reviews'],
    queryFn: () => base44.entities.RestaurantReview.list(),
    enabled: !!user,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ customer_email: user.email, type: 'restaurant' }),
    enabled: !!user?.email,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['customer-conversations', user?.email],
    queryFn: () => base44.entities.Conversation.filter({ customer_email: user.email, status: 'active' }),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['customer-notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ customer_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count_customer || 0), 0);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (restaurant) => {
      const existing = favorites.find(f => f.restaurant_id === restaurant.id);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
      } else {
        await base44.entities.Favorite.create({
          customer_email: user.email,
          type: 'restaurant',
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isFavorite = (restaurantId) => {
    return favorites.some(f => f.restaurant_id === restaurantId);
  };

  const getRestaurantRating = (restaurantId) => {
    const reviews = allRestaurantReviews.filter(r => r.restaurant_id === restaurantId);
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return { avg: avg.toFixed(1), count: reviews.length };
  };

  const cities = ["all", ...new Set(restaurants.map(r => r.city).filter(Boolean))];

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!search || search.length < 2) return [];
    
    const searchLower = search.toLowerCase();
    const suggestions = new Set();
    
    restaurants.forEach(r => {
      if (r.name.toLowerCase().includes(searchLower)) {
        suggestions.add(r.name);
      }
      if (r.description?.toLowerCase().includes(searchLower)) {
        const words = r.description.split(' ').filter(w => w.toLowerCase().includes(searchLower));
        words.forEach(w => suggestions.add(w));
      }
      if (r.city?.toLowerCase().includes(searchLower)) {
        suggestions.add(r.city);
      }
      const cuisine = cuisineCategories.find(c => c.value === r.cuisine_type);
      if (cuisine?.label.toLowerCase().includes(searchLower)) {
        suggestions.add(cuisine.label);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [search, restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      const matchCity = selectedCity === "all" || r.city === selectedCity;
      const matchCuisine = selectedCuisine === "all" || r.cuisine_type === selectedCuisine;
      const matchBusinessType = selectedBusinessType === "all" || r.business_type === selectedBusinessType;
      
      // Enhanced search - name, description, cuisine, city
      const searchLower = search.toLowerCase();
      const matchSearch = !search || 
        r.name.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.city?.toLowerCase().includes(searchLower) ||
        cuisineCategories.find(c => c.value === r.cuisine_type)?.label.toLowerCase().includes(searchLower);
      
      const restaurantRating = getRestaurantRating(r.id);
      const actualRating = restaurantRating ? parseFloat(restaurantRating.avg) : (r.rating || 0);
      
      const matchRating = actualRating >= filters.minRating;
      const matchDeliveryFee = (r.delivery_fee || 0) <= filters.maxDeliveryFee;
      const matchDeliveryTime = (r.avg_delivery_time || 0) <= filters.maxDeliveryTime;
      
      return matchCity && matchCuisine && matchBusinessType && matchSearch && matchRating && matchDeliveryFee && matchDeliveryTime;
    });
  }, [restaurants, selectedCity, selectedCuisine, selectedBusinessType, search, filters]);

  const sortedRestaurants = useMemo(() => {
    const sorted = [...filteredRestaurants];
    
    if (sortBy === "relevance") {
      // Sort by popularity (rating * review count) and total orders
      sorted.sort((a, b) => {
        const ratingA = getRestaurantRating(a.id);
        const ratingB = getRestaurantRating(b.id);
        
        const scoreA = ratingA 
          ? parseFloat(ratingA.avg) * Math.log10(ratingA.count + 1) * (a.total_orders || 1)
          : (a.rating || 0) * (a.total_orders || 1);
        const scoreB = ratingB 
          ? parseFloat(ratingB.avg) * Math.log10(ratingB.count + 1) * (b.total_orders || 1)
          : (b.rating || 0) * (b.total_orders || 1);
        
        return scoreB - scoreA;
      });
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => {
        const ratingA = getRestaurantRating(a.id);
        const ratingB = getRestaurantRating(b.id);
        const scoreA = ratingA ? parseFloat(ratingA.avg) : (a.rating || 0);
        const scoreB = ratingB ? parseFloat(ratingB.avg) : (b.rating || 0);
        return scoreB - scoreA;
      });
    } else if (sortBy === "delivery_time") {
      sorted.sort((a, b) => (a.avg_delivery_time || 999) - (b.avg_delivery_time || 999));
    } else if (sortBy === "delivery_fee") {
      sorted.sort((a, b) => (a.delivery_fee || 999) - (b.delivery_fee || 999));
    } else if (sortBy === "popular") {
      sorted.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));
    }
    
    return sorted;
  }, [filteredRestaurants, sortBy]);

  const handleSelectConversation = (order) => {
    setChatOrder(order);
    setChatDialog(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
  }

  if (showProfile) {
    return <CustomerProfile user={user} onBack={() => setShowProfile(false)} onUserUpdate={checkAuth} language={language} />;
  }

  if (showOrders) {
    return <CustomerOrders user={user} onBack={() => { setShowOrders(false); setSelectedRestaurant(null); }} language={language} />;
  }

  if (selectedRestaurant) {
    return <RestaurantMenu 
      restaurant={selectedRestaurant} 
      user={user} 
      onBack={() => { 
        setSelectedRestaurant(null);
        sessionStorage.removeItem('reorder'); // Clean up reorder data
      }} 
      onShowProfile={() => { setShowProfile(true); setSelectedRestaurant(null); }}
      onShowOrders={() => { setShowOrders(true); setSelectedRestaurant(null); }}
      language={language}
    />;
  }

  return (
    <NotificationProvider user={user} userType="customer">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">🍽️ FoodHub</h1>
                <p className="text-xs sm:text-sm text-slate-600">{t('discover_restaurants')}</p>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <LanguageSwitcher language={language} onLanguageChange={setLanguage} compact />
                <div className="relative">
                  <Button variant="outline" onClick={() => setShowNotificationCenter(true)} size="sm" className="h-8 w-8 sm:h-10 sm:w-10 p-0 sm:p-2">
                    <Bell className="w-4 h-4" />
                  </Button>
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] sm:text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <Button variant="outline" onClick={() => setShowConversations(true)} size="sm" className="h-8 w-8 sm:h-10 sm:w-10 p-0 sm:p-2">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  {totalUnreadMessages > 0 && (
                    <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-[10px] sm:text-xs">
                      {totalUnreadMessages}
                    </Badge>
                  )}
                </div>
                <Button variant="outline" onClick={() => setShowOrders(true)} size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  <span className="hidden sm:inline">{t('orders')}</span>
                  <span className="sm:hidden">📦</span>
                </Button>
                <Button variant="outline" onClick={() => setShowProfile(true)} size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  <UserIcon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('profile')}</span>
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
                  {searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      {searchSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSearch(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                        >
                          <Search className="w-3 h-3 inline mr-2 text-slate-400" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
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
          {/* Breadcrumb Navigation */}
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
            <span className="font-semibold text-orange-600">🏠 {t('home')}</span>
            {selectedCity !== "all" && (
              <>
                <span>›</span>
                <span>{selectedCity}</span>
              </>
            )}
            {selectedCuisine !== "all" && (
              <>
                <span>›</span>
                <span>{cuisineCategories.find(c => c.value === selectedCuisine)?.label}</span>
              </>
            )}
          </div>

          <div className="mb-4 flex justify-between items-center gap-2 flex-wrap">
            <p className="text-sm text-slate-600">
              {sortedRestaurants.length} {sortedRestaurants.length === 1 ? 'result' : 'results'} found
            </p>
            <div className="flex gap-2 items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">
                    <TrendingUp className="w-3 h-3 inline mr-2" />
                    Pertinence
                  </SelectItem>
                  <SelectItem value="rating">
                    <Star className="w-3 h-3 inline mr-2" />
                    Note
                  </SelectItem>
                  <SelectItem value="delivery_time">
                    <Clock className="w-3 h-3 inline mr-2" />
                    Temps
                  </SelectItem>
                  <SelectItem value="delivery_fee">
                    <Bike className="w-3 h-3 inline mr-2" />
                    Frais
                  </SelectItem>
                  <SelectItem value="popular">
                    <TrendingUp className="w-3 h-3 inline mr-2" />
                    Populaire
                  </SelectItem>
                </SelectContent>
              </Select>
              {(filters.minRating > 0 || filters.maxDeliveryFee < 100 || filters.maxDeliveryTime < 120) && (
                <Button variant="ghost" size="sm" onClick={() => setFilters({ minRating: 0, maxDeliveryFee: 100, maxDeliveryTime: 120 })}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {sortedRestaurants.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600">{t('no_restaurants')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sortedRestaurants.map((restaurant) => {
                const restaurantRating = getRestaurantRating(restaurant.id);
                const displayRating = restaurantRating ? restaurantRating.avg : (restaurant.rating || 'New');
                const reviewCount = restaurantRating ? restaurantRating.count : 0;
                
                return (
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteMutation.mutate(restaurant);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <span className="text-2xl">{isFavorite(restaurant.id) ? '❤️' : '🤍'}</span>
                      </button>
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
                          <span className="font-semibold">{displayRating}</span>
                          {reviewCount > 0 && (
                            <span className="text-xs text-slate-500">({reviewCount})</span>
                          )}
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

                      <div className="flex gap-2">
                        {restaurant.phone && (
                          <a 
                            href={`tel:${restaurant.phone}`}
                            className="flex-1"
                          >
                            <Button 
                              variant="outline" 
                              className="w-full"
                              size="sm"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                          </a>
                        )}
                        {reviewCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRestaurant(restaurant);
                            }}
                            className="flex-1"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Reviews
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <ScrollToTop />

        <ConversationsList 
          user={user}
          userType="customer"
          open={showConversations}
          onOpenChange={setShowConversations}
          onSelectConversation={handleSelectConversation}
        />

        {chatOrder && (
          <ChatWindow 
            order={chatOrder}
            user={user}
            userType="customer"
            open={chatDialog}
            onOpenChange={setChatDialog}
          />
        )}

        <NotificationCenter 
          user={user}
          open={showNotificationCenter}
          onOpenChange={setShowNotificationCenter}
        />

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
    </NotificationProvider>
  );
}