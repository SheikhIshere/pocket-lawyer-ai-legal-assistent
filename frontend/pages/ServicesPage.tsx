import React, { useState } from 'react';
import { Header, Footer } from '../components/Layout';
import { Search, FileText, Briefcase, Car, Home, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

const SERVICES_DATA = [
  { id: 1, title: 'Lease Agreement Review', category: 'Real Estate', icon: Home, desc: 'Detailed analysis of rental contracts identifying hidden clauses.' },
  { id: 2, title: 'Traffic Ticket Defense', category: 'Traffic', icon: Car, desc: 'Guidance on contesting speeding tickets and moving violations.' },
  { id: 3, title: 'Contract Analysis', category: 'Business', icon: Briefcase, desc: 'AI-powered review of NDAs, service agreements, and more.' },
  { id: 4, title: 'Divorce Guidance', category: 'Family', icon: Users, desc: 'Preliminary information on filing procedures and asset division.' },
  { id: 5, title: 'Small Claims Court', category: 'Civil', icon: ScaleIcon, desc: 'Step-by-step preparation for small claims filings.' },
  { id: 6, title: 'Copyright Registration', category: 'IP', icon: ShieldCheck, desc: 'Assistance with protecting your creative work and IP.' },
  { id: 7, title: 'Employment Disputes', category: 'Labor', icon: Briefcase, desc: 'Understanding your rights regarding wrongful termination.' },
  { id: 8, title: 'Personal Injury Info', category: 'Civil', icon: AlertTriangle, desc: 'What to do immediately after an accident.' },
];

function ScaleIcon(props: any) {
    return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
}

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredServices = SERVICES_DATA.filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow bg-slate-50">
        <div className="bg-gradient-to-br from-[#0D9488] via-[#1e293b] to-[#0D9488] py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D9488]/10 to-transparent"></div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
             <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 bg-gradient-to-r from-white to-[#e2e8f0] bg-clip-text text-transparent">Explore Legal Services</h1>
             <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">Professional AI-powered legal assistance tailored to your needs</p>
             <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search legal services, documents, or topics..." 
                  className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-600 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] shadow-xl transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {filteredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.map(service => (
                <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0D9488]/10 transition-colors">
                    <service.icon className="w-6 h-6 text-slate-600 group-hover:text-[#0D9488]" />
                  </div>
                  <div className="text-xs font-semibold text-[#0D9488] uppercase tracking-wide mb-2">{service.category}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{service.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No services found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;