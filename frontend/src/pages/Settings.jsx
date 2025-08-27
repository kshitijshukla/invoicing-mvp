import { useEffect, useState } from "react";
import API from "../utils/api";

export default function Settings({ user, setUser }) {
  const [form, setForm] = useState({
    businessName: "", gstNumber: "", address: "", email: "", brandColor: "#111827"
  });
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    (async () => {
      const userId = localStorage.getItem("userId");
      const { data } = await API.get(`/user/profile`, { headers: { "x-user-id": userId } });
      setForm({
        businessName: data.user?.businessName || "",
        gstNumber: data.user?.gstNumber || "",
        address: data.user?.address || "",
        email: data.user?.email || "",
        brandColor: data.user?.brandColor || "#111827",
      });
      setLogoPreview(data.user?.logoUrl || null);
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const { data } = await API.put("/user/profile", { ...form, userId });
    setUser(data.user);
    alert("Saved");
  };

  const onLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const userId = localStorage.getItem("userId");
    const fd = new FormData();
    fd.append("logo", file);
    const { data } = await API.post(`/user/logo?userId=${userId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    setLogoPreview(data.user.logoUrl);
    setUser(data.user);
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Branding & Business Profile</h1>
      <div className="mb-6 flex items-center space-x-4">
        <img src={logoPreview || "https://via.placeholder.com/80"} alt="logo" className="w-20 h-20 rounded bg-gray-100 object-contain"/>
        <label className="bg-gray-800 text-white px-3 py-2 rounded cursor-pointer">
          Upload Logo
          <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={onLogoChange}/>
        </label>
      </div>
      <form onSubmit={save} className="space-y-4">
        <input className="border p-2 w-full rounded" placeholder="Business Name" value={form.businessName} onChange={e=>setForm({...form,businessName:e.target.value})}/>
        <input className="border p-2 w-full rounded" placeholder="GST Number" value={form.gstNumber} onChange={e=>setForm({...form,gstNumber:e.target.value})}/>
        <input className="border p-2 w-full rounded" placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
        <input type="email" className="border p-2 w-full rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <div className="flex items-center space-x-3">
          <label className="w-40">Brand Color</label>
          <input type="color" value={form.brandColor} onChange={e=>setForm({...form,brandColor:e.target.value})}/>
          <span className="text-sm text-gray-600">{form.brandColor}</span>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
