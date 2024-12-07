require("dotenv").config();
const Job = require("../models/job");



const createJobService = async (jobData) => {
    try {
        if (!jobData) {
            return ({
                error: -1,
                message: "Vui lòng nhập thông tin cho job"
            });
        }
        const job = new Job(jobData);
        await job.save();
        return job;
    } catch (error) {
        throw new Error('Không thể tạo công việc: ' + error.message);
    }
}


const getJobService = async () => {
    try {
        const arrJob = [];
        const job = await Job.find({
            isCompleted: false
        })
        arrJob.push(job);
        return arrJob;
    } catch (error) {
        throw new Error('Không thể tạo công việc: ' + error.message);
    }
}


module.exports = {
    createJobService, getJobService
}