const express = require('express');
const { createUser, handleLogin } = require('../controllers/userController');
const { handleguessBitcoin, findWinner, getReward, checkPreviousWinner } = require('../controllers/bitcoinController');
const { createJob, getListJob } = require('../controllers/jobController');
const { createWallet, connectWallet } = require('../controllers/walletController.jsx');

const routerAPI = express.Router();

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello word api");
});

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/guess_bitcoin", handleguessBitcoin);
routerAPI.get("/result", findWinner);
routerAPI.post("/reward", getReward);
routerAPI.post("/checkpreviouswinner", checkPreviousWinner);

// job chain
routerAPI.post("/create_job", createJob);
routerAPI.get("/getListJob", getListJob);

// Wallet APIs
routerAPI.post("/create_wallet", createWallet);
routerAPI.post("/connect_wallet", connectWallet);

module.exports = routerAPI;
