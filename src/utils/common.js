import { toast } from "react-toastify";
import { app } from "@/firebase";
import { getAuth } from "firebase/auth";
import moment from "moment";

const auth = getAuth(app);;

export const simpleNotify = (msg) => toast(msg, {
  style: {
    color: 'black'
  }
});
export const errorNotify = (msg) => toast(msg, {
  style: {
    color: 'red'
  }
});


export const waitForUser = () => new Promise((resolve) => {
  const checkUser = () => {
    if (auth.currentUser) {
      console.log(auth.currentUser);
      resolve(auth.currentUser);
    } else {
      setTimeout(checkUser, 100);
    }
  };
  checkUser();
})

export const getUserUID = async () => {
  if (typeof window !== 'undefined') {
    const user_id = await localStorage.getItem('user_uid');
    return user_id;
  }
  return null;
};

export const successOrderSubject = (order) => `Order Confirmation - #${order.id}`;
export const failedOrderSubject = (order) => `Transaction Declined - #${order.id}`;

export const successOrdertext = (order) => ` <h2 style="color: green;">Order Confirmation</h2>
<p>Hi <strong>Customer</strong>,</p>
<p>Thank you for your order! 🎉</p>
<p>Your order has been placed successfully. Below are the details:</p>

<table style="border-collapse: collapse;">
  <tr>
    <td><strong>Order ID:</strong></td>
    <td>${order.id}</td>
  </tr>
  <tr>
    <td><strong>Amount:</strong></td>
    <td>$${order.grandTotal}</td>
  </tr>
  <tr>
    <td><strong>Date:</strong></td>
    <td>${order?.date ? (moment(order.date).format('dddd, DD/MM/YYYY - hh:mm A')) : ""}</td>
  </tr>
</table>

<p>We’ll notify you when it’s shipped. Thank you for shopping with us!</p>
<p>Best regards,<br />Shopicart</p>
    `;

export const failedOrdertext = (order) => `
      <h2 style="color: red;">Order Failed</h2>
<p>Hi <strong>Customer</strong>,</p>
<p>We’re sorry, but your order could not be completed.</p>

<table style="border-collapse: collapse;">
  <tr>
    <td><strong>Order ID:</strong></td>
    <td>${order.id}</td>
  </tr>
  <tr>
    <td><strong>Amount:</strong></td>
    <td>$${order.grandTotal}</td>
  </tr>
  <tr>
    <td><strong>Date:</strong></td>
    <td>${order?.date ? (moment(order.date).format('dddd, DD/MM/YYYY - hh:mm A')) : ""}</td>
  </tr>
</table>

<p>Please verify your payment information or try placing the order again.</p>
<p>If you need help, contact our support team.</p>
<p>Regards,<br />Shopicart</p>

    `;