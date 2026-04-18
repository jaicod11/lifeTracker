const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    category: {
        type: String,
        enum: ['finance', 'health', 'learning', 'language', 'lifestyle', 'career', 'other'],
        default: 'other',
    },
    target: { type: Number, required: true, min: 1 },
    current: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: '' },
    deadline: Date,
    completed: { type: Boolean, default: false },
}, { timestamps: true });

goalSchema.virtual('progressPercent').get(function () {
    if (!this.target || this.target === 0) return 0;
    return Math.min(100, Math.round((this.current / this.target) * 100));
});

goalSchema.virtual('daysLeft').get(function () {
    if (!this.deadline) return null;
    return Math.ceil((new Date(this.deadline) - new Date()) / (1000 * 60 * 60 * 24));
});

goalSchema.virtual('isOverdue').get(function () {
    if (!this.deadline) return false;
    return new Date(this.deadline) < new Date() && !this.completed;
});

goalSchema.pre('save', function (next) {
    if (this.current >= this.target) this.completed = true;
    next();
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);