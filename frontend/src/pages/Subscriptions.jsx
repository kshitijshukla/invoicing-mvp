import { useEffect, useState } from "react";
import API from "../utils/api";

export default function Subscriptions({ user }) {
  const [subs, setSubs] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    (async () => {
      const { data } = await API.get(`/subscription/list?userId=${userId}`);
      setSubs(data.subscriptions);
    })();
  }, [userId]);

  const handleSubscribe = async () => {
    try {
      const { data } = await API.post("/subscription/create", { amount: 500 });
      alert("Subscription Order Created! (MVP)");
      await API.post("/subscription/verify", { userId, paymentId: "demo_payment_id", amount: 500 });
      const { data: after } = await API.get(`/subscription/list?userId=${userId}`);
      setSubs(after.subscriptions);
    } catch { alert("Error creating subscription"); }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Subscriptions</h1>
      <button onClick={handleSubscribe} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        Buy Subscription (₹500 / 30 days)
      </button>
      <h2 className="text-lg font-semibold mb-2">Past Subscriptions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">GST</th>
              <th className="p-2 border">Start</th>
              <th className="p-2 border">End</th>
              <th className="p-2 border">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(sub => (
              <tr key={sub._id}>
                <td className="p-2 border">₹{sub.amount}</td>
                <td className="p-2 border">₹{sub.gstPaid}</td>
                <td className="p-2 border">{new Date(sub.startDate).toLocaleDateString()}</td>
                <td className="p-2 border">{new Date(sub.endDate).toLocaleDateString()}</td>
                <td className="p-2 border">
                  {sub.pdfUrl ? <a href={sub.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download</a> : "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
