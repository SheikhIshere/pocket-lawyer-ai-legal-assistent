import React from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { Shield, Users, Award, Globe, MessageSquare, CheckCircle, ArrowRight, Mail, Phone, MapPin, Linkedin, Facebook, Twitter } from 'lucide-react';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Imran Rafi",
      role: "CEO, Founder & Main Backend Engineer",
      image: "/asset/img/me.png",
      description: "Leading vision and architecture of Pocket Lawyer's backend systems.",
      expertise: ["Backend Development", "System Architecture", "API Design"],
      socialLinks: [
        { platform: "LinkedIn", url: "https://www.linkedin.com/in/imran-rafi-0a7955293/", icon: <Linkedin className="w-5 h-5" /> },
        { platform: "Facebook", url: "https://www.facebook.com/3imran3rafi3", icon: <Facebook className="w-5 h-5" /> }
      ]
    },
    {
      id: 2,
      name: "Gemini",
      role: "Co-founder & Main UI/UX Designer", 
      image: "/asset/img/gemini.png",
      description: "Crafting beautiful and intuitive user experiences for legal assistance.",
      expertise: ["UI/UX Design", "User Research", "Prototyping"],
      socialLinks: [
        { platform: "LinkedIn", url: "#", icon: <Linkedin className="w-5 h-5" /> },
        { platform: "Facebook", url: "#", icon: <Facebook className="w-5 h-5" /> }
      ]
    },
    {
      id: 3,
      name: "Google Studio",
      role: "Co-founder & Frontend Engineer",
      image: "/asset/img/googleStudio.png", 
      description: "Building responsive and performant frontend applications.",
      expertise: ["Frontend Development", "React", "TypeScript"],
      socialLinks: [
        { platform: "LinkedIn", url: "#", icon: <Linkedin className="w-5 h-5" /> },
        { platform: "Facebook", url: "#", icon: <Facebook className="w-5 h-5" /> }
      ]
    },
    {
      id: 4,
      name: "Windsurf",
      role: "Supporting Frontend Engineer",
      image: "/asset/img/windsurf.png",
      description: "Enhancing frontend features and optimizing user interactions.",
      expertise: ["Frontend Optimization", "Performance", "User Experience"],
      socialLinks: [
        { platform: "LinkedIn", url: "#", icon: <Linkedin className="w-5 h-5" /> },
        { platform: "Facebook", url: "#", icon: <Facebook className="w-5 h-5" /> }
      ]
    },
    {
      id: 5,
      name: "ChatGPT",
      role: "Co-Founder | Frontend Systems Planner & Product Support Engineer",
      image: "/asset/img/chatgpt.png",
      description: "Planning frontend architecture and providing design assistance across the platform.",
      expertise: ["System Planning", "Product Support", "Frontend Architecture"],
      socialLinks: [
        { platform: "LinkedIn", url: "#", icon: <Linkedin className="w-5 h-5" /> },
        { platform: "Facebook", url: "#", icon: <Facebook className="w-5 h-5" /> }
      ]
    },
    {
      id: 6,
      name: "DeepSeek",
      role: "Frontend Optimizer & Bug Maker",
      image: "/asset/img/deepseek.png",
      description: "Optimizing frontend performance and occasionally creating interesting bugs to fix.",
      expertise: ["Frontend Optimization", "Debugging", "Performance Tuning"],
      socialLinks: [
        { platform: "LinkedIn", url: "#", icon: <Linkedin className="w-5 h-5" /> },
        { platform: "Facebook", url: "#", icon: <Facebook className="w-5 h-5" /> }
      ]
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Users" },
    { number: "98%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Availability" },
    { number: "150+", label: "Legal Topics Covered" }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      title: "Privacy First",
      description: "Your conversations are encrypted and never shared with third parties."
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: "Accessible to All", 
      description: "Legal help shouldn't be expensive. We make it affordable for everyone."
    },
    {
      icon: <Award className="w-8 h-8 text-teal-600" />,
      title: "Expert-Backed",
      description: "Our AI is trained on verified legal sources and reviewed by experts."
    },
    {
      icon: <Globe className="w-8 h-8 text-teal-600" />,
      title: "Always Available",
      description: "Get legal guidance anytime, anywhere, on any device."
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-teal-50 to-white pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
                <Shield className="w-3.5 h-3.5 fill-teal-700" />
                Democratizing Legal Access Since 2023
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Making Legal Help 
                <span className="text-teal-600"> Simple & Affordable</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8">
                We believe everyone deserves access to quality legal guidance. Pocket Lawyer uses cutting-edge AI 
                to provide instant, affordable legal assistance for everyday legal questions and concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 hover:shadow-2xl hover:-translate-y-1"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/services" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-50 transition-all"
                >
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-teal-600 mb-2">{stat.number}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

{/* Mission Section */}
<section className="py-20 bg-slate-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Our Mission: Justice Should Not Depend on Money
        </h2>
        <p className="text-lg text-slate-600 mb-6">
          This mission is personal. When my cousine was in jail, our family had to run from court to court, 
          from lawyer to lawyer. I saw how confusing the law is for ordinary people — and how easily that 
          confusion can be exploited.
        </p>
        <p className="text-lg text-slate-600 mb-8">
          I clearly remember a moment when a poor man, who barely understood legal terms, was being charged 
          a large amount of money for a problem that could have been solved in minutes. That experience made 
          one thing clear: people don’t lack intelligence — they lack access to clear legal knowledge.
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Clear Legal Understanding</div>
              <div className="text-slate-600">Simple explanations without confusing legal jargon</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Protection for the Vulnerable</div>
              <div className="text-slate-600">Helping people avoid unnecessary fees and manipulation</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Always Accessible</div>
              <div className="text-slate-600">Legal guidance available anytime, without fear or pressure</div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shadow-none">
        <img 
          src="/asset/img/hero_section.png" 
          alt="Our Mission"
          className="rounded-2xl w-11/12 h-auto object-contain bg-transparent"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  </div>
</section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-teal-50 transition-colors">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

{/* Team Section */}
<section className="py-32 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 relative overflow-hidden">
  {/* Animated Background Elements */}
  <div className="absolute inset-0">
    <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
    <div className="absolute top-40 right-10 w-96 h-96 bg-blue-400/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
    <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
  </div>
  
  {/* Grid Pattern Overlay */}
  <div className="absolute inset-0 opacity-50" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f766e' fill-opacity='0.03'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  }} />
  
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    {/* Section Header */}
    <div className="text-center mb-24">
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-full text-teal-700 text-sm font-semibold mb-8 shadow-lg backdrop-blur-sm">
        <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse shadow-lg shadow-teal-500/50" />
        <span>Our Amazing Team</span>
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse delay-300 shadow-lg shadow-blue-500/50" />
      </div>
      <h2 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight">
        Meet The <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 animate-gradient bg-300">Minds</span> Behind Pocket Lawyer
      </h2>
      <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
        A diverse collective of legal experts, innovative technologists, and creative minds 
        united by one mission: <span className="font-semibold text-teal-600">making justice accessible to everyone.</span>
      </p>
    </div>

    {/* Team Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-10">
      {teamMembers.map((member, index) => (
        <div 
          key={member.id || index} 
          className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 overflow-hidden border border-white/50"
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Card Content */}
          <div className="p-10 relative z-10">
            {/* Image Container with Enhanced Effects */}
            <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 via-teal-50 to-blue-50 shadow-inner">
              <div className="aspect-[4/5] relative overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                  loading="lazy"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(member.name) + "&background=0f766e&color=fff&size=400";
                  }}
                />
                
                {/* Multiple Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
              </div>
              
              {/* Floating Social Links */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-700 delay-200">
                {member.socialLinks?.map((link, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 hover:bg-gradient-to-r hover:from-teal-600 hover:to-blue-600 hover:text-white transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-110 cursor-pointer"
                  >
                    {link.icon}
                  </div>
                ))}
              </div>
              
              {/* Decorative Corner Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-teal-500/30 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-blue-500/30 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
            </div>

            {/* Enhanced Member Info */}
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-blue-600 transition-all duration-700">
                  {member.name}
                </h3>
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 text-teal-700 rounded-full text-sm font-bold shadow-md">
                  <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full animate-pulse" />
                  {member.role}
                </div>
              </div>
              
              <p className="text-slate-600 leading-relaxed text-lg line-clamp-3 font-light">
                {member.description}
              </p>
              
              {/* Enhanced Expertise Tags */}
              {member.expertise && (
                <div className="flex flex-wrap gap-3 justify-center pt-6">
                  {member.expertise.slice(0, 3).map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-slate-50 to-teal-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full hover:from-teal-50 hover:to-blue-50 hover:border-teal-300 hover:text-teal-700 transition-all duration-500"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Accent Border */}
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left shadow-lg" />
          
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
      ))}
    </div>

    {/* Enhanced CTA Section */}
    <div className="text-center mt-32 pt-16 border-t border-gradient-to-r from-transparent via-slate-200 to-transparent">
      <div className="bg-gradient-to-r from-teal-50 via-blue-50 to-purple-50 rounded-3xl p-12 backdrop-blur-sm border border-white/50 shadow-xl">
        <h3 className="text-3xl font-bold text-slate-900 mb-6">
          Want to Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Mission</span>?
        </h3>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          We're always looking for talented individuals who share our vision of making legal help accessible to everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href="/careers"
            className="group inline-flex items-center justify-center px-10 py-5 text-base font-bold text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-teal-500/30"
          >
            View Open Positions
            <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="/about"
            className="group inline-flex items-center justify-center px-10 py-5 text-base font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:text-teal-700 transition-all duration-500 hover:scale-105 hover:shadow-xl"
          >
            Learn About Our Mission
            <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
  
  {/* Add custom styles for animation */}
  <style>{`
    @keyframes gradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .animate-gradient {
      animation: gradient 3s ease infinite;
      background-size: 200% 200%;
    }
    .delay-100 {
      animation-delay: 100ms;
    }
    .delay-200 {
      animation-delay: 200ms;
    }
    .delay-300 {
      animation-delay: 300ms;
    }
    .delay-1000 {
      animation-delay: 1000ms;
    }
    .delay-2000 {
      animation-delay: 2000ms;
    }
  `}</style>
</section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience Legal Help, Reimagined?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Join thousands who have already discovered the smarter way to handle legal matters. 
              Start your free consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-50 transition-all shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white hover:text-teal-600 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
              <p className="text-xl text-slate-600">Have questions? We're here to help</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-slate-50">
                <Mail className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Email Us</h3>
                <p className="text-slate-600 mb-4">support@pocketlawyer.com</p>
                <p className="text-sm text-slate-500">We respond within 24 hours</p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-slate-50">
                <Phone className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Call Us</h3>
                <p className="text-slate-600 mb-4">1-800-LAWYER</p>
                <p className="text-sm text-slate-500">Mon-Fri 9AM-6PM EST</p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-slate-50">
                <MapPin className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Visit Us</h3>
                <p className="text-slate-600 mb-4">123 Legal Street<br />New York, NY 10001</p>
                <p className="text-sm text-slate-500">By appointment only</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
