import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

(async () => {
    //const CS = process.env._MONGO_URL
    const CS = "mongodb+srv://coderhouse:coderhouse@matiaspariente.qctoeul.mongodb.net/?retryWrites=true&w=majority"
    try {
        await mongoose.connect(CS);
        console.log('MongoDB connected');
    } catch (err) {
        console.log(err.message);
    }
})();

const usersSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
});

export default usersSchema