import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ShoppingBag, Coins, ChevronLeft, Check, Lock, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserStats, UserCharacter, InventoryItem, SHOP_ITEMS } from '../types';
import Avatar from '../components/Avatar';

const Shop = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [character, setCharacter] = useState<UserCharacter | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchData();

            const channel = supabase
                .channel(`shop-${user.id}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${user.id}` }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory', filter: `user_id=eq.${user.id}` }, () => fetchData())
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            const { data: statsData } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();
            const { data: charData } = await supabase.from('user_characters').select('*').eq('user_id', user.id).single();
            const { data: invData } = await supabase.from('inventory').select('*').eq('user_id', user.id);

            setStats(statsData);
            setCharacter(charData);
            setInventory(invData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item: typeof SHOP_ITEMS[0]) => {
        if (!user || !stats) return;
        if (stats.coins < item.price) {
            alert('¡No tienes suficientes monedas! Completa más misiones.');
            return;
        }

        setPurchaseLoading(item.id);
        try {
            // 1. Add to inventory
            const { error: invError } = await supabase.from('inventory').insert([{
                user_id: user.id,
                item_id: item.id,
                item_type: item.type,
                item_name: item.name
            }]);
            if (invError) throw invError;

            // 2. Deduct coins
            const { error: statsError } = await supabase.from('user_stats').update({
                coins: stats.coins - item.price
            }).eq('user_id', user.id);
            if (statsError) throw statsError;

            // 3. Auto-equip (optional, let's do it for better UX)
            if (item.type === 'hairstyle') {
                await supabase.from('user_characters').update({ hair_type: item.id }).eq('user_id', user.id);
            } else if (item.type === 'clothes') {
                await supabase.from('user_characters').update({ clothes: item.id }).eq('user_id', user.id);
            }

        } catch (err: any) {
            console.error('Error en compra:', err);
            alert('Error en la compra: ' + (err.error_description || err.message || 'Error desconocido'));
        } finally {
            setPurchaseLoading(null);
        }
    };

    const isOwned = (itemId: string) => inventory.some(i => i.item_id === itemId);
    const isEquipped = (itemId: string) => {
        if (!character) return false;
        return character.hair_type === itemId || character.clothes === itemId || character.accessories?.includes(itemId);
    };

    const handleEquip = async (item: typeof SHOP_ITEMS[0]) => {
        if (!user) return;
        try {
            if (item.type === 'hairstyle') {
                await supabase.from('user_characters').update({ hair_type: item.id }).eq('user_id', user.id);
            } else if (item.type === 'clothes') {
                await supabase.from('user_characters').update({ clothes: item.id }).eq('user_id', user.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 dark:text-slate-400">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <ShoppingBag className="w-7 h-7 text-primary-600" />
                            Tienda de Tesoros
                        </h1>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-5 py-2.5 rounded-2xl text-lg font-black flex items-center gap-2 border border-amber-200 dark:border-amber-800 shadow-sm">
                        <Coins className="w-5 h-5" />
                        {stats?.coins || 0}
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Preview Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 text-center border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-primary-500 rounded-b-full"></div>
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Vista Previa</h2>

                            <div className="mb-8 flex justify-center bg-slate-50 dark:bg-slate-700/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
                                {character && (
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
                                        size={200}
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/50">
                                    <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase mb-1">Tu Rango</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">Viajero de Nivel {stats?.level || 1}</p>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Personaliza tu leyenda</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Peinados Section */}
                        <section>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-500 flex items-center justify-center text-sm">💇</span>
                                Estilos Retro
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {SHOP_ITEMS.filter(i => i.type === 'hairstyle').map(item => (
                                    <ShopItemCard
                                        key={item.id}
                                        item={item}
                                        owned={isOwned(item.id)}
                                        equipped={isEquipped(item.id)}
                                        canAfford={(stats?.coins || 0) >= item.price}
                                        loading={purchaseLoading === item.id}
                                        onBuy={() => handleBuy(item)}
                                        onEquip={() => handleEquip(item)}
                                        character={character}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Bangs Section */}
                        <section>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center text-sm">✂️</span>
                                Estilos de Flequillo
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {SHOP_ITEMS.filter(i => i.type === 'bangs').map(item => (
                                    <ShopItemCard
                                        key={item.id}
                                        item={item}
                                        owned={isOwned(item.id)}
                                        equipped={isEquipped(item.id)}
                                        canAfford={(stats?.coins || 0) >= item.price}
                                        loading={purchaseLoading === item.id}
                                        onBuy={() => handleBuy(item)}
                                        onEquip={() => handleEquip(item)}
                                        character={character}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Ropa Section */}
                        <section>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500 flex items-center justify-center text-sm">🕶️</span>
                                Vestuario Neón (Tron & 80s)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {SHOP_ITEMS.filter(i => i.type === 'clothes').map(item => (
                                    <ShopItemCard
                                        key={item.id}
                                        item={item}
                                        owned={isOwned(item.id)}
                                        equipped={isEquipped(item.id)}
                                        canAfford={(stats?.coins || 0) >= item.price}
                                        loading={purchaseLoading === item.id}
                                        onBuy={() => handleBuy(item)}
                                        onEquip={() => handleEquip(item)}
                                        character={character}
                                    />
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
};

const ShopItemCard = ({ item, owned, equipped, canAfford, loading, onBuy, onEquip, character }: any) => {
    return (
        <div className={`group bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 transition-all ${equipped
            ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-900/10'
            : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
            }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center overflow-hidden w-20 h-20">
                    {character && (
                        <Avatar
                            hairType={item.type === 'hairstyle' ? item.id : character.hair_type}
                            hairColor={character.hair_color}
                            hairColorSecondary={character.hair_color_secondary}
                            hasSecondaryColor={character.has_secondary_hair_color}
                            skinColor={character.skin_color}
                            eyeColor={character.eye_color}
                            bangsType={item.type === 'bangs' ? item.id : character.bangs_type}
                            gender={character.gender}
                            clothes={item.type === 'clothes' ? item.id : character.clothes}
                            size={60}
                        />
                    )}
                </div>
                {!owned && (
                    <div className={`flex items-center gap-1 font-black ${canAfford ? 'text-amber-500' : 'text-red-400'}`}>
                        <Coins className="w-4 h-4" />
                        {item.price}
                    </div>
                )}
            </div>

            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">{item.name}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">Objeto de personalización de rango {item.price > 100 ? 'Épico' : 'Común'}</p>

            {owned ? (
                <button
                    onClick={onEquip}
                    disabled={equipped}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${equipped
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg active:scale-95'
                        }`}
                >
                    {equipped ? <><Check className="w-4 h-4" /> Equipado</> : 'Equipar'}
                </button>
            ) : (
                <button
                    onClick={onBuy}
                    disabled={!canAfford || loading}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${canAfford
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-95 shadow-xl transition-transform'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <><Lock className="w-4 h-4" /> Comprar</>
                    )}
                </button>
            )}
        </div>
    );
};

export default Shop;
