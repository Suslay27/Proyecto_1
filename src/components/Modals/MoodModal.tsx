import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mood } from '../../types';
import { Smile, Meh, Frown, AlertTriangle, X } from 'lucide-react';

interface MoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (mood: Mood) => void;
}

const moods: { type: Mood, icon: any, label: string, color: string }[] = [
    { type: 'feliz', icon: Smile, label: 'Feliz', color: 'text-emerald-500 bg-emerald-50' },
    { type: 'neutral', icon: Meh, label: 'Neutral', color: 'text-slate-500 bg-slate-50' },
    { type: 'triste', icon: Frown, label: 'Triste', color: 'text-blue-500 bg-blue-50' },
    { type: 'estresado', icon: AlertTriangle, label: 'Estresado', color: 'text-amber-500 bg-amber-50' },
];

const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSelect }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full relative border border-slate-100 dark:border-slate-700 text-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">¡Tarea Lograda!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">¿Cómo te sientes en este momento?</p>

                        <div className="grid grid-cols-2 gap-4">
                            {moods.map((m) => (
                                <button
                                    key={m.type}
                                    onClick={() => onSelect(m.type)}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 group border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
                                >
                                    <div className={`p-3 rounded-full ${m.color} transition-all group-hover:scale-110`}>
                                        <m.icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MoodModal;
