import axios from "axios";

export const sendEmail = async (emailData) => {
    try {
        const res = await axios.post('http://localhost:5000/send-email', emailData);
        return res.data.message;
    }
    catch (err) {
        console.log("emailllllllll", err)
        throw new Error(err);
    }
}