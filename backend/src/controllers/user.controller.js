import httpStatus from "http-status";
import {User} from "../models/user.model.js";
import bcrypt, {hash} from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";  


const login = async (req,res) => {
    const {username, password} = req.body;
    if(!username ||!password){
        return res.status(400).json({message:"Please enter correct information"});
    }

    try{
        const user = await User.findOne({username});
        if(!user) {
            return res.status(httpStatus.NOT_FOUND).json({message:"User not found"});
        }
        if(await bcrypt.compare(password, user.password)){
            let token = crypto.randomBytes(20).toString("hex");

            user.token=token;
            await user.save();
            return res.status(httpStatus.OK).json({token:token});
        }

        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });

    } catch(e) {
        return res.status(500).json({message:`Something went wrong ${e}`});
    }
}


const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({ message: "User Registered" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Server error" });
    }
};

const addToActivity = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const newMeeting = new Meeting({
            user_id: user._id,
            meetingCode: meeting_code
        });

        await newMeeting.save();
        return res.status(httpStatus.CREATED).json({ message: "Added to activity" });

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong: ${e}` });
    }
};

const getAllActivity = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const meetings = await Meeting.find({ user_id: user._id });
        return res.status(httpStatus.OK).json(meetings);

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong: ${e}` });
    }
};

export { login, register, addToActivity, getAllActivity };