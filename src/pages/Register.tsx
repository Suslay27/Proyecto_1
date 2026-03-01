import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles, User as UserIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gender, HairType } from '../types'
import Avatar from '../components/Avatar'

const Register = () => {
    const [step, setStep] = useState(1); // 1: Info, 2: Character
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Character State
    const [name, setName] = useState('')
    const [gender, setGender] = useState<Gender>('neutro')
    const [hairType, setHairType] = useState<HairType>('liso')
    const [hairColor, setHairColor] = useState('#4A2B11')

    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError('')
        if (password.trim() !== confirmPassword.trim()) {
            return setError('Las contraseñas no coinciden.')
        }
        if (password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres')
        }
        setStep(2);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data, error: signUpError } = await signUp(email, password)
            if (signUpError) throw signUpError
            if (!data.user) throw new Error('No se pudo crear el usuario')

            // Update character and stats
            // Note: The trigger might already have created defaults, we update them
            const { error: charError } = await supabase
                .from('user_characters')
                .upsert({
                    user_id: data.user.id,
                    name: name || 'Jugador',
                    gender,
                    hair_type: 'messy',
                    hair_color: hairColor,
                    skin_color: '#ffdbac',
                    eye_color: '#1a1a1a',
                    hair_color_secondary: '#4a5568',
                    has_secondary_hair_color: false,
                    bangs_type: 'none',
                    clothes: 'band_tee',
                    accessories: []
                });

            if (charError) console.error('Error saving character:', charError);

            const { error: statsError } = await supabase
                .from('user_stats')
                .upsert({ user_id: data.user.id, coins: 0, level: 1, xp: 0 });

            if (statsError) console.error('Error saving stats:', statsError);

            setSuccess(true)
            setTimeout(() => navigate('/login'), 4000)
        } catch (err: any) {
            setError(err.message || 'Error al registrarse')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-10 transition-colors">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700"
            >
                <div className="text-center mb-8">
                    <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="text-primary-600 dark:text-primary-400 w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">TaskQuest</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {step === 1 ? 'Paso 1: Tu cuenta' : 'Paso 2: Tu personaje'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm"
                    >
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span>¡Registro exitoso! Prepárate para tu aventura. Revisa tu email para confirmar.</span>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleNextStep}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white transition-all"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                Siguiente
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="flex justify-center mb-6">
                                <Avatar
                                    hairType={hairType}
                                    hairColor={hairColor}
                                    gender={gender}
                                    clothes="basic"
                                    accessories={[]}
                                    size={120}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombre del Héroe</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        placeholder="Aragorn, Ciri..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {(['masculino', 'femenino', 'neutro'] as Gender[]).map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setGender(g)}
                                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${gender === g ? 'bg-primary-600 border-primary-600 text-white' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600'}`}
                                    >
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estilo Pixel</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['messy', 'ramona_bob', 'kim_pine'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setHairType(type as any)}
                                            className={`p-3 rounded-xl border-2 transition-all capitalize font-bold ${hairType === type
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                                : 'border-slate-100 dark:border-slate-700 text-slate-500'
                                                }`}
                                        >
                                            {type === 'messy' ? 'Scott' : type === 'ramona_bob' ? 'Ramona' : 'Kim'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color del Cabello</label>
                                <input
                                    type="color"
                                    value={hairColor}
                                    onChange={(e) => setHairColor(e.target.value)}
                                    className="w-full h-10 rounded-lg cursor-pointer"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-all"
                                >
                                    Atrás
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Preparando...' : 'Comenzar Aventura'}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

export default Register
