const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    winnerId: String,
    deviation: Number,
    actualPrice: Number,
    datePredicted: Date,
    canPublish: { type: Boolean, default: false },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    isCompleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const Result = mongoose.model('result', resultSchema);

module.exports = Result;