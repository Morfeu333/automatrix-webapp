import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { useUser } from '../contexts/UserContext';
import { Workflow } from '../types';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Play, 
  Check, 
  Eye,
  Clock,
  Users,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProductCardProps {
  workflow: Workflow;
  onQuickView?: (workflow: Workflow) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  workflow, 
  onQuickView,
  className 
}) => {
  const { 
    addToCart, 
    cart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    addToRecentlyViewed 
  } = useUser();
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleQuickView = () => {
    addToRecentlyViewed(workflow);
    onQuickView?.(workflow);
  };

  const handleCardClick = () => {
    addToRecentlyViewed(workflow);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
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
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer",
        "glass-effect border-white/10 hover:border-primary/50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {workflow.isNew && (
          <Badge className="bg-green-500 text-white text-xs">
            <Zap className="h-3 w-3 mr-1" />
            New
          </Badge>
        )}
        {workflow.isPopular && (
          <Badge className="bg-orange-500 text-white text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        )}
        {workflow.isOnSale && discountPercentage > 0 && (
          <Badge className="bg-red-500 text-white text-xs">
            -{discountPercentage}%
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-3 right-3 z-10 h-8 w-8 rounded-full transition-all",
          "bg-white/80 hover:bg-white backdrop-blur-sm",
          inWishlist && "text-red-500"
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleWishlistToggle();
        }}
      >
        <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
      </Button>

      <CardHeader className="p-0 relative">
        {/* Product Image */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-100">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
          <img
            src={workflow.image}
            alt={workflow.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isHovered && "scale-110",
              !isImageLoaded && "opacity-0"
            )}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Overlay with Quick Actions */}
          <div className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickView();
              }}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Eye className="h-4 w-4 mr-1" />
              Quick View
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 hover:bg-white text-black h-8 w-8"
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Category and Difficulty */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {workflow.category}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              workflow.difficulty === 'Beginner' && "border-green-500 text-green-500",
              workflow.difficulty === 'Intermediate' && "border-yellow-500 text-yellow-500",
              workflow.difficulty === 'Advanced' && "border-red-500 text-red-500"
            )}
          >
            {workflow.difficulty}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {workflow.name}
        </h3>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(workflow.rating)}
          </div>
          <span className="text-sm text-muted-foreground">
            {workflow.rating} ({workflow.reviewCount})
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {workflow.description}
        </p>

        {/* Key Features */}
        <div className="space-y-1">
          {workflow.features.slice(0, 2).map((feature, index) => (
            <div key={index} className="flex items-center text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>

        {/* Setup Time and Users */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {workflow.estimatedSetupTime}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {workflow.reviewCount}+ users
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              ${workflow.price}
            </span>
            {workflow.originalPrice && workflow.originalPrice > workflow.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${workflow.originalPrice}
              </span>
            )}
          </div>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isInCart}
            variant={isInCart ? "outline" : "default"}
            size="sm"
            className={cn(
              "transition-all",
              !isInCart && "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            )}
          >
            {isInCart ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
