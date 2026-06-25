const express = require("express");
const router = express.Router();
const { getTaxonomy, getAlgorithmDetails } = require("../controllers/dsaController");

// =========================================================================
// DSA ROUTES
// =========================================================================

/** GET /api/dsa/taxonomy — fetch the 10 major DSA categories */
router.get("/taxonomy", getTaxonomy);

/** GET /api/dsa/algo/:name — fetch specifics for an algorithm */
router.get("/algo/:name", getAlgorithmDetails);

module.exports = router;
