import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, MessageSquare, Shield, Star, Users, FileText } from 'lucide-react';
import { useAuth } from '../App';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 to-secondary-800 text-white pt-24 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-600/10 blur-3xl transform translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-1.5 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-300">Lawyer in My Pocket</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Get Expert Legal Assistance <span className="text-primary-400">Anytime, Anywhere.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-lg">
              Instant AI-powered legal guidance for contracts, disputes, and family law. 
              No high fees, no waiting.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {isAuthenticated ? (
                <Link to="/chat" className="inline-flex justify-center items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/25">
                  Let's Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <Link to="/register" className="inline-flex justify-center items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/25">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
              <Link to="/about" className="inline-flex justify-center items-center px-8 py-4 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 border border-slate-700 transition">
                Learn More
              </Link>
            </div>
          </div>
          <div className="relative animate-in slide-in-from-right duration-700 hidden md:block">
            <img 
              src="https://picsum.photos/600/600" 
              alt="AI Lawyer Interaction" 
              className="rounded-2xl shadow-2xl border-4 border-slate-700/50 object-cover" 
            />
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl text-slate-800 w-64">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle size={20} /></div>
                <div>
                  <p className="font-bold text-sm">Contract Reviewed</p>
                  <p className="text-xs text-slate-500">Just now</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">"This lease agreement looks standard, but watch out for clause 4.2 regarding early termination."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 mb-6 font-medium">TRUSTED BY 15,000+ INDIVIDUALS & BUSINESSES</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Mock Logos */}
             {['StartupLaw', 'LegalTech', 'DailyJustice', 'SecureDocs', 'FamilyFirst'].map(brand => (
               <span key={brand} className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                 <Shield className="w-6 h-6" /> <span>{brand}</span>
               </span>
             ))}
          </div>
        </div>
      </section>

      {/* Services Snippet */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Comprehensive Legal Services</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">From document review to family law, our AI handles complex topics with ease.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Legal Consultation", desc: "Instant answers to your queries 24/7.", icon: MessageSquare },
              { title: "Document Review", desc: "Upload contracts for risk analysis.", icon: FileText },
              { title: "Family Support", desc: "Sensitive guidance for personal matters.", icon: Users },
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100 group">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition">
                  <s.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center">
              View All Services <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-slate-100 -z-10"></div>
            {[
              { step: "1", title: "Sign Up", desc: "Create your secure account in seconds." },
              { step: "2", title: "Verify", desc: "Confirm your email for security." },
              { step: "3", title: "Explore", desc: "Chat with AI or browse tools." },
            ].map((step, i) => (
              <div key={i} className="relative bg-white p-4">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-primary-200">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to simplify your legal journey?</h2>
          <p className="text-xl text-slate-400 mb-8">Join thousands of users who trust Pocket Lawyer for instant peace of mind.</p>
          <Link to={isAuthenticated ? "/chat" : "/register"} className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-1">
            {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;