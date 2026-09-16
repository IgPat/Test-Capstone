export function fmtMoney(n) {
  return '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
