import React, { useState } from 'react';
import { Users, FileText, MessageSquare, Activity, ChevronDown, ChevronUp, Calendar, Phone, Mail, Building, Globe, Linkedin, Instagram, Twitter, Youtube, ExternalLink, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  businessDescription?: string;
  quizAnswers: string[];
  selectedOption: 'shop' | 'meeting' | 'community';
  createdAt: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  totalSpent: number;
  meetingsScheduled: number;
  meetingsCompleted: number;
  leadScore: number;
  tags: string[];
}

interface Meeting {
  id: number;
  userId: number;
  userName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  duration: number;
  notes?: string;
  transcription?: string;
  followUpRequired: boolean;
  outcome?: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  // Mock data for demonstration
  const stats = [
    { title: 'Total Users', value: '24', icon: Users, color: 'text-blue-600', change: '+12%' },
    { title: 'Active Chats', value: '8', icon: MessageSquare, color: 'text-green-600', change: '+5%' },
    { title: 'Meetings Today', value: '3', icon: Calendar, color: 'text-purple-600', change: '+2' },
    { title: 'Revenue (MTD)', value: '$12,500', icon: DollarSign, color: 'text-orange-600', change: '+18%' },
  ];

  const users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@techstartup.com',
      phone: '+1 (555) 123-4567',
      company: 'Tech Startup Inc.',
      website: 'https://techstartup.com',
      linkedin: 'https://linkedin.com/in/johndoe',
      instagram: '@johndoe_tech',
      twitter: '@johndoe',
      businessDescription: 'We are a SaaS startup focused on productivity tools for remote teams. Looking to automate customer onboarding and support processes.',
      quizAnswers: ['Medium Project - 2+ People', 'Has tech/dev knowledge but not into AI', 'Big Personalized Project', 'Add $10k+ monthly revenue', 'Right Now ASAP'],
      selectedOption: 'shop',
      createdAt: '2024-01-15',
      lastActive: '2024-01-20',
      status: 'active',
      totalSpent: 3000,
      meetingsScheduled: 2,
      meetingsCompleted: 1,
      leadScore: 85,
      tags: ['High Value', 'Tech Savvy', 'Urgent'],
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@enterprisesolutions.com',
      phone: '+1 (555) 987-6543',
      company: 'Enterprise Solutions LLC',
      website: 'https://enterprisesolutions.com',
      linkedin: 'https://linkedin.com/in/janesmith',
      businessDescription: 'Enterprise consulting firm specializing in digital transformation. We help Fortune 500 companies modernize their operations.',
      quizAnswers: ['Big Project - 10+ People', 'Into AI building and wants someone dedicated', 'Big Personalized Project', 'Add $100k+ monthly revenue', 'Next weeks/month'],
      selectedOption: 'meeting',
      createdAt: '2024-01-14',
      lastActive: '2024-01-19',
      status: 'active',
      totalSpent: 15000,
      meetingsScheduled: 5,
      meetingsCompleted: 3,
      leadScore: 95,
      tags: ['Enterprise', 'High Budget', 'Decision Maker'],
    },
    {
      id: 3,
      name: 'Dr. Maria Rodriguez',
      email: 'maria@healthclinic.com',
      phone: '+1 (555) 456-7890',
      company: 'Rodriguez Health Clinic',
      website: 'https://rodriguezhealth.com',
      businessDescription: 'Private medical practice focusing on preventive care and wellness. Need to automate patient scheduling and follow-ups.',
      quizAnswers: ['Small Project - 1 Person', 'Not technical and no tech team', 'Pre-Made Automations', 'Add $1k+ monthly revenue', 'In 2-3 months'],
      selectedOption: 'community',
      createdAt: '2024-01-12',
      lastActive: '2024-01-18',
      status: 'pending',
      totalSpent: 1000,
      meetingsScheduled: 1,
      meetingsCompleted: 1,
      leadScore: 65,
      tags: ['Healthcare', 'Small Business', 'Price Sensitive'],
    },
  ];

  const meetings: Meeting[] = [
    {
      id: 1,
      userId: 2,
      userName: 'Jane Smith',
      date: '2024-01-20',
      time: '14:00',
      status: 'completed',
      duration: 45,
      notes: 'Discussed enterprise automation needs. Interested in custom AI agents for customer service. Budget approved for $50k project.',
      transcription: 'Jane: We need to automate our customer service process... [Full transcription available]',
      followUpRequired: true,
      outcome: 'Proposal sent for $50k custom automation project',
    },
    {
      id: 2,
      userId: 1,
      userName: 'John Doe',
      date: '2024-01-21',
      time: '10:00',
      status: 'scheduled',
      duration: 30,
      followUpRequired: false,
    },
    {
      id: 3,
      userId: 3,
      userName: 'Dr. Maria Rodriguez',
      date: '2024-01-19',
      time: '16:00',
      status: 'completed',
      duration: 30,
      notes: 'Initial consultation about patient management automation. Interested in pre-made solutions.',
      outcome: 'Recommended starter package - $1k',
      followUpRequired: false,
    },
  ];

  const toggleUserExpansion = (userId: number) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOptionColor = (option: string) => {
    switch (option) {
      case 'shop': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'community': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive CRM and user management system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'users', label: 'Users & CRM', icon: Users },
                  { id: 'meetings', label: 'Meetings', icon: Calendar },
                  { id: 'analytics', label: 'Analytics', icon: Activity },
                  { id: 'workflows', label: 'Workflows', icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'border-automatrix-green text-automatrix-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management & CRM</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          <Badge className={getOptionColor(user.selectedOption)}>
                            {user.selectedOption}
                          </Badge>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLeadScoreColor(user.leadScore)}`}>
                            Score: {user.leadScore}
                          </div>
                          <span className="text-sm text-gray-500">{user.createdAt}</span>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {user.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Quick Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            {user.company && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Building className="h-4 w-4" />
                                <span>{user.company}</span>
                              </div>
                            )}
                            {user.website && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Globe className="h-4 w-4" />
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-automatrix-green hover:underline">
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Revenue:</span> ${user.totalSpent.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Meetings:</span> {user.meetingsCompleted}/{user.meetingsScheduled}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserExpansion(user.id)}
                        className="ml-4"
                      >
                        {expandedUser === user.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded Content */}
                    {expandedUser === user.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {/* Business Description */}
                        {user.businessDescription && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Business Description:</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {user.businessDescription}
                            </p>
                          </div>
                        )}

                        {/* Social Media Links */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Social Media:</h4>
                          <div className="flex flex-wrap gap-3">
                            {user.linkedin && (
                              <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
                                <Linkedin className="h-4 w-4" />
                                <span>LinkedIn</span>
                              </a>
                            )}
                            {user.instagram && (
                              <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-sm text-pink-600 hover:underline">
                                <Instagram className="h-4 w-4" />
                                <span>{user.instagram}</span>
                              </a>
                            )}
                            {user.twitter && (
                              <a href={`https://twitter.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-sm text-blue-400 hover:underline">
                                <Twitter className="h-4 w-4" />
                                <span>{user.twitter}</span>
                              </a>
                            )}
                          </div>
                        </div>
                        
                        {/* Quiz Answers */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Quiz Responses:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {user.quizAnswers.map((answer, index) => (
                              <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {answer}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'meetings' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Meeting Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getMeetingStatusIcon(meeting.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">{meeting.userName}</h3>
                          <p className="text-sm text-gray-600">{meeting.date} at {meeting.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={meeting.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                        meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-red-100 text-red-800'}>
                          {meeting.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{meeting.duration} min</p>
                      </div>
                    </div>
                    
                    {meeting.notes && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Notes:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{meeting.notes}</p>
                      </div>
                    )}
                    
                    {meeting.outcome && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Outcome:</h4>
                        <p className="text-sm text-green-600 font-medium">{meeting.outcome}</p>
                      </div>
                    )}
                    
                    {meeting.transcription && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Transcription:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                          {meeting.transcription}
                        </p>
                      </div>
                    )}
                    
                    {meeting.followUpRequired && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800 font-medium">⚠️ Follow-up required</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
