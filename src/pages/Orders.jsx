import { useEffect, useState } from "react"
import API_URL from "../config"

function Orders() {

  const [orders, setOrders] = useState([])

  // 📥 جلب الطلبات
  const fetchOrders = () => {
    fetch(`${API_URL}/orders`)
      .then(res => res.json())
      .then(data => {
        console.log("ORDERS:", data) // للتأكد
        setOrders(data)
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // ✅ قبول الطلب
  const acceptOrder = async (id) => {
    await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT"
    })

    fetchOrders() // تحديث مباشر
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl text-center mb-6 font-bold">
        الطلبات 📦
      </h1>

      {orders.length === 0 ? (
        <p className="text-center">لا توجد طلبات</p>
      ) : (
        <div className="space-y-6">

          {orders.map(order => (
            <div key={order.id} className="border p-4 rounded shadow">

              <p><b>👤 الاسم:</b> {order.name}</p>
              <p><b>📱 الهاتف:</b> {order.phone}</p>

              <p>
                <b>📍 الموقع:</b>
                {order.location ? (
                  <a
                    href={order.location}
                    target="_blank"
                    className="text-blue-600 ml-2"
                  >
                    عرض الموقع
                  </a>
                ) : "غير محدد"}
              </p>

              <p><b>💳 الدفع:</b> {order.paymentMethod}</p>

              {/* المنتجات */}
              <div className="mt-2">
                <b>🛒 المنتجات:</b>
                {order.cart.map((item, i) => (
                  <p key={i}>
                    - {item.name} × {item.quantity}
                  </p>
                ))}
              </div>

              {/* صورة التحويل */}
              {order.paymentImage && (
                <div className="mt-3">
                  <b>📸 صورة التحويل:</b>
                  <img
                    src={order.paymentImage}
                    className="w-40 mt-2 rounded border"
                  />
                </div>
              )}

              <p className="mt-3">
                <b>الحالة:</b>
                {order.status === "accepted"
                  ? " ✅ مقبول"
                  : " ⏳ قيد الانتظار"}
              </p>

              {order.status !== "accepted" && (
                <button
                  onClick={() => acceptOrder(order.id)}
                  className="bg-green-600 text-white px-4 py-2 mt-3 rounded hover:bg-green-700"
                >
                  قبول الطلب
                </button>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  )
}

export default Orders