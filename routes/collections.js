const express = require('express');
const router = express.Router();

router.get('/collections/:collectionId', function(req, res, next) {
  res.send({par: req.params});
});

router.post('/collections', function(req, res, next) {
  res.send({par: req.params, body: req.body});
});

module.exports = router;