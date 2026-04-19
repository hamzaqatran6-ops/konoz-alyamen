import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"

import Navbar from "./components/Navbar"

import Products from "./pages/Products"
import Home from "./pages/Home"
import Offers from "./pages/Offers"
import Cart from "./pages/Cart"
import Admin from "./pages/Admin"
import Login from "./pages/Login"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🧹 تنظيف البيانات القديمة (Insecure Legacy Data)
    localStorage.removeItem("adminUser")

    // التحقق من الأدمن المحلي أولاً (استخدام sessionStorage لزيادة الأمان)
    const adminUser = JSON.parse(sessionStorage.getItem("adminUser"))

    if (adminUser && adminUser.isAdmin && adminUser.token) {
      setUser({ email: adminUser.email, isAdmin: true, isLocalAdmin: true, token: adminUser.token })
    }

    // 🛡️ حارس الأمان: التأكد من إيقاف شاشة التحميل حتى لو فشل Firebase في الرد سريعاً
    const safetyTimeout = setTimeout(() => {
      setLoading(false)
    }, 3000)



    const unsubscribe = onAuthStateChanged(auth, (u) => {
      // إذا كان هناك أدمن مخزن في الجلسة، نفضله على مستخدم Firebase العادي لهذه الجلسة
      const sessionAdmin = JSON.parse(sessionStorage.getItem("adminUser"))
      if (sessionAdmin && sessionAdmin.isAdmin && sessionAdmin.token) {
        setUser({ email: sessionAdmin.email, isAdmin: true, isLocalAdmin: true, token: sessionAdmin.token })
      } else if (u) {
        setUser(u)
      } else {
        setUser(null)
      }
      setLoading(false)
    })


    const handleAdminLogin = () => {
      const adminUser = JSON.parse(sessionStorage.getItem("adminUser"))
      if (adminUser && adminUser.isAdmin && adminUser.token) {
        setUser({ email: adminUser.email, isAdmin: true, isLocalAdmin: true, token: adminUser.token })
      }
    }


    window.addEventListener("adminLogin", handleAdminLogin)
    return () => {
      unsubscribe()
      clearTimeout(safetyTimeout)
      window.removeEventListener("adminLogin", handleAdminLogin)
    }

  }, [])

  const isAdmin = () => {
    if (!user) return false
    return user.isLocalAdmin === true && !!user.token
  }


  if (loading) return <p className="text-center mt-10">جاري التحميل...</p>

  return (
    <Router>
      {/* الـ Navbar يظهر دائماً للجميع */}
      <Navbar />

      <Routes>
        {/* ✅ صفحات عامة - متاحة للجميع بدون تسجيل */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/cart" element={<Cart />} />

        {/* 🔓 صفحة تسجيل الدخول */}
        <Route path="/login" element={<Login />} />

        {/* 🔐 لوحة التحكم - تحتوي على تسجيل دخول مدمج */}
        <Route
          path="/admin"
          element={
            isAdmin()
              ? <Admin />
              : <Navigate to="/login?redirect=/admin&admin=true" />
          }
        />

        {/* أي مسار غلط يرجع للرئيسية */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App