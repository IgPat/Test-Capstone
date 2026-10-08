import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtMoney, fmtDate } from '../../utils/formatters';
import { Receipt, Plus, DollarSign, X } from 'lucide-react';
import Payment from '../../components/Payment';
import '../auth/RebuiltPages.css';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [issueForm, setIssueForm] = useState({ student: '', term: 'Term 1', description: 'Tuition & Facilities Fee', totalAmount: 45000, dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: 0, method: 'bank_transfer', reference: '' });
  const [modalErr, setModalErr] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchStudents();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students?limit=100');
      const list = res.data || res.students || (Array.isArray(res) ? res : []);
      setStudents(list);
      if (list.length) setIssueForm((f) => ({ ...f, student: list[0]._id }));
    } catch (e) {
      /* ignore */
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setModalErr('');
    try {
      await api.post('/invoices', {
        student: issueForm.student,
        term: issueForm.term,
        description: issueForm.description,
        totalAmount: Number(issueForm.totalAmount),
        dueDate: issueForm.dueDate || undefined,
      });
      setShowIssueModal(false);
      fetchInvoices();
    } catch (err) {
      setModalErr(err.message || 'Failed to issue invoice');
    }
  };

  const openPayModal = (inv) => {
    setSelectedInvoice(inv);
    const balance = inv.totalAmount - inv.amountPaid;
    setPayForm({ amount: balance, method: 'bank_transfer', reference: 'REF-' + Date.now().toString().slice(-6) });
    setModalErr('');
    setShowPayModal(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setModalErr('');
    try {
      await api.post(`/invoices/${selectedInvoice._id}/payment`, {
        amount: Number(payForm.amount),
        method: payForm.method,
        reference: payForm.reference,
      });
      setShowPayModal(false);
      fetchInvoices();
    } catch (err) {
      setModalErr(err.message || 'Payment recording failed');
    }
  };

  return (
    <div className="rebuilt-page">
      <header className="rebuilt-page-header">
        <div>
          <p className="dash-eyebrow"><span /> FINANCE & ACCOUNTS</p>
          <h1>Fees & Invoices</h1>
          <p>Issue invoices, review balances, and record student fee payments.</p>
        </div>

        <button className="rebuilt-btn-primary" onClick={() => { setModalErr(''); setShowIssueModal(true); }}>
          <Plus size={16} /> Issue Invoice
        </button>
      </header>

      {loading ? (
        <div className="rebuilt-empty-state">Loading invoices…</div>
      ) : error ? (
        <div className="rebuilt-alert-error">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="rebuilt-empty-state">No invoices issued yet.</div>
      ) : (
        <div className="rebuilt-table-wrap">
          <table className="rebuilt-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Student</th>
                <th>Description</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const balance = inv.totalAmount - inv.amountPaid;
                const statusClass = inv.status === 'paid' ? 'rebuilt-badge-paid' : inv.status === 'partial' ? 'rebuilt-badge-partial' : 'rebuilt-badge-unpaid';
                return (
                  <tr key={inv._id}>
                    <td><strong>{inv.invoiceNumber}</strong></td>
                    <td>{inv.student?.user?.name || 'Student'} ({inv.student?.admissionNumber})</td>
                    <td>{inv.description}</td>
                    <td>{fmtMoney(inv.totalAmount)}</td>
                    <td style={{ color: '#245744', fontWeight: 600 }}>{fmtMoney(inv.amountPaid)}</td>
                    <td style={{ color: balance > 0 ? '#bd5142' : 'var(--portal-muted)', fontWeight: balance > 0 ? 700 : 400 }}>{fmtMoney(balance)}</td>
                    <td><span className={`rebuilt-badge ${statusClass}`}>{inv.status}</span></td>
                    <td>{fmtDate(inv.dueDate)}</td>
                    <td>
                      {balance > 0 && (
                        <button className="rebuilt-btn-secondary" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => openPayModal(inv)}>
                          <DollarSign size={13} /> Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Invoice Modal */}
      {showIssueModal && (
        <div className="rebuilt-modal-overlay">
          <div className="rebuilt-modal">
            <div className="rebuilt-modal-head">
              <h2>Issue Student Invoice</h2>
              <button className="rebuilt-modal-close" onClick={() => setShowIssueModal(false)}><X size={20} /></button>
            </div>

            {modalErr && <div className="rebuilt-alert-error">{modalErr}</div>}

            <form onSubmit={handleIssueSubmit} className="portal-form" style={{ marginTop: 0 }}>
              <label>Select Student</label>
              <select value={issueForm.student} onChange={(e) => setIssueForm({ ...issueForm, student: e.target.value })}>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.user?.name} ({s.admissionNumber})</option>
                ))}
              </select>

              <label className="portal-spaced-label">Term</label>
              <select value={issueForm.term} onChange={(e) => setIssueForm({ ...issueForm, term: e.target.value })}>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>

              <label className="portal-spaced-label">Description</label>
              <input type="text" required value={issueForm.description} onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} />

              <div className="rebuilt-form-row">
                <div>
                  <label>Total Amount (₦)</label>
                  <input type="number" required min={1} value={issueForm.totalAmount} onChange={(e) => setIssueForm({ ...issueForm, totalAmount: e.target.value })} />
                </div>
                <div>
                  <label>Due Date</label>
                  <input type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="rebuilt-btn-secondary" onClick={() => setShowIssueModal(false)}>Cancel</button>
                <button type="submit" className="rebuilt-btn-primary">Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="rebuilt-modal-overlay">
          <div className="rebuilt-modal">
            <div className="rebuilt-modal-head">
              <h2>Record Fee Payment</h2>
              <button className="rebuilt-modal-close" onClick={() => setShowPayModal(false)}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--portal-muted)' }}>
              Invoice <strong>{selectedInvoice.invoiceNumber}</strong> · Outstanding Balance: <strong>{fmtMoney(selectedInvoice.totalAmount - selectedInvoice.amountPaid)}</strong>
            </p>

            {modalErr && <div className="rebuilt-alert-error">{modalErr}</div>}

            <form onSubmit={handlePaySubmit} className="portal-form" style={{ marginTop: 0 }}>
              <label>Payment Amount (₦)</label>
              <input
                type="number"
                required
                min={1}
                max={selectedInvoice.totalAmount - selectedInvoice.amountPaid}
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
              />

              <div className="rebuilt-form-row">
                <div>
                  <label>Payment Method</label>
                  <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card Payment</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label>Reference #</label>
                  <input type="text" value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="rebuilt-btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
                <Payment
                  invoice={selectedInvoice}
                  amount={payForm.amount}
                  email={selectedInvoice?.student?.user?.email}
                  onError={setModalErr}
                  onSuccess={() => {
                    setShowPayModal(false);
                    fetchInvoices();
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
