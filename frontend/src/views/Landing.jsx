import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRole, setName, setPollId } from '../store/userSlice.js';
import { useState } from 'react';

export default function Landing(){
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [role, setRoleLocal] = useState('teacher');
  const [name, setNameLocal] = useState('');
  const [pollId, setPollIdLocal] = useState('');

  function start(){
    if (!name.trim()) return;
    dispatch(setRole(role));
    dispatch(setName(name.trim()));
    if (role === 'teacher'){
      navigate('/teacher/create');
    } else {
      dispatch(setPollId(pollId.trim()));
      navigate(`/student/${pollId.trim()}`);
    }
  }

  return (
    <div className="container">
      <div className="card grid" style={{maxWidth:600, margin:'60px auto'}}>
        <h1>Live Poll</h1>
        <div className="row">
          <label>Role</label>
          <select value={role} onChange={e=>setRoleLocal(e.target.value)}>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div className="row">
          <label style={{minWidth:100}}>Name</label>
          <input value={name} onChange={e=>setNameLocal(e.target.value)} placeholder="Your name" />
        </div>
        {role==='student' && (
          <div className="row">
            <label style={{minWidth:100}}>Poll ID</label>
            <input value={pollId} onChange={e=>setPollIdLocal(e.target.value)} placeholder="poll_xxx" />
          </div>
        )}
        <div className="row" style={{justifyContent:'flex-end'}}>
          <button onClick={start}>Continue</button>
        </div>
      </div>
    </div>
  );
}