import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pollId: '',
  title: '',
  studentCount: 0,
  currentQuestion: null, // { id, text, options, timeLimitSeconds }
  results: null, // { counts, totalResponses, expectedRespondents, status }
  history: [],
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setPollMeta(state, action){
      const { pollId, title } = action.payload;
      state.pollId = pollId || state.pollId;
      if (title) state.title = title;
    },
    setStudentCount(state, action){ state.studentCount = action.payload; },
    setQuestionStarted(state, action){ state.currentQuestion = action.payload; state.results = null; },
    setProgress(state, action){ state.results = action.payload; },
    setResults(state, action){ state.results = action.payload; },
    setHistory(state, action){ state.history = action.payload || []; },
    resetPoll(){ return initialState; },
  }
});

export const { setPollMeta, setStudentCount, setQuestionStarted, setProgress, setResults, setHistory, resetPoll } = pollSlice.actions;
export default pollSlice.reducer;