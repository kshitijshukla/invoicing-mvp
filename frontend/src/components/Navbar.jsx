import { Link } from "react-router-dom";
export default function Navbar({ setUser }) {
  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between">
      <div className="flex items-center space-x-4">
        <span className="font-bold">Invoicing App</span>
        <Link to="/">Dashboard</Link>
        <Link to="/invoice">Create Invoice</Link>
        <Link to="/subscriptions">Subscriptions</Link>
        <Link to="/settings">Settings</Link>
      </div>
      <button onClick={()=>{localStorage.removeItem("token"); setUser(null);}}
        className="bg-red-500 px-3 py-1 rounded">Logout</button>
    </nav>
  );
}
