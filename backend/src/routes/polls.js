const express = require('express');
const { createPoll, ensurePoll, getCurrentResults } = require('../models/store');
const config = require('../config');
const { readHistory } = require('../services/persistenceService');

const router = express.Router();

router.post('/', (req, res, next) => {
  try {
    const { title, timeLimitSeconds } = req.body || {};
    const poll = createPoll({
      title: title || 'Untitled Poll',
      defaultTimeLimitSeconds: typeof timeLimitSeconds === 'number' ? timeLimitSeconds : config.defaultTimeLimitSeconds,
    });
    res.status(201).json({ pollId: poll.id, title: poll.title, defaultTimeLimitSeconds: poll.defaultTimeLimitSeconds });
  } catch (err) {
    next(err);
  }
});

router.get('/:pollId', (req, res, next) => {
  try {
    const poll = ensurePoll(req.params.pollId);
    res.json({
      id: poll.id,
      title: poll.title,
      defaultTimeLimitSeconds: poll.defaultTimeLimitSeconds,
      createdAt: poll.createdAt,
      studentCount: poll.students.size,
      hasActiveQuestion: Boolean(poll.currentQuestion && poll.currentQuestion.status === 'active'),
      questionHistoryCount: poll.questionHistory.length,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:pollId/results', (req, res, next) => {
  try {
    const results = getCurrentResults(req.params.pollId);
    if (!results) return res.status(204).end();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.get('/:pollId/history', (req, res, next) => {
  try {
    ensurePoll(req.params.pollId);
    const history = readHistory(req.params.pollId);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

router.get('/:pollId/students', (req, res, next) => {
  try {
    const poll = ensurePoll(req.params.pollId);
    const students = Array.from(poll.students.values()).map(s => ({ id: s.id, name: s.name, isConnected: s.isConnected }));
    res.json(students);
  } catch (err) {
    next(err);
  }
});

module.exports = router;