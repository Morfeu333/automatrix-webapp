import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bot, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
}

const agents: Agent[] = [
  {
    id: 'n8n-expert',
    name: 'N8N Expert',
    description: 'Workflow Automation',
    avatar: 'N',
    color: 'bg-purple-500'
  },
  {
    id: 'claude-assistant',
    name: 'Claude Assistant',
    description: 'Code Analysis',
    avatar: 'C',
    color: 'bg-blue-500'
  },
  {
    id: 'hostinger-helper',
    name: 'Hostinger Helper',
    description: 'Web Hosting',
    avatar: 'H',
    color: 'bg-orange-500'
  },
  {
    id: 'digitalocean-pro',
    name: 'DigitalOcean Pro',
    description: 'Cloud Infrastructure',
    avatar: 'D',
    color: 'bg-cyan-500'
  },
  {
    id: 'supabase-specialist',
    name: 'Supabase Specialist',
    description: 'Database Design',
    avatar: 'S',
    color: 'bg-green-500'
  },
  {
    id: 'lovable-developer',
    name: 'Lovable Developer',
    description: 'Rapid Prototyping',
    avatar: 'L',
    color: 'bg-pink-500'
  },
  {
    id: 'augment-agent',
    name: 'Augment Agent',
    description: 'Code Analysis',
    avatar: 'A',
    color: 'bg-indigo-500'
  },
  {
    id: 'gemini-ai',
    name: 'Gemini AI',
    description: 'Multimodal Analysis',
    avatar: 'G',
    color: 'bg-yellow-500'
  },
  {
    id: 'ai-tools-expert',
    name: 'AI Tools Expert',
    description: 'AI Tool Integration',
    avatar: 'T',
    color: 'bg-red-500'
  }
];

const AgentsSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleAgentClick = (agentId: string) => {
    navigate('/agents');
  };

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-40 ${
      isExpanded ? 'w-64' : 'w-12'
    }`}>
      {/* Toggle Button */}
      <div className="absolute -right-3 top-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0 bg-white border-gray-300 shadow-md hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Sidebar Content */}
      <div className="p-2 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          {isExpanded ? (
            <div className="flex items-center space-x-2 px-2 py-3">
              <Bot className="h-5 w-5 text-automatrix-green" />
              <span className="font-semibold text-gray-800">AI Agents</span>
            </div>
          ) : (
            <div className="flex justify-center py-3">
              <Bot className="h-5 w-5 text-automatrix-green" />
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="mb-4">
          {isExpanded ? (
            <Button
              variant="outline"
              className="w-full justify-start text-left border-dashed border-gray-300 hover:border-automatrix-green hover:bg-automatrix-green/5"
              onClick={() => navigate('/agents')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 p-0 border-dashed border-gray-300 hover:border-automatrix-green hover:bg-automatrix-green/5"
              onClick={() => navigate('/agents')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Agents List */}
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="cursor-pointer group"
              onClick={() => handleAgentClick(agent.id)}
            >
              {isExpanded ? (
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 ${agent.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-sm font-medium">{agent.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {agent.description}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-2">
                  <div className={`w-8 h-8 ${agent.color} rounded-full flex items-center justify-center hover:scale-110 transition-transform`}>
                    <span className="text-white text-sm font-medium">{agent.avatar}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentsSidebar;
