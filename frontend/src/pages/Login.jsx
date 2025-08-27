import { useState } from "react";
import API from "../utils/api";
export default function Login({ setUser }) {
  const [phone, setPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", { phone, gstNumber });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      setUser(data.user);
    } catch { alert("Login failed"); }
  };
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input type="text" placeholder="Phone Number" value={phone}
          onChange={(e)=>setPhone(e.target.value)} className="border p-2 w-full rounded mb-4"/>
        <input type="text" placeholder="GST Number" value={gstNumber}
          onChange={(e)=>setGstNumber(e.target.value)} className="border p-2 w-full rounded mb-4"/>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
}
