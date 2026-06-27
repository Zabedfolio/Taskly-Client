'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => {},
});

export function  ThemeProvider({ children }) {
    const  [theme, setTheme] = useState('dark');
    const [mounted, setMounted] = useState(false);

    
    useEffect(() => {
        const saved = localStorage.getItem('taskly-theme');
        if (saved === 'light' || saved === 'dark') {
            setTheme(saved);
             document.documentElement.setAttribute('data-theme', saved);
        } else {
            
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const  initial = prefersDark ? 'dark' : 'light';
               setTheme(initial);
            document.documentElement.setAttribute('data-theme', initial);
        }
        setMounted(true);
    }, []);

    function toggleTheme() {
        setTheme(prev => {

            const  next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('taskly-theme', next);
            document.documentElement.setAttribute('data-theme', next);
            return   next;
           });

    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}


export function  useTheme() {
    return useContext(ThemeContext);
}
