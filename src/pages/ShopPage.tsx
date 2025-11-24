import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import ShoppingCart from '../components/ShoppingCart';
import { useUser } from '../contexts/UserContext';
import { workflows } from '../data/workflows';
import { Workflow } from '../types';
import {
  ShoppingCart as CartIcon,
  Filter,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Heart
} from 'lucide-react';

const ShopPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewWorkflow, setQuickViewWorkflow] = useState<Workflow | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { cart, wishlist } = useUser();

  const categories = ['all', ...Array.from(new Set(workflows.map(w => w.category)))];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredAndSortedWorkflows = useMemo(() => {
    let filtered = workflows;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(w => w.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(w => {
        if (max) {
          return w.price >= min && w.price <= max;
        } else {
          return w.price >= min;
        }
      });
    }

    // Filter by difficulty
    if (difficulty !== 'all') {
      filtered = filtered.filter(w => w.difficulty === difficulty);
    }

    // Sort workflows
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      case 'popular':
      default:
        return filtered.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return b.reviewCount - a.reviewCount;
        });
    }
  }, [selectedCategory, searchQuery, sortBy, priceRange, difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-automatrix-dark via-automatrix-gray to-automatrix-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="automatrix-text-gradient">AI Store</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse our collection of premade automation workflows. Each workflow is 
            professionally designed, tested, and ready for immediate deployment.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6 mb-8">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Filter className="h-5 w-5 text-muted-foreground mt-2 mr-2" />
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters and Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500">$0 - $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1000</SelectItem>
                  <SelectItem value="1000-1500">$1000 - $1500</SelectItem>
                  <SelectItem value="1500">$1500+</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty */}
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(diff => (
                    <SelectItem key={diff} value={diff}>
                      {diff === 'all' ? 'All Levels' : diff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Wishlist Button */}
              <Button
                variant="outline"
                onClick={() => {/* TODO: Open wishlist */}}
                className="relative"
              >
                <Heart className="h-4 w-4 mr-2" />
                Wishlist ({wishlist.length})
              </Button>

              {/* Cart Button */}
              <Button
                variant="outline"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <CartIcon className="h-4 w-4 mr-2" />
                Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedWorkflows.length} of {workflows.length} workflows
          </div>
        </div>

        {/* Workflows Grid */}
        <div className={
          viewMode === 'grid'
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredAndSortedWorkflows.map(workflow => (
            <ProductCard
              key={workflow.id}
              workflow={workflow}
              onQuickView={setQuickViewWorkflow}
              className={viewMode === 'list' ? "max-w-none" : ""}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedWorkflows.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold mb-4">No workflows found</h3>
            <p className="text-muted-foreground mb-8">
              {searchQuery
                ? `No workflows match "${searchQuery}". Try adjusting your search or filters.`
                : "Try selecting a different category or check back later for new workflows."
              }
            </p>
            <div className="flex gap-4 justify-center">
              {searchQuery && (
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear Search
                </Button>
              )}
              <Button onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setPriceRange('all');
                setDifficulty('all');
              }}>
                Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Quick View Modal */}
      <QuickViewModal
        workflow={quickViewWorkflow}
        isOpen={!!quickViewWorkflow}
        onClose={() => setQuickViewWorkflow(null)}
      />
    </div>
  );
};

export default ShopPage;
