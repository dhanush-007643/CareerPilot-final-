import React from 'react';
import { motion } from 'framer-motion';
import ResumeSection from '../components/ResumeSection';

export default function FresherResumePage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] circuit-bg pt-24 pb-16 px-4">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-blue-500/8 -top-20 right-0" />
      <div className="orb w-72 h-72 bg-purple-500/6 bottom-0 left-0" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white font-head">
            My <span className="grad-text">Resume</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Upload and manage the PDF resume that will be automatically attached when you apply for jobs.
          </p>
        </div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <ResumeSection />
        </motion.div>
      </div>
    </div>
  );
}
