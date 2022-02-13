var express = require('express');
var router = express.Router();
const reviewerController = require('../controllers/reviewer-controller');

router.post('/login', reviewerController.doLogin);
router.post('/signup', reviewerController.doSignup);

module.exports = router;
