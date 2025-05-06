import React, { useState } from 'react';
import api from '../Api';

const PaymentPage = () => {
  const [paymentDetails, setPaymentDetails] = useState(null);

  const handlePayment = async () => {
    try {
      // Create order from backend
      const res = await api.post('/payment/create-order', {
          amount: 500, // ₹500
          receipt: 'rcpt_001',
          notes: { user: 'John Doe', product: 'Premium Course' }
        })
        console.log(res.data)
      const data = res.data;

      if (!data.success) {
        alert('Failed to create order');
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'MyCompany Pvt Ltd',
        description: 'Test Transaction',
        order_id: data.orderId,
        handler: function (response) {
          setPaymentDetails(response); // Show success data on screen
        },
        prefill: {
          name: 'John Doe',
          email: 'john@example.com',
          contact: '9876543210',
        },
        notes: {
          address: 'Corporate Office',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      alert('Payment failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
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
