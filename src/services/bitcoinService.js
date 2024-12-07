require("dotenv").config();
const GuessBitcoin = require("../models/guess_bitcoin");
const Result = require("../models/result");
const Reward = require("../models/reward");
const Job = require("../models/job");
var CryptoJS = require("crypto-js");

// const generateRandomString = (length) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//         result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return result;
// };


//rs cho hàm gethandleguess
const handleguessBitcoinService = async (guessData) => {
    try {
        const filter = {
            bank_account: guessData.bank_account,
            bitcoin_wallet: guessData.bitcoin_wallet,
        };

        const existingRecord = await GuessBitcoin.findOne(filter);

        if (existingRecord) {
            if (!guessData.bitcoin && !guessData.predicted_price) {
                return {
                    message: "Ví đã kết nối",
                    totalBalance: existingRecord.totalBalance,
                    data: existingRecord,
                };
            }

            const bitcoin = Number(guessData.bitcoin);
            const predictedPrice = Number(guessData.predicted_price);

            if (isNaN(bitcoin) || isNaN(predictedPrice)) {
                return {
                    error: 400,
                    message: "Giá trị bitcoin hoặc predicted_price không hợp lệ",
                    dulieumoi: guessData,
                };
            }

            const isDuplicate =
                existingRecord.bitcoin === bitcoin &&
                existingRecord.predicted_price === predictedPrice;

            if (isDuplicate) {
                return {
                    error: 1,
                    message: "Dữ liệu đã tồn tại",
                    data: existingRecord,
                    dulieumoi: guessData,
                };
            } else {
                if (
                    (existingRecord.bitcoin === 0 && existingRecord.predicted_price === 0) ||
                    existingRecord.bitcoin !== bitcoin ||
                    existingRecord.predicted_price !== predictedPrice
                ) {
                    if (bitcoin > existingRecord.totalBalance) {
                        return {
                            error: 2,
                            message: "Số dư không đủ",
                            data: existingRecord,
                            dulieumoi: guessData,
                        };
                    }

                    existingRecord.bitcoin += bitcoin;
                    existingRecord.predicted_price = predictedPrice;
                    existingRecord.totalBalance -= bitcoin;

                    // Lưu với thời gian GMT+7
                    const gmt7Date = new Date();
                    gmt7Date.setHours(gmt7Date.getHours() + 7);
                    existingRecord.created_at = gmt7Date;

                    await existingRecord.save();

                    return {
                        message: "Cập nhật thành công",
                        data: existingRecord,
                        dulieumoi: guessData,
                    };
                }
            }
        } else {
            const randomTotalBalance =
                Math.floor(Math.random() * (9000000000 - 10000 + 1)) + 10000;

            const bitcoin = Number(guessData.bitcoin || 0);
            const predictedPrice = Number(guessData.predicted_price || 0);

            // Tạo với thời gian GMT+7
            const gmt7Date = new Date();
            gmt7Date.setHours(gmt7Date.getHours() + 7);

            const newGuess = new GuessBitcoin({
                ...guessData,
                bitcoin: bitcoin,
                predicted_price: predictedPrice,
                totalBalance: randomTotalBalance,
                created_at: gmt7Date,
            });

            await newGuess.save();

            return {
                message: "Tạo mới thành công",
                totalBalance: randomTotalBalance,
                data: newGuess,
            };
        }
    } catch (error) {
        console.log("Check error handleguessBitcoinService:", error);
        return { error: 500, message: "Internal Server Error" };
    }
};


const hashWallet = (wallet) => {
    return CryptoJS.SHA256(wallet).toString(CryptoJS.enc.Base64);
};

