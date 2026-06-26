const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { getRoomMessages, saveMessage, getContacts } = require('../controllers/messageController');

router.get('/contacts',  protect, getContacts);
router.get('/:room',     protect, getRoomMessages);
router.post('/',         protect, saveMessage);

module.exports = router;
