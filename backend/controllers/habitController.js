const Habit = require('../models/Habit');

exports.getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createHabit = async (req, res) => {
    try {
        const habit = await Habit.create({ ...req.body, userId: req.user.id });
        res.status(201).json(habit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!habit) return res.status(404).json({ message: 'Not found' });
        res.json(habit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.markComplete = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
        if (!habit) return res.status(404).json({ message: 'Not found' });

        const alreadyDone = habit.completedDates.some(d => {
            const dd = new Date(d);
            dd.setHours(0, 0, 0, 0);
            return dd.getTime() === today.getTime();
        });

        if (alreadyDone) {
            return res.json(habit);
        }

        habit.completedDates.push(today);
        await habit.save();
        res.json(habit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.unmarkComplete = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
        if (!habit) return res.status(404).json({ message: 'Not found' });

        habit.completedDates = habit.completedDates.filter(d => {
            const dd = new Date(d);
            dd.setHours(0, 0, 0, 0);
            return dd.getTime() !== today.getTime();
        });

        await habit.save();
        res.json(habit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!habit) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};