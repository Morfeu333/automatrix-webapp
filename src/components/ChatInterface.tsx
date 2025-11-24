import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';
import { Agent, ChatMessage } from '../types';
import { Send, Paperclip, MoreVertical, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  agent: Agent;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      agentId: agent.id,
      content: `Hello! I'm ${agent.name}. ${agent.description}. How can I help you today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      agentId: agent.id,
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        agentId: agent.id,
        content: `I understand you're asking about "${inputValue}". As ${agent.name}, I can help you with that. This is a simulated response for demonstration purposes. In the real implementation, this would connect to the actual AI agent.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              {!message.isUser && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${agent.color}`}>
                  <span className="text-sm">{agent.icon}</span>
                </div>
              )}
              
              <div className={cn(
                "max-w-[70%] space-y-2",
                message.isUser ? "items-end" : "items-start"
              )}>
                <Card className={cn(
                  "glass-effect border-white/10",
                  message.isUser ? "bg-primary/10 border-primary/20" : ""
                )}>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTime(message.timestamp)}</span>
                  {!message.isUser && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {message.isUser && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground flex-shrink-0">
                  <span className="text-sm font-medium">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${agent.color}`}>
                <span className="text-sm">{agent.icon}</span>
              </div>
              <Card className="glass-effect border-white/10">
                <CardContent className="p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-white/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${agent.name}...`}
                className="pr-12 min-h-[44px] resize-none"
                disabled={isTyping}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFileUpload}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              variant="gradient"
              size="icon"
              className="h-11 w-11"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {agent.name} can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          // Handle file upload
          console.log('Files selected:', e.target.files);
        }}
      />
    </div>
  );
};

export default ChatInterface;
