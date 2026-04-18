const mongoose = require('mongoose');

const monthlyReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    expenses: {
        total: Number,
        byCategory: mongoose.Schema.Types.Mixed,
        prevMonthTotal: Number,
        percentChange: Number,
    },
    habits: {
        totalCompletions: Number,
        topHabit: String,
        averageStreak: Number,
        longestStreak: Number,   // ← NEW
    },
    goals: {
        completed: Number,
        inProgress: Number,
        averageProgress: Number,
    },
    aiSummary: String,
    generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

monthlyReportSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyReport', monthlyReportSchema);