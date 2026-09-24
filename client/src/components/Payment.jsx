import { useState } from "react";
import PaystackPop from "@paystack/inline-js";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Payment = ({ invoice, amount, email, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    try {
      setLoading(true);

      const data = await api.post("/payments/initiate", {
        invoiceId: invoice._id,
        amount: Number(amount),
        email: email || user.email,
      });

      const popup = new PaystackPop();
      popup.resumeTransaction(data.data.access_code, {
        onSuccess: async (transaction) => {
          try {
            await api.get(`/payments/verify/${transaction.reference}`);
            onSuccess?.();
          } catch (error) {
            onError?.(error.message || "Payment verification failed");
          }
        },
        onError: (error) =>
          onError?.(error.message || "Paystack could not load the payment"),
      });
    } catch (error) {
      console.error(error);
      onError?.(error.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading} className="btn-primary">
      {loading ? "Initializing..." : "Pay with Paystack"}
    </button>
  );
};

export default Payment;
