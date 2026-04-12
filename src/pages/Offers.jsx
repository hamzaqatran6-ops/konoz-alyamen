import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProductCard from "../components/ProductCard"

// SVG Icons
const FireIcon = ({ className, size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
)

const TagIcon = ({ className, size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>
  </svg>
)

const SparklesIcon = ({ className, size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
)

const GiftIcon = ({ className, size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
  </svg>
)

const PercentIcon = ({ className, size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
)

const ClockIcon = ({ className, size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

function Offers() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const offerProducts = products.filter(p => p.isOffer)

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20" dir="rtl">

      {/* 🔥 Premium Hero Section with Gradient */}
      <div className="relative bg-gradient-to-b from-red-50 via-orange-50 to-transparent pt-12 pb-20 overflow-hidden">
        {/* Animated floating background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
          <div className="absolute top-12 -left-24 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-amber-200 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="flex justify-center mb-5">
              <span className="bg-red-100 text-red-600 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
                <FireIcon size={18} className="animate-pulse" /> عروض حصرية لفترة محدودة
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-5 tracking-tight leading-tight">
              عروض{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-red-500 via-orange-500 to-amber-500">
                لا تُقاوم
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              اغتنم الفرصة واحصل على أجود أنواع العسل اليمني والمكسرات الفاخرة بأسعار استثنائية قبل انتهاء العرض!
            </p>
          </motion.div>
        </div>
      </div>

      {/* 🏷️ Features Strip */}
      <div className="container mx-auto px-4 -mt-10 relative z-20 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl shadow-red-900/5 border border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Feature 1 */}
          <div className="flex items-center gap-3 justify-center sm:justify-start p-3 rounded-xl hover:bg-red-50/50 transition-colors group">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-110 transition-transform">
              <PercentIcon className="text-white" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">خصومات حقيقية</h3>
              <p className="text-xs text-gray-500">أسعار مخفضة على أجود الأصناف</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3 justify-center sm:justify-start p-3 rounded-xl hover:bg-amber-50/50 transition-colors group">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <GiftIcon className="text-white" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">عروض حصرية</h3>
              <p className="text-xs text-gray-500">منتجات مختارة بعناية لك</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3 justify-center sm:justify-start p-3 rounded-xl hover:bg-orange-50/50 transition-colors group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
              <ClockIcon className="text-white" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">لفترة محدودة</h3>
              <p className="text-xs text-gray-500">اغتنم الفرصة قبل النفاد</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section Title with Counter */}
      <div className="container mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <TagIcon className="text-red-500" size={20} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">المنتجات المخفضة</h2>
              {!loading && (
                <p className="text-sm text-gray-500">
                  {offerProducts.length > 0 ? `${offerProducts.length} منتج بسعر مميز` : "لا توجد عروض حالياً"}
                </p>
              )}
            </div>
          </div>

          {/* Animated Fire Badge */}
          {!loading && offerProducts.length > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg shadow-red-500/20"
            >
              <FireIcon size={16} />
              <span>وفّر الآن!</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 🛍️ Products Grid */}
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FireIcon className="text-red-400 animate-pulse" size={20} />
              </div>
            </div>
            <p className="text-gray-500 font-medium animate-pulse">جاري تحميل العروض الحصرية...</p>
          </div>
        ) : offerProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center max-w-lg mx-auto shadow-sm border border-gray-100"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <TagIcon className="text-red-300" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">لا توجد عروض حالياً</h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              نعمل على تجهيز عروض مميزة لك! تابعنا لتكون أول من يعرف عن أحدث العروض والخصومات.
            </p>
            <div className="flex items-center justify-center gap-2 text-amber-600 font-semibold">
              <SparklesIcon size={16} />
              <span>ترقّب عروضنا القادمة</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8"
          >
            <AnimatePresence>
              {offerProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <ProductCard
                    product={product}
                    addToCart={addToCart}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Decorative Custom CSS Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite linear;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Offers