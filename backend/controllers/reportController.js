const MonthlyReport = require('../models/MonthlyReport');
const Habit = require('../models/Habit');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { generateMonthlySummary } = require('../services/geminiService');
const { generateReportForUser } = require('../jobs/monthlyReportJob');

exports.getReports = async (req, res) => {
    try {
        const reports = await MonthlyReport
            .find({ userId: req.user.id })
            .sort({ year: -1, month: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getReport = async (req, res) => {
    try {
        const { month, year } = req.params;
        const report = await MonthlyReport.findOne({
            userId: req.user.id,
            month: Number(month),
            year: Number(year),
        });
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.triggerReport = async (req, res) => {
    try {
        const { month, year } = req.body;
        const user = await User.findById(req.user.id);
        await generateReportForUser(user, Number(month), Number(year));
        const report = await MonthlyReport.findOne({
            userId: req.user.id,
            month: Number(month),
            year: Number(year),
        });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── NEW: regenerate only the AI summary ───────────────────────────────────
exports.regenerateAI = async (req, res) => {
    try {
        const { month, year } = req.body;

        const report = await MonthlyReport.findOne({
            userId: req.user.id,
            month: Number(month),
            year: Number(year),
        });

        if (!report) return res.status(404).json({ message: 'Report not found. Generate the report first.' });

        const user = await User.findById(req.user.id);

        // Rebuild summary data from stored report fields
        const summaryData = {
            userName: user.name,
            month: Number(month) + 1,
            year: Number(year),
            expenses: {
                total: report.expenses?.total || 0,
                byCategory: report.expenses?.byCategory || {},
                prevMonthTotal: report.expenses?.prevMonthTotal || 0,
                percentChange: report.expenses?.percentChange || 0,
            },
            habits: {
                totalCompletions: report.habits?.totalCompletions || 0,
                topHabit: report.habits?.topHabit || '',
                averageStreak: report.habits?.averageStreak || 0,
                longestStreak: report.habits?.longestStreak || 0,
            },
            goals: {
                completed: report.goals?.completed || 0,
                inProgress: report.goals?.inProgress || 0,
                averageProgress: report.goals?.averageProgress || 0,
            },
        };

        const aiSummary = await generateMonthlySummary(summaryData);

        report.aiSummary = aiSummary;
        await report.save();

        res.json({ aiSummary });
    } catch (err) {
        console.error('AI regeneration error:', err.message);
        res.status(500).json({ message: 'AI regeneration failed. Check your Gemini API key.' });
    }
};