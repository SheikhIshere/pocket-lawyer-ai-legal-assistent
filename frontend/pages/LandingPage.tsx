import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Clock, CheckCircle, MessageSquare, ArrowRight,
  FileText, Scale, Star, Users, Zap, Globe, Award,
  Lock, BookOpen, Building, Target, ChevronRight,
  BarChart, TrendingUp, ShieldCheck, Headphones,
  FileCheck, Search, Users2, Briefcase,
  UserPlus, MessageCircle, User
} from 'lucide-react';
// Header and Footer are now globally handled by Layout in App.tsx

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('individuals');
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFAB(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI-Powered Legal Consultation",
      description: "Grounded in Bangladesh's legal corpus with citations for every answer.",
      gradient: "from-[#0E8E82] to-[#0a6d62]"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Analysis & Review",
      description: "Upload contracts, agreements, and legal documents for comprehensive AI-powered analysis.",
      gradient: "from-[#0E8E82] to-[#0a6d62]"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Legal Research Assistant",
      description: "Instant access to statutes, case law, and legal precedents relevant to your situation.",
      gradient: "from-[#0E8E82] to-[#0a6d62]"
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Private by Design",
      description: "Encrypted transport for every request, with no training on your conversations.",
      gradient: "from-[#0E8E82] to-[#0a6d62]"
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: "Case Management Suite",
      description: "Track progress, store documents, and manage all legal matters in one secure dashboard.",
      gradient: "from-[#0E8E82] to-[#0a6d62]"
    }
  ];

  const industries = [
    { name: "Startups & SMEs", icon: <Zap className="w-5 h-5" /> },
    { name: "Real Estate", icon: <Building className="w-5 h-5" /> },
    { name: "Healthcare", icon: <Headphones className="w-5 h-5" /> },
    { name: "E-commerce", icon: <Globe className="w-5 h-5" /> },
    { name: "Technology", icon: <Target className="w-5 h-5" /> },
    { name: "Finance", icon: <TrendingUp className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500 lg:pb-0 overflow-x-hidden">

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-900 pt-24 pb-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23f8fafc%22 fill-opacity=%221%22 fill-rule=%22evenodd%22%3E%3Ccircle cx=%223%22 cy=%223%22 r=%223%22/%3E%3Ccircle cx=%2213%22 cy=%2213%22 r=%223%22/%3E%3C/g%3E%3C/svg%3E')]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex flex-wrap max-w-full items-center gap-3 px-4 py-2.5 rounded-full bg-[#0E8E82]/10 dark:bg-[#0E8E82]/20 border border-[#0E8E82]/20 dark:border-[#0E8E82]/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0E8E82] animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-semibold text-[#0E8E82]">
                      Built for Bangladesh's legal system
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0E8E82] to-[#0a6d62] border-2 border-white dark:border-slate-800"></div>
                    ))}
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                  Professional Legal
                  <span className="block mt-2">
                    <span className="bg-gradient-to-r from-teal-600 to-emerald-700 bg-clip-text text-transparent">
                      Consultation
                    </span>
                    <span className="text-gray-900 dark:text-white">, Redefined</span>
                  </span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                  AI legal guidance grounded in Bangladesh's legal sources.
                  Clear answers, with citations, whenever you need them.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to={isAuthenticated ? "/chat" : "/register"}
                    className="group relative overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-teal-500/20 active:scale-95 transition-all duration-300 inline-flex items-center justify-center gap-3"
                  >
                    <span className="relative z-10">
                      {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                    </span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => document.getElementById('demo-preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className="group inline-flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  >
                    <span>See a preview</span>
                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition-colors">
                      <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8 max-w-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0E8E82]/10 dark:bg-[#0E8E82]/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-[#0E8E82] dark:text-teal-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">AI-Powered</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Instant Analysis</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0E8E82]/10 dark:bg-[#0E8E82]/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#0E8E82] dark:text-teal-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Bank-Level</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Security</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Chat Interface */}
              <div className="relative">
                <div id="demo-preview" className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0E8E82] to-[#0a6d62] flex items-center justify-center shadow-lg">
                            <Scale className="w-6 h-6 text-white" />
                          </div>
                          {/* <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0E8E82] rounded-full border-2 border-white"></div> */}
                        </div>
                        <div>
                          <div className="font-semibold text-white">PocketLawyer AI</div>
                          <div className="text-sm text-[#0E8E82]/80 dark:text-teal-400/80 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0E8E82] dark:bg-teal-400 animate-pulse"></div>
                            Online • Legal Assistant
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-700 dark:bg-slate-700 text-gray-200">
                        Attorney Mode
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/50">
                    {/* AI Message */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0E8E82]/10 to-[#0E8E82]/5 flex items-center justify-center">
                          <Scale className="w-5 h-5 text-[#0E8E82]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900 mb-1">PocketLawyer AI</div>
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-slate-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            Welcome to PocketLawyer. I can assist with: contract analysis,
                            legal research, compliance checks, and document review. How may I help you today?
                          </p>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#0E8E82]/10 text-[#0E8E82] border border-[#0E8E82]/20">
                            Contract Law
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#0E8E82]/10 text-[#0E8E82] border border-[#0E8E82]/20">
                            Confidential
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-4 justify-end">
                      <div className="flex-1 max-w-md">
                        <div className="text-xs font-semibold text-gray-900 mb-1 text-right">You</div>
                        <div className="bg-gradient-to-r from-[#0E8E82] to-[#0a6d62] text-white rounded-2xl rounded-tr-none p-4">
                          <p className="text-sm">
                            I need to review an NDA with a potential investor. Can you analyze the key clauses?
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">JD</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0E8E82]/10 to-[#0E8E82]/5 flex items-center justify-center">
                          <Scale className="w-5 h-5 text-[#0E8E82]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900 mb-1">PocketLawyer AI</div>
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-slate-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            I'll analyze the NDA. Key areas to review:
                          </p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#0E8E82] dark:text-teal-400" />
                              <span className="text-gray-700 dark:text-gray-300">Confidentiality scope and exclusions</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#0E8E82] dark:text-teal-400" />
                              <span className="text-gray-700 dark:text-gray-300">Term duration and survival clauses</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#0E8E82] dark:text-teal-400" />
                              <span className="text-gray-700 dark:text-gray-300">Remedies for breach</span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Analysis based on Delaware General Corporation Law § 220
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-100 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-700">
                      <div aria-hidden="true" className="flex-1 text-sm text-gray-400">
                        Ask about a contract, notice, or legal question...
                      </div>
                      <Link to="/register" className="flex items-center gap-2 bg-gradient-to-r from-[#0E8E82] to-[#0a6d62] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                        Try it free
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Preview only</p>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#0E8E82] rounded-full opacity-5 blur-3xl"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#0a6d62] rounded-full opacity-5 blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E8E82]/10 dark:bg-[#0E8E82]/20 text-[#0E8E82] dark:text-teal-400 text-sm font-semibold mb-6">
                <Award className="w-4 h-4" />
                Professional Features
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Comprehensive Legal AI Platform
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Advanced tools designed for professionals, backed by Bangladesh's legal corpus
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative transition-all active:scale-[0.98]">
                  <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm group-hover:shadow-xl group-hover:shadow-teal-500/5 transition-all duration-300"></div>
                  <div className="relative p-8 sm:p-10">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 mb-8 shadow-lg shadow-teal-500/20 transition-transform duration-300`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{feature.description}</p>
                    <Link to="/services" className="flex items-center text-teal-600 dark:text-teal-400 font-bold group-hover:translate-x-2 transition-transform h-6 w-fit">
                      <span className="text-sm">Explore services</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-20 bg-gray-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted Across Industries
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                From individuals to growing firms, we provide tailored legal guidance
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {industries.map((industry, index) => (
                <div key={index} className="group">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-[#0E8E82] dark:hover:border-teal-400 hover:shadow-lg transition-all duration-300 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0E8E82]/10 dark:bg-[#0E8E82]/20 text-[#0E8E82] dark:text-teal-400 mb-4 group-hover:bg-gradient-to-br group-hover:from-[#0E8E82] group-hover:to-[#0a6d62] group-hover:text-white transition-colors">
                      {industry.icon}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{industry.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Step Process Section */}
        <section className="relative py-32 overflow-hidden bg-slate-50 dark:bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-50/30 dark:from-teal-900/10 via-transparent to-transparent"></div>

          {/* Floating glowing elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-teal-500/10 to-transparent blur-3xl"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-teal-100 dark:bg-teal-900/30 backdrop-blur-sm border border-teal-200 dark:border-teal-800/50 mb-8">
                <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="text-teal-700 dark:text-teal-400 font-semibold">Start Your Legal Journey</span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-6">
                Get Legal Help in 3 Simple Steps
                <span className="block text-teal-600 dark:text-teal-400 mt-2">Sign Up • Configure API Key • Chat</span>
              </h2>

              <p className="text-xl text-slate-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                Experience seamless legal consultation. Sign up, configure your Gemini API key, and start chatting with our AI-powered legal assistant instantly.
              </p>
            </div>

            {/* Main Steps Container */}
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur-2xl opacity-20"></div>

              {/* Main steps card */}
              <div className="relative bg-white dark:bg-slate-900/50 rounded-3xl border border-gray-200/50 dark:border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="p-12">
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Step 1 - Authenticate */}
                    <div className="text-center space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/50">
                          <span className="text-2xl font-bold text-white">1</span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Authenticate</h3>
                      <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                        Create your account with email and password. Secure, fast, and ready in seconds.
                      </p>

                      <Link
                        to="/register"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg hover:shadow-xl hover:shadow-teal-500/20"
                      >
                        <UserPlus className="w-4 h-4" />
                        Sign Up Now
                      </Link>
                    </div>

                    {/* Step 2 - Add API Key */}
                    <div className="text-center space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                          <span className="text-2xl font-bold text-white">2</span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Add API Key</h3>
                      <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                        Configure your Gemini API key to enable AI-powered legal consultations and document analysis.
                      </p>

                      <Link
                        to="/settings"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
                      >
                        <Lock className="w-4 h-4" />
                        Configure API Key
                      </Link>
                    </div>

                    {/* Step 3 - Start Chat */}
                    <div className="text-center space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/50">
                          <span className="text-2xl font-bold text-white">3</span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Start Chatting</h3>
                      <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                        Begin your legal consultation instantly. Get AI-powered advice and export chat sessions to PDF.
                      </p>

                      <Link
                        to="/chat"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/20"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Start Chat
                      </Link>
                    </div>
                  </div>

                  {/* Process Flow - Removed to solve duplication problem */}
                  {/* <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-4 text-slate-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-teal-500 rounded-full"></div>
                        <span className="text-sm">Create Account</span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Configure API Key</span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm">Start Chat</span>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Alternative CTA */}
            <div className="mt-16 text-center">
              <p className="text-slate-600 dark:text-gray-400 mb-4">Already have an account?</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-3 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group"
              >
                <span>Sign in to start chatting immediately</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default LandingPage;