//rs cho việc chuyển đổi bitcoin sang 12 ký tụ
// const handleguessBitcoinService = async (guessData) => {
//     try {
//         if (!guessData || !guessData.bitcoin_wallet || !guessData.bank_account) {
//             return {
//                 error: 1,
//                 message: "Vui lòng cung cấp đầy đủ thông tin ví và tài khoản ngân hàng"
//             };
//         }
//         else {
//             const encryptedBitcoinWallet = hashWallet(guessData.bitcoin_wallet);
//             console.log("Check encrypt: bitcoin_wallet : ", encryptedBitcoinWallet)
//             const filter = {
//                 bitcoin_wallet: encryptedBitcoinWallet,
//                 bank_account: guessData.bank_account,
//             };
//             const existingRecord = await GuessBitcoin.findOne(filter);
//             console.log("Check dữ liệu đã tồn tại: ", existingRecord);
//             console.log("Check bitcoin_wallet encrypt: ", encryptedBitcoinWallet);
//             if (existingRecord) {
//                 if (existingRecord.bitcoin_wallet === encryptedBitcoinWallet && existingRecord.bank_account === guessData.bank_account) {
//                     if (!guessData.bitcoin && !guessData.predicted_price) {
//                         return {
//                             message: "Ví đã kết nối",
//                             totalBalance: existingRecord.totalBalance,
//                             data: existingRecord,
//                         };
//                     }
//                     const bitcoin = Number(guessData.bitcoin);
//                     const predictedPrice = Number(guessData.predicted_price);
//                     if (isNaN(bitcoin) || isNaN(predictedPrice)) {
//                         return {
//                             error: 400,
//                             message: "Giá trị bitcoin hoặc predicted_price không hợp lệ",
//                             dulieumoi: guessData,
//                         };
//                     }
//                     const isDuplicate = existingRecord.bitcoin === bitcoin && existingRecord.predicted_price === predictedPrice;
//                     if (isDuplicate) {
//                         return {
//                             error: 1,
//                             message: "Dữ liệu đã tồn tại",
//                             data: existingRecord,
//                             dulieumoi: guessData,
//                         };
//                     } else {
//                         if (
//                             (existingRecord.bitcoin === 0 && existingRecord.predicted_price === 0) ||
//                             existingRecord.bitcoin !== bitcoin ||
//                             existingRecord.predicted_price !== predictedPrice
//                         ) {
//                             if (bitcoin > existingRecord.totalBalance) {
//                                 return {
//                                     error: 2,
//                                     message: "Số dư không đủ",
//                                     data: existingRecord,
//                                     dulieumoi: guessData,
//                                 };
//                             }
//                             existingRecord.bitcoin += bitcoin;
//                             existingRecord.predicted_price = predictedPrice;
//                             existingRecord.totalBalance -= bitcoin;
//                             const gmt7Date = new Date();
//                             gmt7Date.setHours(gmt7Date.getHours() + 7);
//                             existingRecord.created_at = gmt7Date;
//                             await existingRecord.save();
//                             return {
//                                 message: "Cập nhật thành công",
//                                 data: existingRecord,
//                                 dulieumoi: guessData,
//                             };
//                         }
//                     }
//                 }
//             } else {
//                 const randomTotalBalance =
//                     Math.floor(Math.random() * (9000000000 - 10000 + 1)) + 10000;

//                 const bitcoin = Number(guessData.bitcoin || 0);
//                 const predictedPrice = Number(guessData.predicted_price || 0);

//                 // Tạo thời gian GMT+7
//                 const gmt7Date = new Date();
//                 gmt7Date.setHours(gmt7Date.getHours() + 7);

//                 const newGuess = new GuessBitcoin({
//                     bitcoin_wallet: encryptedBitcoinWallet,
//                     bank_account: guessData.bank_account,
//                     bitcoin: bitcoin,
//                     predicted_price: predictedPrice,
//                     totalBalance: randomTotalBalance,
//                     created_at: gmt7Date,
//                 });

//                 await newGuess.save();

//                 return {
//                     message: "Tạo mới thành công",
//                     totalBalance: randomTotalBalance,
//                     data: newGuess,
//                 };
//             }
//         }
//         // Mã hóa bitcoin_wallet và bank_account trước khi lưu trữ

