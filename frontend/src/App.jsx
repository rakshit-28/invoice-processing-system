
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [status, setStatus] = useState('PENDING')
  const [saving, setSaving] = useState(false)

  async function loadInvoices() {
    try {
      const response = await fetch('http://localhost:8080/api/invoices')
      if (!response.ok) throw new Error()
      const data = await response.json()
      setInvoices(data)
      setError('')
    } catch {
      setError('Could not connect to the backend. Check that Spring Boot is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!invoiceNumber.trim() || !vendorName.trim() || totalAmount === '' ||
        !Number.isFinite(Number(totalAmount)) || Number(totalAmount) <= 0) {
      setError('Enter an invoice number, vendor name, and a valid amount greater than zero.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('http://localhost:8080/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: invoiceNumber.trim(),
          vendorName: vendorName.trim(),
          totalAmount: Number(totalAmount),
          status,
        }),
      })

      if (!response.ok) throw new Error()

      setInvoiceNumber('')
      setVendorName('')
      setTotalAmount('')
      setStatus('PENDING')
      setMessage('Invoice created successfully!')
      await loadInvoices()
    } catch {
      setError('Could not save the invoice. Please check your backend and try again.')
    } finally {
      setSaving(false)
    }
  }

  const totalValue = invoices.reduce(
    (sum, invoice) => sum + (Number(invoice.totalAmount) || 0), 0
  )

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>InvoiceFlow</h1>
          <p>Invoice Processing System</p>
        </div>
        <span className="api-status">Invoice Dashboard</span>
      </header>

      <main className="main">
        <section className="welcome">
          <h2>Invoice Dashboard</h2>
          <p>Track and manage your invoices in one place.</p>
        </section>

        <section className="stats">
          <article className="stat-card">
            <p>Total Invoices</p>
            <h3>{invoices.length}</h3>
          </article>
          <article className="stat-card">
            <p>Total Invoice Value</p>
            <h3>{totalValue.toLocaleString('en-IN', {
              style: 'currency', currency: 'INR',
            })}</h3>
          </article>
          <article className="stat-card">
            <p>Pending Invoices</p>
            <h3>{invoices.filter((invoice) => invoice.status === 'PENDING').length}</h3>
          </article>
        </section>

        <section className="invoice-section">
          <h2>Create Invoice</h2>

          <form className="invoice-form" onSubmit={handleSubmit}>
            <label>
              Invoice Number
              <input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-002"
                required
              />
            </label>

            <label>
              Vendor Name
              <input
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. ABC Technologies"
                required
              />
            </label>

            <label>
              Total Amount (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="e.g. 25000"
                required
              />
            </label>

            <label>
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PAID">PAID</option>
              </select>
            </label>

            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create Invoice'}
            </button>
          </form>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </section>

        <section className="invoice-section">
          <h2>Recent Invoices</h2>

          {loading && <p>Loading invoices...</p>}
          {!loading && !error && invoices.length === 0 && <p>No invoices found.</p>}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Invoice Number</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.vendorName}</td>
                    <td>{Number(invoice.totalAmount).toLocaleString('en-IN', {
                      style: 'currency', currency: 'INR',
                    })}</td>
                    <td><span className="status">{invoice.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
