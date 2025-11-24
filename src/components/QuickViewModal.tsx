import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useUser } from '../contexts/UserContext';
import { Workflow } from '../types';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  Play, 
  Check, 
  Clock,
  Users,
  Zap,
  TrendingUp,
  Shield,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';

interface QuickViewModalProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ 
  workflow, 
  isOpen, 
  onClose 
}) => {
  const { 
    addToCart, 
    cart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  } = useUser();

  if (!workflow || !isOpen) return null;

  const isInCart = cart.some(item => item.workflow.id === workflow.id);
  const inWishlist = isInWishlist(workflow.id);

  const handleAddToCart = () => {
    addToCart({ 
      workflow, 
      quantity: 1,
      addedAt: new Date()
    });
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(workflow.id);
    } else {
      addToWishlist(workflow);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : i < rating 
            ? "fill-yellow-400/50 text-yellow-400" 
            : "text-gray-300"
        )}
      />
    ));
  };

  const discountPercentage = workflow.originalPrice 
    ? Math.round(((workflow.originalPrice - workflow.price) / workflow.originalPrice) * 100)
    : 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold">Quick View</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Left Column - Image and Video */}
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {workflow.isNew && (
                  <Badge className="bg-green-500 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
                {workflow.isPopular && (
                  <Badge className="bg-orange-500 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {workflow.isOnSale && discountPercentage > 0 && (
                  <Badge className="bg-red-500 text-white">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Main Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={workflow.image}
                  alt={workflow.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="font-semibold mb-3">Key Features</h4>
                <div className="grid grid-cols-1 gap-2">
                  {workflow.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Category and Difficulty */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{workflow.category}</Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    workflow.difficulty === 'Beginner' && "border-green-500 text-green-500",
                    workflow.difficulty === 'Intermediate' && "border-yellow-500 text-yellow-500",
                    workflow.difficulty === 'Advanced' && "border-red-500 text-red-500"
                  )}
                >
                  {workflow.difficulty}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold">{workflow.name}</h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(workflow.rating)}
                </div>
                <span className="font-medium">{workflow.rating}</span>
                <span className="text-muted-foreground">
                  ({workflow.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-primary">
                  ${workflow.price}
                </span>
                {workflow.originalPrice && workflow.originalPrice > workflow.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${workflow.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {workflow.description}
              </p>

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Setup: {workflow.estimatedSetupTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{workflow.reviewCount}+ users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Verified workflow</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>Instant download</span>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-semibold mb-3">Requirements</h4>
                <div className="space-y-2">
                  {workflow.requirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                      {req}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="font-semibold mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {workflow.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={cn(
                    "flex-1",
                    !isInCart && "bg-gradient-to-r from-primary to-primary/80"
                  )}
                  size="lg"
                >
                  {isInCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      In Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  className={cn(inWishlist && "text-red-500 border-red-500")}
                >
                  <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;
