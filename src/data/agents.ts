import { Agent } from '../types';

export const agents: Agent[] = [
  {
    id: 'n8n',
    name: 'N8N Expert',
    description: 'Specialized in N8N workflow automation, node configurations, and advanced integrations',
    color: 'agent-n8n',
    icon: '🔗',
    specialties: ['Workflow Automation', 'API Integrations', 'Data Processing'],
    isLocked: false
  },
  {
    id: 'claude',
    name: 'Claude Assistant',
    description: 'Advanced AI assistant for coding, analysis, and complex problem-solving tasks',
    color: 'agent-claude',
    icon: '🧠',
    specialties: ['Code Analysis', 'Problem Solving', 'Documentation'],
    isLocked: false
  },
  {
    id: 'hostinger',
    name: 'Hostinger Helper',
    description: 'Expert in web hosting, domain management, and website deployment on Hostinger',
    color: 'agent-hostinger',
    icon: '🌐',
    specialties: ['Web Hosting', 'Domain Management', 'Website Deployment'],
    isLocked: false
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean Pro',
    description: 'Cloud infrastructure specialist for DigitalOcean droplets, databases, and services',
    color: 'agent-digitalocean',
    icon: '☁️',
    specialties: ['Cloud Infrastructure', 'Server Management', 'Database Hosting'],
    isLocked: false
  },
  {
    id: 'supabase',
    name: 'Supabase Specialist',
    description: 'Database and backend expert for Supabase projects, auth, and real-time features',
    color: 'agent-supabase',
    icon: '🗄️',
    specialties: ['Database Design', 'Authentication', 'Real-time Features'],
    isLocked: false
  },
  {
    id: 'lovable',
    name: 'Lovable Developer',
    description: 'AI-powered development assistant for rapid prototyping and app creation',
    color: 'agent-lovable',
    icon: '💝',
    specialties: ['Rapid Prototyping', 'App Development', 'UI/UX Design'],
    isLocked: false
  },
  {
    id: 'augment',
    name: 'Augment Agent',
    description: 'Code analysis and enhancement specialist using Augment\'s powerful tools',
    color: 'agent-augment',
    icon: '⚡',
    specialties: ['Code Analysis', 'Performance Optimization', 'Debugging'],
    isLocked: false
  },
  {
    id: 'gemini',
    name: 'Gemini AI',
    description: 'Google\'s advanced AI for multimodal tasks, analysis, and creative solutions',
    color: 'agent-gemini',
    icon: '💎',
    specialties: ['Multimodal Analysis', 'Creative Solutions', 'Data Processing'],
    isLocked: false
  },
  {
    id: 'aitools',
    name: 'AI Tools Expert',
    description: 'Comprehensive knowledge of AI tools, APIs, and integration strategies',
    color: 'agent-aitools',
    icon: '🛠️',
    specialties: ['AI Tool Integration', 'API Management', 'Automation Strategy'],
    isLocked: false
  },
  {
    id: 'general',
    name: 'General Agent',
    description: 'Versatile AI assistant for general tasks, questions, and business automation',
    color: 'agent-general',
    icon: '🤖',
    specialties: ['General Assistance', 'Business Automation', 'Task Management'],
    isLocked: false
  }
];
