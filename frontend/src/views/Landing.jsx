import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setRole, setName, setPollId } from '../store/userSlice.js';
import { useState } from 'react';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

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
    <div className="container" style={{display:'grid',placeItems:'center',minHeight:'100%'}}>
      <Card style={{maxWidth:640, width:'100%', padding:28}}>
        <h1 style={{marginBottom:4}}>Live Poll</h1>
        <div className="subtle" style={{marginBottom:16}}>Select your role and continue</div>
        <div className="grid" style={{gap:14}}>
          <div className="grid" style={{gap:6}}>
            <label>Role</label>
            <select className="select" value={role} onChange={e=>setRoleLocal(e.target.value)}>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="grid" style={{gap:6}}>
            <label>Name</label>
            <Input value={name} onChange={e=>setNameLocal(e.target.value)} placeholder="Your name" />
          </div>
          {role==='student' && (
            <div className="grid" style={{gap:6}}>
              <label>Poll ID</label>
              <Input value={pollId} onChange={e=>setPollIdLocal(e.target.value)} placeholder="poll_xxx" />
            </div>
          )}
          <div className="row" style={{justifyContent:'flex-end'}}>
            <Button onClick={start}>Continue</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}