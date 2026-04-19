const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const multer = require("multer")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

const app = express()


// 🛡️ الطبقة 2: حماية العناوين (Security Headers)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // للسماح بعرض الصور من السيرفر
}))

// 🌐 الطبقة 4: قواعد الوصول (CORS) - السماح بالاتصال من أي مصدر يطلبه المستخدم (Reflective CORS)
app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())

// 🛑 الطبقة 3: منع الهجمات العشوائية (Rate Limiting)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, // زيادة الحد للسماح بلوحة الإدارة بالتحديث المستمر
  message: { message: "عدد طلبات كبير جداً، يرجى المحاولة لاحقاً" }
})


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // زيادة عدد المحاولات للتجربة (Relaxed for testing)
  message: { message: "محاولات دخول كثيرة، يرجى الانتظار 15 دقيقة" }
})


app.use("/orders", apiLimiter) // حماية قسم الطلبات من الإغراق (Spam)


// 🔒 إعدادات الحماية (Admin Security - Trimmed for safety)
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "hamza").trim()
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "2120").trim()
const ADMIN_SECRET = (process.env.ADMIN_SECRET || "hamza-secret-token-2026").trim()
const ADMIN_EMAIL_ALIAS = "admin@konoz.com" 


// Middleware للتحقق من الصلاحيات
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization
  if (token === ADMIN_SECRET) {
    next()
  } else {
    res.status(401).json({ message: "غير مصرح لك بالوصول (Unauthorized)" })
  }
}


// 🧼 الطبقة 5: تنظيف البيانات (Input Sanitization)
const sanitize = (text) => {
  if (typeof text !== "string") return text
  return text
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "") // حذف السكربتات
    .replace(/<\/?[^>]+(>|$)/g, "") // حذف أي تاجات HTML
    .replace(/[;\"\'\%\&\(\)\<\>\\]/g, (c) => "") // تنظيف إضافي للرموز الخطرة
    .trim()
}


const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitize(req.body[key])
      }
    }
  }
  next()
}

app.use(sanitizeMiddleware)

// 🔥 تأكد من المسارات

const DATA_PATH = path.join(__dirname, "data")
const UPLOADS_PATH = path.join(__dirname, "uploads")

// 📁 رفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_PATH)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    if (mimetype && extname) return cb(null, true)
    cb(new Error("Error: File upload only supports images (jpeg, jpg, png, webp)"))
  }
})


// 📂 قراءة وكتابة
const readJSON = (file) => {
  const fullPath = path.join(DATA_PATH, file)
  if (!fs.existsSync(fullPath)) return []
  return JSON.parse(fs.readFileSync(fullPath))
}

const saveJSON = (file, data) => {
  const fullPath = path.join(DATA_PATH, file)
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2))
}

// 🔥 اختبار السيرفر
app.get("/", (req, res) => {
  res.send("Server is working ✅")
})

// 🔐 تسجيل دخول الأدمن بنظام "التحقق الذكي"
app.post("/login", loginLimiter, (req, res) => {
  const { email, password } = req.body
  
  // تحويل للتبسيط وضمان عدم وجود مسافات أو اختلاف في الأحرف
  const inputIdentifier = (email || "").trim().toLowerCase()
  const inputPassword = (password || "").trim()

  const isUsernameMatch = inputIdentifier === ADMIN_USERNAME.toLowerCase()
  const isEmailMatch = inputIdentifier === ADMIN_EMAIL_ALIAS.toLowerCase()
  const isPasswordMatch = inputPassword === ADMIN_PASSWORD

  if ((isUsernameMatch || isEmailMatch) && isPasswordMatch) {
    res.json({ token: ADMIN_SECRET, isAdmin: true })
  } else {
    res.status(401).json({ message: "بيانات الدخول غير صحيحة" })
  }
})



// 🛍️ المنتجات
app.get("/products", (req, res) => {
  res.json(readJSON("products.json"))
})

// ➕ إضافة
app.post("/products", authMiddleware, upload.single("image"), (req, res) => {
  const products = readJSON("products.json")

  const newProduct = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    image: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null,
    isOffer: req.body.isOffer === "true",
  }

  products.push(newProduct)
  saveJSON("products.json", products)

  res.json(newProduct)
})

