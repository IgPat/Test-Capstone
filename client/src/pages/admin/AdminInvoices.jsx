import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtMoney, fmtDate } from '../../utils/formatters';
import { Receipt, Plus, DollarSign, X } from 'lucide-react';
import Payment from '../../components/Payment';

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
    <div>
      <div className="toolbar">
        <div>
          <h1>Fees & Invoices</h1>
          <p className="muted">Issue invoices, review balances, and record student fee payments.</p>
        </div>

        <button className="btn-primary" onClick={() => { setModalErr(''); setShowIssueModal(true); }}>
          <Plus size={18} /> Issue Invoice
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading invoices...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="card empty-state">No invoices issued yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
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
                const statusClass = inv.status === 'paid' ? 'pill-paid' : inv.status === 'partial' ? 'pill-partial' : 'pill-unpaid';
                return (
                  <tr key={inv._id}>
                    <td><strong>{inv.invoiceNumber}</strong></td>
                    <td>{inv.student?.user?.name || 'Student'} ({inv.student?.admissionNumber})</td>
                    <td>{inv.description}</td>
                    <td>{fmtMoney(inv.totalAmount)}</td>
                    <td style={{ color: 'var(--success)' }}>{fmtMoney(inv.amountPaid)}</td>
                    <td style={{ color: balance > 0 ? 'var(--danger)' : 'var(--ink-soft)' }}>{fmtMoney(balance)}</td>
                    <td><span className={`pill ${statusClass}`} style={{ textTransform: 'capitalize' }}>{inv.status}</span></td>
                    <td>{fmtDate(inv.dueDate)}</td>
                    <td>
                      {balance > 0 && (
                        <button className="btn-secondary btn-small" onClick={() => openPayModal(inv)}>
                          <DollarSign size={14} /> Record Payment
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
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Issue Student Invoice</h2>
              <button className="modal-close" onClick={() => setShowIssueModal(false)}><X size={20} /></button>
            </div>

            {modalErr && <div className="error">{modalErr}</div>}

            <form onSubmit={handleIssueSubmit}>
              <label>Select Student
                <select value={issueForm.student} onChange={(e) => setIssueForm({ ...issueForm, student: e.target.value })}>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.user?.name} ({s.admissionNumber})</option>
                  ))}
                </select>
              </label>

              <label style={{ marginTop: '10px' }}>Term
                <select value={issueForm.term} onChange={(e) => setIssueForm({ ...issueForm, term: e.target.value })}>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </label>

              <label style={{ marginTop: '10px' }}>Description
                <input type="text" required value={issueForm.description} onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} />
              </label>

              <div className="form-row" style={{ marginTop: '10px' }}>
                <label>Total Amount (₦)
                  <input type="number" required min={1} value={issueForm.totalAmount} onChange={(e) => setIssueForm({ ...issueForm, totalAmount: e.target.value })} />
                </label>

                <label>Due Date
                  <input type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })} />
                </label>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowIssueModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Record Fee Payment</h2>
              <button className="modal-close" onClick={() => setShowPayModal(false)}><X size={20} /></button>
            </div>

            <p className="muted" style={{ fontSize: '.88rem' }}>
              Invoice <strong>{selectedInvoice.invoiceNumber}</strong> · Outstanding Balance: <strong>{fmtMoney(selectedInvoice.totalAmount - selectedInvoice.amountPaid)}</strong>
            </p>

            {modalErr && <div className="error">{modalErr}</div>}

            <form onSubmit={handlePaySubmit}>
              <label>Payment Amount (₦)
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedInvoice.totalAmount - selectedInvoice.amountPaid}
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                />
              </label>

              <div className="form-row" style={{ marginTop: '10px' }}>
                <label>Payment Method
                  <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card Payment</option>
                    <option value="cash">Cash</option>
                  </select>
                </label>

                <label>Reference #
                  <input type="text" value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} />
                </label>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
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
