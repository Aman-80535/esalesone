import axios from "axios";

export const sendEmail = async (emailData) => {
    try {
        const res = await axios.post('https://esalesone.onrender.com/send-email', emailData);
        return res.data.message;
    }
    catch (err) {
        console.log("emailllllllll", err)
        throw new Error(err);
    }
}