import React from 'react'
import { CheckCircle2, Circle, Trash2, Edit2, Calendar, Shield, Swords, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { Task } from '../types'

interface TaskCardProps {
    task: Task;
    onToggle: (task: Task) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

    const difficultyConfig = {
        'fácil': { icon: Shield, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', reward: 10 },
        'media': { icon: Swords, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', reward: 20 },
        'difícil': { icon: Flame, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', reward: 30 },
    };

    const config = difficultyConfig[task.difficulty] || difficultyConfig['fácil'];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`group bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none flex items-start gap-4 ${task.completed ? 'opacity-70 grayscale-[0.5]' : 'hover:border-primary-200 dark:hover:border-primary-800'
                } ${isOverdue ? 'border-red-200 dark:border-red-900/50 bg-red-50/30' : 'border-slate-100 dark:border-slate-700'}`}
        >
            <button
                onClick={() => onToggle(task)}
                className={`mt-1 transition-all active:scale-90 ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-primary-500'
                    }`}
            >
                {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 transition-transform group-hover:scale-110" />}
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${config.color}`}>
                        <config.icon className="w-3 h-3" />
                        {task.difficulty}
                        <span className="ml-1 opacity-70">+{config.reward}💰</span>
                    </span>

                    {task.due_date && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${isOverdue ? 'bg-red-100 text-red-600 border-red-200' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                            }`}>
                            <Calendar className="w-3 h-3" />
                            {task.due_date}
                        </span>
                    )}
                </div>

                <h3 className={`text-lg font-bold truncate transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'
                    }`}>
                    {task.title}
                </h3>

                {task.description && (
                    <p className={`mt-1 text-sm line-clamp-2 ${task.completed ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400 font-medium'
                        }`}>
                        {task.description}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all -mr-1">
                <button
                    onClick={() => onEdit(task)}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    )
}

export default TaskCard
