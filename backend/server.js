const express = require("express")
const cors = require("cors")
const multer = require("multer")
const fs = require("fs")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

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

const upload = multer({ storage })

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

// 🛍️ المنتجات
app.get("/products", (req, res) => {
  res.json(readJSON("products.json"))
})

// ➕ إضافة
app.post("/products", upload.single("image"), (req, res) => {
  const products = readJSON("products.json")

  const newProduct = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    image: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null,
    isOffer: req.body.isOffer === "true",
  }

  products.push(newProduct)
  saveJSON("products.json", products)

  res.json(newProduct)
})

// ❌ حذف
app.delete("/products/:id", (req, res) => {
  const products = readJSON("products.json")
  const newProducts = products.filter(p => p.id != req.params.id)
  saveJSON("products.json", newProducts)
  res.json({ message: "Deleted" })
})

// ✏️ تعديل
app.put("/products/:id", upload.single("image"), (req, res) => {
  const products = readJSON("products.json")

  const updated = products.map(p => {
    if (p.id == req.params.id) {
      return {
        ...p,
        name: req.body.name || p.name,
        price: req.body.price || p.price,
        isOffer: req.body.isOffer === "true",
        image: req.file
          ? `http://localhost:5000/uploads/${req.file.filename}`
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
    name: req.body.name,
    phone: req.body.phone,
    location: req.body.location,
    paymentMethod: req.body.paymentMethod,
    cart: JSON.parse(req.body.cart),
    paymentImage: req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : null,
    status: "pending",
  }

  orders.push(newOrder)
  saveJSON("orders.json", orders)

  res.json({ message: "Order saved" })
})

// 📥 جلب الطلبات (🔥 أهم نقطة)
app.get("/orders", (req, res) => {
  res.json(readJSON("orders.json"))
})

// 📸 عرض الصور
app.use("/uploads", express.static(UPLOADS_PATH))

// ✅ قبول الطلب
app.put("/orders/:id", (req, res) => {
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
app.delete("/orders/:id", (req, res) => {
  const orders = readJSON("orders.json")
  const newOrders = orders.filter(o => o.id != req.params.id)
  saveJSON("orders.json", newOrders)
  res.json({ message: "Order deleted" })
})

// 🗑️ حذف جميع الطلبات
app.delete("/orders", (req, res) => {
  saveJSON("orders.json", [])
  res.json({ message: "All orders deleted" })
})

// 🔄 تحديث حالة الطلب (قبول / رفض / أرشفة)
app.patch("/orders/:id", (req, res) => {
  const orders = readJSON("orders.json")
  const { status } = req.body

  const updated = orders.map(order =>
    order.id == req.params.id
      ? { ...order, status: status || order.status }
      : order
  )

  saveJSON("orders.json", updated)
  res.json({ message: "Order status updated" })
})

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})