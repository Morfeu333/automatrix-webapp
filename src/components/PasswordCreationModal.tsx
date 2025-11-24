import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { useUser } from '../contexts/UserContext';
import { Eye, EyeOff, Lock, Calendar, ShoppingBag, Users } from 'lucide-react';

interface PasswordCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOption: 'meeting' | 'shop' | 'community';
  onComplete: () => void;
}

const PasswordCreationModal: React.FC<PasswordCreationModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedOption, 
  onComplete 
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { registerUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      await registerUser(password);
      onComplete();
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const getOptionDetails = () => {
    switch (selectedOption) {
      case 'meeting':
        return {
          icon: <Calendar className="h-8 w-8 text-primary" />,
          title: 'Schedule Your Meeting',
          description: 'Create your password to access the calendar and schedule your consultation',
          nextStep: 'After creating your password, you\'ll be redirected to our calendar to book your free consultation.'
        };
      case 'shop':
        return {
          icon: <ShoppingBag className="h-8 w-8 text-primary" />,
          title: 'Access AI Store',
          description: 'Create your password to browse and purchase automation workflows',
          nextStep: 'After creating your password, you\'ll have full access to our AI automation store.'
        };
      case 'community':
        return {
          icon: <Users className="h-8 w-8 text-primary" />,
          title: 'Join Our Community',
          description: 'Create your password to get the community link and access AI agents',
          nextStep: 'After creating your password, you\'ll get access to our NASio community and AI agents.'
        };
      default:
        return {
          icon: <Lock className="h-8 w-8 text-primary" />,
          title: 'Create Account',
          description: 'Create your password to continue',
          nextStep: 'Complete your registration to continue.'
        };
    }
  };

  const optionDetails = getOptionDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 automatrix-gradient rounded-full flex items-center justify-center">
              {optionDetails.icon}
            </div>
          </div>
          <DialogTitle className="text-xl automatrix-text-gradient text-center">
            {optionDetails.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {optionDetails.description}
          </DialogDescription>
        </DialogHeader>

        <Card className="glass-effect border-white/10">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </div>

              <Button 
                type="submit" 
                variant="gradient" 
                className="w-full"
                disabled={!password || !confirmPassword || password !== confirmPassword}
              >
                Create Account & Continue
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>{optionDetails.nextStep}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordCreationModal;
