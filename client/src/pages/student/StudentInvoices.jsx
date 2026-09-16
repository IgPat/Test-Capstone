import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtMoney, fmtDate } from '../../utils/formatters';
import { Receipt, CreditCard, CheckCircle, X } from 'lucide-react';

export default function StudentInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMsg, setPayMsg] = useState({ error: '', success: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMyInvoices();
  }, []);

  const fetchMyInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices/my-invoices');
      setInvoices(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (inv) => {
    setSelectedInvoice(inv);
    const balance = inv.totalAmount - inv.amountPaid;
    setPayAmount(balance);
    setPayMsg({ error: '', success: '' });
    setShowPayModal(true);
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    setPayMsg({ error: '', success: '' });
    try {
      setProcessing(true);
      await api.post(`/invoices/${selectedInvoice._id}/payment`, {
        amount: Number(payAmount),
        method: 'card',
        reference: 'ONLINE-SIM-' + Date.now().toString().slice(-6),
      });
      setPayMsg({ error: '', success: 'Payment processed successfully!' });
      setTimeout(() => {
        setShowPayModal(false);
        fetchMyInvoices();
      }, 1200);
    } catch (err) {
      setPayMsg({ error: err.message || 'Payment simulation failed', success: '' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1>My Fees & Invoices</h1>
          <p className="muted">View your fee statements and payment history.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading fee statements…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="card empty-state">No invoices issued to your account yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Description</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const balance = inv.totalAmount - inv.amountPaid;
                const statusClass = inv.status === 'paid' ? 'pill-paid' : inv.status === 'partial' ? 'pill-partial' : 'pill-unpaid';
                return (
                  <tr key={inv._id}>
                    <td><strong>{inv.invoiceNumber}</strong></td>
                    <td>{inv.description}</td>
                    <td>{fmtMoney(inv.totalAmount)}</td>
                    <td style={{ color: 'var(--success)' }}>{fmtMoney(inv.amountPaid)}</td>
                    <td style={{ color: balance > 0 ? 'var(--danger)' : 'var(--ink-soft)' }}>{fmtMoney(balance)}</td>
                    <td><span className={`pill ${statusClass}`} style={{ textTransform: 'capitalize' }}>{inv.status}</span></td>
                    <td>{fmtDate(inv.dueDate)}</td>
                    <td>
                      {balance > 0 ? (
                        <button className="btn-primary btn-small" onClick={() => openPayModal(inv)}>
                          <CreditCard size={14} /> Pay Online
                        </button>
                      ) : (
                        <span className="flex" style={{ color: 'var(--success)', fontSize: '.84rem', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Online Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Simulate Fee Payment</h2>
              <button className="modal-close" onClick={() => setShowPayModal(false)}><X size={20} /></button>
            </div>

            <p className="muted" style={{ fontSize: '.88rem' }}>
              Invoice <strong>{selectedInvoice.invoiceNumber}</strong> · Outstanding: <strong>{fmtMoney(selectedInvoice.totalAmount - selectedInvoice.amountPaid)}</strong>
            </p>

            {payMsg.success && <div className="success-msg">{payMsg.success}</div>}
            {payMsg.error && <div className="error">{payMsg.error}</div>}

            <form onSubmit={handleSimulatePayment}>
              <label>Amount to Pay (₦)
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedInvoice.totalAmount - selectedInvoice.amountPaid}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </label>

              <div className="card" style={{ background: 'var(--bg)', marginTop: '14px', fontSize: '.84rem' }}>
                <div className="flex" style={{ gap: '8px', color: 'var(--ink-soft)' }}>
                  <CreditCard size={16} />
                  <span>Test Gateway: Click below to simulate online card authorization.</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={processing}>
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
