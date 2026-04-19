import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { auth } from "../firebase"
import { signOut, onAuthStateChanged } from "firebase/auth"

// SVG Icons
const HomeIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const PackageIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
)
const TagIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>
  </svg>
)
const CartIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
)
const DashboardIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
)
const LogoutIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const UserIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const MenuIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
)
const CloseIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)

function Navbar() {
  const location = useLocation()
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const checkAdmin = () => {
    const localAdmin = JSON.parse(sessionStorage.getItem("adminUser"))
    if (localAdmin && localAdmin.isAdmin && localAdmin.token) {
      setIsAdmin(true)
      setIsLoggedIn(true)
      return true
    }
    return false
  }


  useEffect(() => {
    checkAdmin()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!checkAdmin()) {
        setIsAdmin(false)
        setIsLoggedIn(!!user)
      }
    })

    const handleAdminLogin = () => checkAdmin()
    window.addEventListener("adminLogin", handleAdminLogin)

    return () => {
      unsubscribe()
      window.removeEventListener("adminLogin", handleAdminLogin)
    }
  }, [])

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const total = cart.reduce((sum, item) => sum + item.quantity, 0)
    setCount(total)
  }

  useEffect(() => {
    updateCartCount()
    window.addEventListener("cartUpdated", updateCartCount)
    return () => window.removeEventListener("cartUpdated", updateCartCount)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("adminUser")
      localStorage.removeItem("adminUser") // For safety/backward compatibility
      setIsAdmin(false)
      setIsLoggedIn(false)
      await signOut(auth)
      window.location.href = "/"
    } catch {
      sessionStorage.removeItem("adminUser")
      localStorage.removeItem("adminUser")
      window.location.href = "/"
    }
  }


  // Don't show navbar on admin page
  if (location.pathname === "/admin") return null

  const navLinks = [
    { path: "/", label: "الرئيسية", icon: <HomeIcon /> },
    { path: "/products", label: "المنتجات", icon: <PackageIcon /> },
    { path: "/offers", label: "العروض", icon: <TagIcon /> },
  ]

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-amber-900/5 border-b border-amber-100/50"
          : "bg-white shadow-md"
      }`}
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* 🌿 Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all group-hover:scale-105">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4.7v9.6L12 21l-8-4.7V6.7L12 2z" />
              </svg>
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-l from-amber-600 to-amber-800 bg-clip-text text-transparent">
              كنوز اليمن
            </span>
          </Link>

          {/* 🖥️ Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(path)
                    ? "bg-amber-100 text-amber-700 shadow-inner"
                    : "text-gray-600 hover:text-amber-700 hover:bg-amber-50"
                }`}
              >
                <span className={isActive(path) ? "text-amber-500" : "text-gray-400"}>{icon}</span>
                {label}
                {isActive(path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-500 rounded-full"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}

            {/* Admin Link - only for admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 text-violet-600 hover:bg-violet-50"
              >
                <DashboardIcon size={16} />
                لوحة التحكم
              </Link>
            )}

            <div className="w-px h-8 bg-gray-200 mx-2" />

            {/* 🛒 Cart */}
            <Link
              to="/cart"
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive("/cart")
                  ? "bg-amber-100 text-amber-700"
                  : "text-gray-600 hover:text-amber-700 hover:bg-amber-50"
              }`}
            >
              <CartIcon size={20} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -left-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                >
                  {count}
                </motion.span>
              )}
            </Link>

            {/* Login / Logout */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <LogoutIcon size={16} />
                خروج
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-all duration-200 border border-amber-200"
              >
                <UserIcon size={16} />
                تسجيل دخول
              </Link>
            )}
          </div>

          {/* 📱 Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-700">
              <CartIcon size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
              onClick={() => setOpen(!open)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* 📱 Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-gray-100"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(path)
                      ? "bg-amber-100 text-amber-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={isActive(path) ? "text-amber-500" : "text-gray-400"}>{icon}</span>
                  {label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-violet-600 hover:bg-violet-50"
                >
                  <DashboardIcon size={16} />
                  لوحة التحكم
                </Link>
              )}

              <div className="pt-2 border-t border-gray-100 mt-2">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogoutIcon size={16} />
                    تسجيل الخروج
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-all"
                  >
                    <UserIcon size={16} />
                    تسجيل دخول
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar