import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MyInvoices = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.studentProfile) return;
    api.get(`/invoices/student/${user.studentProfile}`).then(({ data }) => setData(data));
  }, [user]);

  if (!data) return <p>Loading invoices…</p>;

  return (
    <div>
      <h1>My Fees</h1>
      <div className="stat-card" style={{ marginBottom: '1rem' }}>
        <span className="stat-label">Outstanding Balance</span>
        <span className="stat-value">₦{data.balance.toLocaleString()}</span>
      </div>

      {data.invoices.map((inv) => (
        <div key={inv._id} className="invoice-card">
          <div className="invoice-header">
            <strong>{inv.term}</strong>
            <span className={`pill ${inv.status}`}>{inv.status}</span>
          </div>
          <ul>{inv.lineItems.map((li, i) => <li key={i}>{li.label}: ₦{li.amount.toLocaleString()}</li>)}</ul>
          <p>Total: ₦{inv.totalAmount.toLocaleString()} · Paid: ₦{inv.amountPaid.toLocaleString()} · Balance: ₦{(inv.totalAmount - inv.amountPaid).toLocaleString()}</p>
        </div>
      ))}
      {data.invoices.length === 0 && <p className="muted">No invoices yet.</p>}

      <div className="card">
        <h3>Payment history</h3>
        {data.payments.length === 0 && <p className="muted">No payments recorded yet.</p>}
        <ul className="activity-list">
          {data.payments.map((p) => <li key={p._id}>₦{p.amount.toLocaleString()} — {new Date(p.date).toLocaleDateString()} ({p.method})</li>)}
        </ul>
      </div>
    </div>
  );
};

export default MyInvoices;
