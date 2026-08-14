import { toast } from "react-toastify";
import { app, auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import moment from "moment";

export const simpleNotify = (msg) =>
  toast.info(msg, {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

export const successNotify = (msg) =>
  toast.success(msg, {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

export const errorNotify = (msg) =>
  toast.error(msg, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

export const waitForUser = () =>
  new Promise((resolve) => {
    if (auth.currentUser) {
      return resolve(auth.currentUser);
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user || null);
    });

    // Safety timeout to avoid hanging indefinitely if offline/unauthenticated
    setTimeout(() => {
      try {
        unsubscribe();
      } catch (e) {}
      resolve(auth.currentUser || null);
    }, 2500);
  });

export const getUserUID = async () => {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  if (typeof window !== "undefined") {
    return localStorage.getItem("user_uid");
  }
  return null;
};

export const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return `₹${num.toFixed(2)}`;
};

export const successOrderSubject = (order) =>
  `Order Confirmation - #${order.id || "LIBAAS"}`;

export const failedOrderSubject = (order) =>
  `Transaction Declined - #${order.id || "LIBAAS"}`;

export const successOrdertext = (order) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #0d493b; margin-top: 0;">Shopi Order Confirmation</h2>
    <p>Hi <strong>${order.fullName || "Customer"}</strong>,</p>
    <p>Thank you for your order! 🎉 We have received your order and are getting it ready to be shipped.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9fbf9; border-radius: 6px;">
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 10px;"><strong>Order ID:</strong></td>
        <td style="padding: 10px;">#${order.id}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 10px;"><strong>Total Amount:</strong></td>
        <td style="padding: 10px; color: #0d493b; font-weight: bold;">₹${Number(order.grandTotal || 0).toFixed(2)}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 10px;"><strong>Payment Method:</strong></td>
        <td style="padding: 10px; text-transform: uppercase;">${order.paymentMethod || (order.payment ? "Card / Stripe" : "Cash on Delivery")}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 10px;"><strong>Delivery Address:</strong></td>
        <td style="padding: 10px;">${order.address || ""}, ${order.city || ""}, ${order.state || ""} ${order.zip || ""}</td>
      </tr>
      <tr>
        <td style="padding: 10px;"><strong>Date:</strong></td>
        <td style="padding: 10px;">${order?.date ? moment(order.date).format("dddd, DD/MM/YYYY - hh:mm A") : moment().format("dddd, DD/MM/YYYY")}</td>
      </tr>
    </table>

    <p>We'll notify you when your package is shipped. Thank you for shopping with <strong>Shopi</strong>!</p>
    <p style="margin-top: 30px; font-size: 13px; color: #777;">Best regards,<br/>The Shopi Team</p>
  </div>
`;

export const failedOrdertext = (order) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #d32f2f; margin-top: 0;">Order Payment Failed</h2>
    <p>Hi <strong>${order.fullName || "Customer"}</strong>,</p>
    <p>We're sorry, but your transaction for order <strong>#${order.id || ""}</strong> could not be completed.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff5f5; border-radius: 6px;">
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 10px;"><strong>Order ID:</strong></td>
        <td style="padding: 10px;">#${order.id}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 10px;"><strong>Attempted Amount:</strong></td>
        <td style="padding: 10px;">₹${Number(order.grandTotal || 0).toFixed(2)}</td>
      </tr>
    </table>

    <p>Please check your payment method or try placing the order again.</p>
    <p style="margin-top: 30px; font-size: 13px; color: #777;">If you need assistance, contact our support.<br/>Shopi Team</p>
  </div>
`;

export const checkEmptiness = (obj, setErrors) => {
  let hasError = false;
  for (const key in obj) {
    if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
      if (setErrors) {
        setErrors((prev) => ({
          ...(prev || {}),
          [key]: `Please select ${key}`,
        }));
      }
      hasError = true;
    }
  }
  return hasError;
};