// ❌ حذف
app.delete("/products/:id", authMiddleware, (req, res) => {
  const products = readJSON("products.json")
  const newProducts = products.filter(p => p.id != req.params.id)
  saveJSON("products.json", newProducts)
  res.json({ message: "Deleted" })
})

// ✏️ تعديل
app.put("/products/:id", authMiddleware, upload.single("image"), (req, res) => {
  const products = readJSON("products.json")

  const updated = products.map(p => {
    if (p.id == req.params.id) {
      return {
        ...p,
        name: req.body.name || p.name,
        price: req.body.price || p.price,
        isOffer: req.body.isOffer === "true",
        image: req.file
          ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
          : p.image,
      }
    }
    return p
  })

  saveJSON("products.json", updated)
  res.json({ message: "Updated" })
})

// 📦 الطلبات
app.post("/orders", upload.single("paymentImage"), (req, res) => {
  const orders = readJSON("orders.json")

  const newOrder = {
    id: Date.now(),
    orderId: `KNZ-${Math.floor(1000 + Math.random() * 9000)}`, // رقم طلب مميز
    userId: req.body.userId || null,
    userEmail: req.body.userEmail || null,
    name: req.body.name,
    phone: req.body.phone,
    location: req.body.location,
    paymentMethod: req.body.paymentMethod,
    cart: JSON.parse(req.body.cart),
    paymentImage: req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : null,
    status: "pending", // قيد المراجعة
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [{ status: "pending", date: new Date().toISOString(), note: "تم إنشاء الطلب" }]
  }

  orders.push(newOrder)
  saveJSON("orders.json", orders)

  res.json({ message: "Order saved", orderId: newOrder.orderId })
})

// 📥 جلب طلبات مستخدم معين (لصفحة طلباتي)
app.get("/orders/user/:userId", (req, res) => {
  const orders = readJSON("orders.json")
  const userOrders = orders.filter(o => o.userId === req.params.userId)
  res.json(userOrders)
})


// 📥 جلب الطلبات (🔥 أهم نقطة)
app.get("/orders", authMiddleware, (req, res) => {
  res.json(readJSON("orders.json"))
})

// 📸 عرض الصور
app.use("/uploads", express.static(UPLOADS_PATH))

// ✅ قبول الطلب
app.put("/orders/:id", authMiddleware, (req, res) => {
  const orders = readJSON("orders.json")

  const updated = orders.map(order =>
    order.id == req.params.id
      ? { ...order, status: "accepted" }
      : order
  )

  saveJSON("orders.json", updated)

  res.json({ message: "Order accepted" })
})

// ❌ حذف طلب واحد
app.delete("/orders/:id", authMiddleware, (req, res) => {
  const orders = readJSON("orders.json")
  const newOrders = orders.filter(o => o.id != req.params.id)
  saveJSON("orders.json", newOrders)
  res.json({ message: "Order deleted" })
})

// 🗑️ حذف جميع الطلبات
app.delete("/orders", authMiddleware, (req, res) => {
  saveJSON("orders.json", [])
  res.json({ message: "All orders deleted" })
})

// 🔄 تحديث حالة الطلب أو التعديل
app.patch("/orders/:id", (req, res) => {
  const orders = readJSON("orders.json")
  const { status, cancelledBy, name, phone, location } = req.body
  
  let found = false
  const updated = orders.map(order => {
    if (order.id == req.params.id) {
      found = true
      const newStatus = status || order.status
      
      // إذا تم الإلغاء، نسجل من قام بذلك
      const cancellationInfo = cancelledBy ? { cancelledBy } : {}
      
      return { 
        ...order, 
        ...cancellationInfo,
        status: newStatus,
        name: name || order.name,
        phone: phone || order.phone,
        location: location || order.location,
        updatedAt: new Date().toISOString(),
        history: [...(order.history || []), { status: newStatus, date: new Date().toISOString(), note: cancelledBy ? `تم الإلغاء بواسطة ${cancelledBy}` : "تحديث الحالة" }]
      }
    }
    return order
  })

  if (!found) return res.status(404).json({ message: "الطلب غير موجود" })

  saveJSON("orders.json", updated)
  res.json({ message: "Order updated successfully" })
})


// 🛡️ الطبقة 7: معالجة الأخطاء الآمنة (Global Error Handler)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "حدث خطأ داخلي في السيرفر، تم تسجيل المشكلة" })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});