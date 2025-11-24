import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { agents } from '../data/agents';
import { Agent, ChatMessage } from '../types';
import {
  MessageSquare,
  Plus,
  Send,
  Paperclip,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Bot,
  User as UserIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

const AgentsPage: React.FC = () => {
  const { user } = useUser();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Check if user has access
  if (!user?.isRegistered || !user?.selectedOption) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">
            Complete the quiz and register to unlock access to our AI agents.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-automatrix-green hover:bg-automatrix-green-dark"
          >
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
      agentId: selectedAgent.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Hello! I'm ${selectedAgent.name}. ${selectedAgent.description} How can I help you today?`,
        isUser: false,
        timestamp: new Date(),
        agentId: selectedAgent.id
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle agent selection
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true); // Auto-collapse on mobile
    }
  };

  return (
    <div className="h-screen bg-white pt-16 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-gray-50 border-r border-gray-200 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">AI Agents</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-600 hover:text-automatrix-green"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            variant="outline"
            className={`${sidebarCollapsed ? 'w-8 h-8 p-0' : 'w-full'} border-automatrix-green text-automatrix-green hover:bg-automatrix-green hover:text-white`}
            onClick={() => {
              setSelectedAgent(null);
              setMessages([]);
            }}
          >
            <Plus className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">New Chat</span>}
          </Button>
        </div>

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent)}
                className={`w-full p-3 mb-2 rounded-lg text-left transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'bg-automatrix-green text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                } ${sidebarCollapsed ? 'px-2' : ''}`}
                title={sidebarCollapsed ? agent.name : ''}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    selectedAgent?.id === agent.id ? 'bg-white text-automatrix-green' : 'bg-automatrix-green text-white'
                  }`}>
                    {agent.icon}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{agent.name}</div>
                      <div className={`text-xs truncate ${
                        selectedAgent?.id === agent.id ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {agent.specialties[0]}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-automatrix-green rounded-full flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                <div className="text-xs text-gray-500">Premium Access</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-automatrix-green rounded-full flex items-center justify-center text-white font-medium">
                  {selectedAgent.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedAgent.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                </div>
                <div className="ml-auto">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-automatrix-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chat with {selectedAgent.name}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {selectedAgent.description} Start a conversation to get help with your automation needs.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {selectedAgent.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-automatrix-green text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${selectedAgent.name}...`}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-automatrix-green hover:bg-automatrix-green-dark"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Agent Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AI Agents</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                Select an AI agent from the sidebar to start a conversation. Each agent specializes in different areas of automation and development.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {agents.slice(0, 4).map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-automatrix-green hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-automatrix-green rounded-full flex items-center justify-center text-white text-sm font-medium mb-2">
                      {agent.icon}
                    </div>
                    <div className="font-medium text-gray-900 text-sm">{agent.name}</div>
                    <div className="text-xs text-gray-600">{agent.specialties[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsPage;