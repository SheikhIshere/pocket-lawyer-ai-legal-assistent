import React from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { Shield, Users, Award, Globe, MessageSquare, CheckCircle, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://picsum.photos/seed/sarah/300/300",
      description: "Former corporate lawyer with 15+ years of experience in legal tech innovation."
    },
    {
      name: "Michael Chen",
      role: "CTO", 
      image: "https://picsum.photos/seed/michael/300/300",
      description: "AI specialist focused on making legal knowledge accessible to everyone."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Legal Operations",
      image: "https://picsum.photos/seed/emily/300/300", 
      description: "Expert in legal compliance and user experience design."
    },
    {
      name: "David Kim",
      role: "Lead Engineer",
      image: "https://picsum.photos/seed/david/300/300",
      description: "Full-stack developer passionate about democratizing legal services."
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
                  Our Mission: Legal Help for Everyone
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Traditional legal services are expensive, slow, and intimidating. We're changing that. 
                  Pocket Lawyer leverages advanced AI to provide instant, affordable legal guidance 
                  that anyone can understand and use.
                </p>
                <p className="text-lg text-slate-600 mb-8">
                  Whether you're reviewing a contract, dealing with a landlord dispute, or need guidance 
                  on traffic violations, we're here to help 24/7.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Instant Answers</div>
                      <div className="text-slate-600">No waiting for appointments or callbacks</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Affordable Pricing</div>
                      <div className="text-slate-600">Fraction of traditional legal costs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Expert-Backed</div>
                      <div className="text-slate-600">AI trained on verified legal sources</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://picsum.photos/seed/mission/600/400" 
                  alt="Our Mission"
                  className="rounded-2xl shadow-2xl w-full"
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
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Legal experts, technologists, and innovators working to make justice accessible
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6 overflow-hidden rounded-2xl">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
                  <div className="text-teal-600 font-medium mb-3">{member.role}</div>
                  <p className="text-slate-600 text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
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
