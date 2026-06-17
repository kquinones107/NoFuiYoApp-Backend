const express = require('express');
const router = express.Router();
const requireClerkAuth = require('../middlewares/requireClerkAuth');

const {
  searchHomeByCode,
  sendNeighborRequest,
  getNeighborRequests,
  acceptNeighborRequest,
  rejectNeighborRequest,
  getNeighbors,
} = require('../controllers/neighborController');

router.get('/search/:code', requireClerkAuth, searchHomeByCode);
router.post('/request', requireClerkAuth, sendNeighborRequest);
router.get('/requests', requireClerkAuth, getNeighborRequests);
router.post('/requests/:requestId/accept', requireClerkAuth, acceptNeighborRequest);
router.post('/requests/:requestId/reject', requireClerkAuth, rejectNeighborRequest);
router.get('/', requireClerkAuth, getNeighbors);

module.exports = router;