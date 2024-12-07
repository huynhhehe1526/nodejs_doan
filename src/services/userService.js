require("dotenv").config();
const User = require("../models/user");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require("jsonwebtoken");


const createUserService = async (username, email, password) => {
    try {
        const hashPassword = await bcrypt.hash(password, saltRounds);
        let result = await User.create({
            username: username,
            email: email,
            password: hashPassword,
            role: "User"
        })
        return result;

    } catch (error) {
        console.log(error);
        return null;
    }
}


const handleLoginService = async (inputEmail, password) => {
    try {
        const user = await User.findOne({
            email: inputEmail
        });
        if (user) {
            const isComparePassword = await bcrypt.compare(password, user.password);
            if (!isComparePassword) {
                return {
                    error: 2,
                    message: "Password không hợp lệ"
                }
            } else {
                const payload = {
                    email: user.email,
                    username: user.username
                }
                const accessToken = jwt.sign(
                    payload,
                    process.env.JWT_SECRETKEY,
                    {
                        expiresIn: process.env.JWT_EXPIRE
                    }

                )
                return {
                    error: 0,
                    message: "Đăng nhập thành công !!!",
                    accessToken,
                    user: {
                        email: user.email,
                        username: user.username
                    }
                }
            }
        } else {
            return {
                error: 1,
                message: "Email / Password không hợp lệ"
            }
        }

    } catch (error) {
        console.log(error);
        return null;
    }
}





module.exports = {
    createUserService,
    handleLoginService
}