import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: null, // 'teacher' | 'student'
  name: '',
  pollId: '',
  studentId: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRole(state, action){ state.role = action.payload; },
    setName(state, action){ state.name = action.payload; },
    setPollId(state, action){ state.pollId = action.payload; },
    setStudentId(state, action){ state.studentId = action.payload; },
    resetUser(){ return initialState; },
  }
});

export const { setRole, setName, setPollId, setStudentId, resetUser } = userSlice.actions;
export default userSlice.reducer;