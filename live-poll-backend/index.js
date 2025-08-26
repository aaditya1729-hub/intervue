// index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 4000;

// In-memory state (for production replace with Redis/DB)
const students = new Map(); // socketId -> { name }
const namesSet = new Set(); // unique names among connected students
const teachers = new Map(); // socketId -> { name }
let currentQuestion = null; // active question object
const pollHistory = []; // past polls with results

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getStudentList() {
  return Array.from(students.entries()).map(([socketId, obj]) => ({ socketId, name: obj.name }));
}

function computeResults(question) {
  const counts = {};
  for (const opt of question.options) counts[opt] = 0;
  for (const [, opt] of question.answers.entries()) {
    if (counts[opt] === undefined) counts[opt] = 0;
    counts[opt]++;
  }
  const answers = Array.from(question.answers.entries()).map(([socketId, option]) => {
    const s = students.get(socketId);
    return { socketId, name: s ? s.name : 'left', option };
  });
  return { counts, answers };
}

function endQuestionDueToTimeout() {
  if (!currentQuestion) return;
  const q = currentQuestion;
  clearTimeout(q.timeout);

  const { counts, answers } = computeResults(q);
  const record = {
    id: q.id,
    question: q.question,
    options: q.options,
    counts,
    answers,
    startedAt: q.startedAt,
    endedAt: Date.now(),
    endedBy: 'timeout',
    timeLimit: q.timeLimit
  };
  pollHistory.unshift(record);

  io.to('teachers').emit('results', record);

  for (const [socketId] of students) {
    io.to(socketId).emit('results', record);
  }

  currentQuestion = null;
}

