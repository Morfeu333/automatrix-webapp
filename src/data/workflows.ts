import { Workflow } from '../types';

export const workflows: Workflow[] = [
  {
    id: 'instagram-dm',
    name: 'Instagram DM Automation',
    description: 'Automatically send personalized DMs to new followers and engage with your audience',
    category: 'Social Media',
    price: 1000,
    originalPrice: 1200,
    image: '/placeholder-workflow-1.jpg',
    videoUrl: '/placeholder-video-1.mp4',
    specifications: [
      'Auto-DM new followers',
      'Personalized message templates',
      'Engagement tracking',
      'Response automation'
    ],
    requirements: [
      'Instagram Business Account',
      'Meta Business API access',
      'N8N workspace'
    ],
    features: [
      'Smart targeting',
      'A/B testing',
      'Analytics dashboard',
      'Compliance monitoring'
    ],
    isPopular: true,
    isOnSale: true,
    rating: 4.8,
    reviewCount: 127,
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah M.',
        rating: 5,
        comment: 'Amazing automation! Increased my engagement by 300%.',
        createdAt: new Date('2024-01-15'),
        verified: true
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike R.',
        rating: 4,
        comment: 'Great workflow, easy to set up and very effective.',
        createdAt: new Date('2024-01-10'),
        verified: true
      }
    ],
    tags: ['Instagram', 'DM', 'Automation', 'Engagement'],
    difficulty: 'Intermediate',
    estimatedSetupTime: '2-3 hours',
    lastUpdated: new Date('2024-01-20')
  },
  {
    id: 'workflow-ads',
    name: 'Ad Campaign Optimizer',
    description: 'Automatically optimize your ad campaigns across multiple platforms for better ROI',
    category: 'Marketing',
    price: 1000,
    image: '/placeholder-workflow-2.jpg',
    videoUrl: '/placeholder-video-2.mp4',
    specifications: [
      'Multi-platform optimization',
      'Budget reallocation',
      'Performance monitoring',
      'Automated bidding'
    ],
    requirements: [
      'Facebook Ads Manager',
      'Google Ads account',
      'API access tokens'
    ],
    features: [
      'Real-time optimization',
      'Cost reduction',
      'Performance alerts',
      'Custom reporting'
    ],
    rating: 4.6,
    reviewCount: 89,
    reviews: [
      {
        id: '3',
        userId: 'user3',
        userName: 'David L.',
        rating: 5,
        comment: 'Saved me thousands on ad spend. ROI improved by 40%!',
        createdAt: new Date('2024-01-12'),
        verified: true
      }
    ],
    tags: ['Ads', 'Optimization', 'ROI', 'Marketing'],
    difficulty: 'Advanced',
    estimatedSetupTime: '4-6 hours',
    lastUpdated: new Date('2024-01-18')
  },
  {
    id: 'social-media-scraper',
    name: 'Social Media Scraper',
    description: 'Extract valuable data from social media platforms for market research and lead generation',
    category: 'Data Collection',
    price: 1000,
    image: '/placeholder-workflow-3.jpg',
    videoUrl: '/placeholder-video-3.mp4',
    specifications: [
      'Multi-platform scraping',
      'Data cleaning & formatting',
      'Export to spreadsheets',
      'Scheduled collection'
    ],
    requirements: [
      'Platform API access',
      'Data storage solution',
      'Compliance verification'
    ],
    features: [
      'Advanced filtering',
      'Duplicate removal',
      'Data validation',
      'Export automation'
    ],
    rating: 4.3,
    reviewCount: 67,
    reviews: [],
    tags: ['Data', 'Scraping', 'Research', 'Analytics'],
    difficulty: 'Advanced',
    estimatedSetupTime: '3-4 hours',
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'onboarding-workflow',
    name: 'Customer Onboarding',
    description: 'Streamline your customer onboarding process with automated sequences and follow-ups',
    category: 'Customer Success',
    price: 1000,
    image: '/placeholder-workflow-4.jpg',
    videoUrl: '/placeholder-video-4.mp4',
    specifications: [
      'Welcome email sequences',
      'Task automation',
      'Progress tracking',
      'Personalized journeys'
    ],
    requirements: [
      'Email marketing platform',
      'CRM integration',
      'Customer database'
    ],
    features: [
      'Conditional logic',
      'Progress analytics',
      'Custom triggers',
      'Multi-channel support'
    ]
  },
  {
    id: 'autopost',
    name: 'Social Media Autopost',
    description: 'Schedule and automatically post content across all your social media platforms',
    category: 'Social Media',
    price: 1000,
    image: '/placeholder-workflow-5.jpg',
    videoUrl: '/placeholder-video-5.mp4',
    specifications: [
      'Multi-platform posting',
      'Content scheduling',
      'Image optimization',
      'Hashtag automation'
    ],
    requirements: [
      'Social media accounts',
      'Content library',
      'Platform API access'
    ],
    features: [
      'Optimal timing',
      'Content recycling',
      'Performance tracking',
      'Bulk scheduling'
    ],
    isPopular: true,
    isNew: true,
    rating: 4.7,
    reviewCount: 203,
    reviews: [
      {
        id: '4',
        userId: 'user4',
        userName: 'Emma K.',
        rating: 5,
        comment: 'Saves me hours every week! Content goes out perfectly timed.',
        createdAt: new Date('2024-01-08'),
        verified: true
      }
    ],
    tags: ['Social Media', 'Automation', 'Scheduling', 'Content'],
    difficulty: 'Beginner',
    estimatedSetupTime: '1-2 hours',
    lastUpdated: new Date('2024-01-22')
  },
  {
    id: 'agent-creating-agents',
    name: 'Agent Creating Agents N8N',
    description: 'Meta-automation that creates and manages other AI agents within your N8N workspace',
    category: 'AI Automation',
    price: 1000,
    image: '/placeholder-workflow-6.jpg',
    videoUrl: '/placeholder-video-6.mp4',
    specifications: [
      'Dynamic agent creation',
      'Template management',
      'Agent orchestration',
      'Performance monitoring'
    ],
    requirements: [
      'N8N Pro workspace',
      'API credentials',
      'Agent templates'
    ],
    features: [
      'Self-improving systems',
      'Scalable architecture',
      'Error handling',
      'Resource optimization'
    ]
  },
  {
    id: 'claude-code-prompts',
    name: 'Claude Code Prompts',
    description: 'Advanced prompt engineering system for Claude AI to generate high-quality code',
    category: 'AI Development',
    price: 1000,
    image: '/placeholder-workflow-7.jpg',
    videoUrl: '/placeholder-video-7.mp4',
    specifications: [
      'Optimized prompt templates',
      'Code quality validation',
      'Multi-language support',
      'Version control integration'
    ],
    requirements: [
      'Claude API access',
      'Development environment',
      'Git repository'
    ],
    features: [
      'Smart prompting',
      'Code review automation',
      'Documentation generation',
      'Testing integration'
    ]
  },
  {
    id: 'first-webapp',
    name: 'FirstWebApp Generator',
    description: 'Automatically generate complete web applications from simple descriptions',
    category: 'Development',
    price: 1000,
    image: '/placeholder-workflow-8.jpg',
    videoUrl: '/placeholder-video-8.mp4',
    specifications: [
      'Full-stack generation',
      'Database setup',
      'API creation',
      'Frontend scaffolding'
    ],
    requirements: [
      'Development tools',
      'Cloud hosting',
      'Database service'
    ],
    features: [
      'Rapid prototyping',
      'Best practices',
      'Scalable architecture',
      'Deployment automation'
    ]
  },
  {
    id: 'maestra',
    name: 'Maestra Content AI',
    description: 'AI-powered content creation and management system for all your marketing needs',
    category: 'Content Creation',
    price: 1000,
    image: '/placeholder-workflow-9.jpg',
    videoUrl: '/placeholder-video-9.mp4',
    specifications: [
      'Multi-format content',
      'Brand voice consistency',
      'SEO optimization',
      'Content calendar'
    ],
    requirements: [
      'Content management system',
      'AI writing tools',
      'Brand guidelines'
    ],
    features: [
      'Voice matching',
      'Automated publishing',
      'Performance analytics',
      'Content optimization'
    ]
  },
  {
    id: 'postiz',
    name: 'Postiz Social Manager',
    description: 'Complete social media management automation with analytics and engagement tools',
    category: 'Social Media',
    price: 1000,
    image: '/placeholder-workflow-10.jpg',
    videoUrl: '/placeholder-video-10.mp4',
    specifications: [
      'Unified dashboard',
      'Engagement automation',
      'Analytics reporting',
      'Content curation'
    ],
    requirements: [
      'Social media accounts',
      'Analytics tools',
      'Content sources'
    ],
    features: [
      'Smart scheduling',
      'Audience insights',
      'Competitor analysis',
      'ROI tracking'
    ]
  },
  {
    id: 'veo3-content',
    name: 'Veo3 Video Content Automation',
    description: 'Automated video content creation workflow using Veo3 AI for marketing campaigns',
    category: 'Video Production',
    price: 1000,
    image: '/placeholder-workflow-11.jpg',
    videoUrl: '/placeholder-video-11.mp4',
    specifications: [
      'AI video generation',
      'Script automation',
      'Brand customization',
      'Multi-format export'
    ],
    requirements: [
      'Veo3 API access',
      'Video editing tools',
      'Content templates'
    ],
    features: [
      'Automated scripting',
      'Brand consistency',
      'Batch processing',
      'Quality optimization'
    ]
  },
  {
    id: 'carousel-workflow',
    name: 'Carousel Content Generator',
    description: 'Automatically create engaging carousel posts for social media platforms',
    category: 'Content Creation',
    price: 1000,
    image: '/placeholder-workflow-12.jpg',
    videoUrl: '/placeholder-video-12.mp4',
    specifications: [
      'Template-based design',
      'Content adaptation',
      'Multi-platform sizing',
      'Automated publishing'
    ],
    requirements: [
      'Design templates',
      'Content sources',
      'Social media APIs'
    ],
    features: [
      'Dynamic content',
      'Brand alignment',
      'Performance tracking',
      'A/B testing'
    ],
    isPopular: true
  }
].map(workflow => ({
  ...workflow,
  // Ensure all workflows have required fields
  rating: workflow.rating || 4.0 + Math.random() * 0.9, // Random rating between 4.0-4.9
  reviewCount: workflow.reviewCount || Math.floor(Math.random() * 100) + 20, // Random count 20-120
  reviews: workflow.reviews || [],
  tags: workflow.tags || [workflow.category, 'Automation'],
  difficulty: workflow.difficulty || (['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)] as 'Beginner' | 'Intermediate' | 'Advanced'),
  estimatedSetupTime: workflow.estimatedSetupTime || '2-3 hours',
  lastUpdated: workflow.lastUpdated || new Date('2024-01-10')
}));
