import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useUser } from '../contexts/UserContext';
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Calendar,
  CreditCard,
  Heart,
  Clock,
  ArrowRight,
  Trash2,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    clearCart,
    updateCartQuantity,
    savedForLater,
    saveForLater,
    moveToCart,
    removeFromSavedForLater
  } = useUser();

  const [activeTab, setActiveTab] = useState<'cart' | 'saved'>('cart');

  const total = cart.reduce((sum, item) => sum + (item.workflow.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savings = cart.reduce((sum, item) => {
    const originalPrice = item.workflow.originalPrice || item.workflow.price;
    return sum + ((originalPrice - item.workflow.price) * item.quantity);
  }, 0);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        )}
      />
    ));
  };

  const handleCheckout = () => {
    // Simulate checkout process
    alert('Redirecting to payment via nas.io...');
    // In real implementation, this would redirect to nas.io payment
    window.open('https://nas.io/referral?code=AUTOMATRIX_85LF', '_blank');
  };

  const handleScheduleImplementation = () => {
    alert('Redirecting to calendar for implementation scheduling...');
    // In real implementation, this would open calendar booking
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Cart Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-white/10 z-50 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Shopping Cart
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              className={cn(
                "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                activeTab === 'cart'
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('cart')}
            >
              Cart ({itemCount})
            </button>
            <button
              className={cn(
                "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                activeTab === 'saved'
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('saved')}
            >
              Saved for Later ({savedForLater.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'cart' ? (
              cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Browse our AI workflows and add them to your cart
                  </p>
                  <Button onClick={onClose} variant="outline">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <Card key={item.workflow.id} className="glass-effect border-white/10">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={item.workflow.image}
                              alt={item.workflow.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm line-clamp-1">
                                  {item.workflow.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {item.workflow.category}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    {renderStars(item.workflow.rating)}
                                    <span className="text-xs text-muted-foreground">
                                      ({item.workflow.reviewCount})
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.workflow.id)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Price and Quantity */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateCartQuantity(item.workflow.id, item.quantity - 1)}
                                  className="h-6 w-6"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateCartQuantity(item.workflow.id, item.quantity + 1)}
                                  className="h-6 w-6"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-primary">
                                  ${item.workflow.price * item.quantity}
                                </div>
                                {item.workflow.originalPrice && item.workflow.originalPrice > item.workflow.price && (
                                  <div className="text-xs text-muted-foreground line-through">
                                    ${item.workflow.originalPrice * item.quantity}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Save for Later */}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveForLater(item.workflow.id)}
                                className="text-xs h-7"
                              >
                                <Heart className="h-3 w-3 mr-1" />
                                Save for Later
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Clear Cart */}
                  {cart.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  )}
                </div>
              )
            ) : (
              /* Saved for Later Tab */
              savedForLater.length === 0 ? (
                <div className="text-center py-20">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved items</h3>
                  <p className="text-muted-foreground mb-6">
                    Items you save for later will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedForLater.map(item => (
                    <Card key={item.workflow.id} className="glass-effect border-white/10">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={item.workflow.image}
                              alt={item.workflow.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm line-clamp-1">
                                  {item.workflow.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {item.workflow.category}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    {renderStars(item.workflow.rating)}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromSavedForLater(item.workflow.id)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Price and Actions */}
                            <div className="flex items-center justify-between">
                              <div className="text-primary font-semibold">
                                ${item.workflow.price}
                                {item.workflow.originalPrice && item.workflow.originalPrice > item.workflow.price && (
                                  <span className="text-xs text-muted-foreground line-through ml-2">
                                    ${item.workflow.originalPrice}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => moveToCart(item.workflow.id)}
                                className="h-7"
                              >
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Move to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          {activeTab === 'cart' && cart.length > 0 && (
            <div className="border-t border-white/10 p-6 space-y-4">
              {/* Savings */}
              {savings > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>You're saving:</span>
                  <span className="font-semibold">${savings}</span>
                </div>
              )}

              {/* Subtotal and Total */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({itemCount} items):</span>
                  <span>${total}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">${total}</span>
                </div>
              </div>

              {/* Checkout Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-primary to-primary/80"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>

                <Button
                  onClick={handleScheduleImplementation}
                  variant="outline"
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Implementation
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Payment processed securely via nas.io
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShoppingCart;
