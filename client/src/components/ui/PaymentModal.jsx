import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function PaymentModal({ booking, onClose, onSuccess }) {
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");

  const formatCardNumber = (val) => {
    return val
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  const formatExpiry = (val) => {
    return val
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{0,2})/, "$1/$2")
      .slice(0, 5);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedMethodName =
        method === "card"
          ? "Credit / Debit Card"
          : method === "upi"
          ? "UPI Payment (" + upiId + ")"
          : "NetBanking / Wallet";

      const { data } = await api.post(`/bookings/${booking._id}/pay`, {
        paymentMethod: selectedMethodName,
      });

      toast.success("🎉 Payment successful!");
      if (onSuccess) onSuccess(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal fade-in"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title" style={{ color: "#0F172A" }}>
              Complete Payment
            </h3>
            <p className="text-secondary" style={{ fontSize: "0.825rem" }}>
              Secure escrow payment for {booking.service}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Amount Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
            border: "1px solid #C7D2FE",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: "0.8rem", color: "#4338CA", fontWeight: 600 }}>
              Total Payable
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#3730A3" }}>
              ₹{booking.price}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="badge badge-accent" style={{ fontSize: "0.75rem" }}>
              🛡️ Escrow Protected
            </span>
            <div style={{ fontSize: "0.75rem", color: "#6366F1", marginTop: "0.2rem" }}>
              Provider: {booking.providerId?.name || "Freelancer"}
            </div>
          </div>
        </div>

        {/* Method Toggle Tabs */}
        <div className="role-toggle" style={{ marginBottom: "1.25rem" }}>
          <button
            type="button"
            className={`role-btn ${method === "card" ? "active" : ""}`}
            onClick={() => setMethod("card")}
          >
            💳 Card
          </button>
          <button
            type="button"
            className={`role-btn ${method === "upi" ? "active" : ""}`}
            onClick={() => setMethod("upi")}
          >
            📱 UPI / QR
          </button>
          <button
            type="button"
            className={`role-btn ${method === "wallet" ? "active" : ""}`}
            onClick={() => setMethod("wallet")}
          >
            👛 NetBanking
          </button>
        </div>

        <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {method === "card" && (
            <>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="4532 8901 2345 6789"
                  value={cardForm.number}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="08/28"
                    value={cardForm.expiry}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input
                    type="password"
                    maxLength="4"
                    className="form-input"
                    placeholder="•••"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Name on card"
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {method === "upi" && (
            <div className="form-group">
              <label className="form-label">UPI ID / VPA</label>
              <input
                type="text"
                className="form-input"
                placeholder="username@okaxis or mobile@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
              <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "0.25rem" }}>
                You will receive a payment request on your UPI app (Google Pay, PhonePe, Paytm).
              </p>
            </div>
          )}

          {method === "wallet" && (
            <div className="form-group">
              <label className="form-label">Select Bank / Wallet</label>
              <select className="form-input form-select" required>
                <option value="HDFC Bank">HDFC Bank NetBanking</option>
                <option value="ICICI Bank">ICICI Bank NetBanking</option>
                <option value="SBI">State Bank of India</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Paytm Wallet">Paytm Wallet</option>
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : `Pay ₹${booking.price} Now`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
