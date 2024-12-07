const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    question: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    rewardAmount: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.model('job', jobSchema);

module.exports = Job;
