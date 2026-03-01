import React, { useEffect, useState } from 'react'
import { X, Plus, Save, Calendar, BarChart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Difficulty, Task } from '../types'

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Task>) => void;
    initialData?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [difficulty, setDifficulty] = useState<Difficulty>('fácil')
    const [dueDate, setDueDate] = useState('')

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title)
            setDescription(initialData.description || '')
            setDifficulty(initialData.difficulty || 'fácil')
            setDueDate(initialData.due_date || '')
        } else {
            setTitle('')
            setDescription('')
            setDifficulty('fácil')
            setDueDate('')
        }
    }, [initialData, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            title,
            description,
            difficulty,
            due_date: dueDate || undefined
        })
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700"
                    >
                        <header className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-700/50">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                {initialData ? 'Editar Misión' : 'Nueva Misión'}
                            </h3>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre de la Misión</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-medium"
                                    placeholder="Ej: Derrotar al dragón del código..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descripción (Opcional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white min-h-[100px] resize-none font-medium"
                                    placeholder="Detalles de la aventura..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <BarChart className="w-4 h-4 text-primary-500" />
                                        Dificultad
                                    </label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-bold appearance-none"
                                    >
                                        <option value="fácil">Fácil (10💰)</option>
                                        <option value="media">Media (20💰)</option>
                                        <option value="difícil">Difícil (30💰)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary-500" />
                                        Vencimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-medium"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
                                >
                                    {initialData ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {initialData ? 'Guardar Cambios' : 'Iniciar Misión'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default TaskForm
