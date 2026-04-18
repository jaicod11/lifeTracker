const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getHabits, createHabit, updateHabit,
    markComplete, unmarkComplete, deleteHabit,
} = require('../controllers/habitController');

router.use(protect);
router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.patch('/:id/complete', markComplete);
router.patch('/:id/uncomplete', unmarkComplete);
router.delete('/:id', deleteHabit);

module.exports = router;