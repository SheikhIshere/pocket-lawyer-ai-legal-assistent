import React, { useState } from 'react';
import { Header, Footer } from '../components/Layout';
import { 
  Search, FileText, Briefcase, Car, Home, Users, 
  AlertTriangle, ShieldCheck, Scale, Compass, 
  ArrowRight, Sparkles, Filter
} from 'lucide-react';

const SERVICES_DATA = [
  { id: 1, title: 'Lease Agreement Review', category: 'Real Estate', icon: Home, desc: 'Detailed analysis of rental contracts identifying hidden clauses and protecting your rights.', color: 'teal' },
  { id: 2, title: 'Traffic Ticket Defense', category: 'Traffic', icon: Car, desc: 'Professional guidance on contesting speeding tickets and moving violations effectively.', color: 'amber' },
  { id: 3, title: 'Contract Analysis', category: 'Business', icon: Briefcase, desc: 'AI-powered review of NDAs, service agreements, and complex commercial contracts.', color: 'blue' },
  { id: 4, title: 'Divorce Guidance', category: 'Family', icon: Users, desc: 'Preliminary information on filing procedures, asset division, and family law basics.', color: 'purple' },
  { id: 5, title: 'Small Claims Court', category: 'Civil', icon: Scale, desc: 'Step-by-step preparation for small claims filings and courtroom procedures.', color: 'indigo' },
  { id: 6, title: 'Copyright Registration', category: 'IP', icon: ShieldCheck, desc: 'Assistance with protecting your creative work, trademarks, and intellectual property.', color: 'emerald' },
  { id: 7, title: 'Employment Disputes', category: 'Labor', icon: Briefcase, desc: 'Understanding your rights regarding wrongful termination, discrimination, and labor laws.', color: 'rose' },
  { id: 8, title: 'Personal Injury Info', category: 'Civil', icon: AlertTriangle, desc: 'Immediate steps and legal frameworks to navigate after a personal injury accident.', color: 'orange' },
];

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = SERVICES_DATA.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500 pb-20 lg:pb-0">
      <Header />
      <main className="flex-grow relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-teal-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Hero Section - Android Style */}
        <div className="relative pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/30 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest">Premium Legal Intelligence</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Explore Our <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Legal Ecosystem</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 dark:text-gray-400 font-medium mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Instantly access professional AI guidance for complex legacy matters, 
              contracts, and daily legal inquiries.
            </p>

            <div className="relative max-w-2xl mx-auto group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="absolute inset-0 bg-teal-500/10 blur-2xl group-focus-within:bg-teal-500/20 transition-all duration-500"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-6 text-slate-400 group-focus-within:text-teal-500 transition-colors w-6 h-6" />
                <input
                  type="text"
                  placeholder="What can we help you with today?"
                  className="w-full pl-16 pr-24 py-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-slate-900 dark:text-white placeholder-slate-400 focus:border-teal-500 dark:focus:border-teal-500 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all outline-none text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-4">
                  <button className="p-3 bg-teal-600 text-white rounded-[1.5rem] shadow-lg shadow-teal-500/30 active:scale-90 transition-all">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories / Chips - Native Android Feel */}
        <div className="max-w-7xl mx-auto px-4 mb-12 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 pb-2">
            {['All Services', 'Real Estate', 'Business', 'Family', 'Civil', 'IP', 'Labor'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setSearchTerm(cat === 'All Services' ? '' : cat)}
                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  (searchTerm === cat || (cat === 'All Services' && searchTerm === ''))
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-gray-400 border-slate-100 dark:border-slate-800 hover:border-teal-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 mb-20">
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredServices.map(service => (
                <div 
                  key={service.id} 
                  className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-teal-500/5 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col active:scale-[0.98]"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 shadow-sm
                    ${service.color === 'teal' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600' : ''}
                    ${service.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : ''}
                    ${service.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : ''}
                    ${service.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' : ''}
                    ${service.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : ''}
                    ${service.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : ''}
                    ${service.color === 'rose' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600' : ''}
                    ${service.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600' : ''}
                  `}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400 group-hover:text-teal-500 transition-colors">
                      {service.category}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                      {service.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 group/btn">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">Learn More</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:border-teal-500/30 group-hover:text-teal-500 transition-all">
                      <Compass className="w-5 h-5" />
                    </div>
                  </div>
                  
                  {/* Premium Hover Ornament */}
                  <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="inline-flex p-8 rounded-[2rem] bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 mb-8 border border-slate-100 dark:border-slate-700 shadow-xl">
                <Search className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Matches Found</h3>
              <p className="text-slate-500 dark:text-gray-400 font-medium max-w-sm mx-auto">
                We couldn't find any services matching "{searchTerm}". Try a different keyword or category.
              </p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-10 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl active:scale-95 transition-all"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;