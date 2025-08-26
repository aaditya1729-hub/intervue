import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function connectPoll({ pollId, role, name }){
  const socket = io(`${BASE}/poll`, { query: { pollId, role, name } });
  return socket;
}