//     } catch (error) {
//         console.log("Check error handleguessBitcoinService:", error);
//         return { error: 500, message: "Internal Server Error" };
//     }
// };









//check tiếp

// const getResultWinnerService = async (actualPrice, deviationThreshold, limit) => {
//     try {
//         // Lấy thời gian hiện tại và đặt về đầu ngày GMT+7
//         const currentDate = new Date();
//         currentDate.setHours(currentDate.getHours() + 7, 0, 0, 0);

//         const startOfDayGMT7 = currentDate;
//         const endOfDayGMT7 = new Date(currentDate);
//         endOfDayGMT7.setHours(23, 59, 59, 999);

//         console.log("Ngày kiểm tra (GMT+7): ", startOfDayGMT7);

//         const existingResult = await Result.findOne({
//             datePredicted: { $gte: startOfDayGMT7, $lt: endOfDayGMT7 },
//         });

//         if (existingResult) {
//             console.log(
//                 `Đã có kết quả cho ngày ${startOfDayGMT7.toISOString().split('T')[0]} trong database:`,
//                 existingResult
//             );
//             return existingResult;
//         }

//         const results = await GuessBitcoin.aggregate([
//             {
//                 $addFields: {
//                     deviation: {
//                         $abs: {
//                             $subtract: ["$predicted_price", actualPrice],
//                         },
//                     },
//                     actualPrice,
//                 },
//             },
//             {
//                 $match: {
//                     deviation: { $lte: deviationThreshold },
//                     created_at: { $gte: startOfDayGMT7, $lt: endOfDayGMT7 },
//                 },
//             },
//             {
//                 $sort: { deviation: 1, created_at: 1 },
//             },
//         ]);

//         const topResults = results.slice(0, limit);

//         if (topResults.length > 0) {
//             const winner = topResults[0];

//             const createdAtGMT7 = new Date();
//             createdAtGMT7.setHours(createdAtGMT7.getHours() + 7);

//             const saveResult = new Result({
//                 winnerId: winner._id,
//                 deviation: winner.deviation,
//                 actualPrice: actualPrice,
//                 datePredicted: winner.created_at, // Lưu giờ GMT+7
//                 created_at: createdAtGMT7, // Lưu thời gian tạo
//                 canPublish: false,
//             });

//             await saveResult.save();
//             const previousDate = new Date(currentDate);
//             previousDate.setDate(previousDate.getDate() - 1);

//             const previousResult = await Result.findOne({
//                 datePredicted: { $gte: previousDate, $lt: currentDate },
//                 canPublish: true,
//             });

//             if (previousResult) {
//                 await Result.updateOne(
//                     { winnerId: previousResult.winnerId },
//                     { $set: { canPublish: false } }
//                 );
//                 console.log("Đã gán canPublish của người thắng hôm qua về false.");
//             }
//             return saveResult;
//         } else {
//             console.log(`Không có kết quả nào hợp lệ cho ngày ${startOfDayGMT7.toISOString().split('T')[0]}.`);
//             return null;
//         }
//     } catch (error) {
//         throw new Error("Lỗi khi tính toán kết quả!");
//     }
// };


