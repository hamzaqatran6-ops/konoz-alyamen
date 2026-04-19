import { useState, useEffect } from "react"
import { auth } from "../firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth"
import toast from "react-hot-toast"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

import API_URL from "../config"

function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const isAdminLogin = searchParams.get("admin") === "true"

  // 🧹 إفراغ الحقول عند تحميل الصفحة لضمان عدم بقاء بيانات قديمة (مثل إكمال المتصفح التلقائي)
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail("")
      setPassword("")
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("⚠️ الرجاء إدخال البيانات المطلوبة")
      return
    }

    setIsLoading(true)
    const loadingId = toast.loading("⏳ جاري التحقق...")

    // 🧹 تصفير أي جلسة قديمة لضمان عدم حدوث تضارب
    sessionStorage.removeItem("adminUser")


    // 🔐 التحقق من الأدمن عبر السيرفر
    if (!isRegister && isAdminLogin) {
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        })
        
        const data = await response.json()

        if (response.ok && data.token) {
          sessionStorage.setItem("adminUser", JSON.stringify({ 
            email: email.includes("@") ? email : `admin (${email})`, 
            isAdmin: true,
            token: data.token 
          }))

          toast.dismiss(loadingId)
          toast.success("✅ مرحباً بك يا أدمن!")
          window.dispatchEvent(new Event("adminLogin"))
          
          // بدلاً من navigate، نستخدم تحويل الصفحة كاملاً لضمان تصفير الكاش وحالة React بالكامل
          setTimeout(() => {
            window.location.href = redirect
          }, 800)


        } else {
          toast.dismiss(loadingId)
          const errorMsg = data.message || "بيانات الأدمن غير صحيحة"
          toast.error("❌ " + errorMsg)
          console.error("Admin Auth Failed:", data)
        }
      } catch (err) {
        toast.dismiss(loadingId)
        toast.error("❌ فشل الاتصال بالسيرفر. تأكد من أن السيرفر يعمل وحالة الـ CORS")
        console.error("Fetch error:", err)
      } finally {
        setIsLoading(false)
      }
      return
    }


    // إذا كانت صفحة دخول الأدمن فقط، لا نسمح بـ Firebase login
    if (isAdminLogin) {
      toast.dismiss(loadingId)
      toast.error("❌ بيانات الأدمن غير صحيحة")
      setIsLoading(false)
      return
    }

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password)
        toast.success("✅ تم إنشاء الحساب بنجاح!")
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success("✅ أهلاً بك مجدداً!")
      }

      toast.dismiss(loadingId)
      
      // نستخدم التحويل الكامل لضمان مزامنة حالة Firebase في كل أجزاء المتصفح وبناء الرابط بشكل صحيح
      setTimeout(() => {
        const origin = window.location.origin
        window.location.href = origin + (redirect.startsWith("/") ? redirect : "/" + redirect)
      }, 800)



    } catch (err) {
      toast.dismiss(loadingId)
      let errorMsg = "حدث خطأ ما."
      if (err.code === 'auth/email-already-in-use') errorMsg = "البريد الإلكتروني مستخدم مسبقاً."
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') errorMsg = "البريد الإلكتروني أو كلمة المرور غير صحيحة."
      else if (err.code === 'auth/invalid-email') errorMsg = "تنسيق البريد الإلكتروني غير صحيح."
      else if (err.code) errorMsg = `خطأ تقني: (${err.code})` // إظهار الكود التقني للمساعدة في التشخيص
      
      toast.error("❌ " + errorMsg)
      console.error("Firebase Auth Error:", err)

      
      // 🧹 إفراغ الحقول عند الخطأ لضمان الخصوصية
      setEmail("")
      setPassword("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100" dir="rtl">
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`w-20 h-20 ${isAdminLogin ? 'bg-gradient-to-tr from-violet-500 to-purple-600' : 'bg-gradient-to-tr from-amber-400 to-orange-500'} rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 transform rotate-12`}
            >
              <svg className="w-10 h-10 text-white transform -rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {isAdminLogin ? (
                  <><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4.7v9.6L12 21l-8-4.7V6.7L12 2z"></path>
                )}
              </svg>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.h2 
                key={isAdminLogin ? "admin" : isRegister ? "register" : "login"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`text-3xl font-bold bg-gradient-to-r ${isAdminLogin ? 'from-violet-600 to-purple-600' : 'from-amber-600 to-orange-600'} bg-clip-text text-transparent`}
              >
                {isAdminLogin ? "دخول الإدارة" : isRegister ? "حساب جديد" : "تسجيل الدخول"}
              </motion.h2>
            </AnimatePresence>
            
            <p className="text-gray-600 mt-2 text-sm font-medium">
              {isAdminLogin 
                ? "دخول مخصص لمدير المتجر فقط"
                : isRegister 
                  ? "انضم إلى عائلة كنوز اليمن" 
                  : "مرحباً بعودتك إلى كنوز اليمن"
              }
            </p>
          </div>

          {/* 🔄 زر التبديل بين الأدمن والمستخدم */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (isAdminLogin) {
                  params.delete("admin");
                } else {
                  params.set("admin", "true");
                }
                navigate(`/login?${params.toString()}`);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                isAdminLogin 
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              {isAdminLogin ? "← التبديل لدخول الزبائن" : "⚙️ دخول لوحة الإدارة"}
            </button>
          </div>


          <form onSubmit={handleAuth} className="space-y-5" autoComplete="off">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={isAdminLogin ? "اسم المستخدم" : "البريد الإلكتروني (Gmail/Outlook...)"}
                className="w-full pl-4 pr-10 py-3 bg-white/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all duration-300 placeholder-gray-400 text-gray-800"

                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="كلمة المرور"
                className="w-full pl-4 pr-10 py-3 bg-white/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all duration-300 placeholder-gray-400 text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className={`w-full relative py-3 mt-4 ${isAdminLogin ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 hover:shadow-purple-500/30' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-orange-500/30'} text-white rounded-xl font-bold shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>جاري المعالجة...</span>
                </div>
              ) : (
                <span>{isAdminLogin ? "دخول لوحة التحكم" : isRegister ? "إنشاء الحساب" : "دخول آمن"}</span>
              )}
            </motion.button>
          </form>

          {/* Register toggle */}
          <div className="mt-8 text-center text-sm font-medium text-gray-600">
            <p>
              {isAdminLogin ? (
                <span className="text-xs text-gray-400">حسابات الإدارة يتم تعيينها من السيرفر فقط</span>
              ) : (
                <>
                  {isRegister ? "لديك حساب بالفعل؟ " : "ليس لديك حساب؟ "}
                  <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-amber-600 hover:text-orange-600 transition-colors font-bold select-none cursor-pointer"
                  >
                    {isRegister ? "سجل دخولك من هنا" : "أنشئ حساباً الآن"}
                  </button>
                </>
              )}
            </p>
          </div>


          {/* Back to home */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-amber-600 transition-colors font-medium"
            >
              ← العودة للمتجر
            </button>
          </div>

        </div>
      </motion.div>
      
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

export default Login