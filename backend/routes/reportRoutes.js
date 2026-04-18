const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getReports, getReport, triggerReport, regenerateAI,
} = require('../controllers/reportController');

router.use(protect);
router.get('/', getReports);
router.get('/:year/:month', getReport);
router.post('/generate', triggerReport);
router.post('/regenerate-ai', regenerateAI);

module.exports = router;