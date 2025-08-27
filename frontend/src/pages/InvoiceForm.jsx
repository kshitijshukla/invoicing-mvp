import { useState } from "react";
import API from "../utils/api";

export default function InvoiceForm() {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0, gstRate: 18 }]);
  const userId = localStorage.getItem("userId");
  const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0, gstRate: 18 }]);
  const update = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = field==="quantity"||field==="price"||field==="gstRate"?Number(value):value;
    setItems(updated);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/invoices/create", { userId, customerName, items });
      alert("Invoice created!");
      console.log(data.invoice);
    } catch { alert("Error creating invoice"); }
  };
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Create Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Customer Name" value={customerName}
          onChange={(e)=>setCustomerName(e.target.value)} className="border p-2 w-full rounded"/>
        {items.map((item, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            <input type="text" placeholder="Description" value={item.description}
              onChange={(e)=>update(index,"description",e.target.value)}
              className="border p-2 rounded flex-1 min-w-[200px]"/>
            <input type="number" placeholder="Qty" value={item.quantity}
              onChange={(e)=>update(index,"quantity",e.target.value)} className="border p-2 rounded w-24"/>
            <input type="number" placeholder="Price" value={item.price}
              onChange={(e)=>update(index,"price",e.target.value)} className="border p-2 rounded w-28"/>
            <input type="number" placeholder="GST %" value={item.gstRate}
              onChange={(e)=>update(index,"gstRate",e.target.value)} className="border p-2 rounded w-28"/>
          </div>
        ))}
        <div className="space-x-2">
          <button type="button" onClick={addItem} className="bg-gray-600 text-white px-3 py-1 rounded">+ Add Item</button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Generate Invoice</button>
        </div>
      </form>
    </div>
  );
}
