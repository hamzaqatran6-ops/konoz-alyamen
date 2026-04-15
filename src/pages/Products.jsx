import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProductCard from "../components/ProductCard"
import API_URL from "../config"

// SVG Icons
const SearchIcon = ({ className, size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
)

const DropletIcon = ({ className, size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
)

const SparklesIcon = ({ className, size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
)

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all") // all, offers

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" || (filter === "offers" && product.isOffer)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20" dir="rtl">

      {/* 🌟 Premium Hero Section */}
      <div className="relative bg-gradient-to-b from-amber-50 to-transparent pt-12 pb-16 overflow-hidden">
        {/* Soft floating background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
          <div className="absolute top-12 -left-24 w-72 h-72 bg-yellow-200 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-4">
              <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                <SparklesIcon size={16} /> أجود أنواع العسل اليمني
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              كنوز الطبيعة <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-500 to-yellow-600">بين يديك</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              تصفح تشكيلتنا الفاخرة من العسل الطبيعي والمكسرات المختارة بعناية فائقة لترضي ذوقك الرفيع.
            </p>
          </motion.div>
        </div>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="container mx-auto px-4 -mt-8 relative z-20 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl shadow-amber-900/5 border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          {/* Search Input */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors">
              <SearchIcon size={20} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن العسل المفضل لديك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 block pl-4 pr-11 py-3.5 transition-all outline-none"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar justify-start md:justify-end">
            <button
              onClick={() => setFilter("all")}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all ${filter === "all"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter("offers")}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${filter === "offers"
                ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                : "bg-gray-50 text-gray-600 hover:bg-red-50"
                }`}
            >
              <DropletIcon size={18} />
              عروض مميزة
            </button>
          </div>
        </motion.div>
      </div>

      {/* 🛍️ Products Grid */}
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-gray-500 font-medium animate-pulse">جاري تحضير المنتجات الفاخرة...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="text-gray-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">لا توجد نتائج!</h3>
            <p className="text-gray-500">
              لم نعثر على منتجات تطابق بحثك. جرب استخدام كلمات مختلفة.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setFilter("all"); }}
              className="mt-6 text-amber-600 font-semibold hover:text-amber-700"
            >
              عرض جميع المنتجات &rarr;
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8"
          >
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
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

    </div>
  )
}

export default Products