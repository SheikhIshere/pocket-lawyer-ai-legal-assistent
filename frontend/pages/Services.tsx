import React, { useState } from 'react';
import { Search, FileText, MessageCircle, Shield, Scale, Users, Home, Briefcase, FileCheck } from 'lucide-react';

const servicesList = [
  { id: 1, title: 'AI Legal Consultation', desc: 'Instant conversational advice available 24/7.', icon: MessageCircle, category: 'General' },
  { id: 2, title: 'Document Review', desc: 'Risk analysis and summaries of contracts.', icon: FileText, category: 'Documents' },
  { id: 3, title: 'Family Law', desc: 'Support for custody, separation, and agreements.', icon: Users, category: 'Personal' },
  { id: 4, title: 'Property Guidance', desc: 'Leases, tenant rights, and landlord notices.', icon: Home, category: 'Property' },
  { id: 5, title: 'Employment Law', desc: 'Workplace rights, contracts, and dismissal advice.', icon: Briefcase, category: 'Work' },
  { id: 6, title: 'Compliance Checks', desc: 'Regulatory guidance for small businesses.', icon: FileCheck, category: 'Business' },
  { id: 7, title: 'Dispute Prep', desc: 'Organize evidence and timelines for court.', icon: Scale, category: 'General' },
  { id: 8, title: 'Privacy Guide', desc: 'Data protection and basic privacy obligations.', icon: Shield, category: 'General' },
];

const Services = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = servicesList.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Our Services</h1>
          <p className="text-lg text-slate-300 mb-10">Professional, AI-driven legal assistance tailored to your needs.</p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search legal services, documents, or topics..." 
              className="w-full pl-12 pr-4 py-4 rounded-full text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/50 shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div key={service.id} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-slate-100 flex flex-col h-full">
              <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center mb-6">
                <service.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-600 mb-6 flex-grow">{service.desc}</p>
              <div className="mt-auto">
                 <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded mb-4">{service.category}</span>
                 <button className="w-full py-2 border border-primary-600 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition">
                   Learn More
                 </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-slate-500 text-lg">No services found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;