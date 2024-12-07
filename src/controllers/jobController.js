const { createJobService, getJobService } = require("../services/jobService")

const createJob = async (req, res) => {
    try {
        const jobData = req.body;
        const newJob = await createJobService(jobData);
        res.status(201).json(newJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getListJob = async (req, res) => {
    try {
        const job = await getJobService();
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createJob, getListJob
}