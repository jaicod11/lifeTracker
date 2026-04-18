const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getGoals, createGoal, updateGoal, updateProgress, deleteGoal,
} = require('../controllers/goalController');

router.use(protect);
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.patch('/:id/progress', updateProgress);
router.delete('/:id', deleteGoal);

module.exports = router;