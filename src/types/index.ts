export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  youtube?: string;
  otherSocial?: string;
  businessDescription?: string;
  audioTranscription?: string;
  isRegistered: boolean;
  selectedOption: 'meeting' | 'shop' | 'community' | null;
  quizAnswers: QuizAnswer[];
  createdAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | Record<string, any>;
  questionText: string;
}

export interface QuizFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  required: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'scale' | 'contact-form' | 'business-form';
  options?: string[];
  fields?: QuizFormField[];
  description?: string;
  required: boolean;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  verified: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  videoUrl: string;
  specifications: string[];
  requirements: string[];
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedSetupTime: string;
  lastUpdated: Date;
}

export interface CartItem {
  workflow: Workflow;
  quantity: number;
  addedAt: Date;
}

export interface WishlistItem {
  workflow: Workflow;
  addedAt: Date;
}

export interface SavedForLaterItem {
  workflow: Workflow;
  quantity: number;
  savedAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  specialties: string[];
  isLocked: boolean;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: File[];
}

export interface ChatSession {
  id: string;
  agentId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminData {
  users: User[];
  workflows: Workflow[];
  chatSessions: ChatSession[];
  userFiles: UserFile[];
}

export interface UserFile {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  agentId: string;
}
