import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AppContext';
import { getUnreadCount } from '../services/NotificationService';

interface NotificationContextValue {
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  refreshUnreadCount: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    const count = await getUnreadCount(user.id);
    setUnreadCount(count);
  }, [user?.id]);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