//check tiếp 
const getResultWinnerService = async (actualPrice, deviationThreshold, limit) => {
    try {
        // Dùng thời gian GMT+7
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);
        const startOfDayGMT7 = new Date(currentDate.getTime() + 7 * 60 * 60 * 1000);
        const endOfDayGMT7 = new Date(startOfDayGMT7.getTime() + 24 * 60 * 60 * 1000 - 1);

        console.log("Ngày kiểm tra (GMT+7): ", startOfDayGMT7);

        const existingResult = await Result.findOne({
            datePredicted: { $gte: startOfDayGMT7, $lt: endOfDayGMT7 },
        });

        if (existingResult) {
            console.log(
                `Đã có kết quả cho ngày ${startOfDayGMT7.toISOString().split('T')[0]} trong database:`,
                existingResult
            );
            const previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);

            console.log("Check thông tin chiến thắng của ngày hôm qua: ", previousDate);
            console.log("Check thông tin chiến thắng của ngày hiện tại: ", currentDate)

            const previousResult = await Result.findOne({
                datePredicted: { $gte: previousDate, $lt: currentDate },
                canPublish: true,
            });

            if (previousResult) {
                await Result.updateOne(
                    { winnerId: previousResult.winnerId },
                    { $set: { canPublish: false } }
                );
                console.log("Đã gán canPublish của người thắng hôm qua về false.");
            }
            return existingResult;
        }

        const results = await GuessBitcoin.aggregate([
            {
                $addFields: {
                    deviation: {
                        $abs: {
                            $subtract: ["$predicted_price", actualPrice],
                        },
                    },
                },
            },
            {
                $match: {
                    deviation: { $lte: deviationThreshold },
                    created_at: { $gte: startOfDayGMT7, $lt: endOfDayGMT7 },
                },
            },
            {
                $sort: { deviation: 1, created_at: 1 },
            },
        ]);

        const topResults = results.slice(0, limit);

        if (topResults.length > 0) {
            const winner = topResults[0];

            const createdAtGMT7 = new Date();
            createdAtGMT7.setHours(createdAtGMT7.getHours() + 7);

            const saveResult = new Result({
                winnerId: winner._id,
                deviation: winner.deviation,
                actualPrice: actualPrice,
                datePredicted: winner.created_at,
                created_at: createdAtGMT7,
                canPublish: false,
            });

            await saveResult.save();
            const previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);

            console.log("Check thông tin chiến thắng của ngày hôm qua: ", previousDate);
            console.log("Check thông tin chiến thắng của ngày hiện tại: ", currentDate)

            const previousResult = await Result.findOne({
                datePredicted: { $gte: previousDate, $lt: currentDate },
                canPublish: true,
            });

            if (previousResult) {
                await Result.updateOne(
                    { winnerId: previousResult.winnerId },
                    { $set: { canPublish: false } }
                );
                console.log("Đã gán canPublish của người thắng hôm qua về false.");
            }
            return saveResult;
        } else {
            console.log(`Không có kết quả nào hợp lệ cho ngày ${startOfDayGMT7.toISOString().split('T')[0]}.`);
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi tính toán kết quả:", error.message);
        throw new Error("Lỗi khi tính toán kết quả!");
    }
};

//gốc nè
// const getRewardService = async (winnerId) => {
//     try {
//         const findWinner_Reward = await Result.findOne({ winnerId: winnerId });
//         const invest_bitcoin = await GuessBitcoin.findOne({ _id: winnerId });

//         console.log("Check lấy thông tin người chiến thắng để nhận thưởng: ", findWinner_Reward);
//         console.log("Check lấy thông tin số bitcoin đầu tư: ", invest_bitcoin.bitcoin);
//         if (!findWinner_Reward || !invest_bitcoin) {
//             throw new Error("Không tìm thấy thông tin người chiến thắng hoặc dữ liệu dự đoán bitcoin.");
//         }
//         const existingReward = await Reward.findOne({ winnerId: winnerId });
//         if (existingReward) {
//             return { rewardAmount: existingReward.reward_balance };
//         }
//         let rewardPercentage = 0;
//         let rewardAmount = 0;
//         if (findWinner_Reward.deviation >= 900 && findWinner_Reward.deviation <= 1000) {
//             rewardPercentage = 0.10; // 10% => between 900-1000
//         } else if (findWinner_Reward.deviation >= 700 && findWinner_Reward.deviation <= 800) {
//             rewardPercentage = 0.15; // 15% => between 700-800
//         } else if (findWinner_Reward.deviation >= 400 && findWinner_Reward.deviation <= 600) {
//             rewardPercentage = 0.20; // 20% => between 400-600
//         } else if (findWinner_Reward.deviation >= 100 && findWinner_Reward.deviation <= 300) {
//             rewardPercentage = 0.30; // 30% => between 100-300
//         } else {
//             rewardPercentage = 0.40;
//         }
//         rewardAmount = invest_bitcoin.bitcoin * rewardPercentage;
//         const winnerId_reward = new Reward({
//             winnerId: findWinner_Reward.winnerId,
//             reward_balance: rewardAmount,
//             status: true
//         });
//         await winnerId_reward.save();
//         await GuessBitcoin.updateOne(
//             { _id: winnerId },
//             { $inc: { totalBalance: rewardAmount } }
//         );
//         return { rewardAmount };
//     } catch (error) {
//         throw new Error(error.message || "Lỗi khi cập nhật phần thưởng!");
//     }
// };





