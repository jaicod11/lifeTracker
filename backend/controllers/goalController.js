const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const goal = await Goal.create({ ...req.body, userId: req.user.id });
        res.status(201).json(goal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json(goal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const { current } = req.body;
        if (current === undefined || current === null)
            return res.status(400).json({ message: 'current value is required' });

        const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        goal.current = Math.max(0, Number(current));
        await goal.save();

        res.json(goal);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};