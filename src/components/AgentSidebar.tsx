import React from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Agent } from '../types';
import { cn } from '../lib/utils';
import { MessageSquare, History, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

interface AgentSidebarProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  isOpen,
  onToggle
}) => {
  // Mock chat history data
  const chatHistory = [
    { id: '1', title: 'N8N Workflow Setup', agentId: 'n8n', timestamp: '2 hours ago' },
    { id: '2', title: 'Database Schema Design', agentId: 'supabase', timestamp: '1 day ago' },
    { id: '3', title: 'Cloud Deployment Help', agentId: 'digitalocean', timestamp: '2 days ago' },
    { id: '4', title: 'Code Review Session', agentId: 'claude', timestamp: '3 days ago' },
  ];

  return (
    <div className={cn(
      "bg-automatrix-gray border-r border-white/10 transition-all duration-300 flex flex-col",
      isOpen ? "w-80" : "w-16"
    )}>
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4">
        {isOpen && (
          <h2 className="font-semibold text-lg">AI Agents</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden md:flex"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Agents List */}
          <div className="space-y-2">
            {isOpen && (
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Available Agents
              </h3>
            )}
            
            {agents.map(agent => (
              <Button
                key={agent.id}
                variant={selectedAgent?.id === agent.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  !isOpen && "px-2"
                )}
                onClick={() => onSelectAgent(agent)}
                disabled={agent.isLocked}
              >
                <div className={cn(
                  "flex items-center space-x-3",
                  !isOpen && "justify-center"
                )}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${agent.color} relative`}>
                    <span className="text-lg">{agent.icon}</span>
                    {agent.isLocked && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Lock className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {isOpen && (
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {agent.description}
                      </div>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Chat History */}
          {isOpen && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                <History className="h-4 w-4 mr-2" />
                Recent Chats
              </h3>
              
              {chatHistory.map(chat => (
                <Card key={chat.id} className="glass-effect border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                        agents.find(a => a.id === chat.agentId)?.color || 'bg-muted'
                      }`}>
                        {agents.find(a => a.id === chat.agentId)?.icon || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-1">
                          {chat.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chat.timestamp}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="outline" className="w-full text-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                View All Chats
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AgentSidebar;
