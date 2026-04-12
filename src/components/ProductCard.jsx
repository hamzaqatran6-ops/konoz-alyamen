import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"
import { motion, AnimatePresence } from "framer-motion"

// SVG Icons
const ShoppingCartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
)

const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const TrendingDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>
  </svg>
)

function ProductCard({ product, addToCart }) {
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول مرة واحدة عند التحميل والمتابعة مع تغييرات الحالة
    const checkAuth = () => {
      const localAdmin = JSON.parse(localStorage.getItem("adminUser"))
      if (localAdmin && localAdmin.isAdmin) return true
      return !!auth.currentUser
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(checkAuth())
    })
    
    setIsLoggedIn(checkAuth())
    return () => unsubscribe()
  }, [])

  const handleAdd = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    setLoading(true)
    addToCart(product)
    setTimeout(() => {
      setLoading(false)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }, 600)
  }

  return (
    <>
      {/* Login Prompt Modal for Adding to Cart */}
      <AnimatePresence>
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowLoginPrompt(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              {/* Decorative background element */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
              
              <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner">
                <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-black text-gray-800 mb-3">سجل دخولك أولاً</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                عذراً، يجب عليك تسجيل الدخول لتتمكن من إضافة المنتجات إلى سلتك والبدء بالتسوق.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/login?redirect=${location.pathname}`)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(212,175,55,0.2)] border border-gray-100 hover:border-amber-200 transition-all duration-300 overflow-hidden group flex flex-col">
        {/* 🖼️ Product Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-50 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          
          {/* 🔥 Offer Badge */}
          {product.isOffer && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse" dir="rtl">
              <TrendingDownIcon className="ml-1" />
              <span>عرض خاص</span>
            </div>
          )}
          
          {/* Hover Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* 📦 Info Box */}
        <div className="p-5 flex flex-col flex-grow">
          <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors" dir="rtl">
            {product.name}
          </h2>

          {/* 💰 Price */}
          <div className="mb-4 flex-grow" dir="rtl">
            {product.isOffer ? (
              <div className="flex items-end gap-2">
                <span className="text-amber-600 font-black text-2xl">
                  {product.price} <span className="text-sm font-medium">ريال</span>
                </span>
                <span className="text-gray-400 line-through text-sm mb-1 decoration-red-400/50">
                  {product.price + 2000}
                </span>
              </div>
            ) : (
              <div className="flex items-end">
                <span className="text-amber-600 font-black text-2xl">
                  {product.price} <span className="text-sm font-medium">ريال</span>
                </span>
              </div>
            )}
          </div>

          {/* 🛒 Add Action */}
          <button
            onClick={handleAdd}
            disabled={loading || added}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex justify-center items-center gap-2 transform active:scale-95 ${
              added 
               ? "bg-green-50 text-green-600 border border-green-200 shadow-inner"
               : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-amber-500/30"
            }`}
            dir="rtl"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري الإضافة...</span>
              </>
            ) : added ? (
              <>
                <CheckIcon className="animate-[scale-in_0.2s_ease-out]" />
                <span>تمت الإضافة بنجاح</span>
              </>
            ) : (
              <>
                <ShoppingCartIcon className="group-hover:translate-x-1 transition-transform" />
                <span>أضف إلى السلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

export default ProductCard