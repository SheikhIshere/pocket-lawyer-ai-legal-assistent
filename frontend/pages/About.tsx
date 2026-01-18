import React from 'react';

const About = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Democratizing Legal Knowledge</h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">We are on a mission to make legal assistance accessible, affordable, and understandable for everyone.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        
        {/* Story */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Story</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Once, while visiting a lawyer’s office, I noticed something troubling: many clients—especially those with limited knowledge or money—were being charged high fees for just a few minutes of advice. 
            That moment made me realize the need for a fair, transparent, and accessible solution.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Pocket Lawyer was born from that experience: a trusted, AI-powered legal assistant designed to give clear, reliable, and affordable advice to all.
          </p>
        </section>

        {/* Values */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Privacy First</h3>
            <p className="text-slate-600">End-to-end encrypted conversations. Your legal matters stay between you and the secure AI.</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Clarity & Accuracy</h3>
            <p className="text-slate-600">We translate complex "legalese" into plain language you can actually understand and act upon.</p>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">The Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
             {['Founder', 'Tech Lead', 'Legal Expert', 'Design'].map((role, i) => (
               <div key={i} className="flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-200 rounded-full mb-3 overflow-hidden">
                   <img src={`https://picsum.photos/seed/${i + 10}/200`} alt="Team Member" className="w-full h-full object-cover" />
                 </div>
                 <p className="font-bold text-slate-900">Member {i+1}</p>
                 <p className="text-sm text-slate-500">{role}</p>
               </div>
             ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-yellow-50 p-8 rounded-xl border border-yellow-200 text-sm text-yellow-900">
          <strong>Disclaimer:</strong> Pocket Lawyer provides information and guidance, not legal representation. For complex or serious legal matters, always consult a licensed attorney.
        </section>
      </div>
    </div>
  );
};

export default About;