import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import API_URL from "../config"

// --- Icons ---
const BagIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
const ClockIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
const EditIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 113 3L15.414 11l-3 3-3-3 7.071-7.071z" /></svg>
const XIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>

import SEO from "../components/SEO"

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        fetchUserOrders(currentUser.uid)
      } else {
        navigate("/login")
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchUserOrders = async (uid) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/orders/user/${uid}`)
      
      if (res.status === 429) {
          toast.error("طلبات كثيرة جداً، يرجى المحاولة بعد قليل", { id: "rate-limit" });
          setOrders([]);
          return;
      }

      const data = await res.json()
      
      if (Array.isArray(data)) {
          setOrders(data.sort((a, b) => b.id - a.id))
      } else {
          console.error("Orders data is not an array:", data);
          setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      toast.error("تعذر تحميل الطلبات حالياً")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm("هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟")
    if (!confirmed) return

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "cancelled", 
          cancelledBy: "العميل" 
        })
      })
      if (res.ok) {
        toast.success("تم إلغاء الطلب بنجاح")
        fetchUserOrders(user.uid)
      }
    } catch (err) {
      toast.error("فشل إلغاء الطلب")
    }
  }

  const getStatusInfo = (status) => {
    const states = {
      pending: { label: "قيد المراجعة", color: "amber", icon: "⏳" },
      confirmed: { label: "تم التأكيد", color: "blue", icon: "✅" },
      processing: { label: "جاري التجهيز", color: "indigo", icon: "📦" },
      shipped: { label: "تم الشحن", color: "violet", icon: "🚚" },
      delivered: { label: "تم التسليم", color: "green", icon: "🏁" },
      cancelled: { label: "ملغي", color: "red", icon: "✕" },
      rejected: { label: "مرفوض", color: "gray", icon: "🚫" },
      // الربط مع الحالات القديمة للتوافق
      accepted: { label: "تم التأكيد", color: "blue", icon: "✅" },
    }
    return states[status] || states.pending
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold animate-pulse">جاري جلب طلباتك...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-2 sm:px-4" dir="rtl">
      <SEO title="طلباتي" />

      {/* Header */}
      <div className="max-w-6xl mx-auto py-10 flex justify-between items-end">
          <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">طلباتي 📦</h1>
              <p className="text-gray-500 text-sm font-medium mt-1">تتبع حالة مشترياتك من كنوز اليمن</p>
          </div>
          <div className="hidden sm:flex w-12 h-12 bg-white rounded-2xl items-center justify-center text-amber-600 shadow-sm border border-gray-100">
              <BagIcon />
          </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto"
          >
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">لا توجد طلبات بعد!</h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">يبدو أنك لم تقم بطلب أي منتجات حتى الآن. ابدأ باكتشاف أجود أنواع العسل اليمني.</p>
            <button 
              onClick={() => navigate("/products")}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform"
            >
              ابدأ التسوق الآن
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {orders.map((order, idx) => {
              const status = getStatusInfo(order.status)
              const orderTotal = order.cart?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Status Bar */}
                  <div className={`h-1.5 w-full bg-${status.color}-500/10`}>
                      <div className={`h-full bg-${status.color}-500 transition-all duration-1000`} style={{ width: order.status === 'delivered' ? '100%' : '30%' }}></div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">رقم الطلب</p>
                            <h3 className="text-lg font-black text-gray-800">{order.orderId || `#${order.id.toString().slice(-6)}`}</h3>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold bg-${status.color}-50 text-${status.color}-700 border border-${status.color}-100 flex items-center gap-1.5`}>
                           <span>{status.icon}</span> {status.label}
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        {order.cart?.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 group">
                             <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             </div>
                             <div className="flex-grow">
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                <p className="text-[11px] text-gray-400">{item.quantity} × {item.price} ريال</p>
                             </div>
                          </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">التاريخ</p>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase">
                                <ClockIcon />
                                <span>{new Date(order.createdAt || order.id).toLocaleDateString("ar-YE")}</span>
                            </div>
                        </div>

                        <div className="text-left">
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">السعر الإجمالي</p>
                            <p className="text-xl font-black text-amber-600">{orderTotal.toLocaleString()} <span className="text-[10px] font-medium text-gray-400">ريال</span></p>
                        </div>
                    </div>

                    {/* Actions */}
                    {order.status === "pending" && (
                        <div className="mt-6 flex gap-3 pt-6 border-t border-gray-50">
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <XIcon /> إلغاء الطلب
                            </button>
                            <button 
                              onClick={() => {
                                  localStorage.setItem("cart", JSON.stringify(order.cart));
                                  toast.success("تم إدراج المنتجات في السلة للتعديل");
                                  navigate("/cart");
                              }}
                              className="flex-1 py-3 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <EditIcon /> تعديل البيانات
                            </button>
                        </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tailwind dynamic colors registration */}
      <div className="hidden bg-amber-50 bg-blue-50 bg-indigo-50 bg-violet-50 bg-green-50 bg-red-50 text-amber-700 text-blue-700 text-indigo-700 text-violet-700 text-green-700 text-red-700 border-amber-100 border-blue-100 border-indigo-100 border-violet-100 border-green-100 border-red-100 bg-amber-500 bg-blue-500 bg-indigo-500 bg-violet-500 bg-green-500 bg-red-500 text-amber-600 text-blue-600 text-indigo-600 text-violet-600 text-green-600 text-red-600 border-amber-500 border-blue-500 border-indigo-500 border-violet-500 border-green-500 border-red-500" />
    </div>
  )
}

export default MyOrders