function broadcastResultsEarlyIfAllAnswered() {
  if (!currentQuestion) return;
  const q = currentQuestion;
  if (q.answers.size >= students.size) {
    clearTimeout(q.timeout);
    const { counts, answers } = computeResults(q);
    const record = {
      id: q.id,
      question: q.question,
      options: q.options,
      counts,
      answers,
      startedAt: q.startedAt,
      endedAt: Date.now(),
      endedBy: 'all_answered',
      timeLimit: q.timeLimit
    };
    pollHistory.unshift(record);

    io.to('teachers').emit('results', record);
    for (const [socketId] of students) {
      io.to(socketId).emit('results', record);
    }
    currentQuestion = null;
  }
}

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);

  socket.on('join_teacher', ({ name }, cb) => {
    teachers.set(socket.id, { name });
    socket.join('teachers');
    console.log('teacher joined:', name || socket.id);

    socket.emit('state', {
      students: getStudentList(),
      currentQuestion: currentQuestion ? {
        id: currentQuestion.id,
        question: currentQuestion.question,
        options: currentQuestion.options,
        timeLeftMs: Math.max(0, currentQuestion.deadline - Date.now())
      } : null,
      pollHistory: pollHistory.slice(0, 20) // initial recent history
    });

    io.to('teachers').emit('teacher_list', Array.from(teachers.entries()).map(([id, t]) => ({ socketId: id, name: t.name })));
    if (cb) cb({ ok: true });
  });

  socket.on('join_student', ({ name }, cb) => {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      if (cb) cb({ ok: false, error: 'Name required' });
      return;
    }
    name = name.trim();
    if (namesSet.has(name)) {
      if (cb) cb({ ok: false, error: 'Name already in use' });
      return;
    }

    students.set(socket.id, { name });
    namesSet.add(name);
    socket.join('students');

    console.log(`student joined: ${name} (${socket.id})`);
    if (cb) cb({ ok: true, socketId: socket.id });

    io.to('teachers').emit('student_joined', { socketId: socket.id, name });

    if (currentQuestion) {
      const payload = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        options: currentQuestion.options,
        timeLeftMs: Math.max(0, currentQuestion.deadline - Date.now())
      };
      socket.emit('question_broadcast', payload);
    }
  });

  socket.on('ask_question', (data, cb) => {
    const teacher = teachers.get(socket.id);
    if (!teacher) {
      if (cb) cb({ ok: false, error: 'Only teacher can ask questions' });
      return;
    }

    if (!data || typeof data.question !== 'string' || !Array.isArray(data.options) || data.options.length === 0) {
      if (cb) cb({ ok: false, error: 'Invalid question payload' });
      return;
    }

    if (currentQuestion) {
      if (currentQuestion.answers.size < students.size) {
        if (cb) cb({ ok: false, error: 'Cannot ask new question: previous question active and not all students answered' });
        return;
      }
    }

    const qid = genId();
    const timeLimit = (typeof data.timeLimitMs === 'number' && data.timeLimitMs > 0) ? data.timeLimitMs : 60000;
    const deadline = Date.now() + timeLimit;

    currentQuestion = {
      id: qid,
      question: data.question,
      options: data.options,
      teacherSocketId: socket.id,
      timeLimit,
      deadline,
      answers: new Map(),
      timeout: null,
      startedAt: Date.now()
    };

    io.to('students').emit('question_broadcast', {
      questionId: qid,
      question: data.question,
      options: data.options,
      timeLeftMs: timeLimit
    });

    io.to('teachers').emit('question_started', {
      questionId: qid,
      question: data.question,
      options: data.options,
      timeLeftMs: timeLimit
    });

    currentQuestion.timeout = setTimeout(() => {
      console.log('question timeout, ending it:', qid);
      endQuestionDueToTimeout();
    }, timeLimit);

    if (cb) cb({ ok: true, questionId: qid });
  });

  socket.on('submit_answer', ({ questionId, option }, cb) => {
    const student = students.get(socket.id);
    if (!student) {
      if (cb) cb({ ok: false, error: 'Student not registered' });
      return;
    }

    if (!currentQuestion || currentQuestion.id !== questionId) {
      if (cb) cb({ ok: false, error: 'No active matching question' });
      return;
    }

    if (!currentQuestion.options.includes(option)) {
      if (cb) cb({ ok: false, error: 'Invalid option' });
      return;
    }

    if (currentQuestion.answers.has(socket.id)) {
      if (cb) cb({ ok: false, error: 'Already answered' });
      return;
    }

    currentQuestion.answers.set(socket.id, option);

    if (cb) cb({ ok: true });

    io.to('teachers').emit('student_answered', {
      questionId: currentQuestion.id,
      socketId: socket.id,
      name: student.name,
      option,
      totalAnswered: currentQuestion.answers.size,
      totalStudents: students.size
    });

    broadcastResultsEarlyIfAllAnswered();
  });

  socket.on('remove_student', ({ socketId }, cb) => {
    const teacher = teachers.get(socket.id);
    if (!teacher) {
      if (cb) cb({ ok: false, error: 'Only teacher can remove students' });
      return;
    }

    const s = students.get(socketId);
    if (!s) {
      if (cb) cb({ ok: false, error: 'Student not found' });
      return;
    }

    const sock = io.sockets.sockets.get(socketId);
    if (sock) {
      sock.emit('removed_by_teacher', { reason: 'removed' });
      sock.disconnect(true);
    }

    if (cb) cb({ ok: true });
  });

  // Chat message: { role: 'teacher'|'student', name, text }
  socket.on('chat_message', (msg) => {
    // Broadcast to everyone (teachers + students)
    const envelope = { ...msg, ts: Date.now() };
    io.to('teachers').emit('chat_message', envelope);
    io.to('students').emit('chat_message', envelope);
  });

  socket.on('get_past_polls', (data, cb) => {
    // just return the pollHistory (paginated in future)
    const recent = pollHistory.slice(0, 50);
    if (cb) cb({ ok: true, polls: recent });
  });

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected:', socket.id, 'reason:', reason);
    const wasStudent = students.has(socket.id);
    const wasTeacher = teachers.has(socket.id);

    if (wasStudent) {
      const s = students.get(socket.id);
      students.delete(socket.id);
      namesSet.delete(s.name);
      io.to('teachers').emit('student_left', { socketId: socket.id, name: s.name });

      if (currentQuestion) {
        if (currentQuestion.answers.size >= students.size) {
          broadcastResultsEarlyIfAllAnswered();
        }
      }
    }

    if (wasTeacher) {
      teachers.delete(socket.id);
      io.to('teachers').emit('teacher_list', Array.from(teachers.entries()).map(([id, t]) => ({ socketId: id, name: t.name })));
    }
  });
});

// Simple REST endpoints
app.get('/', (req, res) => {
  res.json({ ok: true, students: getStudentList().length, currentQuestion: currentQuestion ? { id: currentQuestion.id, question: currentQuestion.question } : null });
});

app.get('/polls', (req, res) => {
  res.json({ ok: true, polls: pollHistory.slice(0, 100) });
});

server.listen(PORT, () => {
  console.log(`Live Polling backend running on port ${PORT}`);
});
