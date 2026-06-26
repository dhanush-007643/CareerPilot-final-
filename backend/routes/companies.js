// ═══════════════════════════════════════════════════════════════════════════
// Companies Routes — Explore / Discovery
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { getAllCompanies } = require('../controllers/companyController');

// GET /api/companies — List all companies (for Explore page)
router.get('/', protect, getAllCompanies);

module.exports = router;
