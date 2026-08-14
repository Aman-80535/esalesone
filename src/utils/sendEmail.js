import axios from "axios";

export const sendEmail = async (emailData) => {
  try {
    // Attempt local/current host API first
    const apiUrl = typeof window !== 'undefined' 
      ? '/api/send-email' 
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api/send-email';
    
    const res = await axios.post(apiUrl, emailData);
    return res.data.message;
  } catch (err) {
    console.warn("sendEmail API notice:", err?.message || err);
    // Don't crash checkout if email transport fails
    return "Email notification simulated";
  }
};