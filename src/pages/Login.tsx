import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sword, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { error } = await signIn(email.trim(), password)
            if (error) throw error
            navigate('/')
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors duration-300 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary-500 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-slate-100 dark:border-slate-700 relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="bg-primary-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-lg shadow-primary-200 dark:shadow-none">
                        <Sword className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">TaskQuest</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">Retoma tu aventura y completa misiones</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Correo Electrónico</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-medium"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Contraseña Máxica</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary-200 dark:shadow-none disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 group text-lg"
                    >
                        {loading ? 'Entrando al Reino...' : (
                            <>
                                Iniciar Aventura
                                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-slate-500 dark:text-slate-400 mt-10 font-medium">
                    ¿Nuevo en el reino?{' '}
                    <Link to="/register" className="text-primary-600 dark:text-primary-400 font-black hover:underline">
                        Crea tu Héroe
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

export default Login
