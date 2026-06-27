'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import toast from 'react-hot-toast';

const  BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const POLL_INTERVAL_MS = 30_000; 

const STORAGE_KEY = (userId) => `taskly-notifications-${userId}`;

const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    markAllRead: () => {},
    markRead: (_id) => {},
    clearAll: () => {},
});

async function fetchProposals(email) {
    const res = await fetch(`${BASE_URL}/api/proposals?freelancerEmail=${encodeURIComponent(email)}`);
    if (!res.ok) return   null;
    return res.json();
}

export function NotificationProvider({ children }) {
    const { data: session } = useSession();
    const user = session?.user;
    const token = session?.session?.token;
    const  isFreelancer = user?.role === 'freelancer';

    const [notifications, setNotifications] = useState([]);
    const prevStatusMapRef = useRef({}); 
    const pollerRef = useRef(null);

    
    useEffect(() => {
        if (!user?.id) return;
           try {

            const raw = localStorage.getItem(STORAGE_KEY(user.id));
            if (raw) setNotifications(JSON.parse(raw));
        } catch (_) {}
    }, [user?.id]);

    
    const  persist = useCallback((notifs, userId) => {
        if (!userId) return;
        try {

            localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(notifs.slice(0, 50)));
        } catch (_) {}
    }, []);

    
     const addNotification = useCallback((notif) => {
        setNotifications(prev => {

            const next = [notif, ...prev].slice(0, 50);
            persist(next, user?.id);
            return next;
        });
    }, [persist, user?.id]);

    
    const poll = useCallback(async () => {
        if (!user?.email || !isFreelancer) return;
        try {
            const proposals = await fetchProposals(user.email);
            if (!Array.isArray(proposals)) return;

            proposals.forEach(p => {
                const prev = prevStatusMapRef.current[p._id];
                const curr = p.status?.toLowerCase();
                if (prev && prev !== curr) {
                    
                    const statusLabels = {
                        accepted:  { emoji: '🎉', msg: `Proposal accepted`, color: '#22c55e' },
                        rejected:  { emoji: '❌', msg: `Proposal rejected`, color: '#ef4444' },
                        pending:   { emoji: '⏳', msg: `Proposal under review`, color: '#eab308' },
                        completed: { emoji: '✅', msg: `Project marked complete`, color: '#06b6d4' },
                    };

                    const info = statusLabels[curr] || { emoji: '🔔', msg: `Status updated to ${curr}`, color: '#ff4d00' };
                    const notif = {
                        id: `${p._id}-${Date.now()}`,
                        proposalId: p._id,
                        taskTitle: p.taskTitle || 'Unknown Task',
                        message: info.msg,
                        emoji: info.emoji,
                        color: info.color,
                        status: curr,
                        read: false,
                        createdAt: new Date().toISOString(),
                     };
                    addNotification(notif);

                    
                    toast(`${info.emoji} ${info.msg}: "${notif.taskTitle}"`, {
                        duration: 5000,
                        style: {
                            background: '#1a1a1a',
                             color: '#fff',

                            border: `1px solid ${info.color}44`,
                            fontSize: 13,
                            borderRadius: 12,
                           },
                    });
                }
                prevStatusMapRef.current[p._id] = curr;
            });
        } catch (_) {}
    }, [token, isFreelancer, addNotification]);

    
    useEffect(() => {
        if (!user?.email || !isFreelancer) return;

        
        (async () => {
            const proposals = await fetchProposals(user.email).catch(() => null);
             if (Array.isArray(proposals)) {
                proposals.forEach(p => {
                    prevStatusMapRef.current[p._id] = p.status?.toLowerCase();
                });

            }
        })();

        pollerRef.current = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(pollerRef.current);
    }, [user?.email, isFreelancer, poll]);

    
    const markRead = useCallback((id) => {

         setNotifications(prev => {
            const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
            persist(next, user?.id);
            return next;
          });
    }, [persist, user?.id]);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const next = prev.map(n => ({ ...n, read: true }));
            persist(next, user?.id);

            return next;
        });
    }, [persist, user?.id]);

    const clearAll = useCallback(() => {
           setNotifications([]);
        persist([], user?.id);
      }, [persist, user?.id]);


    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, clearAll }}>
            {children}

        </NotificationContext.Provider>
      );
}


export function useNotifications() {
    return useContext(NotificationContext);
}
