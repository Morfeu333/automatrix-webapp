import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import QuizModal from '../components/QuizModal';
import OptionsModal from '../components/OptionsModal';
import { useUser } from '../contexts/UserContext';
import { Play, ArrowRight, Download, ChevronRight, Sparkles, Bot, Database, Webhook, Image as ImageIcon, Palette, Zap, Users, Target, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { user, isQuizCompleted } = useUser();

  const handleGetStarted = () => {
    setIsQuizOpen(true);
  };

  const handleQuizComplete = () => {
    setIsQuizOpen(false);
    setIsOptionsOpen(true);
  };

  const floatingBadges = [
    { text: 'data sync', color: 'bg-green-500', position: 'top-20 right-32', delay: '0s' },
    { text: 'webhook', color: 'bg-emerald-500', position: 'top-32 right-16', delay: '0.5s' },
    { text: 'OAuth', color: 'bg-green-600', position: 'top-48 right-24', delay: '1s' },
    { text: 'image resize', color: 'bg-emerald-400', position: 'top-64 right-8', delay: '1.5s' },
    { text: 'AI audit', color: 'bg-green-700', position: 'top-80 right-20', delay: '2s' },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-green-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent"></div>
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          {/* Authority Badges */}
          <div className="flex justify-center items-center space-x-6 mb-8">
            <span className="text-sm font-medium text-green-600 flex items-center bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm border border-green-200/50">
              <CheckCircle className="w-4 h-4 mr-2" />
              Meta Technology Provider
            </span>
            <span className="text-sm font-medium text-emerald-600 flex items-center bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm border border-green-200/50">
              <CheckCircle className="w-4 h-4 mr-2" />
              Google Developer Program
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - VSL */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-gradient-to-br from-white/80 to-white/60 rounded-2xl p-6 backdrop-blur-xl border border-green-200/50 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-green-800 to-emerald-900 rounded-xl overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Play className="w-8 h-8 text-green-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-green-900/80 backdrop-blur-sm rounded-lg p-4 border border-green-200/20">
                      <h3 className="text-white font-semibold mb-2">High-Impact VSL Video Demonstration</h3>
                      <p className="text-green-100 text-sm mb-3">
                        From intelligent ad reporting to 30-second customer onboarding - see how our AI workflows eliminate hundreds of hours of manual work.
                      </p>
                      <div className="flex items-center text-white text-sm">
                        <Play className="w-4 h-4 mr-2" />
                        <span>8:45</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Text & 3D Sphere */}
            <div className="space-y-8 order-1 lg:order-2 relative">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="text-green-900">Scale your Business with</span>
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">AI Automations and SaaS!</span>
                </h1>
                <p className="text-xl text-green-700 leading-relaxed max-w-2xl">
                  From intelligent ad reporting to 30-second customer onboarding, our <strong>AI workflows eliminate hundreds of hours of manual work</strong> so you can focus on what really matters.
                </p>
              </div>

              {/* Download Workflow Button */}
              <div className="flex items-start space-x-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleGetStarted}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Join / Hire!
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Tooltip */}
                <div className="bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-lg p-3 max-w-xs">
                  <p className="text-green-800 text-sm">
                    Get personalized AI automation solutions for your business
                  </p>
                </div>
              </div>

              {/* 3D Sphere with Floating Badges */}
              <div className="absolute -right-32 top-0 w-96 h-96 hidden xl:block">
                {/* Main Sphere */}
                <div className="relative w-64 h-64 mx-auto">
                  <div className="w-full h-full bg-gradient-to-br from-white/60 to-green-100/40 rounded-full backdrop-blur-xl border border-green-300/50 shadow-2xl relative overflow-hidden">
                    {/* Sphere Highlights */}
                    <div className="absolute top-8 left-8 w-16 h-16 bg-white/40 rounded-full blur-xl"></div>
                    <div className="absolute bottom-12 right-12 w-8 h-8 bg-green-400/40 rounded-full blur-lg"></div>

                    {/* Green Ring */}
                    <div className="absolute inset-8 border-2 border-green-400/60 rounded-full"></div>
                  </div>

                  {/* Floating Badges */}
                  {floatingBadges.map((badge, index) => (
                    <div
                      key={index}
                      className={`absolute ${badge.position} animate-pulse`}
                      style={{ animationDelay: badge.delay }}
                    >
                      <Badge className={`${badge.color} text-white border-0 px-3 py-1 text-sm font-medium shadow-lg`}>
                        {badge.text}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-900">
            Our AI Solutions: Ready-Made or Custom Built
          </h2>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side: Ready-to-Implement Workflows */}
            <Card className="bg-white/80 backdrop-blur-xl border border-green-300/50 hover:border-green-400/70 transition-all duration-300 p-8">
              <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative border border-green-200/50">
                <div className="text-center text-green-600">
                  [Workflow Image Slide Placeholder]
                </div>
                <div className="absolute bottom-3 right-3 flex space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                </div>
              </div>

              <CardHeader className="p-0">
                <CardTitle className="text-2xl font-bold mb-4 text-green-700">
                  We have Automations/Apps for all Marketing Areas (Ads, Social Media, CRM, Product Management, Websites) ready to implement!
                </CardTitle>
                <CardDescription className="text-green-600 mb-6 text-base">
                  <strong>Choose the solution, deploy, and scale. No code needed.</strong> Each workflow is designed to maximize your results and eliminate repetitive tasks, giving you time back to focus on strategy.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <ul className="space-y-3 mb-8 text-green-700">
                  <li className="flex items-start">
                    <span className="mr-3 text-green-500 font-bold">•</span>
                    <span><strong>Social Media Auto-Post & SEO:</strong> Publish across all networks in one click, automatically adding strategic keywords.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-green-500 font-bold">•</span>
                    <span><strong>30-Second Client Onboarding:</strong> Instant client setup integrating Notion, Gmail, WhatsApp, and Drive APIs.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-green-500 font-bold">•</span>
                    <span><strong>AI-Powered Ad Reports:</strong> Get intelligent campaign analysis delivered instantly.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-green-500 font-bold">•</span>
                    <span><strong>Intelligent Instagram Auto-DM:</strong> Scale prospecting and engagement by automating DMs based on post interaction.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-green-500 font-bold">•</span>
                    <span><strong>Competitor Analysis (Scrapers):</strong> Gain an edge by automatically monitoring rivals' ads and content.</span>
                  </li>
                </ul>

                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Hire! (Starting at $1,000 USD)
                </Button>
              </CardContent>
            </Card>

            {/* Right Side: Custom Projects */}
            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300 p-8">
              <div className="h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative border border-green-200/50">
                <div className="text-center text-green-600">
                  [Custom Project App Slide Placeholder]
                </div>
                <div className="absolute bottom-3 right-3 flex space-x-2">
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                </div>
              </div>

              <CardHeader className="p-0">
                <CardTitle className="text-2xl font-bold mb-4 text-green-800">
                  If you want to develop your custom project like big companies are doing, click here.
                </CardTitle>
                <CardDescription className="text-green-600 mb-6 text-base">
                  <strong>Go Beyond Off-the-Shelf Tools.</strong> We develop entire custom systems and applications—from sales platforms to internal client apps—to meet the precise needs of your operation. <strong>Projects start at $5,000 USD.</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <ul className="space-y-3 mb-8 text-green-700">
                  <li className="flex items-start">
                    <span className="mr-3 text-green-600 font-bold">•</span>
                    <span>Bespoke IAaaS (IA as a Service) Platforms.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-green-600 font-bold">•</span>
                    <span>Full-Stack App Development (e.g., Kelston's 3-App System).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-green-600 font-bold">•</span>
                    <span>Deep Integration: GoHighLevel, n8n, Custom APIs.</span>
                  </li>
                </ul>

                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Hire! (Custom Project)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-green-900">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Learn for Free:</span> Join the Vibe Koder Community
          </h2>
          <p className="text-xl text-green-700 mb-8 max-w-4xl mx-auto">
            <strong>All our workflows are free to download in our FREE community.</strong> You'll have access to guides and trainings on the most advanced techniques in AI and automation.
          </p>

          <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 p-6 sm:p-8 rounded-xl shadow-xl text-left mb-10 max-w-4xl mx-auto">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-semibold text-green-700">
                Essential Guides & Exclusive Knowledge:
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-3 text-lg text-green-700">
                <li className="flex items-start">
                  <ArrowRight className="mr-3 text-green-500 font-bold mt-1 flex-shrink-0" size={20} />
                  <span><strong>The AI Agent Loop:</strong> Use Claude Code to code workflows for your n8n that will be able to create/edit other workflows from n8n!</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="mr-3 text-green-500 font-bold mt-1 flex-shrink-0" size={20} />
                  <span>Essential guides about <strong>AI Agents, Automations, and Vibecoding!</strong></span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Users className="w-5 h-5 mr-2" />
            Join Us! (Free Access)
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-green-900">
            See What Our Clients Say
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300 p-6">
              <CardContent className="p-0">
                <p className="text-green-700 italic mb-4">
                  "I was spending 6 hours weekly posting manually. With the Social Auto-Post workflow, I now save 24 hours per month. It's a complete game-changer for our agency's efficiency."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex-shrink-0 mr-3"></div>
                  <div>
                    <p className="font-semibold text-green-900">João S.</p>
                    <p className="text-sm text-green-600">Agency CEO</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300 p-6">
              <CardContent className="p-0">
                <p className="text-green-700 italic mb-4">
                  "The 30-Second Onboarding system is incredible. Client activation went from a 15-step process to a smooth, automated handshake. Immediate ROI."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex-shrink-0 mr-3"></div>
                  <div>
                    <p className="font-semibold text-green-900">Sarah K.</p>
                    <p className="text-sm text-green-600">SaaS Founder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300 p-6">
              <CardContent className="p-0">
                <p className="text-green-700 italic mb-4">
                  "We leveraged the Custom Project team to build our client-facing mobile app. It scaled our service delivery instantly and securely. Worth every penny."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex-shrink-0 mr-3"></div>
                  <div>
                    <p className="font-semibold text-green-900">David L.</p>
                    <p className="text-sm text-green-600">Tech Consultant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 4 */}
            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300 p-6">
              <CardContent className="p-0">
                <p className="text-green-700 italic mb-4">
                  "The AI-Powered Ad Reports mean our team spends zero time on manual spreadsheets and all their time on strategy. Better results, less effort."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex-shrink-0 mr-3"></div>
                  <div>
                    <p className="font-semibold text-green-900">Mia T.</p>
                    <p className="text-sm text-green-600">Performance Marketing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 5 */}
            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300 p-6">
              <CardContent className="p-0">
                <p className="text-green-700 italic mb-4">
                  "The free community alone is gold. The Claude Code/n8n guide taught us things we couldn't find anywhere else. An essential resource for any dev."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-700 rounded-full flex-shrink-0 mr-3"></div>
                  <div>
                    <p className="font-semibold text-green-900">Ricardo P.</p>
                    <p className="text-sm text-green-600">Automation Specialist</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 6 */}
            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300 p-6">
              <CardContent className="p-0">
                <p className="text-green-700 italic mb-4">
                  "We now spy on our competitors ethically and automatically. We know what works before they do. Massive competitive edge in e-commerce."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-700 rounded-full flex-shrink-0 mr-3"></div>
                  <div>
                    <p className="font-semibold text-green-900">Elena C.</p>
                    <p className="text-sm text-green-600">eCommerce Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
        <div className="container mx-auto px-4">
          {/* Top Icons */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-center mb-10 text-green-900">
            AI Agency: Understanding Automatrix
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-900">Trust & Vetting: Certified Partnership</CardTitle>
                <CardDescription className="text-green-700">
                  As a <strong>Meta-Certified Technology Provider</strong>, we ensure our solutions meet the highest quality and security standards for Facebook, Instagram, and WhatsApp. Our <strong>Google Developer Program</strong> partnership provides unique access to cutting-edge AI integrations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-900">The Core Stack: Built for Global Scale</CardTitle>
                <CardDescription className="text-green-700">
                  We don't just use basic tools. Our solutions are built on the same scalable stacks trusted by global SaaS companies, including <strong>Augment Code</strong>, <strong>Supabase</strong>, <strong>Claude + Claude Code</strong>, <strong>Gemini CLI</strong>, <strong>FFMPEG</strong>, and highly optimized <strong>n8n workflows</strong>.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-900">Our Philosophy: Human-in-the-Loop</CardTitle>
                <CardDescription className="text-green-700">
                  We believe in <strong>Human-in-the-Loop</strong> design. While the AI does the heavy lifting (like responding to planning requests via email and creating workflows), you, the user, always maintain final control and strategy, ensuring performance and compliance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold text-green-900 mb-8">Trusted by 1000+ Businesses Worldwide</h3>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, index) => (
              <div key={index} className="text-green-600 font-medium">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <QuizModal 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        onComplete={handleQuizComplete}
      />
      <OptionsModal 
        isOpen={isOptionsOpen} 
        onClose={() => setIsOptionsOpen(false)} 
      />
    </div>
  );
};

export default LandingPage;
