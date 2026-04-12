import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import honeyImage from "../assets/honey.jpg"

function Home() {
  const navigate = useNavigate()

  // تجهيز إعدادات الحركة (Animation Variants) للمميزات
  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  }

  return (
    <div className="bg-amber-50 min-h-screen font-sans" dir="rtl">

      {/* 🔥 Hero Section */}
      <div className="relative h-[80vh] min-h-[500px] max-h-[700px] flex items-center justify-center overflow-hidden">

        {/* الصورة الخلفية مع تأثير ضبابي خفيف للتركيز */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={honeyImage}
            alt="صورة عسل طبيعي"
            className="w-full h-full object-cover"
          />
        </div>

        {/* طبقة التدرج اللوني (Gradient Overlay) للعزل وإعطاء طابع العسل */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-900/60 to-black/30 mix-blend-multiply"></div>

        {/* المحتوى النصي الفاخر */}
        <div className="relative z-30 flex flex-col justify-center items-center text-center text-white px-4 mt-8 pb-16 md:pb-24">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-4"
          >
            <span className="bg-amber-500/20 text-amber-200 border border-amber-500/30 px-5 py-2 rounded-full text-sm sm:text-base font-semibold tracking-wide backdrop-blur-sm">
              أصالة الطبيعة بين يديك
            </span>
          </motion.div>

          {/* عنوان متحرك */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg"
          >
            كنوز اليمن <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-none">الطبيعية</span>
          </motion.h1>

          {/* وصف */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-lg md:text-2xl mb-12 max-w-2xl font-light text-amber-50 drop-shadow-md"
          >
            أجود أنواع العسل اليمني والمكسرات والزيوت الطبيعية الأصلية 
            بجودة لا تُضاهى وطعم أصيل.
          </motion.p>

          {/* الزر العصري - بارز ومتباين */}
          <motion.button
            onClick={() => navigate("/products")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, boxShadow: "0px 15px 35px rgba(245, 158, 11, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            className="relative overflow-hidden group bg-gradient-to-r from-amber-500 to-amber-600 px-14 py-5 rounded-full text-2xl font-extrabold text-white shadow-[0_10px_30px_rgba(245,158,11,0.5)] transition-all border-2 border-amber-300 hover:from-amber-400 hover:to-amber-500 hover:border-amber-200"
          >
            <span className="relative z-10 flex items-center gap-3">
              تصفح كنوزنا
              <svg className="w-7 h-7 transform group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            {/* تأثير اللمعان المستمر لجذب الانتباه */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
          </motion.button>

        </div>

        {/* انحناء SVG (Wave Separator) للأسفل */}
        <div className="absolute bottom-[-2px] w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,105.74,106.64,114.65,164.66,112.5,217.47,110.56,269.96,87.97,321.39,56.44Z" className="fill-amber-50"></path>
          </svg>
        </div>
      </div>

      {/* ⭐ قسم المميزات (Premium Features Section) */}
      <div className="max-w-6xl mx-auto py-20 px-6 sm:px-8 relative z-20">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-amber-950 inline-block relative"
          >
            لماذا تختار منتجاتنا؟
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-amber-500 rounded-full"></span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">

          {/* الميزة الأولى */}
          <motion.div 
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureVariants}
            className="bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 rounded-3xl border border-amber-100 group relative overflow-hidden"
          >
            {/* تأثير ضوء خلفي خفيف مع التمرير */}
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-100 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full blur-2xl"></div>
            
            <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-600 rounded-full flex justify-center items-center mb-6 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* أيقونة الجودة/العسل */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l8 4.7v9.6L12 21l-8-4.7V6.7L12 2z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-amber-900 group-hover:text-amber-700 transition-colors">جودة ملكية</h3>
            <p className="text-amber-950/70 leading-relaxed font-medium">
              عسل يمني حر، مقطوف من أعلى الجبال والمناحل الطبيعية بنقاوة %100 بدون إضافات.
            </p>
          </motion.div>

          {/* الميزة الثانية */}
          <motion.div 
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureVariants}
            className="bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 rounded-3xl border border-amber-100 group relative overflow-hidden"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-100 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full blur-2xl"></div>
            
            <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-600 rounded-full flex justify-center items-center mb-6 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* أيقونة التوصيل */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14l2-2 m0 0l2 2 m-2-2v6 m8-10a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-amber-900 group-hover:text-amber-700 transition-colors">توصيل آمن وسريع</h3>
            <p className="text-amber-950/70 leading-relaxed font-medium">
              نضمن وصول منتجاتنا إلى باب منزلك معبأة بأعلى معايير السلامة والنظافة.
            </p>
          </motion.div>

          {/* الميزة الثالثة */}
          <motion.div 
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureVariants}
            className="bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 rounded-3xl border border-amber-100 group relative overflow-hidden"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-100 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full blur-2xl"></div>
            
            <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-600 rounded-full flex justify-center items-center mb-6 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* أيقونة الضمان */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-amber-900 group-hover:text-amber-700 transition-colors">ضمان ذهبي</h3>
            <p className="text-amber-950/70 leading-relaxed font-medium">
              أصالة وجودة لا تقبل المساومة. رضاك الكامل هو أولويتنا القصوى مع كل قطرة.
            </p>
          </motion.div>

        </div>

      </div>

      {/* Decorative Custom CSS Animation */}
      <style>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        .animate-shine {
          animation: shine 2s infinite;
        }
      `}</style>
      
    </div>
  )
}

export default Home