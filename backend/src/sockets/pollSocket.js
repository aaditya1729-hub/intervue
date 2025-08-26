const {
  ensurePoll,
  addTeacherSocket,
  removeTeacherSocket,
  addStudent,
  findStudentBySocket,
  setStudentConnection,
  removeStudent,
  startQuestion,
  submitAnswer,
  closeCurrentQuestion,
  getCurrentResults,
} = require('../models/store');
const { appendQuestionHistory } = require('../services/persistenceService');
const config = require('../config');
const { logInfo, logWarn } = require('../utils/logger');

function setupPollNamespace(io) {
  const nsp = io.of('/poll');

  nsp.on('connection', (socket) => {
    const { pollId, role, name } = socket.handshake.query || {};

    if (!pollId || !role) {
      socket.emit('error', { message: 'Missing pollId or role' });
      return socket.disconnect(true);
    }

    try {
      ensurePoll(pollId);
    } catch (err) {
      socket.emit('error', { message: 'Poll not found' });
      return socket.disconnect(true);
    }

    socket.join(pollId);

    if (role === 'teacher') {
      addTeacherSocket(pollId, socket.id);
      logInfo('Teacher connected', { pollId, socketId: socket.id });
    } else if (role === 'student') {
      if (!name || typeof name !== 'string' || !name.trim()) {
        socket.emit('error', { message: 'Student name required' });
        return socket.disconnect(true);
      }
      const student = addStudent({ pollId, name: name.trim(), socketId: socket.id });
      socket.data.studentId = student.id;
      socket.emit('student:registered', { studentId: student.id, name: student.name });
      nsp.to(pollId).emit('poll:student_count', { count: ensurePoll(pollId).students.size });
    }

    socket.on('teacher:start_question', (payload, cb) => {
      try {
        if (role !== 'teacher') throw new Error('Unauthorized');
        const { text, options, timeLimitSeconds } = payload || {};
        const limit = typeof timeLimitSeconds === 'number' ? timeLimitSeconds : config.defaultTimeLimitSeconds;
        const q = startQuestion({ pollId, text, options, timeLimitSeconds: limit });
        nsp.to(pollId).emit('poll:question_started', {
          id: q.id,
          text: q.text,
          options: q.options,
          timeLimitSeconds: q.timeLimitSeconds,
        });
        // Start timer
        const timer = setTimeout(() => {
          const closed = closeCurrentQuestion(pollId);
          if (!closed) return;
          const { results } = closed;
          appendQuestionHistory(pollId, results);
          nsp.to(pollId).emit('poll:results', results);
        }, q.timeLimitSeconds * 1000);
        socket.data.currentTimer = timer;
        cb && cb({ ok: true, questionId: q.id });
      } catch (err) {
        cb && cb({ ok: false, error: err.message });
      }
    });

    socket.on('teacher:close_question', (payload, cb) => {
      try {
        if (role !== 'teacher') throw new Error('Unauthorized');
        const closed = closeCurrentQuestion(pollId);
        if (!closed) return cb && cb({ ok: false, error: 'No active question' });
        const { results } = closed;
        appendQuestionHistory(pollId, results);
        const t = socket.data.currentTimer;
        if (t) clearTimeout(t);
        nsp.to(pollId).emit('poll:results', results);
        cb && cb({ ok: true });
      } catch (err) {
        cb && cb({ ok: false, error: err.message });
      }
    });

    socket.on('student:answer', (payload, cb) => {
      try {
        if (role !== 'student') throw new Error('Unauthorized');
        const studentId = socket.data.studentId;
        const { questionId, optionIndex } = payload || {};
        const q = submitAnswer({ pollId, studentId, questionId, optionIndex });
        const results = getCurrentResults(pollId);
        nsp.to(pollId).emit('poll:progress', results);
        // If all answered, close early
        if (results.totalResponses >= results.expectedRespondents) {
          const closed = closeCurrentQuestion(pollId);
          if (closed) {
            const { results: finalRes } = closed;
            appendQuestionHistory(pollId, finalRes);
            nsp.to(pollId).emit('poll:results', finalRes);
            const t = socket.data.currentTimer;
            if (t) clearTimeout(t);
          }
        }
        cb && cb({ ok: true });
      } catch (err) {
        cb && cb({ ok: false, error: err.message });
      }
    });

    socket.on('teacher:kick_student', (payload, cb) => {
      try {
        if (role !== 'teacher') throw new Error('Unauthorized');
        const { studentId } = payload || {};
        const student = removeStudent(pollId, studentId);
        if (student) {
          const s = nsp.sockets.get(student.socketId);
          if (s) {
            try { s.emit('student:kicked'); } catch {}
            s.disconnect(true);
          }
          nsp.to(pollId).emit('poll:student_count', { count: ensurePoll(pollId).students.size });
        }
        cb && cb({ ok: true });
      } catch (err) {
        cb && cb({ ok: false, error: err.message });
      }
    });

    socket.on('chat:message', (payload) => {
      const { from, text } = payload || {};
      if (!text) return;
      nsp.to(pollId).emit('chat:message', { from: from || role, text, at: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      if (role === 'teacher') {
        removeTeacherSocket(pollId, socket.id);
      } else if (role === 'student') {
        const student = findStudentBySocket(pollId, socket.id);
        if (student) setStudentConnection(pollId, student.id, false);
        nsp.to(pollId).emit('poll:student_count', { count: ensurePoll(pollId).students.size });
      }
    });
  });

  return nsp;
}

module.exports = { setupPollNamespace };