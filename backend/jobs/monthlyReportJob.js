const cron = require('node-cron');
const User = require('../models/User');
const Habit = require('../models/Habit');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const MonthlyReport = require('../models/MonthlyReport');
const { generateMonthlySummary } = require('../services/geminiService');

const generateReportForUser = async (user, month, year) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    // ── Expenses ──────────────────────────────────────────
    const expenses = await Expense.find({ userId: user._id, date: { $gte: start, $lte: end } });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});

    // Compare to previous month
    const prevStart = new Date(year, month - 1, 1);
    const prevEnd = new Date(year, month, 0, 23, 59, 59);
    const prevExpenses = await Expense.find({ userId: user._id, date: { $gte: prevStart, $lte: prevEnd } });
    const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
    const percentChange = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

    // ── Habits ────────────────────────────────────────────
    const habits = await Habit.find({ userId: user._id });
    let totalCompletions = 0;
    let topHabit = '';
    let maxCompletions = 0;

    for (const habit of habits) {
        const monthCompletions = habit.completedDates.filter(
            (d) => d >= start && d <= end
        ).length;
        totalCompletions += monthCompletions;
        if (monthCompletions > maxCompletions) {
            maxCompletions = monthCompletions;
            topHabit = habit.name;
        }
    }

    const averageStreak = habits.length
        ? Math.round(habits.reduce((s, h) => s + (h.currentStreak || 0), 0) / habits.length)
        : 0;

    const longestStreak = habits.length
        ? Math.max(...habits.map(h => h.longestStreak || 0))
        : 0;

    // ── Goals ─────────────────────────────────────────────
    const goals = await Goal.find({ userId: user._id });
    const completedGoals = goals.filter((g) => g.completed).length;
    const avgProgress = goals.length
        ? Math.round(goals.reduce((s, g) => s + g.progressPercent, 0) / goals.length)
        : 0;

    // ── AI Summary ────────────────────────────────────────
    const summaryData = {
        userName: user.name,
        month: month + 1,
        year,
        expenses: { total, byCategory, prevMonthTotal: prevTotal, percentChange },
        habits: { totalCompletions, topHabit, averageStreak, longestStreak }, // ← added longestStreak
        goals: { completed: completedGoals, inProgress: goals.length - completedGoals, averageProgress: avgProgress },
    };

    let aiSummary = '';
    try {
        aiSummary = await generateMonthlySummary(summaryData);
    } catch (err) {
        console.error('Gemini error for user', user._id, err.message);
        aiSummary = 'AI summary unavailable this month.';
    }

    // ── Save Report ───────────────────────────────────────
    await MonthlyReport.findOneAndUpdate(
        { userId: user._id, month, year },
        {
            expenses: { total, byCategory, prevMonthTotal: prevTotal, percentChange },
            habits: { totalCompletions, topHabit, averageStreak },
            goals: { completed: completedGoals, inProgress: goals.length - completedGoals, averageProgress: avgProgress },
            aiSummary,
            generatedAt: new Date(),
        },
        { upsert: true, new: true }
    );

    console.log(`Report saved for ${user.email} — ${month + 1}/${year}`);
};

// Run on the 1st of every month at midnight
cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly report generation...');
    const now = new Date();
    const month = now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1;
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const users = await User.find({});
    for (const user of users) {
        await generateReportForUser(user, month, year);
    }
});

module.exports = { generateReportForUser };