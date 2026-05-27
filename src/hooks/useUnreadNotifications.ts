import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/config';

export function useUnreadNotifications(pollMs = 45000) {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user?.stats) {
        setUnreadCount(data.user.stats.unreadNotifications ?? 0);
      }
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    refresh();
    if (!token || pollMs <= 0) return;
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, token, pollMs]);

  return { unreadCount, refreshUnread: refresh };
}

export const REFERENCE_IN_MESSAGE =
  /(?:VER|REG|TRF|REQ)-\d{4}-[A-Z0-9]+/i;

export function parseReferenceFromMessage(message: string): string | undefined {
  return message.match(REFERENCE_IN_MESSAGE)?.[0];
}
