import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import VideoPlaceholder from './VideoPlaceholder';
import PasswordCreationModal from './PasswordCreationModal';
import { useUser } from '../contexts/UserContext';
import { Calendar, ShoppingBag, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({ isOpen, onClose }) => {
  const [showPasswordCreation, setShowPasswordCreation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'meeting' | 'shop' | 'community' | null>(null);
  const { selectOption } = useUser();
  const navigate = useNavigate();

  const handleOptionSelect = (option: 'meeting' | 'shop' | 'community') => {
    setSelectedOption(option);
    selectOption(option);
    setShowPasswordCreation(true);
  };

  const handlePasswordCreationComplete = () => {
    onClose();

    if (selectedOption === 'meeting') {
      // Redirect to calendar booking (placeholder)
      alert('Calendar integration coming soon! You will receive an email with booking instructions.');
    } else if (selectedOption === 'shop') {
      navigate('/shop');
    } else if (selectedOption === 'community') {
      // Show community info and redirect
      alert('Welcome to our community! You now have access to AI agents and will receive the NASio community link via email.');
      // In real implementation, this would send the community link
    }
  };

  if (showPasswordCreation && selectedOption) {
    return (
      <PasswordCreationModal
        isOpen={isOpen}
        onClose={onClose}
        selectedOption={selectedOption}
        onComplete={handlePasswordCreationComplete}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl automatrix-text-gradient text-center">
            Choose Your Next Step
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Based on your assessment, here are the best ways we can help you achieve your automation goals.
          </DialogDescription>
        </DialogHeader>

        {/* Second VSL */}
        <div className="mb-8">
          <VideoPlaceholder
            title="Your Personalized Automation Path"
            description="Watch this personalized video explaining your options based on your assessment results."
            duration="4:30"
            className="aspect-video"
          />
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Option 1: Schedule Meeting */}
          <Card className="glass-effect border-white/10 hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 automatrix-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Schedule a Meeting</CardTitle>
              <CardDescription>
                Get a personalized consultation with our automation experts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 30-minute strategy session</li>
                <li>• Custom automation roadmap</li>
                <li>• Implementation timeline</li>
                <li>• ROI projections</li>
              </ul>
              <Button 
                onClick={() => handleOptionSelect('meeting')}
                variant="gradient" 
                className="w-full"
              >
                Book Free Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: Hire Premade Automations */}
          <Card className="glass-effect border-white/10 hover:border-primary/50 transition-all cursor-pointer group border-primary/30">
            <CardHeader className="text-center">
              <div className="w-16 h-16 automatrix-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Hire Premade Automations</CardTitle>
              <CardDescription>
                Browse our library of ready-to-deploy automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 12+ proven workflows</li>
                <li>• Instant deployment</li>
                <li>• Full documentation</li>
                <li>• 30-day support included</li>
              </ul>
              <Button 
                onClick={() => handleOptionSelect('shop')}
                variant="gradient" 
                className="w-full"
              >
                Browse AI Store
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Option 3: Join Community */}
          <Card className="glass-effect border-white/10 hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 automatrix-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Join the Community</CardTitle>
              <CardDescription>
                Connect with other automation enthusiasts and get free resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Free automation templates</li>
                <li>• Weekly live sessions</li>
                <li>• Peer support network</li>
                <li>• Exclusive content</li>
              </ul>
              <Button 
                onClick={() => handleOptionSelect('community')}
                variant="outline" 
                className="w-full"
              >
                Join Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>You can always explore other options after making your choice</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OptionsModal;
