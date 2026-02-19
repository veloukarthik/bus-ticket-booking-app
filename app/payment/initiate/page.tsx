"use client";
import { useState } from 'react';

export default function InitiatePaymentPage() {
  const [orderId, setOrderId] = useState('ORDER_' + Date.now());
  const [amount, setAmount] = useState('100.00');
  const [customerId, setCustomerId] = useState('CUST_1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, customerId }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data?.error || 'Failed to initiate payment');
        return;
      }
      // Build a form and post to Paytm using returned shape { params, paytmUrl }
      const params = data.params || {};
      const paytmUrl = data.paytmUrl || (process.env.NEXT_PUBLIC_PAYTM_PROCESS_URL) || 'https://securegw-stage.paytm.in/order/process';
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paytmUrl;

      // Append fields (params + CHECKSUMHASH)
      for (const key of Object.keys(params)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(params[key]);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || String(err));
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Initiate Paytm Payment</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Order ID</label>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        </div>
        <div>
          <label>Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label>Customer ID</label>
          <input value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Starting...' : 'Pay with Paytm'}</button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: 12 }}>This will POST signed params to Paytm's checkout URL.</p>
    </div>
  );
}
