import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export const api = axios.create({ baseURL: API_BASE });

export function createPoll({ title, timeLimitSeconds }){
  return api.post('/api/polls', { title, timeLimitSeconds }).then(r => r.data);
}

export function getPoll(pollId){
  return api.get(`/api/polls/${pollId}`).then(r => r.data);
}

export function getResults(pollId){
  return api.get(`/api/polls/${pollId}/results`).then(r => r.data);
}

export function getHistory(pollId){
  return api.get(`/api/polls/${pollId}/history`).then(r => r.data);
}

export function getStudents(pollId){
  return api.get(`/api/polls/${pollId}/students`).then(r => r.data);
}