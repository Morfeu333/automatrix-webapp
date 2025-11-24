import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'contact-info',
    question: 'Let\'s start with your contact information',
    type: 'contact-form',
    description: 'We need your email to send you the results and recommendations. Phone is optional but helps us provide better support.',
    required: true,
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: false }
    ]
  },
  {
    id: 'business-size',
    question: 'What best describes your business and team size?',
    type: 'multiple-choice',
    description: 'We have 3 client examples to guide you:\n\n**Febracis** is a huge company with +1000 employees and we\'re working with 10 of their employees. Their CEO had 6M followers on Instagram and they have a team of professionals for each area - we\'re making many personalized applications and agents for them.\n\n**Purposewaze** is a company with more than 10 employees and we\'re working with their owner + 3 people only in an agentic app development that has a single functionality.\n\n**Dani** is a single person business, she\'s a doctor and she hired us to implement a pre-made automation with an interface.',
    options: [
      'A) Big Project - Working with 10+ People',
      'B) Medium Project - We will deal with 2+ People',
      'C) Small Project - We will deal with 1 Person'
    ],
    required: true
  },
  {
    id: 'technical-knowledge',
    question: 'What\'s your technical background and AI experience?',
    type: 'multiple-choice',
    description: '**Febracis** has some tech people working for them that communicate with us about projects and review, but they don\'t have any experience with AI building - we are their first AI project, despite being a huge company.\n\n**Purposewaze\'s CEO** is into the AI community and even tried to build some automations and apps, but needed someone dedicated to this area. He even has some N8N automations running already and a CRM.\n\n**Dani** has zero knowledge and approach for technology, she\'s a doctor and wants us to take care of everything - she basically uses Google Docs and basic ChatGPT.',
    options: [
      'A) Has some tech/dev knowledge or team but is not into AI building',
      'B) Into AI building, knows some or a lot about it and wants someone dedicated',
      'C) Not a technical person and don\'t have a tech team'
    ],
    required: true
  },
  {
    id: 'project-type',
    question: 'What brings you to us?',
    type: 'multiple-choice',
    description: 'You have a big personalized project, you want to hire pre-made automations to scale your business, or you just want some of our automations and tools for free to implement yourself?',
    options: [
      'A) Big Personalized Project',
      'B) Pre-Made Automations',
      'C) Want Free Tools to implement myself'
    ],
    required: true
  },
  {
    id: 'earning-goals',
    question: 'What are your realistic earning goals hiring our services?',
    type: 'multiple-choice',
    description: 'How much are you aiming to earn with your new automations/app/SaaS?',
    options: [
      'A) Add $100k+ Monthly revenue to my company',
      'B) Add $10k+ Monthly revenue',
      'C) Add $1k+ Monthly revenue',
      'D) I don\'t have a specific earning goal'
    ],
    required: true
  },
  {
    id: 'urgency',
    question: 'When are you looking to start your new project?',
    type: 'multiple-choice',
    description: 'In how much time are you looking to start your new project?',
    options: [
      'A) Right Now, As soon as possible',
      'B) Next weeks or even Next Month',
      'C) In 2-3 Months'
    ],
    required: true
  },
  {
    id: 'business-description',
    question: 'Tell us about your business',
    type: 'business-form',
    description: 'Tell me about your business - what is your business about? You can write us simply the niche of your business or make a complete description. You can even record an audio if you want and we will have it transcribed.',
    required: true,
    fields: [
      { name: 'description', label: 'Business Description', type: 'textarea', required: true },
      { name: 'linkedin', label: 'LinkedIn URL', type: 'url', required: false },
      { name: 'instagram', label: 'Instagram URL', type: 'url', required: false },
      { name: 'tiktok', label: 'TikTok URL', type: 'url', required: false },
      { name: 'twitter', label: 'X (Twitter) URL', type: 'url', required: false },
      { name: 'youtube', label: 'YouTube URL', type: 'url', required: false },
      { name: 'website', label: 'Website URL', type: 'url', required: false }
    ]
  }
];
