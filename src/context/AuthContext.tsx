import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session, AuthResponse } from '@supabase/supabase-js'

interface AuthContextType {
    user: User | null;
    signUp: (email: string, password: string) => Promise<AuthResponse>;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signOut: () => Promise<{ error: any }>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = (email: string, password: string) => supabase.auth.signUp({ email, password })
    const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password })
    const signOut = () => supabase.auth.signOut()

    return (
        <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
