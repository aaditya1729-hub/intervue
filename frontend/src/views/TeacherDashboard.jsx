import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { connectPoll } from '../services/socket.js';
import { setPollMeta, setStudentCount, setQuestionStarted, setProgress, setResults } from '../store/pollSlice.js';
import { getPoll, getHistory, getStudents } from '../services/api.js';
import QuestionForm from '../components/QuestionForm.jsx';
import ResultsChart from '../components/ResultsChart.jsx';
import Timer from '../components/Timer.jsx';
import ChatPopup from '../components/ChatPopup.jsx';
import Header from '../components/ui/Header.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';

export default function TeacherDashboard(){
  const { pollId } = useParams();
  const dispatch = useDispatch();
  const { results, currentQuestion, studentCount } = useSelector(s=>s.poll);
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const socketRef = useRef(null);

  useEffect(()=>{
    (async ()=>{
      const meta = await getPoll(pollId);
      dispatch(setPollMeta({ pollId: meta.id, title: meta.title }));
      setHistory(await getHistory(pollId));
      setStudents(await getStudents(pollId));
    })();
    const socket = connectPoll({ pollId, role:'teacher' });
    socketRef.current = socket;
    socket.on('poll:student_count', ({ count }) => dispatch(setStudentCount(count)));
    socket.on('poll:question_started', (q) => dispatch(setQuestionStarted(q)));
    socket.on('poll:progress', (r) => dispatch(setProgress(r)));
    socket.on('poll:results', (r) => dispatch(setResults(r)));
    return () => socket.disconnect();
  }, [pollId, dispatch]);

  function startQuestion({ text, options, timeLimitSeconds }){
    socketRef.current.emit('teacher:start_question', { text, options, timeLimitSeconds }, (res)=>{
      if (!res?.ok) alert(res?.error || 'Failed to start question');
    });
  }

  function kickStudent(id){
    socketRef.current.emit('teacher:kick_student', { studentId: id }, ()=>{
      setStudents(s=>s.filter(x=>x.id!==id));
    });
  }

  return (
    <div className="container grid" style={{gap:20}}>
      <Header title={`Teacher Dashboard • ${pollId}`} right={<div className="subtle">Students: {studentCount}</div>} />

      {!currentQuestion && (
        <QuestionForm onStart={startQuestion} />
      )}

      {currentQuestion && (
        <Card style={{display:'grid', gap:12}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <h3>{currentQuestion.text}</h3>
            <Timer seconds={currentQuestion.timeLimitSeconds} />
          </div>
          {results && (
            <ResultsChart options={currentQuestion.options} counts={results.counts || []} />
          )}
          {!results && (
            <div className="subtle">Waiting for responses...</div>
          )}
        </Card>
      )}

      <div className="grid" style={{gridTemplateColumns:'2fr 1fr', gap:20}}>
        <Card>
          <h3>History</h3>
          {history.length===0 && <div className="subtle">No past questions yet.</div>}
          <div className="grid" style={{gap:12}}>
            {history.map(h => (
              <Card key={h.id}>
                <div style={{fontWeight:600, marginBottom:8}}>{h.text}</div>
                <ResultsChart options={h.options} counts={h.counts} />
              </Card>
            ))}
          </div>
        </Card>
        <Card>
          <h3>Students</h3>
          <div className="grid" style={{gap:8}}>
            {students.map(s => (
              <div key={s.id} className="row" style={{justifyContent:'space-between'}}>
                <div>{s.name} {s.isConnected ? '' : '(left)'}</div>
                <Button variant="ghost" onClick={()=>kickStudent(s.id)} style={{background:'var(--danger)', borderColor:'var(--danger)'}}>Remove</Button>
              </div>
            ))}
            {students.length===0 && <div className="subtle">Waiting for students...</div>}
          </div>
        </Card>
      </div>

      <ChatPopup socket={socketRef.current} />
    </div>
  );
}