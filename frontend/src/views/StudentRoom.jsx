import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { connectPoll } from '../services/socket.js';
import { setPollMeta, setProgress, setResults } from '../store/pollSlice.js';
import { setStudentId } from '../store/userSlice.js';
import ResultsChart from '../components/ResultsChart.jsx';
import Timer from '../components/Timer.jsx';
import ChatPopup from '../components/ChatPopup.jsx';

export default function StudentRoom() {
  const { pollId } = useParams();
  const dispatch = useDispatch();
  const { name } = useSelector(s => s.user);
  const { results } = useSelector(s => s.poll);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [kicked, setKicked] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    dispatch(setPollMeta({ pollId }));
    const socket = connectPoll({ pollId, role: 'student', name });
    socketRef.current = socket;
    socket.on('student:registered', ({ studentId }) => dispatch(setStudentId(studentId)));
    socket.on('poll:question_started', (q) => { setQuestion(q); setSubmitted(false); setSelected(null); });
    socket.on('poll:progress', (r) => dispatch(setProgress(r)));
    socket.on('poll:results', (r) => dispatch(setResults(r)));
    socket.on('student:kicked', () => { setKicked(true); socket.disconnect(); });
    return () => socket.disconnect();
  }, [pollId, dispatch, name]);

  function submit() {
    if (selected == null || !question) return;
    socketRef.current.emit('student:answer', { questionId: question.id, optionIndex: selected }, (res) => {
      if (!res?.ok) alert(res?.error || 'Failed to submit');
      else setSubmitted(true);
    });
  }

  return (
    <div className="flex justify-center px-6 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-8 space-y-6">
        <div>
          <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700 font-medium">
            Interactive Poll
          </span>
          <h2 className="text-2xl font-bold mt-3">Let’s Get Started</h2>
          <p className="text-gray-500 text-sm">
            You’ll have the ability to answer live questions, submit your choice,
            and see results in real-time.
          </p>
        </div>

        {kicked && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-red-600 font-semibold">You’ve been kicked out!</h3>
            <p className="text-sm text-red-500">This session has ended for you.</p>
          </div>
        )}

        {!kicked && !question && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="animate-spin h-6 w-6 border-4 border-purple-400 border-t-transparent rounded-full"></div>
            <p className="text-gray-500 mt-3">Wait for the teacher to ask questions...</p>
          </div>
        )}

        {!kicked && question && (
          <div className="space-y-6">
            {/* Question Row */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{question.text}</h3>
              <Timer seconds={question.timeLimitSeconds} />
            </div>

            {/* Options */}
            {!submitted ? (
              <div className="space-y-4">
                {question.options.map((o, i) => (
                  <button
                    key={i}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition 
                    ${selected === i
                        ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                        : 'border-gray-300 hover:border-purple-400'}`}
                    onClick={() => setSelected(i)}
                  >
                    {o}
                  </button>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={submit}
                    disabled={selected == null}
                    className={`px-6 py-2 rounded-xl font-medium text-white transition 
                    ${selected == null
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">You have voted</p>
                {results && (
                  <ResultsChart
                    options={question.options}
                    counts={results.counts || []}
                    highlightIndex={selected}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <ChatPopup socket={socketRef.current} />
      </div>
    </div>
  );
}
