import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useUser } from '../contexts/UserContext';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { Badge } from './ui/badge';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, cart } = useUser();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-automatrix-green to-automatrix-green-dark rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-automatrix-green to-automatrix-green-dark bg-clip-text text-transparent">
            Automatrix
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-automatrix-green' : 'text-gray-600 hover:text-automatrix-green'
            }`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={`text-sm font-medium transition-colors ${
              isActive('/shop') ? 'text-automatrix-green' : 'text-gray-600 hover:text-automatrix-green'
            }`}
          >
            AI Store
          </Link>

          <a
            href="https://nas.io/referral?code=AUTOMATRIX_85LF"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-automatrix-green"
          >
            Community
          </a>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Shopping Cart */}
          <Link to="/shop" className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-600 hover:text-automatrix-green"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-automatrix-green text-white text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Info */}
          {user?.isRegistered ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-8 h-8 bg-automatrix-green rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name}</span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Guest</div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-600 hover:text-automatrix-green"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="md:hidden py-4 border-t border-gray-200 bg-white">
          <nav className="flex flex-col space-y-2 px-4">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/') ? 'text-automatrix-green' : 'text-gray-600 hover:text-automatrix-green'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/shop') ? 'text-automatrix-green' : 'text-gray-600 hover:text-automatrix-green'
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              AI Store
            </Link>

            <a
              href="https://nas.io/referral?code=AUTOMATRIX_85LF"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-automatrix-green"
              onClick={() => setShowMobileMenu(false)}
            >
              Community
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;