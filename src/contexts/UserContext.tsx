import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, QuizAnswer, CartItem, WishlistItem, SavedForLaterItem, Workflow } from '../types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isQuizCompleted: boolean;
  setIsQuizCompleted: (completed: boolean) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (workflowId: string) => void;
  clearCart: () => void;
  updateCartQuantity: (workflowId: string, quantity: number) => void;
  wishlist: WishlistItem[];
  addToWishlist: (workflow: Workflow) => void;
  removeFromWishlist: (workflowId: string) => void;
  isInWishlist: (workflowId: string) => boolean;
  savedForLater: SavedForLaterItem[];
  saveForLater: (workflowId: string) => void;
  moveToCart: (workflowId: string) => void;
  removeFromSavedForLater: (workflowId: string) => void;
  recentlyViewed: Workflow[];
  addToRecentlyViewed: (workflow: Workflow) => void;
  updateQuizAnswers: (answers: QuizAnswer[]) => void;
  selectOption: (option: 'meeting' | 'shop' | 'community') => void;
  registerUser: (password: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<SavedForLaterItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Workflow[]>([]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.workflow.id === item.workflow.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.workflow.id === item.workflow.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, addedAt: new Date() }];
    });
  };

  const removeFromCart = (workflowId: string) => {
    setCart(prev => prev.filter(item => item.workflow.id !== workflowId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateCartQuantity = (workflowId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(workflowId);
    } else {
      setCart(prev => prev.map(item =>
        item.workflow.id === workflowId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  // Wishlist functions
  const addToWishlist = (workflow: Workflow) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.workflow.id === workflow.id);
      if (!exists) {
        return [...prev, { workflow, addedAt: new Date() }];
      }
      return prev;
    });
  };

  const removeFromWishlist = (workflowId: string) => {
    setWishlist(prev => prev.filter(item => item.workflow.id !== workflowId));
  };

  const isInWishlist = (workflowId: string) => {
    return wishlist.some(item => item.workflow.id === workflowId);
  };

  // Save for later functions
  const saveForLater = (workflowId: string) => {
    const cartItem = cart.find(item => item.workflow.id === workflowId);
    if (cartItem) {
      setSavedForLater(prev => [...prev, {
        workflow: cartItem.workflow,
        quantity: cartItem.quantity,
        savedAt: new Date()
      }]);
      removeFromCart(workflowId);
    }
  };

  const moveToCart = (workflowId: string) => {
    const savedItem = savedForLater.find(item => item.workflow.id === workflowId);
    if (savedItem) {
      addToCart({
        workflow: savedItem.workflow,
        quantity: savedItem.quantity,
        addedAt: new Date()
      });
      removeFromSavedForLater(workflowId);
    }
  };

  const removeFromSavedForLater = (workflowId: string) => {
    setSavedForLater(prev => prev.filter(item => item.workflow.id !== workflowId));
  };

  // Recently viewed functions
  const addToRecentlyViewed = (workflow: Workflow) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== workflow.id);
      return [workflow, ...filtered].slice(0, 10); // Keep only last 10 items
    });
  };

  const updateQuizAnswers = (answers: QuizAnswer[]) => {
    // Create user from quiz answers if doesn't exist
    if (!user) {
      const contactInfo = answers.find(a => a.questionId === 'contact-info')?.answer as Record<string, string>;
      const businessInfo = answers.find(a => a.questionId === 'business-description')?.answer as Record<string, string>;

      const newUser: User = {
        id: Date.now().toString(),
        email: contactInfo?.email || '',
        phone: contactInfo?.phone,
        businessDescription: businessInfo?.description,
        linkedin: businessInfo?.linkedin,
        instagram: businessInfo?.instagram,
        tiktok: businessInfo?.tiktok,
        twitter: businessInfo?.twitter,
        youtube: businessInfo?.youtube,
        website: businessInfo?.website,
        otherSocial: businessInfo?.other,
        audioTranscription: businessInfo?.audioTranscription,
        isRegistered: false,
        selectedOption: null,
        quizAnswers: answers,
        createdAt: new Date()
      };
      setUser(newUser);
    } else {
      setUser({ ...user, quizAnswers: answers });
    }
  };

  const selectOption = (option: 'meeting' | 'shop' | 'community') => {
    if (user) {
      setUser({ ...user, selectedOption: option });
    }
  };

  const registerUser = async (password: string): Promise<void> => {
    if (!user) {
      throw new Error('No user data available for registration');
    }

    // In a real app, this would make an API call to register the user
    // For now, we'll just mark them as registered
    setUser({ ...user, isRegistered: true });

    // Here you would typically:
    // 1. Send user data to Supabase
    // 2. Create authentication account
    // 3. Store quiz answers and profile data
    console.log('User registered:', { ...user, password: '[HIDDEN]' });
  };

  const value: UserContextType = {
    user,
    setUser,
    isQuizCompleted,
    setIsQuizCompleted,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartQuantity,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    savedForLater,
    saveForLater,
    moveToCart,
    removeFromSavedForLater,
    recentlyViewed,
    addToRecentlyViewed,
    updateQuizAnswers,
    selectOption,
    registerUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
