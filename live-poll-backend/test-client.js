// test-client.js
const io = require('socket.io-client');

const URL = 'http://localhost:4000';

// create teacher socket
const teacher = io(URL);
teacher.on('connect', () => {
  console.log('Teacher connected', teacher.id);
  teacher.emit('join_teacher', { name: 'Prof. X' }, (res) => console.log('teacher join ack', res));
  teacher.on('question_started', (q) => console.log('teacher sees question started', q));
  teacher.on('student_answered', (u) => console.log('teacher student answered', u));
  teacher.on('results', (r) => console.log('teacher results', r));
});

// create two student sockets
const s1 = io(URL);
const s2 = io(URL);

s1.on('connect', () => {
  s1.emit('join_student', { name: 'Alice' }, (res) => console.log('s1 join', res));
  s1.on('question_broadcast', (q) => {
    console.log('s1 got question', q);
    setTimeout(() => {
      s1.emit('submit_answer', { questionId: q.questionId, option: q.options[0] }, (a) => console.log('s1 answered', a));
    }, 2000);
  });
  s1.on('results', (r) => console.log('s1 results', r));
});

s2.on('connect', () => {
  s2.emit('join_student', { name: 'Bob' }, (res) => console.log('s2 join', res));
  s2.on('question_broadcast', (q) => {
    console.log('s2 got question', q);
    setTimeout(() => {
      s2.emit('submit_answer', { questionId: q.questionId, option: q.options[1] }, (a) => console.log('s2 answered', a));
    }, 4000);
  });
  s2.on('results', (r) => console.log('s2 results', r));
});

// after a short delay ask a question
setTimeout(() => {
  teacher.emit('ask_question', { question: '2+2?', options: ['3','4','5'], timeLimitMs: 30000 }, (res) => console.log('ask res', res));
}, 1000);
