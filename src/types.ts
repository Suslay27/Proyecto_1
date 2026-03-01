export type Gender = 'masculino' | 'femenino' | 'neutro';
export type HairType = 'liso' | 'ondulado' | 'rizado' | 'mohicano' | 'trenzas' | 'alborotado';
export type Mood = 'feliz' | 'neutral' | 'triste' | 'estresado';
export type Difficulty = 'fácil' | 'media' | 'difícil';

export interface UserStats {
    user_id: string;
    coins: number;
    level: number;
    xp: number;
}

export interface UserCharacter {
    user_id: string;
    name: string;
    gender: Gender;
    hair_type: string;
    hair_color: string;
    hair_color_secondary?: string;
    has_secondary_hair_color?: boolean;
    skin_color?: string;
    eye_color?: string;
    bangs_type?: string;
    clothes: string;
    accessories?: string[];
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    completed: boolean;
    difficulty: Difficulty;
    due_date?: string;
    created_at: string;
}

export interface InventoryItem {
    id: string;
    user_id: string;
    item_type: string;
    item_id: string;
    item_name?: string;
}

export interface MoodEntry {
    id: string;
    user_id: string;
    mood: Mood;
    date: string;
}

export const SHOP_ITEMS = [
    { id: 'messy', name: 'Corte Indie (Pixel)', price: 50, type: 'hairstyle' },
    { id: 'ramona_bob', name: 'Bob Ramona (Pixel)', price: 100, type: 'hairstyle' },
    { id: 'kim_pine', name: 'Liso Kim (Pixel)', price: 75, type: 'hairstyle' },
    { id: 'mohawk', name: 'Mohicano Punk', price: 90, type: 'hairstyle' },
    { id: 'braids', name: 'Trenzas RPG', price: 80, type: 'hairstyle' },
    { id: 'bangs_straight', name: 'Flequillo Recto', price: 30, type: 'bangs' },
    { id: 'bangs_side', name: 'Flequillo de Lado', price: 30, type: 'bangs' },
    { id: 'band_tee', name: 'Camiseta de Banda', price: 120, type: 'clothes' },
    { id: 'parka', name: 'Parka de Scott', price: 200, type: 'clothes' },
    { id: 'hoodie', name: 'Sudadera RPG', price: 150, type: 'clothes' },
    { id: 'tron_suit', name: 'Traje Cyber Pixel', price: 300, type: 'clothes' },
];
