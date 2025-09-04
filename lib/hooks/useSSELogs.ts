import { useState, useEffect, useRef } from 'react';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  username: string;
}

export interface UseSSELogsReturn {
  logs: LogEntry[];
  isConnected: boolean;
  error: string | null;
  clearLogs: () => void;
  connect: () => void;
  disconnect: () => void;
}

export function useSSELogs(username: string, autoConnect = true): UseSSELogsReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Assumindo que o backend está rodando na porta 3001
      const eventSource = new EventSource(`http://localhost:3001/api/instagram/logs/${username}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('SSE conectado para:', username);
      };

      eventSource.onmessage = (event) => {
        try {
          const logEntry: LogEntry = JSON.parse(event.data);
          setLogs(prev => [...prev, logEntry]);
        } catch (err) {
          console.error('Erro ao parsear log SSE:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('Erro SSE:', err);
        setIsConnected(false);
        setError('Erro na conexão SSE');
      };

    } catch (err) {
      setError('Erro ao conectar SSE');
      console.error('Erro ao criar EventSource:', err);
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    if (autoConnect && username) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [username, autoConnect]);

  return {
    logs,
    isConnected,
    error,
    clearLogs,
    connect,
    disconnect
  };
}