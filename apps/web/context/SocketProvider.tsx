'use client';

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

interface ISocketContext {
  sendMessage: (msg: string) => any;
  messages: string[];
}
interface SocketProviderProps {
  children?: React.ReactNode;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`State is undefined, useSocket should be used inside SocketProvider`);
  return state;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);
  const sendMessage: ISocketContext['sendMessage'] = useCallback((msg: string) => {
    if (!socket) {
      console.log("Socket not connected");
      console.log(socket);
      return;
    }
    socket.emit('event:message', { message: msg });
  }, [socket])

  const onMessageRec = useCallback((msg: string) => {
    const { message } = JSON.parse(msg) as { message: string };
    setMessages(prev => [ ...prev, message ]);
  }, [])

  useEffect(() => {
    const _socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || '');

    _socket.on("connect", () => console.log("Socket connected"))
    _socket.on("connect_error", (err: any) => {
      console.log(err.message);
      console.log(err.description);
      console.log(err.context);
    });
    _socket.on("message", onMessageRec);

    setSocket(_socket);
    return () => {
      _socket.disconnect();
      _socket.off("message");
      setSocket(undefined);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }} >
      {children}
    </SocketContext.Provider >
  )
}
