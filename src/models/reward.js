const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    winnerId: String,
    // bitcoin_wallet: String,
    // bank_account: String,
    reward_balance: { type: Number, default: 0 },
    status: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const Reward = mongoose.model('reward', rewardSchema);

module.exports = Reward;