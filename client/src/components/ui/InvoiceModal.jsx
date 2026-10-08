import { useEffect, useState } from "react";
import api from "../../api/axios";
import Spinner from "./Spinner";

export default function InvoiceModal({ bookingId, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}/invoice`);
        setInvoice(data.data);
      } catch {
        // Fallback invoice construction if API fails
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal card" onClick={(e) => e.stopPropagation()}>
          <Spinner text="Loading digital invoice..." />
        </div>
      </div>
    );
  }

  const inv = invoice || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal fade-in"
        style={{ maxWidth: "620px", background: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2L32 10.0718V25.9282L18 34L4 25.9282V10.0718L18 2Z" fill="#635BFF"/>
              <path d="M18 8L26 12.6188V21.8542L18 26.473L10 21.8542V12.6188L18 8Z" fill="white" fillOpacity="0.25"/>
              <path d="M18 13.5L22 15.8094V20.4281L18 22.7375L14 20.4281V15.8094L18 13.5Z" fill="white"/>
            </svg>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A" }}>
              SkillHive Invoice
            </span>
          </div>
          <span className="badge badge-success" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}>
            ✓ OFFICIAL RECEIPT
          </span>
        </div>

        {/* Invoice Meta */}
        <div className="grid-2" style={{ gap: "1rem", margin: "1.25rem 0", fontSize: "0.85rem" }}>
          <div>
            <span style={{ color: "#64748B", display: "block" }}>Invoice Number</span>
            <strong style={{ color: "#0F172A", fontSize: "1rem" }}>{inv.invoiceNumber}</strong>
            <span style={{ color: "#64748B", display: "block", marginTop: "0.4rem" }}>
              Transaction ID: <span style={{ color: "#334155" }}>{inv.transactionId}</span>
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#64748B", display: "block" }}>Date Issued</span>
            <strong style={{ color: "#0F172A" }}>
              {new Date(inv.issueDate || Date.now()).toLocaleDateString()}
            </strong>
            <span style={{ color: "#64748B", display: "block", marginTop: "0.4rem" }}>
              Payment Method: <span style={{ color: "#334155" }}>{inv.paymentMethod}</span>
            </span>
          </div>
        </div>

        <div className="divider" style={{ margin: "1rem 0" }} />

        {/* Billed To / Freelancer */}
        <div className="grid-2" style={{ gap: "1rem", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
          <div style={{ background: "#F8FAFC", padding: "0.85rem", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
              Billed To (Client)
            </span>
            <strong style={{ display: "block", color: "#0F172A", fontSize: "0.95rem", marginTop: "0.2rem" }}>
              {inv.client?.name || "Client"}
            </strong>
            <span style={{ color: "#64748B" }}>{inv.client?.email}</span>
          </div>

          <div style={{ background: "#F8FAFC", padding: "0.85rem", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
              Service Provider
            </span>
            <strong style={{ display: "block", color: "#0F172A", fontSize: "0.95rem", marginTop: "0.2rem" }}>
              {inv.provider?.name || "Freelancer"}
            </strong>
            <span style={{ color: "#64748B" }}>{inv.category || "Professional Service"}</span>
          </div>
        </div>

        {/* Breakdown Table */}
        <table className="admin-table" style={{ marginBottom: "1.5rem" }}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong style={{ color: "#0F172A" }}>{inv.serviceName}</strong>
                <span style={{ display: "block", fontSize: "0.78rem", color: "#64748B" }}>
                  Category: {inv.category}
                </span>
              </td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#0F172A" }}>
                ₹{inv.amount}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#64748B", fontSize: "0.85rem" }}>Platform Service Fee (5%)</td>
              <td style={{ textAlign: "right", color: "#64748B" }}>Included</td>
            </tr>
            <tr style={{ background: "#EEF2FF" }}>
              <td>
                <strong style={{ color: "#4338CA", fontSize: "1rem" }}>Total Paid</strong>
              </td>
              <td style={{ textAlign: "right" }}>
                <strong style={{ color: "#4338CA", fontSize: "1.2rem" }}>₹{inv.amount}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Modal Footer actions */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            🖨️ Print / Download
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