//chỉnh sửa get reward + job

const getRewardService = async (winnerId, jobId, answer) => {
    try {
        // Tìm thông tin người chiến thắng
        const findWinner_Reward = await Result.findOne({ winnerId });
        const invest_bitcoin = await GuessBitcoin.findOne({ _id: winnerId });

        if (!findWinner_Reward || !invest_bitcoin) {
            return { error: 1, message: "Không tìm thấy thông tin người chiến thắng hoặc dữ liệu dự đoán bitcoin." };
        }

        // Tìm công việc và kiểm tra trạng thái công việc
        const job = await Job.findOne({ _id: jobId });
        if (!job) return { error: 2, message: "Không tìm thấy công việc." };
        if (job.isCompleted) return { error: 3, message: "Công việc này đã hoàn thành." };

        // **Kiểm tra điều kiện trả lời đúng câu hỏi**
        let additionalReward = 0;
        if (job.correctAnswer.toLowerCase() === answer.toLowerCase()) {
            additionalReward = job.rewardAmount;

            // Cập nhật trạng thái công việc là đã hoàn thành
            job.isCompleted = true;
            await job.save();

            // Lưu thông tin jobId và trạng thái isComplete vào Result
            findWinner_Reward.jobId = jobId;
            findWinner_Reward.isCompleted = true;
            await findWinner_Reward.save();

        } else {
            return { error: 4, message: "Trả lời không chính xác, không được nhận thưởng." };
        }

        // Tính phần thưởng cơ bản dựa vào phần trăm lệch dự đoán Bitcoin
        let rewardPercentage = 0;

        if (findWinner_Reward.deviation >= 900 && findWinner_Reward.deviation <= 1000) {
            rewardPercentage = 0.10;
        } else if (findWinner_Reward.deviation >= 700 && findWinner_Reward.deviation <= 800) {
            rewardPercentage = 0.15;
        } else if (findWinner_Reward.deviation >= 400 && findWinner_Reward.deviation <= 600) {
            rewardPercentage = 0.20;
        } else if (findWinner_Reward.deviation >= 100 && findWinner_Reward.deviation <= 300) {
            rewardPercentage = 0.30;
        } else {
            rewardPercentage = 0.40;
        }

        const rewardAmount = invest_bitcoin.bitcoin * rewardPercentage + additionalReward;

        // Cập nhật Reward
        const existingReward = await Reward.findOne({ winnerId });
        if (existingReward) {
            existingReward.reward_balance += rewardAmount;
            existingReward.status = true;
            await existingReward.save();
        } else {
            const newReward = new Reward({
                winnerId: findWinner_Reward.winnerId,
                reward_balance: rewardAmount,
                status: true,
            });
            await newReward.save();
        }

        // Cộng tổng số dư người chơi
        await GuessBitcoin.updateOne(
            { _id: winnerId },
            { $inc: { totalBalance: rewardAmount } }
        );

        return { error: 0, message: "Phần thưởng đã được cập nhật thành công!", rewardAmount };
    } catch (error) {
        return { error: -1, message: error.message || "Lỗi khi cập nhật phần thưởng!" };
    }
};



//gốc
// const checkPreviousWinnerService = async (userId) => {
//     const currentDate = new Date();

