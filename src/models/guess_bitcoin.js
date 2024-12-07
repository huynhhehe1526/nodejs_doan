const mongoose = require('mongoose');

// Schema cho ví Bitcoin
const guessBitcoinSchema = new mongoose.Schema({
    bitcoin_wallet: { type: String, required: true },
    bank_account: { type: String, required: true },
    mnemonic: { type: String, required: true }, // 12 từ seed phrase
    totalBalance: { type: Number, default: 0 },
    bitcoin: { type: Number, default: 0 },
    predicted_price: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Đảm bảo ví và tài khoản là duy nhất
guessBitcoinSchema.index({ bitcoin_wallet: 1, bank_account: 1 }, { unique: true });

const GuessBitcoin = mongoose.model('GuessBitcoin', guessBitcoinSchema);

module.exports = GuessBitcoin;
