const GuessBitcoin = require('../models/guess_bitcoin'); // Đường dẫn đúng
const bip39 = require('bip39');
const crypto = require('crypto');

// Tạo ví mới
exports.createWallet = async (req, res) => {
    try {
        const { bank_account } = req.body;

        const existingAccount = await GuessBitcoin.findOne({ bank_account });
        if (existingAccount) {
            return res.status(400).json({ message: "Tài khoản ngân hàng đã được sử dụng" });
        }

        const mnemonic = bip39.generateMnemonic();
        const bitcoinWallet = generateBitcoinWallet();
        const randomTotalBalance = Math.floor(Math.random() * (10000000 - 1000 + 1)) + 1000;

        const newWallet = new GuessBitcoin({
            bitcoin_wallet: bitcoinWallet,
            bank_account,
            mnemonic,
            totalBalance: randomTotalBalance,
            

            // Không thêm wallet_status
        });

        await newWallet.save();

        res.status(201).json({
            message: "Tạo ví Bitcoin thành công",
            wallet: {
                bitcoin_wallet: newWallet.bitcoin_wallet,
                bank_account: newWallet.bank_account,
                totalBalance: newWallet.totalBalance,
                mnemonic,
            },
        });
    } catch (error) {
        console.error("Error in createWallet:", error);
        res.status(500).json({ message: "Lỗi tạo ví", error: error.message });
    }
};

// Kết nối ví
exports.connectWallet = async (req, res) => {
    try {
        const { bitcoin_wallet, bank_account, mnemonic } = req.body;

        if (!bip39.validateMnemonic(mnemonic)) {
            return res.status(400).json({ message: "Seed phrase không hợp lệ" });
        }

        const wallet = await GuessBitcoin.findOne({ bitcoin_wallet });
        if (!wallet) {
            return res.status(404).json({ message: "Ví không tồn tại" });
        }

        // Không cần kiểm tra wallet_status nữa

        wallet.bank_account = bank_account;
        wallet.last_connected = new Date();
        await wallet.save();

        res.status(200).json({
            message: "Kết nối ví thành công",
            wallet: {
                bitcoin_wallet: wallet.bitcoin_wallet,
                bank_account: wallet.bank_account,
                totalBalance: wallet.totalBalance,
            },
        });
    } catch (error) {
        console.error("Error in connectWallet:", error);
        res.status(500).json({ message: "Lỗi kết nối ví", error: error.message });
    }
};

// Hàm sinh địa chỉ ví Bitcoin ngẫu nhiên
function generateBitcoinWallet() {
    const randomBytes = crypto.randomBytes(20);
    return '1' + randomBytes.toString('hex').slice(0, 33);
}
