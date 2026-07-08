import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Pause, Square, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusMode({ task, onStop, onRefresh }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef(Date.now());
  const entryRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const createEntry = async () => {
      const entry = await base44.entities.TimeEntry.create({
        task_id: task.id,
        start_time: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      });
      entryRef.current = entry;
    };
    createEntry();
    return () => clearInterval(intervalRef.current);
  }, [task.id]);

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [paused]);

  const handlePause = () => {
    setPaused(!paused);
    if (paused) {
      startRef.current = Date.now() - elapsed * 1000;
    }
  };

  const handleStop = async () => {
    clearInterval(intervalRef.current);
    if (entryRef.current) {
      await base44.entities.TimeEntry.update(entryRef.current.id, {
        end_time: new Date().toISOString(),
        duration_seconds: elapsed
      });
    }
    await base44.entities.Task.update(task.id, {
      total_time_spent: (task.total_time_spent || 0) + elapsed,
      status: 'todo'
    });
    onRefresh?.();
    onStop();
  };

  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col items-center justify-center p-6"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-white/40 text-sm font-medium tracking-wide uppercase mb-2">Focusing on</p>
          <h2 className="text-white text-xl font-semibold mb-1 max-w-xs mx-auto">{task.title}</h2>
          {task.description && <p className="text-white/30 text-sm max-w-xs mx-auto">{task.description}</p>}
        </div>

        {/* Timer */}
        <div className="mt-16 mb-16">
          <p className="text-7xl font-light text-white tracking-wider tabular-nums">
            {hours > 0 && <>{pad(hours)}<span className="text-white/20">:</span></>}
            {pad(mins)}<span className="text-white/20">:</span>{pad(secs)}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={handlePause}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <Pause className="w-6 h-6" fill={paused ? 'none' : 'currentColor'} />
          </button>
          <button
            onClick={handleStop}
            className="w-20 h-20 rounded-full bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-500/30"
          >
            <Square className="w-7 h-7" fill="currentColor" />
          </button>
        </div>

        <p className="mt-8 text-white/20 text-xs">{paused ? 'Paused — tap to resume' : 'Tap square to stop'}</p>
      </motion.div>
    </AnimatePresence>
  );
}
