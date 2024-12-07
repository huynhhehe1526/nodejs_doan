const { handleguessBitcoinService,
  getResultWinnerService, getRewardService,
  checkPreviousWinnerService, selectJobService
} = require("../services/bitcoinService")

const actualPrice = 30000;
const deviationThreshold = 1000;
const limit = 1;
const handleguessBitcoin = async (req, res) => {
  console.log("Check req.body: ", req.body)
  try {
    const result = await handleguessBitcoinService(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};


const checkPreviousWinner = async (req, res) => {
  const { userId } = req.body;
  try {
    const isPreviousWinnerAllowedToPublish = await checkPreviousWinnerService(userId);

    return res.status(200).send(
      {
        isPreviousWinnerAllowedToPublish,
      }
    )
  } catch (error) {
    console.error("Lỗi khi công bố kết quả:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình công bố kết quả." });
  }
};



const findWinner = async (req, res) => {
  try {

    const winner = await getResultWinnerService(actualPrice, deviationThreshold, limit);

    if (winner) {
      res.status(200).send({
        message: "Người chiến thắng được tìm thấy!",
        winner,
      });
    } else {
      res.status(200).send({
        message: "Không có người chiến thắng trong lần này.",
      });
    }

  } catch (error) {
    res.status(500).send({
      error: error.message || "Lỗi khi tính toán kết quả!",
    });
  }
};


//gốc
// const getReward = async (req, res) => {
//   try {
//     const winner = await getResultWinnerService(actualPrice, deviationThreshold, limit);
//     console.log("Check id winner:", winner);
//     const currentDate = new Date();
//     console.log("Check current date getReward: ", currentDate);

//     if (!winner.winnerId) {
//       return res.status(400).send({
//         error: "Không tìm thấy người chiến thắng!",
//       });
//     }

//     const rewardResult = await getRewardService(winner.winnerId);

//     return res.status(200).send({
//       message: `Phần thưởng đã được trao! Chúc mừng bạn nhận được ${rewardResult.rewardAmount} USD vào tài khoản!`,
//       user: rewardResult,
//     });
//   } catch (error) {
//     console.error("Lỗi trong hàm getReward: ", error);
//     if (!res.headersSent) {
//       return res.status(500).send({
//         error: error.message || "Lỗi khi trao thưởng!",
//       });
//     }
//   }
// };


//chỉnh sửa
const getReward = async (req, res) => {
  try {
    const { actualPrice, deviationThreshold, limit, jobId, answer } = req.body; // Lấy dữ liệu từ body request

    // Lấy thông tin người chiến thắng
    const winner = await getResultWinnerService(actualPrice, deviationThreshold, limit);
    console.log("Check id winner:", winner);
    const currentDate = new Date();
    console.log("Check current date getReward: ", currentDate);

    // Kiểm tra xem có người chiến thắng không
    if (!winner || !winner.winnerId) {
      return res.status(404).send({
        error: "Không tìm thấy người chiến thắng!",
      });
    }

    // Trao thưởng cho người chiến thắng
    const rewardResult = await getRewardService(winner.winnerId, jobId, answer);

    return res.status(200).send({
      // message: `Phần thưởng đã được trao! Chúc mừng bạn nhận được ${rewardResult.rewardAmount} USD (bao gồm ${rewardResult.additionalReward} USD từ câu trả lời đúng) vào tài khoản!`,
      rewardDetails: rewardResult,
    });
  } catch (error) {
    console.error("Lỗi trong hàm getReward: ", error);

    // Xử lý lỗi chung và đảm bảo không bị lỗi gửi lại response nhiều lần
    if (!res.headersSent) {
      return res.status(500).send({
        error: error.message || "Lỗi khi trao thưởng!",
      });
    }
  }
};


//select job
const selectJob = async (req, res) => {
  try {
    const { winnerId, jobId } = req.body;  // Lấy thông tin từ request body
    const result = await selectJobService(winnerId, jobId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



module.exports = {
  handleguessBitcoin, findWinner, getReward,
  checkPreviousWinner, selectJob
}