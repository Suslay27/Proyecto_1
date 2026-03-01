import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import {
    LogOut,
    Plus,
    Filter,
    Search,
    CheckCircle2,
    Clock,
    ListChecks,
    ShoppingBag,
    Coins,
    Moon,
    Sun,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Palette,
    UserCog,
    Edit2,
    Sparkles,
    User,
    LayoutGrid
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import Avatar from '../components/Avatar'
import MoodModal from '../components/Modals/MoodModal'
import { Task, UserCharacter, UserStats, Mood } from '../types'

const Dashboard = () => {
    const { user, signOut } = useAuth()
    const { theme, toggleTheme, primaryColor, setPrimaryColor } = useTheme()
    const [tasks, setTasks] = useState<Task[]>([])
    const [character, setCharacter] = useState<UserCharacter | null>(null)
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Mood logic
    const [isMoodModalOpen, setIsMoodModalOpen] = useState(false)
    const [lastCompletedTask, setLastCompletedTask] = useState<Task | null>(null)
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        if (!user) return;

        fetchTasks()
        fetchRPGData()

        const channel = supabase
            .channel(`changes - ${user.id} `)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id = eq.${user.id} ` }, () => fetchTasks())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats', filter: `user_id = eq.${user.id} ` }, () => fetchRPGData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_characters', filter: `user_id = eq.${user.id} ` }, () => fetchRPGData())
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [user?.id])

    const fetchTasks = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            if (error) throw error
            setTasks(data || [])
        } catch (err: any) {
            console.error('Error fetching tasks:', err.message)
        }
    }

    const fetchRPGData = async () => {
        if (!user) return;
        try {
            setLoading(true)
            const { data: charData } = await supabase.from('user_characters').select('*').eq('user_id', user.id).single()
            const { data: statsData } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single()
            setCharacter(charData)
            setStats(statsData)
        } catch (err: any) {
            console.error('Error fetching RPG data:', err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrUpdate = async (taskData: any) => {
        if (!user) return;
        try {
            if (editingTask) {
                const { error } = await supabase.from('tasks').update(taskData).eq('id', editingTask.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('tasks').insert([{ ...taskData, user_id: user.id }])
                if (error) throw error
            }
            setIsFormOpen(false)
            setEditingTask(null)
            fetchTasks()
        } catch (err: any) {
            alert('Error: ' + err.message)
        }
    }

    const handleToggleStatus = async (task: Task) => {
        if (!user) return;
        try {
            const nextStatus = !task.completed
            const { error } = await supabase.from('tasks').update({ completed: nextStatus }).eq('id', task.id)
            if (error) throw error

            if (nextStatus) {
                // Award coins based on difficulty
                const reward = task.difficulty === 'fácil' ? 10 : task.difficulty === 'media' ? 20 : 30
                const newCoins = (stats?.coins || 0) + reward
                const newXp = (stats?.xp || 0) + (reward / 2)

                await supabase.from('user_stats').update({ coins: newCoins, xp: newXp }).eq('user_id', user.id)

                setLastCompletedTask(task)
                setIsMoodModalOpen(true)
            }
            fetchTasks()
        } catch (err: any) {
            console.error('Error updating task:', err.message)
        }
    }

    const handleSaveMood = async (mood: Mood) => {
        if (!user) return;
        try {
            await supabase.from('mood_entries').insert([{ user_id: user.id, mood, date: new Date().toISOString() }])
            setIsMoodModalOpen(false)
        } catch (err: any) {
            console.error(err);
        }
    }

    const handleUpdateCharacter = async (updates: Partial<UserCharacter>) => {
        if (!user || !character) return;
        // Optimistic update FIRST for immediate feedback
        const previousCharacter = { ...character };
        setCharacter({ ...character, ...updates });

        try {
            // Using upsert instead of update for more robustness
            const { error } = await supabase
                .from('user_characters')
                .upsert({
                    ...character,
                    ...updates,
                    user_id: user.id
                });

            if (error) {
                console.error('Error updating character in DB:', error.message);
                // If it's a "column not found" error, the user MUST run the SQL
                if (error.message.includes('column') || error.code === '42703') {
                    alert('Error de Base de Datos: Faltan columnas. Por favor, asegúrate de ejecutar el script SQL en Supabase para guardar los colores.');
                }
            }
        } catch (err: any) {
            console.error('Error in handleUpdateCharacter:', err.message);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id)
            if (error) throw error
            fetchTasks()
        } catch (err: any) {
            alert('Error deleting task: ' + err.message)
        }
    }

    const filteredTasks = tasks.filter((task) => {
        const matchesFilter = filter === 'all' ? true : filter === 'completed' ? task.completed : !task.completed
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const taskStats = {
        total: tasks.length,
        pending: tasks.filter(t => !t.completed).length,
        completed: tasks.filter(t => t.completed).length
    }

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarYear = currentDate.getFullYear();
    const calendarMonth = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDayOfMonth = getFirstDayOfMonth(calendarYear, calendarMonth);

    const prevMonth = () => setCurrentDate(new Date(calendarYear, calendarMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(calendarYear, calendarMonth + 1, 1));

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-300">
            {/* Sidebar with Avatar */}
            <aside className="w-full md:w-80 h-auto md:h-screen md:sticky top-0 bg-white dark:bg-slate-800 border-b md:border-r border-slate-100 dark:border-slate-700 flex flex-col transition-colors duration-300 z-20">
                {/* Scrollable Content Area - Only scrollable on desktop */}
                <div className="flex-1 md:overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 rotate-3 group-hover:rotate-12 transition-transform">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">TaskQuest</h1>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 text-center relative group neon-border min-h-[260px] flex flex-col items-center justify-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary-500"></div>
                        {character && (
                            <div className="mt-4 mb-4 flex justify-center items-center">
                                <Avatar
                                    hairType={character.hair_type}
                                    hairColor={character.hair_color}
                                    hairColorSecondary={character.hair_color_secondary}
                                    hasSecondaryColor={character.has_secondary_hair_color}
                                    skinColor={character.skin_color}
                                    eyeColor={character.eye_color}
                                    bangsType={character.bangs_type}
                                    gender={character.gender}
                                    clothes={character.clothes}
                                    accessories={character.accessories}
                                    size={140}
                                />
                            </div>
                        )}
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1 leading-tight">{character?.name || 'Héroe'}</h2>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 border border-amber-200 dark:border-amber-800 shadow-sm">
                                <Coins className="w-4 h-4" />
                                {stats?.coins || 0}
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-xs font-black border border-blue-200 dark:border-blue-800 shadow-sm">
                                NIVEL {stats?.level || 1}
                            </div>
                        </div>

                        {/* XP Progress Bar - MORE PROMINENT */}
                        <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2 relative border border-slate-100 dark:border-slate-700">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats?.xp || 0) % 100}%` }}
                                className="h-full bg-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.7)] relative z-0"
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <span className="text-[8px] font-black text-white mix-blend-difference uppercase tracking-tighter">XP: {(stats?.xp || 0) % 100}/100</span>
                            </div>
                        </div>
                    </div>

                    {/* Personalization Section */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 space-y-6">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Personalizar Héroe</span>
                        </div>

                        <input
                            type="text"
                            value={character?.name || ''}
                            placeholder="Nombre del Héroe"
                            onChange={(e) => handleUpdateCharacter({ name: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-black text-slate-900 dark:text-white focus:border-primary-500 transition-all outline-none"
                        />

                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase px-1 tracking-wider">Piel</label>
                                <div className="relative h-10 w-full group rounded-xl overflow-hidden border border-slate-100 dark:border-slate-600">
                                    <input
                                        type="color"
                                        value={character?.skin_color || '#ffdbac'}
                                        onChange={(e) => handleUpdateCharacter({ skin_color: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full h-full shadow-inner" style={{ backgroundColor: character?.skin_color || '#ffdbac' }}></div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase px-1 tracking-wider">Ojos</label>
                                <div className="relative h-10 w-full group rounded-xl overflow-hidden border border-slate-100 dark:border-slate-600">
                                    <input
                                        type="color"
                                        value={character?.eye_color || '#1a1a1a'}
                                        onChange={(e) => handleUpdateCharacter({ eye_color: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full h-full shadow-inner" style={{ backgroundColor: character?.eye_color || '#1a1a1a' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Two-tone Hair Toggle */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Color 2 (Puntas)</label>
                                <button
                                    onClick={() => handleUpdateCharacter({ has_secondary_hair_color: !character?.has_secondary_hair_color })}
                                    className={`w-10 h-5 rounded-full transition-all relative ${character?.has_secondary_hair_color ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${character?.has_secondary_hair_color ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                            {character?.has_secondary_hair_color && (
                                <div className="relative h-10 w-full group rounded-xl overflow-hidden border border-slate-100 dark:border-slate-600">
                                    <input
                                        type="color"
                                        value={character?.hair_color_secondary || '#4a5568'}
                                        onChange={(e) => handleUpdateCharacter({ hair_color_secondary: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full h-full shadow-inner" style={{ backgroundColor: character?.hair_color_secondary || '#4a5568' }}></div>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase px-1 tracking-wider">Base de Cabello</label>
                                <div className="relative h-10 w-full group rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                                    <input
                                        type="color"
                                        value={character?.hair_color || '#000000'}
                                        onChange={(e) => handleUpdateCharacter({ hair_color: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full h-full shadow-inner" style={{ backgroundColor: character?.hair_color || '#000000' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <Link to="/adventure" className="w-full flex items-center justify-between p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl shadow-slate-200 dark:shadow-none transition-transform active:scale-95 group">
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="w-5 h-5 text-primary-400 group-hover:rotate-12 transition-transform" />
                                Aventura
                            </div>
                            <span className="bg-primary-500 text-white text-[10px] px-2 py-1 rounded-lg">{taskStats.pending}</span>
                        </Link>
                        <Link to="/shop" className="w-full flex items-center gap-3 p-4 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl font-bold transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                            <ShoppingBag className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform" />
                            Tienda
                        </Link>
                    </nav>

                    <div className="space-y-4">
                        <div className="px-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Tema de la Aplicación</label>
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/30 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 transition-all active:scale-90">
                                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                </button>
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-600"></div>
                                <div className="flex-1 flex items-center justify-between gap-2 pl-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase">Color Principal</span>
                                    <div className="relative w-8 h-8 group">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div
                                            className="w-full h-full rounded-full border-2 border-white dark:border-slate-500 shadow-md flex items-center justify-center transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <Palette className="w-3 h-3 text-white mix-blend-difference opacity-70" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logout Footer - Fixed at bottom */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700/50">
                    <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl font-bold transition-all group">
                        <LogOut className="w-5 h-5" />
                        Retirarse
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-10 pt-8 md:pt-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Task List */}
                        <div className="lg:col-span-2 space-y-6">
                            <header className="flex items-center justify-between mb-2">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Misiones</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Completa retos para ganar tesoros</p>
                                </div>
                                <button
                                    onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
                                    className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-2xl font-black transition-all shadow-xl shadow-primary-200 dark:shadow-none flex items-center gap-2 active:scale-95"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </header>

                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar misiones..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {loading && tasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600 mb-4"></div>
                                        <p className="font-bold">Viajando al reino...</p>
                                    </div>
                                ) : filteredTasks.length > 0 ? (
                                    <AnimatePresence mode="popLayout">
                                        {filteredTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onToggle={handleToggleStatus}
                                                onDelete={handleDelete}
                                                onEdit={(t) => {
                                                    setEditingTask(t)
                                                    setIsFormOpen(true)
                                                }}
                                            />
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-[2rem] border-4 border-dashed border-slate-100 dark:border-slate-700 p-12 text-center">
                                        <div className="bg-slate-100 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Plus className="text-slate-400 w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Tranquilidad total</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No hay misiones pendientes. ¡Es hora de descansar o crear un nuevo reto!</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Mini Calendar & Stats */}
                        <div className="space-y-8">
                            {/* Stats Summary */}
                            <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">Estado de la Aventura</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                                        <CheckCircle2 className="w-5 h-5 mb-2 text-emerald-300" />
                                        <div className="text-2xl font-black">{taskStats.completed}</div>
                                        <div className="text-[10px] uppercase font-bold opacity-70 text-emerald-100">Completas</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                                        <Clock className="w-5 h-5 mb-2 text-amber-300" />
                                        <div className="text-2xl font-black">{taskStats.pending}</div>
                                        <div className="text-[10px] uppercase font-bold opacity-70 text-amber-100">Pendientes</div>
                                    </div>
                                </div>
                            </div>

                            {/* Mini Calendar Visualization */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-primary-500" />
                                        {monthNames[calendarMonth]} {calendarYear}
                                    </h3>
                                    <div className="flex gap-1">
                                        <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                                        <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                                        <span key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: 42 }).map((_, i) => {
                                        const dayNums = i - firstDayOfMonth + 1;
                                        if (dayNums < 1 || dayNums > daysInMonth) return <div key={i}></div>

                                        const isToday = dayNums === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();

                                        // Find tasks for this day
                                        const dayDate = new Date(calendarYear, calendarMonth, dayNums).toISOString().split('T')[0];
                                        const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(dayDate));
                                        const hasOverdue = dayTasks.some(t => !t.completed && new Date(t.due_date!) < new Date());
                                        const hasPending = dayTasks.some(t => !t.completed && new Date(t.due_date!) >= new Date());

                                        return (
                                            <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold relative ${isToday ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {dayNums}
                                                <div className="flex gap-[1px] absolute bottom-1">
                                                    {hasOverdue && <div className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]"></div>}
                                                    {hasPending && <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_4px_#f59e0b]"></div>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="mt-6 space-y-2">
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span>Misiones Vencidas</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span>Próximas Misiones</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <TaskForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingTask(null); }} onSubmit={handleCreateOrUpdate} initialData={editingTask} />
            <MoodModal isOpen={isMoodModalOpen} onClose={() => setIsMoodModalOpen(false)} onSelect={handleSaveMood} />
        </div>
    )
}

export default Dashboard
