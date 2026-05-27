import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '../utils/socketUrl';

export function useChatSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const joinConversation = useCallback((conversationId: string) => {
    const emit = () => socketRef.current?.emit('join_conversation', conversationId);
    if (socketRef.current?.connected) emit();
    else socketRef.current?.once('connect', emit);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave_conversation', conversationId);
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    socketRef.current?.emit('send_message', { conversationId, content });
  }, []);

  const subscribe = useCallback(
    (
      event: 'new_message' | 'error_message',
      handler: (...args: unknown[]) => void
    ) => {
      const attach = () => {
        socketRef.current?.on(event, handler);
      };
      if (socketRef.current?.connected) attach();
      else socketRef.current?.once('connect', attach);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    []
  );

  return {
    connected,
    joinConversation,
    leaveConversation,
    sendMessage,
    subscribe,
  };
}
