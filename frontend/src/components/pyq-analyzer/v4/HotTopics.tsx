import React from 'react';
import { V4HotTopic } from '../../../types/pyq4';
import { motion } from 'framer-motion';

interface HotTopicsProps {
  hotTopics: V4HotTopic[];
}

export const HotTopics: React.FC<HotTopicsProps> = ({ hotTopics }) => {
  if (!hotTopics || hotTopics.length === 0) return null;

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Hot Topics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotTopics.map((topic, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#111111] border border-white/5 rounded-xl p-5 hover:border-orange-500/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-md">
                {topic.unit}
              </span>
              <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded text-orange-400 text-xs font-bold">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {topic.frequency}x Asked
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2">
              {topic.topic}
            </h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
