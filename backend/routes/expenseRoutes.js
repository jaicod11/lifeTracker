const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');

router.use(protect);
router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;