import React, { useState } from 'react';
import api from '../Api';
import { useAuth } from "../Context/AuthContext"


const PaymentPage = () => {
  const { user } = useAuth();
  console.log(user);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [orderId, setOrderId] = useState("");

  const handlePayment = async () => {
    try {
      // Create order from backend
      const res = await api.post('/payment/create-order', {
          amount: 500,
          receipt: user.uuid,
          userId: user.uuid,
          email: user.email,
          userName: user.userName
        })
        console.log(res.data)
      const data = res.data;
      setOrderId(res.data.orderId);

      if (!data.success) {
        alert('Failed to create order');
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'ANIKET RAMESH BADAKH',
        description: 'Test Transaction',
        order_id: data.orderId,
        handler: async function (response) {
          const payload = {
            ...response,
            status: "paid",
          }
          const data = await api.post("/payment/verify-payment", payload);
          setPaymentDetails(response);
          console.log('Payment Success:', response, data);
        },
        prefill: {
          name: user.userName,
          email: user.email,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: async function () {
            const data = await api.post("/payment/verify-payment", {razorpay_order_id: orderId, razorpay_payment_id:null, status: "failed" });
            console.log(data);
            console.warn('Payment popup was closed by the user.');
            alert('Payment was not completed or was cancelled.');
          }
        }
      };
      

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      alert('Payment failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-20">
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Make a Payment</h2>
        <p className="text-gray-700 mb-2">Product: <strong>Premium Course</strong></p>
        <p className="text-gray-700 mb-4">Amount: <strong>₹500</strong></p>
        <button
          onClick={handlePayment}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          Pay Now
        </button>
      </div>

      {paymentDetails && (
        <div className="mt-8 bg-white shadow-md rounded-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-2 text-green-600">Payment Successful!</h3>
          <p><strong>Payment ID:</strong> {paymentDetails.razorpay_payment_id}</p>
          <p><strong>Order ID:</strong> {paymentDetails.razorpay_order_id}</p>
          <p><strong>Signature:</strong> {paymentDetails.razorpay_signature}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
