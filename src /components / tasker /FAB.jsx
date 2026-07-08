import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FAB({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:bg-blue-600 transition-colors"
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </motion.button>
  );
}
