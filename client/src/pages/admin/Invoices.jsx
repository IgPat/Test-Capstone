import { useEffect, useState } from 'react';
import api from '../../services/api';

const Invoices = () => {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [lineItems, setLineItems] = useState([{ label: 'Tuition', amount: '' }]);
  const [studentInvoices, setStudentInvoices] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState({});
  const [error, setError] = useState('');

  useEffect(() => { api.get('/classes').then(({ data }) => setClasses(data)); }, []);
  useEffect(() => {
    if (!classId) { setStudents([]); return; }
    api.get(`/classes/${classId}`).then(({ data }) => setStudents(data.students || []));
  }, [classId]);

  const loadInvoices = (id) => api.get(`/invoices/student/${id}`).then(({ data }) => setStudentInvoices(data));
  useEffect(() => { if (studentId) loadInvoices(studentId); else setStudentInvoices(null); }, [studentId]);

  const updateLineItem = (i, field, value) => {
    const copy = [...lineItems];
    copy[i][field] = value;
    setLineItems(copy);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/invoices', {
        student: studentId,
        term,
        lineItems: lineItems.map((li) => ({ label: li.label, amount: Number(li.amount) })),
      });
      setLineItems([{ label: 'Tuition', amount: '' }]);
      loadInvoices(studentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handleSimulatePayment = async (invoiceId) => {
    const amount = Number(paymentAmount[invoiceId]);
    if (!amount) return;
    await api.post(`/invoices/${invoiceId}/payments`, { amount, method: 'simulated' });
    setPaymentAmount({ ...paymentAmount, [invoiceId]: '' });
    loadInvoices(studentId);
  };

  return (
    <div>
      <h1>Fees & Invoices</h1>
      <div className="filter-bar">
        <select value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(''); }}>
          <option value="">Select a class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!students.length}>
          <option value="">Select a student</option>
          {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name} ({s.admissionNumber})</option>)}
        </select>
      </div>

      {studentId && (
        <>
          <form className="card" onSubmit={handleCreateInvoice}>
            {error && <p className="error">{error}</p>}
            <h3>New invoice</h3>
            <label>Term
              <select value={term} onChange={(e) => setTerm(e.target.value)}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
            </label>
            {lineItems.map((li, i) => (
              <div className="line-item-row" key={i}>
                <input placeholder="Label (e.g. Tuition)" value={li.label} onChange={(e) => updateLineItem(i, 'label', e.target.value)} />
                <input type="number" placeholder="Amount" value={li.amount} onChange={(e) => updateLineItem(i, 'amount', e.target.value)} />
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={() => setLineItems([...lineItems, { label: '', amount: '' }])}>+ Add line item</button>
            <button className="btn-primary" type="submit">Generate invoice</button>
          </form>

          <div className="card">
            <h3>Invoices & Balance</h3>
            {studentInvoices && <p><strong>Total outstanding: ₦{studentInvoices.balance.toLocaleString()}</strong></p>}
            {studentInvoices?.invoices.map((inv) => (
              <div key={inv._id} className="invoice-card">
                <div className="invoice-header">
                  <strong>{inv.term}</strong>
                  <span className={`pill ${inv.status}`}>{inv.status}</span>
                </div>
                <ul>{inv.lineItems.map((li, i) => <li key={i}>{li.label}: ₦{li.amount.toLocaleString()}</li>)}</ul>
                <p>Total: ₦{inv.totalAmount.toLocaleString()} · Paid: ₦{inv.amountPaid.toLocaleString()} · Balance: ₦{(inv.totalAmount - inv.amountPaid).toLocaleString()}</p>
                {inv.status !== 'paid' && (
                  <div className="line-item-row">
                    <input type="number" placeholder="Amount to record" value={paymentAmount[inv._id] || ''} onChange={(e) => setPaymentAmount({ ...paymentAmount, [inv._id]: e.target.value })} />
                    <button className="btn-secondary" onClick={() => handleSimulatePayment(inv._id)}>Record payment</button>
                  </div>
                )}
              </div>
            ))}
            {studentInvoices?.invoices.length === 0 && <p className="muted">No invoices yet.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default Invoices;
