import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"
import API_URL from "../config"

function Cart() {
  const [cart, setCart] = useState([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentImage, setPaymentImage] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // التحقق من تسجيل الدخول (Firebase أو أدمن محلي عبر الجلسة مؤقتاً)
    const sessionAdmin = JSON.parse(sessionStorage.getItem("adminUser"))
    if (sessionAdmin && sessionAdmin.isAdmin && sessionAdmin.token) {
      setIsLoggedIn(true)
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const admin = JSON.parse(sessionStorage.getItem("adminUser"))
      setIsLoggedIn(!!(user || (admin && admin.isAdmin && admin.token)))
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || []
    setCart(data)
  }, [])

  const updateCart = (newCart) => {
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const increase = (id) => {
    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    )
    updateCart(newCart)
  }

  const decrease = (id) => {
    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    )
    updateCart(newCart)
  }

  const remove = (id) => {
    const newCart = cart.filter(item => item.id !== id)
    updateCart(newCart)
  }

  const total = cart.reduce((t, i) => t + i.price * i.quantity, 0)

  const getLocation = () => {
    toast.loading("جاري تحديد الموقع...", { id: "loc" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        const url = `https://www.google.com/maps?q=${lat},${lon}`
        setLocation(url)
        toast.success("تم تحديد موقعك بنجاح 📍", { id: "loc" })
      },
      () => {
        toast.error("تعذر تحديد الموقع ❌", { id: "loc" })
      }
    )
  }

  const handleSubmit = async () => {
    // التحقق من تسجيل الدخول قبل إرسال الطلب
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    if (!name || !phone || !location || !paymentMethod) {
      toast.error("يرجى تعبئة جميع البيانات المطلوبة ⚠️")
      return
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("phone", phone)
    formData.append("location", location)
    formData.append("paymentMethod", paymentMethod)
    formData.append("cart", JSON.stringify(cart))

    if (paymentImage) {
      formData.append("paymentImage", paymentImage)
    }

    toast.loading("جاري إرسال الطلب...", { id: "submit" });

    try {
      await fetch(`${API_URL}/orders`, {
        method: "POST",
        body: formData
      })

      toast.success("تم إرسال طلبك بنجاح! 🚀", { id: "submit" })
      
      localStorage.removeItem("cart")
      setCart([])
      setName("")
      setPhone("")
      setLocation("")
      setPaymentMethod("")
      setPaymentImage(null)

    } catch (error) {
      toast.error("حدث خطأ في الإرسال ❌", { id: "submit" });
    }
  }

  return (
    <>
    {/* Login Prompt Modal */}
    <AnimatePresence>
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLoginPrompt(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">سجل دخولك لإتمام الطلب</h3>
            <p className="text-gray-500 text-sm mb-6">يرجى تسجيل الدخول أو إنشاء حساب لتتمكن من إرسال طلبك. سلتك محفوظة ولن تضيع!</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/login?redirect=/cart")}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                متابعة التصفح
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-gray-900 mb-10 flex items-center gap-3"
        >
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          سلة المشتريات
        </motion.h1>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-16 text-center max-w-2xl mx-auto border border-gray-100"
          >
            <div className="w-40 h-40 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-20 h-20 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">سلتك فارغة حالياً</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
              يبدو أنك لم تقم بإضافة أي منتجات شهية إلى سلتك بعد. استكشف منتجاتنا الطبيعية والفاخرة!
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-amber-500/30 transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              تصفح المنتجات
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* المنتجات */}
            <div className="lg:col-span-7 space-y-4">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-shadow hover:shadow-md flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group"
                  >
                    {/* الحافة الجانبية للزينة */}
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* صورة المنتج */}
                    <div className="w-24 h-24 bg-amber-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-amber-100">
                      {item.image ? (
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-10 h-10 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143z" />
                        </svg>
                      )}
                    </div>

                    {/* تفاصيل المنتج */}
                    <div className="flex-1 text-center sm:text-right w-full">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                      <p className="text-amber-600 font-semibold text-lg">{item.price} <span className="text-sm text-gray-500">ريال</span></p>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="flex items-center gap-1 bg-gray-50 rounded-full border border-gray-200 p-1">
                      <button 
                        onClick={() => increase(item.id)}
                        className="w-8 h-8 rounded-full bg-white text-gray-600 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                      <button 
                        onClick={() => decrease(item.id)}
                        className="w-8 h-8 rounded-full bg-white text-gray-600 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                    </div>

                    {/* زر الحذف */}
                    <button 
                      onClick={() => remove(item.id)}
                      className="absolute left-4 top-4 sm:relative sm:left-auto sm:top-auto w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                      title="حذف المنتج"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* تفاصيل الطلب والفورم */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-8"
            >
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">ملخص الطلب</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* الإجمالي */}
                <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                  <span className="text-gray-500 text-lg">إجمالي المنتجات ({cart.length})</span>
                  <span className="text-3xl font-bold text-gray-900">{total} <span className="text-xl text-gray-500 font-normal">ريال</span></span>
                </div>

                {/* البيانات */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 mb-2">بيانات التوصيل</h3>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-gray-50 text-gray-900"
                      placeholder="الاسم الكامل"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <input
                      type="tel"
                      className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-gray-50 text-gray-900"
                      placeholder="رقم الهاتف"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={getLocation}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-amber-500 text-amber-600 rounded-xl hover:bg-amber-50 font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {location ? "تم تحديد الموقع ✓" : "إرسال موقعي الحالي (GPS)"}
                  </button>
                </div>

                {/* طريقة الدفع */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-2">طريقة الدفع</h3>
                  <div className="relative">
                    <select
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-gray-50 text-gray-900 appearance-none cursor-pointer font-medium"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="" disabled>اختر طريقة الدفع</option>
                      <option value="cash">💵 الدفع عند الاستلام</option>
                      <option value="online">💳 دفع إلكتروني (حوالة)</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <AnimatePresence>
                    {paymentMethod === "online" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-amber-50 rounded-xl p-4 border border-amber-100 overflow-hidden"
                      >
                        <ul className="space-y-2 text-sm text-gray-700 mb-4">
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            بنك الكريمي: <strong className="text-amber-700 tracking-wider">3105594762</strong>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            بنك الشرق: <strong className="text-amber-700 tracking-wider">411671363</strong>
                          </li>
                        </ul>
                        
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">إرفاق صورة السند</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 transition-colors cursor-pointer"
                            onChange={(e) => setPaymentImage(e.target.files[0])}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl mt-4"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  تأكيد وإرسال الطلب
                </button>
                
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Cart