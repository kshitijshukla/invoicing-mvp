import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";

export default function Dashboard({ user }) {
  const [invoices, setInvoices] = useState([]);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    (async () => {
      const { data } = await API.get(`/invoices/list?userId=${userId}`);
      setInvoices(data.invoices);
    })();
  }, [userId]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {user.businessName || "User"}</h1>
        {user?.logoUrl && <img src={user.logoUrl} alt="logo" className="h-10 object-contain" />}
      </div>
      <p className="mt-2">GST Number: {user.gstNumber}</p>

      <div className="mt-6 space-x-4">
        <Link to="/invoice" className="bg-green-600 text-white px-4 py-2 rounded">Create Invoice</Link>
        <Link to="/subscriptions" className="bg-blue-600 text-white px-4 py-2 rounded">Manage Subscription</Link>
        <Link to="/settings" className="bg-gray-700 text-white px-4 py-2 rounded">Settings</Link>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">Your Invoices</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">GST</th>
              <th className="p-2 border">PDF</th>
              <th className="p-2 border">Share</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv._id}>
                <td className="p-2 border">{inv.customerName}</td>
                <td className="p-2 border">₹{inv.totalAmount}</td>
                <td className="p-2 border">₹{inv.gstCollected}</td>
                <td className="p-2 border">
                  {inv.pdfUrl ? <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download</a> : "Pending"}
                </td>
                <td className="p-2 border">
                  {inv.pdfUrl && (
                    <button
                      onClick={async () => {
                        const phone = prompt("Enter customer WhatsApp number (e.g., +91XXXXXXXXXX):");
                        if (!phone) return;
                        await API.post("/invoices/share", { phone, pdfUrl: inv.pdfUrl });
                        alert("Invoice shared via WhatsApp!");
                      }}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      WhatsApp
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
