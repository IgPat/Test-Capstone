import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtMoney, fmtDate } from '../../utils/formatters';
import { Receipt, CreditCard, CheckCircle, X } from 'lucide-react';
import Payment from '../../components/Payment';

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
    <div className="rebuilt-page">
      <div className="rebuilt-page-header">
        <div>
          <h1 className="rebuilt-page-title">My Fees & Invoices</h1>
          <p className="rebuilt-page-subtitle">View your fee statements and online payment options.</p>
        </div>
      </div>

      {loading ? (
        <div className="rebuilt-loading-state">Loading fee statements…</div>
      ) : error ? (
        <div className="rebuilt-alert rebuilt-alert-error">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="rebuilt-card rebuilt-empty-state">No invoices issued to your account yet.</div>
      ) : (
        <div className="rebuilt-table-wrap">
          <table className="rebuilt-table">
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
                const statusBadgeClass = inv.status === 'paid' ? 'rebuilt-badge-paid' : inv.status === 'partial' ? 'rebuilt-badge-partial' : 'rebuilt-badge-unpaid';
                return (
                  <tr key={inv._id}>
                    <td><strong>{inv.invoiceNumber}</strong></td>
                    <td>{inv.description}</td>
                    <td>{fmtMoney(inv.totalAmount)}</td>
                    <td style={{ color: '#2b6e4e', fontWeight: 600 }}>{fmtMoney(inv.amountPaid)}</td>
                    <td style={{ color: balance > 0 ? '#b91c1c' : 'var(--portal-text-muted)', fontWeight: balance > 0 ? 700 : 400 }}>{fmtMoney(balance)}</td>
                    <td><span className={`rebuilt-badge ${statusBadgeClass}`} style={{ textTransform: 'capitalize' }}>{inv.status}</span></td>
                    <td>{fmtDate(inv.dueDate)}</td>
                    <td>
                      {balance > 0 ? (
                        <button className="rebuilt-btn rebuilt-btn-primary rebuilt-btn-sm" onClick={() => openPayModal(inv)}>
                          <CreditCard size={14} /> Pay Online
                        </button>
                      ) : (
                        <span className="rebuilt-flex-center" style={{ color: '#2b6e4e', fontSize: '.84rem', fontWeight: 600, gap: '4px' }}>
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
        <div className="rebuilt-modal-overlay">
          <div className="rebuilt-modal">
            <div className="rebuilt-modal-header">
              <h2>Simulate Fee Payment</h2>
              <button className="rebuilt-modal-close" onClick={() => setShowPayModal(false)}><X size={20} /></button>
            </div>

            <p style={{ color: 'var(--portal-text-muted)', fontSize: '.88rem', margin: '0 0 16px' }}>
              Invoice <strong>{selectedInvoice.invoiceNumber}</strong> · Outstanding: <strong>{fmtMoney(selectedInvoice.totalAmount - selectedInvoice.amountPaid)}</strong>
            </p>

            {payMsg.success && <div className="rebuilt-alert rebuilt-alert-success">{payMsg.success}</div>}
            {payMsg.error && <div className="rebuilt-alert rebuilt-alert-error">{payMsg.error}</div>}

            <form onSubmit={handleSimulatePayment} className="portal-form">
              <div className="portal-form-group">
                <label>Amount to Pay (₦)</label>
                <input
                  type="number"
                  className="portal-input"
                  required
                  min={1}
                  max={selectedInvoice.totalAmount - selectedInvoice.amountPaid}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="rebuilt-card" style={{ background: '#f4f6f0', marginTop: '14px', padding: '12px 16px' }}>
                <div className="rebuilt-flex-center" style={{ gap: '10px', color: 'var(--portal-text-muted)', fontSize: '.84rem' }}>
                  <CreditCard size={16} />
                  <span>Test Gateway: Click below to simulate online card authorization.</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="rebuilt-btn rebuilt-btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
                <Payment
                  invoice={selectedInvoice}
                  amount={payAmount}
                  email={selectedInvoice?.student?.user?.email}
                  onSuccess={() => {
                    setShowPayModal(false);
                    fetchMyInvoices();
                  }}
                  onError={(msg) => setPayMsg({ error: msg, success: '' })}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
