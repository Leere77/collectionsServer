const express = require('express');
const router = express.Router();

router.get('/users/:userId', function(req, res, next) {
  res.send(req.params);
});

router.post('/users', function(req, res, next) {
  res.send(req.params);
});

module.exports = router;