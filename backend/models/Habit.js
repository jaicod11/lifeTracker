const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    completedDates: [{ type: Date }],
    icon: { type: String, default: 'check_circle' }, // ← NEW: material symbol name
    color: { type: String, default: '#005157' },
}, { timestamps: true });

habitSchema.virtual('currentStreak').get(function () {
    if (!this.completedDates || this.completedDates.length === 0) return 0;

    const unique = [...new Set(
        this.completedDates.map(d => {
            const n = new Date(d); n.setHours(0, 0, 0, 0); return n.getTime();
        })
    )].sort((a, b) => b - a);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const mostRecent = new Date(unique[0]);

    if (
        mostRecent.getTime() !== today.getTime() &&
        mostRecent.getTime() !== yesterday.getTime()
    ) return 0;

    let streak = 0, expected = mostRecent;
    for (const ts of unique) {
        const d = new Date(ts);
        if (d.getTime() === expected.getTime()) {
            streak++;
            const prev = new Date(expected);
            prev.setDate(expected.getDate() - 1);
            expected = prev;
        } else break;
    }
    return streak;
});

habitSchema.virtual('longestStreak').get(function () {
    if (!this.completedDates || this.completedDates.length === 0) return 0;
    const unique = [...new Set(
        this.completedDates.map(d => {
            const n = new Date(d); n.setHours(0, 0, 0, 0); return n.getTime();
        })
    )].sort((a, b) => a - b);

    let longest = 1, current = 1;
    for (let i = 1; i < unique.length; i++) {
        const diff = (unique[i] - unique[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) { current++; longest = Math.max(longest, current); }
        else current = 1;
    }
    return longest;
});

habitSchema.virtual('weeklyRate').get(function () {
    if (!this.completedDates || this.completedDates.length === 0) return 0;
    const fourWeeksAgo = new Date(); fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recent = this.completedDates.filter(d => new Date(d) >= fourWeeksAgo);
    return Math.round((recent.length / 28) * 100);
});

habitSchema.set('toJSON', { virtuals: true });
habitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Habit', habitSchema);