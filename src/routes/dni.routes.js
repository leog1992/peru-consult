const { Router } = require('express');
const dniController = require('../controllers/dni.controller');
const { validateDniParam } = require('../middlewares/validateDocument');

const router = Router();

// GET /api/v1/dni/:dni
router.get('/:dni', validateDniParam, dniController.getDni);

module.exports = router;
