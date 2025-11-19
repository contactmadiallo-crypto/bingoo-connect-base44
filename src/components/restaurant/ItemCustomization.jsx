import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

export default function ItemCustomization({ item, open, onClose, onAddToCart, language = "en" }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handleOptionChange = (optionName, value, isMultiple = false) => {
    if (isMultiple) {
      const current = selectedOptions[optionName] || [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setSelectedOptions({ ...selectedOptions, [optionName]: newValue });
    } else {
      setSelectedOptions({ ...selectedOptions, [optionName]: value });
    }
  };

  const calculatePrice = () => {
    let price = item.price;
    
    // Add price for selected options
    if (item.customization_options) {
      item.customization_options.forEach(option => {
        if (selectedOptions[option.name]) {
          if (Array.isArray(selectedOptions[option.name])) {
            selectedOptions[option.name].forEach(value => {
              const choice = option.choices?.find(c => c.value === value);
              if (choice?.extra_price) {
                price += choice.extra_price;
              }
            });
          } else {
            const choice = option.choices?.find(c => c.value === selectedOptions[option.name]);
            if (choice?.extra_price) {
              price += choice.extra_price;
            }
          }
        }
      });
    }
    
    return price * quantity;
  };

  const handleAddToCart = () => {
    onAddToCart({
      ...item,
      quantity,
      customizations: selectedOptions,
      special_instructions: specialInstructions,
      customized_price: calculatePrice() / quantity
    });
    onClose();
  };

  const translations = {
    en: {
      customize: "Customize Your Order",
      quantity: "Quantity",
      special_instructions: "Special Instructions",
      add_to_cart: "Add to Cart",
      total: "Total",
      required: "Required",
      optional: "Optional",
      extra: "extra"
    },
    fr: {
      customize: "Personnaliser Votre Commande",
      quantity: "Quantité",
      special_instructions: "Instructions Spéciales",
      add_to_cart: "Ajouter au Panier",
      total: "Total",
      required: "Requis",
      optional: "Optionnel",
      extra: "supplément"
    },
    ar: {
      customize: "تخصيص طلبك",
      quantity: "الكمية",
      special_instructions: "تعليمات خاصة",
      add_to_cart: "أضف إلى السلة",
      total: "المجموع",
      required: "مطلوب",
      optional: "اختياري",
      extra: "إضافي"
    }
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("customize")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Item Info */}
          <div className="flex gap-4">
            {item.image_url && (
              <img src={item.image_url} alt={item.name} className="w-24 h-24 rounded-lg object-cover" />
            )}
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
              <p className="text-lg font-bold text-orange-600 mt-2">${item.price}</p>
            </div>
          </div>

          {/* Customization Options */}
          {item.customization_options && item.customization_options.length > 0 && (
            <div className="space-y-4">
              {item.customization_options.map((option, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">{option.name}</Label>
                    <Badge variant={option.required ? "destructive" : "secondary"}>
                      {option.required ? t("required") : t("optional")}
                    </Badge>
                  </div>

                  {option.type === "single" && (
                    <RadioGroup
                      value={selectedOptions[option.name]}
                      onValueChange={(value) => handleOptionChange(option.name, value, false)}
                    >
                      {option.choices?.map((choice, choiceIdx) => (
                        <div key={choiceIdx} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={choice.value} id={`${option.name}-${choiceIdx}`} />
                            <Label htmlFor={`${option.name}-${choiceIdx}`} className="cursor-pointer">
                              {choice.label}
                            </Label>
                          </div>
                          {choice.extra_price > 0 && (
                            <span className="text-sm text-green-600">+${choice.extra_price} {t("extra")}</span>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {option.type === "multiple" && (
                    <div className="space-y-2">
                      {option.choices?.map((choice, choiceIdx) => (
                        <div key={choiceIdx} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${option.name}-${choiceIdx}`}
                              checked={(selectedOptions[option.name] || []).includes(choice.value)}
                              onCheckedChange={() => handleOptionChange(option.name, choice.value, true)}
                            />
                            <Label htmlFor={`${option.name}-${choiceIdx}`} className="cursor-pointer">
                              {choice.label}
                            </Label>
                          </div>
                          {choice.extra_price > 0 && (
                            <span className="text-sm text-green-600">+${choice.extra_price} {t("extra")}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label>{t("quantity")}</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label>{t("special_instructions")}</Label>
            <Textarea
              placeholder="Ex: Sans oignons, bien cuit..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleAddToCart} className="flex-1 bg-orange-600 hover:bg-orange-700">
            {t("add_to_cart")} • ${calculatePrice().toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}