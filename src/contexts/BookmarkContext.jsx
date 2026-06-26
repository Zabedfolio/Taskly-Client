'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';

const BookmarkContext = createContext({
    bookmarks: [],        // array of task IDs
    toggleBookmark: (_taskId) => {},
    isBookmarked: (_taskId) => false,
});

const STORAGE_KEY = (userId) => `taskly-bookmarks-${userId}`;

export function BookmarkProvider({ children }) {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const [bookmarks, setBookmarks] = useState([]);

    // Load bookmarks from localStorage when user is identified
    useEffect(() => {
        if (!userId) {
            setBookmarks([]);
            return;
        }
        try {
            const raw = localStorage.getItem(STORAGE_KEY(userId));
            setBookmarks(raw ? JSON.parse(raw) : []);
        } catch (_) {
            setBookmarks([]);
        }
    }, [userId]);

    const persist = useCallback((ids) => {
        if (!userId) return;
        try {
            localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(ids));
        } catch (_) {}
    }, [userId]);

    const toggleBookmark = useCallback((taskId) => {
        setBookmarks(prev => {
            const next = prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId];
            persist(next);
            return next;
        });
    }, [persist]);

    const isBookmarked = useCallback((taskId) => bookmarks.includes(taskId), [bookmarks]);

    return (
        <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    return useContext(BookmarkContext);
}
