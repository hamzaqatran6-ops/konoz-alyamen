/**
 * 🌍 إعدادات الاتصال بالسيرفر
 * يتم تغيير الوصلة تلقائياً بناءً على بيئة التشغيل (تطوير أو إنتاج)
 */

// استبدل الرابط أدناه برابط السيرفر المرفوع (مثل Render أو Railway) عند توفره
// استبدل الرابط أدناه برابط السيرفر المرفوع من ريندر (Render)
// مثال: https://konoz-backend.onrender.com
const PRODUCTION_API_URL = "https://your-backend-url.onrender.com"

const API_URL = (import.meta.env.MODE === "development" || window.location.hostname === "localhost")
  ? "http://localhost:5000"
  : PRODUCTION_API_URL

export default API_URL