//     const previousDate = new Date(currentDate);
//     previousDate.setDate(previousDate.getDate() - 1);

//     console.log("Check người chiến thắng hôm trước");
//     console.log("Check ngày hôm trước là ngày: ", previousDate);
//     console.log("Check ngày hiện tại là ngày: ", currentDate);

//     // Tìm kết quả của ngày hôm trước
//     const previousResult = await Result.findOne({
//         datePredicted: { $gte: previousDate, $lt: currentDate },
//     });

//     if (previousResult) {
//         console.log("Người thắng ngày hôm trước:", previousResult);
//         if (userId && previousResult.winnerId.toString() === userId.toString()) {
//             console.log("Người dùng này là người thắng cuộc ngày hôm trước.");

//             // Update canPublish to true
//             const updateResult = await Result.updateOne(
//                 { winnerId: previousResult.winnerId }, // Filter by the result ID
//                 { $set: { canPublish: true } } // Update canPublish to true
//             );

//             console.log("Cập nhật canPublish:", updateResult);
//             return ({
//                 error: 0,
//                 message: "Bạn có quyền công bố"
//             })
//         } else {
//             console.log("Người dùng này không phải người thắng ngày hôm trước.");
//             // return false;
//             return ({
//                 error: 1,
//                 message: "Bạn không được phép công bố"
//             })
//         }
//     }

//     console.log("Không tìm thấy kết quả của ngày hôm trước.");
//     return false;
// };
//copy
const checkPreviousWinnerService = async (userId) => {
    const currentDate = new Date();
    const previousDate = new Date();
    previousDate.setDate(currentDate.getDate() - 1);

    // Chuyển về UTC
    const startOfPreviousDate = new Date(previousDate.toISOString().split("T")[0] + "T00:00:00Z");
    const endOfPreviousDate = new Date(previousDate.toISOString().split("T")[0] + "T23:59:59Z");

    console.log("Check ngày hôm trước là ngày (UTC): ", startOfPreviousDate);
    console.log("Check ngày hiện tại là ngày (UTC): ", endOfPreviousDate);

    // Tìm kết quả của ngày hôm trước
    const previousResult = await Result.findOne({
        datePredicted: { $gte: startOfPreviousDate, $lt: endOfPreviousDate },
    });

    if (previousResult) {
        console.log("Người thắng ngày hôm trước:", previousResult);
        if (userId && previousResult.winnerId.toString() === userId.toString()) {
            console.log("Người dùng này là người thắng cuộc ngày hôm trước.");

            // Update canPublish to true
            const updateResult = await Result.updateOne(
                { winnerId: previousResult.winnerId }, // Filter by the result ID
                { $set: { canPublish: true } } // Update canPublish to true
            );

            console.log("Cập nhật canPublish:", updateResult);
            return {
                error: 0,
                message: "Bạn có quyền công bố",
            };
        } else {
            console.log("Người dùng này không phải người thắng ngày hôm trước.");
            return {
                error: 1,
                message: "Bạn không được phép công bố",
            };
        }
    }

    console.log("Không tìm thấy kết quả của ngày hôm trước.");
    return {
        error: 1,
        message: "Không tìm thấy kết quả ngày hôm trước",
    };
};


//select job

const selectJobService = async (winnerId, jobId) => {
    try {
        let result;
        if (jobId) {
            const job = await Job.findById(jobId);
            if (!job) {
                throw new Error('Không tìm thấy công việc');
            }

            result = await Result.findOneAndUpdate(
                { winnerId: winnerId },
                { jobId: jobId },
                { new: true, upsert: true }
            );
        } else {
            result = await Result.findOneAndUpdate(
                { winnerId: winnerId },
                {},
                { new: true, upsert: true }
            );
        }
        return result;
    } catch (error) {
        throw new Error('Không thể chọn công việc: ' + error.message);
    }
};




module.exports = {
    handleguessBitcoinService,
    getResultWinnerService,
    getRewardService,
    checkPreviousWinnerService,
    selectJobService
}