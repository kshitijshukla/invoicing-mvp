import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InvoiceForm from "./pages/InvoiceForm.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Settings from "./pages/Settings.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {
  const [user, setUser] = useState(null);
  return (
    <Router>
      {user && <Navbar setUser={setUser} />}
      <Routes>
        {!user ? (
          <Route path="*" element={<Login setUser={setUser} />} />
        ) : (
          <>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/invoice" element={<InvoiceForm />} />
            <Route path="/subscriptions" element={<Subscriptions user={user} />} />
            <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
export default App;
