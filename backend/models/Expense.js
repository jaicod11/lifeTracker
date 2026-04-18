const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    category: {
        type: String,
        enum: ['food', 'transport', 'health', 'entertainment', 'shopping', 'utilities', 'other'],
        default: 'other',
    },
    note: String,
    date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);