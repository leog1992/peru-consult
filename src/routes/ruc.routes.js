const { Router } = require('express');
const rucController = require('../controllers/ruc.controller');
const { validateRucParam } = require('../middlewares/validateDocument');

const router = Router();

// GET /api/v1/ruc/:ruc
router.get('/:ruc', validateRucParam, rucController.getRuc);

module.exports = router;
