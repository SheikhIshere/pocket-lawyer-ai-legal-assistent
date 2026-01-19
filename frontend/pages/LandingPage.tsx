import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Clock, CheckCircle, MessageSquare, ArrowRight,
  FileText, Scale, Star, Users, Zap, Globe, Award,
  Lock, BookOpen, Building, Target, ChevronRight,
  BarChart, TrendingUp, ShieldCheck, Headphones,
  FileCheck, Search, Users2, Briefcase
} from 'lucide-react';
import { Header, Footer } from '../components/Layout';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('individuals');

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI-Powered Legal Consultation",
      description: "Advanced AI trained on millions of legal cases provides instant, accurate legal guidance 24/7.",
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
      icon: <Users2 className="w-8 h-8" />,
      title: "Attorney Connect Platform",
      description: "Seamlessly connect with vetted legal professionals in our network when needed.",
      gradient: "from-[#0E8E82] to-[#0a6d62]"
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Enterprise-Grade Security",
      description: "Bank-level encryption with SOC 2 compliance ensures complete confidentiality.",
      gradient: "from-[#0E8E82] to-[#0a6d62]"
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: "Case Management Suite",
      description: "Track progress, store documents, and manage all legal matters in one secure dashboard.",
      gradient: "from-[#0E8E82] to-[#0a6d62]"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "General Counsel, TechStart Inc.",
      content: "PocketLawyer has revolutionized how our legal team operates. The AI provides immediate preliminary analysis, saving us 40+ hours monthly.",
      rating: 5,
      company: "Technology"
    },
    {
      name: "Marcus Rodriguez",
      role: "Managing Partner, Rodriguez & Associates",
      content: "As a practicing attorney, I'm impressed by the accuracy and depth of legal analysis. It's become an essential tool for my practice.",
      rating: 5,
      company: "Legal Services"
    },
    {
      name: "Jennifer Park",
      role: "Chief Compliance Officer",
      content: "The compliance analysis feature has been invaluable. It identified potential issues in our vendor contracts that our team had overlooked.",
      rating: 5,
      company: "Finance"
    }
  ];

  const stats = [
    { number: "98.7%", label: "Client Satisfaction Rate", icon: <Star className="w-5 h-5" /> },
    { number: "50K+", label: "Legal Documents Analyzed", icon: <FileCheck className="w-5 h-5" /> },
    { number: "2M+", label: "Legal Queries Processed", icon: <MessageSquare className="w-5 h-5" /> },
    { number: "99.9%", label: "Uptime & Reliability", icon: <Shield className="w-5 h-5" /> }
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-24 pb-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23f8fafc%22 fill-opacity=%221%22 fill-rule=%22evenodd%22%3E%3Ccircle cx=%223%22 cy=%223%22 r=%223%22/%3E%3Ccircle cx=%2213%22 cy=%2213%22 r=%223%22/%3E%3C/g%3E%3C/svg%3E')]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#0E8E82]/10 to-[#0E8E82]/5 border border-[#0E8E82]/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0E8E82] animate-pulse"></div>
                    <span className="text-sm font-semibold text-[#0E8E82]">
                      Trusted by Fortune 500 Companies
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0E8E82] to-[#0a6d62] border-2 border-white"></div>
                    ))}
                  </div>
                </div>

                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 tracking-tight">
                  Professional Legal
                  <span className="block mt-2">
                    <span className="bg-gradient-to-r from-[#0E8E82] to-[#0a6d62] bg-clip-text text-transparent">
                      Consultation
                    </span>
                    <span className="text-gray-900">, Redefined</span>
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  Enterprise-grade AI legal assistant providing instant, accurate, and secure legal guidance.
                  Trusted by legal professionals and businesses worldwide.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to={isAuthenticated ? "/chat" : "/register"}
                    className="group relative overflow-hidden bg-gradient-to-r from-[#0E8E82] to-[#0a6d62] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-[#0E8E82]/30 transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center justify-center gap-3"
                  >
                    <span className="relative z-10">
                      {isAuthenticated ? "Go to Dashboard" : "Start Enterprise Trial"}
                    </span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a6d62] to-[#0E8E82] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>

                  <Link
                    to="/demo"
                    className="group inline-flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <span>Watch Demo</span>
                    <div className="w-10 h-10 rounded-full bg-[#0E8E82]/10 flex items-center justify-center group-hover:bg-[#0E8E82]/20 transition-colors">
                      <svg className="w-5 h-5 text-[#0E8E82]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8 max-w-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0E8E82]/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-[#0E8E82]" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">AI-Powered</div>
                      <div className="text-sm text-gray-600">Instant Analysis</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0E8E82]/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#0E8E82]" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Bank-Level</div>
                      <div className="text-sm text-gray-600">Security</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Chat Interface */}
              <div className="relative">
                <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0E8E82] to-[#0a6d62] flex items-center justify-center shadow-lg">
                            <Scale className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0E8E82] rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <div className="font-semibold text-white">PocketLawyer AI</div>
                          <div className="text-sm text-[#0E8E82]/80 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0E8E82] animate-pulse"></div>
                            Online • Enterprise Edition
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-700 text-gray-200">
                        Attorney Mode
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
                    {/* AI Message */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0E8E82]/10 to-[#0E8E82]/5 flex items-center justify-center">
                          <Scale className="w-5 h-5 text-[#0E8E82]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900 mb-1">PocketLawyer AI</div>
                        <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 border border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Welcome to PocketLawyer Enterprise. I can assist with: contract analysis,
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
                        <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 border border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            I'll analyze the NDA. Key areas to review:
                          </p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#0E8E82]" />
                              <span>Confidentiality scope and exclusions</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#0E8E82]" />
                              <span>Term duration and survival clauses</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-[#0E8E82]" />
                              <span>Remedies for breach</span>
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
                  <div className="border-t border-gray-100 p-4 bg-white">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                      <input
                        type="text"
                        placeholder="Type your legal question or upload document..."
                        className="bg-transparent flex-1 outline-none text-sm text-gray-600 placeholder-gray-400"
                        readOnly
                      />
                      <button className="flex items-center gap-2 bg-gradient-to-r from-[#0E8E82] to-[#0a6d62] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                        <ArrowRight className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#0E8E82] rounded-full opacity-5 blur-3xl"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#0a6d62] rounded-full opacity-5 blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white border-t border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow mb-6">
                    <div className="text-[#0E8E82]">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E8E82]/10 text-[#0E8E82] text-sm font-semibold mb-6">
                <Award className="w-4 h-4" />
                Enterprise-Grade Features
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Comprehensive Legal AI Platform
              </h2>
              <p className="text-xl text-gray-600">
                Advanced tools designed for professionals, backed by AI trained on millions of legal documents
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 group-hover:border-blue-200 transition-all duration-300"></div>
                  <div className="relative p-8">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                    <div className="flex items-center text-blue-600 font-medium group-hover:gap-3 transition-all">
                      <span>Learn more</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trusted Across Industries
              </h2>
              <p className="text-xl text-gray-600">
                From startups to Fortune 500 companies, we provide tailored legal solutions
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {industries.map((industry, index) => (
                <div key={index} className="group">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#0E8E82] hover:shadow-lg transition-all duration-300 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0E8E82]/10 text-[#0E8E82] mb-4 group-hover:bg-gradient-to-br group-hover:from-[#0E8E82] group-hover:to-[#0a6d62] group-hover:text-white transition-colors">
                      {industry.icon}
                    </div>
                    <div className="font-semibold text-gray-900">{industry.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E8E82]/10 text-[#0E8E82] text-sm font-semibold mb-6">
                <Star className="w-4 h-4 fill-[#0E8E82]" />
                Client Testimonials
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Trusted by Legal Professionals
              </h2>
              <p className="text-xl text-gray-600">
                See how leading organizations leverage PocketLawyer for their legal needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="group">
                  <div className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-[#0E8E82] hover:shadow-xl transition-all duration-300 h-full">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-8 leading-relaxed text-lg italic">"{testimonial.content}"</p>
                    <div className="pt-6 border-t border-gray-200">
                      <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-gray-600 mb-2">{testimonial.role}</div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                        <Briefcase className="w-3 h-3" />
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Background with clear contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
          </div>

          {/* Floating glowing elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <Award className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Limited Time Offer</span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                Elevate Your Legal Practice
                <span className="block text-cyan-300 mt-2">with AI Precision</span>
              </h2>

              <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Experience the future of legal consultation. Join thousands of professionals
                who have transformed their practice with PocketLawyer's cutting-edge AI.
              </p>
            </div>

            {/* Main CTA Container */}
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-20"></div>

              {/* Main card */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700 overflow-hidden">
                <div className="p-12">
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Left - Value Proposition */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-white">
                          Everything You Need in One Platform
                        </h3>
                        <ul className="space-y-3">
                          {[
                            "Unlimited AI legal consultations",
                            "Document review & analysis",
                            "Legal research assistant",
                            "Priority support & training",
                            "Enterprise security compliance",
                            "Team collaboration tools"
                          ].map((item, index) => (
                            <li key={index} className="flex items-center gap-3 text-gray-300">
                              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-white">$0</div>
                          <div className="text-sm text-gray-400">First 14 days</div>
                        </div>
                        <div className="h-12 w-px bg-gray-700"></div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">50% OFF</div>
                          <div className="text-sm text-gray-400">First 3 months</div>
                        </div>
                      </div>
                    </div>

                    {/* Right - CTA Form */}
                    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                      <h4 className="text-xl font-bold text-white mb-6">Start Your Trial</h4>

                      <div className="space-y-4 mb-6">
                        <input
                          type="email"
                          placeholder="Work email"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Company name"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Company size</option>
                          <option>1-10 employees</option>
                          <option>11-50 employees</option>
                          <option>51-200 employees</option>
                          <option>200+ employees</option>
                        </select>
                      </div>

                      <Link
                        to="/register"
                        className="block w-full text-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg text-lg font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20 mb-4"
                      >
                        Start Free Trial
                      </Link>

                      <p className="text-xs text-gray-500 text-center">
                        By clicking, you agree to our terms. No credit card required.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom trust bar */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm text-gray-300">SOC 2 Compliant</span>
                      </div>
                      <div className="h-4 w-px bg-gray-700"></div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-gray-300">256-bit Encryption</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="text-white">4.9/5</span> rating from 1,200+ reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative CTA */}
            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-4">Prefer to see it in action first?</p>
              <Link
                to="/demo"
                className="inline-flex items-center gap-3 text-white hover:text-cyan-300 transition-colors group"
              >
                <span>Book a personalized demo with our team</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;