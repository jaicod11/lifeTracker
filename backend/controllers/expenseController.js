const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
    const { month, year } = req.query;
    const filter = { userId: req.user.id };
    if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        filter.date = { $gte: start, $lte: end };
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
};

exports.createExpense = async (req, res) => {
    const expense = await Expense.create({ ...req.body, userId: req.user.id });
    res.status(201).json(expense);
};

exports.updateExpense = async (req, res) => {
    const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json(expense);
};

exports.deleteExpense = async (req, res) => {
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
};