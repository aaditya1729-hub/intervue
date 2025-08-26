const { generateId } = require('../utils/id');

const store = {
  polls: new Map(), // pollId -> poll
};

function createPoll({ title = 'Untitled Poll', defaultTimeLimitSeconds = 60 }) {
  const pollId = generateId('poll');
  const poll = {
    id: pollId,
    title,
    defaultTimeLimitSeconds,
    createdAt: new Date().toISOString(),
    teachers: new Set(), // socketIds
    students: new Map(), // studentId -> { id, name, socketId, joinedAt, isConnected }
    currentQuestion: null, // see shape below
    questionHistory: [], // closed questions with aggregated results
    chat: [],
  };
  store.polls.set(pollId, poll);
  return poll;
}

function getPoll(pollId) {
  return store.polls.get(pollId) || null;
}

function ensurePoll(pollId) {
  const poll = getPoll(pollId);
  if (!poll) {
    const err = new Error('Poll not found');
    err.status = 404;
    throw err;
  }
  return poll;
}

function addTeacherSocket(pollId, socketId) {
  const poll = ensurePoll(pollId);
  poll.teachers.add(socketId);
  return poll;
}

function removeTeacherSocket(pollId, socketId) {
  const poll = getPoll(pollId);
  if (poll) poll.teachers.delete(socketId);
}

function addStudent({ pollId, name, socketId }) {
  const poll = ensurePoll(pollId);
  const studentId = generateId('student');
  const student = {
    id: studentId,
    name,
    socketId,
    joinedAt: new Date().toISOString(),
    isConnected: true,
  };
  poll.students.set(studentId, student);
  return student;
}

function findStudentBySocket(pollId, socketId) {
  const poll = getPoll(pollId);
  if (!poll) return null;
  for (const student of poll.students.values()) {
    if (student.socketId === socketId) return student;
  }
  return null;
}

function setStudentConnection(pollId, studentId, isConnected, socketId) {
  const poll = ensurePoll(pollId);
  const student = poll.students.get(studentId);
  if (student) {
    student.isConnected = isConnected;
    if (socketId) student.socketId = socketId;
  }
}

function removeStudent(pollId, studentId) {
  const poll = ensurePoll(pollId);
  const existed = poll.students.get(studentId);
  poll.students.delete(studentId);
  return existed;
}

function canAskNewQuestion(poll) {
  if (!poll.currentQuestion) return true;
  return poll.currentQuestion.status === 'closed';
}

function startQuestion({ pollId, text, options, timeLimitSeconds }) {
  const poll = ensurePoll(pollId);
  if (!Array.isArray(options) || options.length < 2) {
    const err = new Error('Question options must be an array with at least 2 items');
    err.status = 400;
    throw err;
  }
  if (!canAskNewQuestion(poll)) {
    const err = new Error('Previous question is still active');
    err.status = 409;
    throw err;
  }
  const questionId = generateId('q');
  const activeStudents = Array.from(poll.students.values()).filter(s => s.isConnected);
  const question = {
    id: questionId,
    text,
    options,
    createdAt: new Date().toISOString(),
    timeLimitSeconds,
    status: 'active',
    expectedRespondents: activeStudents.length,
    responses: {}, // studentId -> optionIndex
  };
  poll.currentQuestion = question;
  return question;
}

function submitAnswer({ pollId, studentId, questionId, optionIndex }) {
  const poll = ensurePoll(pollId);
  const q = poll.currentQuestion;
  if (!q || q.id !== questionId || q.status !== 'active') {
    const err = new Error('No active question');
    err.status = 400;
    throw err;
  }
  if (!poll.students.has(studentId)) {
    const err = new Error('Student not in poll');
    err.status = 404;
    throw err;
  }
  if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= q.options.length) {
    const err = new Error('Invalid option index');
    err.status = 400;
    throw err;
  }
  if (q.responses[studentId] !== undefined) {
    const err = new Error('Student already answered');
    err.status = 409;
    throw err;
  }
  q.responses[studentId] = optionIndex;
  return q;
}

function aggregateResults(question) {
  const counts = Array.from({ length: question.options.length }, () => 0);
  for (const sid of Object.keys(question.responses)) {
    const idx = question.responses[sid];
    if (typeof idx === 'number') counts[idx] += 1;
  }
  return counts;
}

function closeCurrentQuestion(pollId) {
  const poll = ensurePoll(pollId);
  const q = poll.currentQuestion;
  if (!q || q.status !== 'active') return null;
  q.status = 'closed';
  q.closedAt = new Date().toISOString();
  const counts = aggregateResults(q);
  const total = Object.keys(q.responses).length;
  const record = {
    id: q.id,
    text: q.text,
    options: q.options,
    counts,
    totalResponses: total,
    createdAt: q.createdAt,
    closedAt: q.closedAt,
    timeLimitSeconds: q.timeLimitSeconds,
  };
  poll.questionHistory.push(record);
  return { question: q, results: record };
}

function getCurrentResults(pollId) {
  const poll = ensurePoll(pollId);
  const q = poll.currentQuestion;
  if (!q) return null;
  const counts = aggregateResults(q);
  return {
    id: q.id,
    text: q.text,
    options: q.options,
    counts,
    totalResponses: Object.keys(q.responses).length,
    expectedRespondents: q.expectedRespondents,
    status: q.status,
  };
}

module.exports = {
  store,
  createPoll,
  getPoll,
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
  aggregateResults,
};