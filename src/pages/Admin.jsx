import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from "../config";

function Admin() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // 🛡️ المساعدة في التوثيق (Auth Helpers)
  const handleUnauthorized = () => {
    sessionStorage.removeItem("adminUser");
    toast.error("انتهت الجلسة أو غير مصرح لك");
    window.location.href = "/login?admin=true";
  };

  const getAuthHeaders = (contentType = "application/json") => {
    const adminUser = JSON.parse(sessionStorage.getItem("adminUser"));
    const headers = {};
    if (contentType) headers["Content-Type"] = contentType;
    if (adminUser?.token) headers["Authorization"] = adminUser.token;
    return headers;
  };



  // Product form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [isOffer, setIsOffer] = useState(false);
  const [editId, setEditId] = useState(null);

  // Orders filters
  const [orderFilter, setOrderFilter] = useState("all"); // all, pending, accepted, archived, rejected
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // order id or "all" or "selected"

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [showProductDeleteConfirm, setShowProductDeleteConfirm] = useState(null);

  const fetchProducts = () => {
    fetch(`${API_URL}/products`)
      .then((res) => {
        if (res.status === 401) return handleUnauthorized();
        return res.json();
      })
      .then((data) => {
        if (data) setProducts(data);
      })
      .catch(err => console.error("Error fetching products:", err));
  };


  const isFirstLoad = useRef(true);
  const lastOrderId = useRef(null);

  const fetchOrders = () => {
    fetch(`${API_URL}/orders`, {
      headers: getAuthHeaders()
    })
      .then((res) => {
        if (res.status === 401) return handleUnauthorized();
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const latest = data[data.length - 1];


        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          lastOrderId.current = latest?.id;
          setOrders(data);
          return;
        }

        if (latest && latest.id !== lastOrderId.current) {
          lastOrderId.current = latest.id;
          showNotification(latest);
        }

        setOrders(data);
      })
      .catch(err => console.error("Error fetching orders:", err));
  };

  const showNotification = (order) => {
    toast.dismiss();
    toast.custom(() => (
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: "#1e293b", color: "white", padding: "20px", borderRadius: "16px",
          display: "flex", flexDirection: "column", gap: "12px", minWidth: "280px",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)", border: "1px solid #334155"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "#fbbf24", padding: "8px", borderRadius: "50%" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <strong style={{ fontSize: "16px", color: "#fbbf24" }}>طلب جديد وصل!</strong>
        </div>
        <div style={{ fontSize: "15px", color: "#cbd5e1" }}>👤 {order.name}</div>
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
          💰 {order.cart?.reduce((t, i) => t + (i.price * i.quantity), 0)} ريال
        </div>
        <button
          onClick={() => { setActiveTab("orders"); toast.dismiss(); }}
          style={{
            background: "linear-gradient(to right, #fbbf24, #f59e0b)", border: "none", padding: "8px",
            borderRadius: "8px", cursor: "pointer", color: "#1e293b", fontWeight: "bold", marginTop: "4px"
          }}
        >
          عرض الطلب التفصيلي
        </button>
      </motion.div>
    ), { duration: 5000 });
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // === Product CRUD ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("isOffer", isOffer);
    if (image) formData.append("image", image);

    if (editId) {
      const res = await fetch(`${API_URL}/products/${editId}`, { 
        method: "PUT", 
        headers: getAuthHeaders(null), // FormData handle content-type
        body: formData 
      });
      if (res.status === 401) return handleUnauthorized();
      toast.success("تم التحديث بنجاح");
    } else {
      const res = await fetch(`${API_URL}/products`, { 
        method: "POST", 
        headers: getAuthHeaders(null),
        body: formData 
      });
      if (res.status === 401) return handleUnauthorized();
      toast.success("تمت الإضافة بنجاح");
    }

    fetchProducts();
    resetForm();
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.status === 401) return handleUnauthorized();
      fetchProducts();
      toast.success("تم حذف المنتج بنجاح");
      setShowProductDeleteConfirm(null);
    } catch {

      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const editProduct = (p) => {
    setName(p.name);
    setPrice(p.price);
    setIsOffer(p.isOffer || false);
    setEditId(p.id);
    setActiveTab("add-product");
  };

  const resetForm = () => {
    setName(""); setPrice(""); setImage(null); setIsOffer(false); setEditId(null);
    setActiveTab("products");
  };

  // === Order Actions ===
  const acceptOrder = async (id) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, { 
        method: "PUT",
        headers: getAuthHeaders()
      });
      if (res.status === 401) return handleUnauthorized();
      fetchOrders();
      toast.success("تم قبول الطلب");
    } catch { toast.error("حدث خطأ"); }
  };


  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.status === 401) return handleUnauthorized();
      fetchOrders();
      const labels = { archived: "تمت الأرشفة", rejected: "تم الرفض", pending: "أُعيد للانتظار", accepted: "تم القبول" };
      toast.success(labels[status] || "تم التحديث");
    } catch { toast.error("حدث خطأ"); }
  };


  const deleteOrder = async (id) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.status === 401) return handleUnauthorized();
      fetchOrders();
      toast.success("تم حذف الطلب");
      setShowDeleteConfirm(null);
    } catch { toast.error("حدث خطأ"); }

  };

  const deleteSelectedOrders = async () => {
    try {
      for (const id of selectedOrders) {
        const res = await fetch(`${API_URL}/orders/${id}`, { 
          method: "DELETE",
          headers: getAuthHeaders()
        });
        if (res.status === 401) return handleUnauthorized();
      }
      setSelectedOrders([]);
      fetchOrders();
      toast.success(`تم حذف ${selectedOrders.length} طلب`);
      setShowDeleteConfirm(null);
    } catch { toast.error("حدث خطأ"); }

  };

  const deleteAllOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, { 
        method: "DELETE" ,
        headers: getAuthHeaders()
      });
      if (res.status === 401) return handleUnauthorized();
      setOrders([]);
      setSelectedOrders([]);
      toast.success("تم حذف جميع الطلبات");
      setShowDeleteConfirm(null);
    } catch { toast.error("حدث خطأ"); }

  };

  const archiveSelectedOrders = async () => {
    try {
      for (const id of selectedOrders) {
        const res = await fetch(`${API_URL}/orders/${id}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: "archived" })
        });
        if (res.status === 401) return handleUnauthorized();
      }
      setSelectedOrders([]);
      fetchOrders();
      toast.success("تمت أرشفة الطلبات المحددة");
    } catch { toast.error("حدث خطأ"); }

  };

  const toggleOrderSelection = (id) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  // === Filters ===
  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderFilter === "all" || o.status === orderFilter ||
      (orderFilter === "pending" && o.status !== "accepted" && o.status !== "archived" && o.status !== "rejected");
    const matchesSearch = !orderSearch || o.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone?.includes(orderSearch);
    return matchesFilter && matchesSearch;
  });

  const filteredProducts = products.filter(p =>
    !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // === Stats ===
  const totalIncome = orders.filter(o => o.status === "accepted").reduce((acc, order) => {
    return acc + (order.cart?.reduce((t, i) => t + (i.price * i.quantity), 0) || 0);
  }, 0);
  const pendingOrders = orders.filter(o => o.status !== "accepted" && o.status !== "archived" && o.status !== "rejected").length;
  const archivedOrders = orders.filter(o => o.status === "archived").length;
  const acceptedOrders = orders.filter(o => o.status === "accepted").length;

  const orderFilterTabs = [
    { id: "all", label: "الكل", count: orders.length, color: "slate" },
    { id: "pending", label: "قيد المراجعة", count: orders.filter(o => o.status === "pending" || !o.status).length, color: "amber" },
    { id: "confirmed", label: "تم التأكيد", count: orders.filter(o => o.status === "confirmed" || o.status === "accepted").length, color: "blue" },
    { id: "processing", label: "جاري التجهيز", count: orders.filter(o => o.status === "processing").length, color: "indigo" },
    { id: "shipped", label: "تم الشحن", count: orders.filter(o => o.status === "shipped").length, color: "violet" },
    { id: "delivered", label: "تم التسليم", count: orders.filter(o => o.status === "delivered").length, color: "green" },
    { id: "cancelled", label: "ملغي", count: orders.filter(o => o.status === "cancelled" || o.status === "rejected").length, color: "red" },
  ];


  // Icons
  const IconHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
  const IconBox = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
  const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>;
  const IconList = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
  const IconLogOut = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

  // Status badge helper
  const statusBadge = (status) => {
    const map = {
      pending: { label: "قيد المراجعة", bg: "bg-amber-100", text: "text-amber-700", icon: "⏳" },
      confirmed: { label: "تم التأكيد", bg: "bg-blue-100", text: "text-blue-700", icon: "✅" },
      accepted: { label: "تم التأكيد", bg: "bg-blue-100", text: "text-blue-700", icon: "✅" }, // توافق مع القديم
      processing: { label: "جاري التجهيز", bg: "bg-indigo-100", text: "text-indigo-700", icon: "📦" },
      shipped: { label: "تم الشحن", bg: "bg-violet-100", text: "text-violet-700", icon: "🚚" },
      delivered: { label: "تم التسليم", bg: "bg-green-100", text: "text-green-700", icon: "🏁" },
      cancelled: { label: "ملغي", bg: "bg-red-100", text: "text-red-700", icon: "✕" },
      rejected: { label: "ملغي", bg: "bg-red-100", text: "text-red-700", icon: "✕" }, // توافق مع القديم
    };
    const s = map[status] || map.pending;
    return (
      <span className={`${s.bg} ${s.text} text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1`}>
        <span>{s.icon}</span> {s.label}
      </span>
    );
  };


  // Delete confirmation modal
  const DeleteModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </div>
        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-center text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-semibold text-slate-700 hover:bg-slate-200 transition-colors">إلغاء</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 rounded-xl font-semibold text-white hover:bg-red-700 transition-colors">تأكيد الحذف</button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl flex flex-col z-20 border-l border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
              كنوز اليمن
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">لوحة الإدارة</p>
          </div>
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-600 text-xl font-bold">🍯</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "dashboard", label: "الرئيسية", icon: <IconHome /> },
            { id: "products", label: "إدارة المنتجات", icon: <IconBox /> },
            { id: "add-product", label: editId ? "تعديل المنتج" : "إضافة منتج", icon: <IconPlus /> },
            { id: "orders", label: `الطلبات (${orders.length})`, icon: <IconList /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === item.id
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-amber-600"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === "orders" && pendingOrders > 0 && (
                <span className="mr-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingOrders} جديد
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium"
          >
            <IconLogOut />
            <span>العودة للمتجر</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <h2 className="text-xl font-bold text-slate-800">
            {activeTab === "dashboard" && "نظرة عامة 📊"}
            {activeTab === "products" && "المنتجات 📦"}
            {activeTab === "add-product" && (editId ? "تعديل منتج ✏️" : "إضافة منتج جديد ✨")}
            {activeTab === "orders" && "إدارة الطلبات 🧾"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-800">المدير العام</p>
              <p className="text-xs text-slate-500">متصل الآن</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-amber-500">
               <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold">م</div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              

              {/* === TAB: DASHBOARD === */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">🛒</div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">المنتجات</p>
                        <h3 className="text-2xl font-bold text-slate-800">{products.length}</h3>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-2xl">📦</div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">الطلبات</p>
                        <h3 className="text-2xl font-bold text-slate-800">{orders.length}</h3>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl">⏳</div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">معلقة</p>
                        <h3 className="text-2xl font-bold text-slate-800">{pendingOrders}</h3>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">💰</div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">الدخل</p>
                        <h3 className="text-2xl font-bold text-slate-800">{totalIncome} <span className="text-sm font-normal text-slate-500">ريال</span></h3>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                     <h3 className="text-lg font-bold text-slate-800 mb-4">أحدث الطلبات المعلقة</h3>
                     {pendingOrders === 0 ? (
                       <div className="text-center py-8 text-slate-400">لا توجد طلبات معلقة حالياً</div>
                     ) : (
                       <div className="space-y-3">
                         {orders.filter(o => o.status !== "accepted" && o.status !== "archived" && o.status !== "rejected").slice(-5).reverse().map(order => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                                    {order.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800">{order.name}</p>
                                    <p className="text-sm text-slate-500">{order.phone}</p>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => setActiveTab("orders")}
                                 className="text-amber-600 text-sm font-medium hover:underline bg-white px-3 py-1.5 rounded-lg border border-amber-200"
                               >
                                 عرض التفاصيل
                               </button>
                            </div>
                         ))}
                       </div>
                     )}
                  </div>
                </div>
              )}


              {/* === TAB: PRODUCTS === */}
              {activeTab === "products" && (
                <div className="space-y-4">
                  {/* Product toolbar */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <input
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 outline-none focus:border-amber-500 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("add-product")}
                        className="bg-amber-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors flex items-center gap-2"
                      >
                        <IconPlus /> إضافة منتج
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-16 text-slate-400">
                         <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                         </svg>
                         <p className="text-lg font-medium text-slate-600">لا توجد منتجات</p>
                         <button onClick={() => setActiveTab("add-product")} className="mt-4 text-amber-600 font-medium hover:underline">إضافة منتج الآن</button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm text-slate-600">
                          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
                            <tr>
                              <th className="px-6 py-4 font-semibold">ت</th>
                              <th className="px-6 py-4 font-semibold">صورة</th>
                              <th className="px-6 py-4 font-semibold">الاسم</th>
                              <th className="px-6 py-4 font-semibold">السعر</th>
                              <th className="px-6 py-4 font-semibold">الحالة</th>
                              <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((p, i) => (
                              <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400">{i + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {p.image ? (
                                    <img src={typeof p.image === 'string' ? p.image : URL.createObjectURL(p.image)} alt={p.name} className="w-16 h-16 rounded-lg object-cover shadow-sm border border-slate-200" />
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs text-center border border-slate-200">لا صورة</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-800">{p.name}</td>
                                <td className="px-6 py-4 font-bold text-amber-600">{p.price} <span className="text-xs font-normal text-slate-500">ريال</span></td>
                                <td className="px-6 py-4">
                                  {p.isOffer ? (
                                    <span className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-bold">بعرض</span>
                                  ) : (
                                    <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full">عادي</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex justify-center gap-2 items-center">
                                    <button
                                      onClick={() => editProduct(p)}
                                      className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                                      title="تعديل"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    </button>
                                    <button
                                      onClick={() => setShowProductDeleteConfirm(p.id)}
                                      className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                                      title="حذف"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* === TAB: ADD / EDIT PRODUCT === */}
              {activeTab === "add-product" && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
                  <div className="mb-8">
                     <h3 className="text-xl font-bold text-slate-800">{editId ? "تعديل تفاصيل المنتج" : "إضافة تفاصيل المنتج الجديد"}</h3>
                     <p className="text-slate-500 mt-1 text-sm">أدخل المعلومات الأساسية للمنتج وصورة جذابة</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">اسم المنتج</label>
                      <input type="text" placeholder="مثال: عسل سدر يمني درجة أولى" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:bg-white transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">سعر المنتج (ريال)</label>
                      <input type="number" placeholder="مثال: 500" value={price} onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:bg-white transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">صورة المنتج</label>
                      <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 transition-colors text-center">
                        <input type="file" onChange={(e) => setImage(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center justify-center gap-2">
                           <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                           <p className="text-sm font-medium text-slate-600">انقر هنا لرفع صورة</p>
                           {image && <p className="text-xs text-amber-600 font-bold mt-2">📎 تم تحديد ملف</p>}
                           {!image && editId && <p className="text-xs text-slate-500 mt-2">اتركه فارغاً للاحتفاظ بالصورة السابقة</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                      <input id="offers" type="checkbox" checked={isOffer} onChange={(e) => setIsOffer(e.target.checked)}
                        className="w-5 h-5 text-amber-600 bg-slate-100 border-slate-300 rounded focus:ring-amber-500 cursor-pointer" />
                      <div className="mr-1">
                        <label htmlFor="offers" className="font-medium text-slate-800 cursor-pointer text-sm">تصنيف كعرض خاص</label>
                        <p className="text-slate-500 text-xs">سيظهر المنتج في قسم العروض المميزة</p>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button type="submit" className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all">
                        {editId ? "حفظ التعديلات 💾" : "نشر المنتج 🚀"}
                      </button>
                      {editId && (
                        <button type="button" onClick={resetForm} className="px-6 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">إلغاء</button>
                      )}
                    </div>
                  </form>
                </div>
              )}


              {/* === TAB: ORDERS === */}
              {activeTab === "orders" && (
                <div className="space-y-4">

                  {/* Orders Toolbar */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {orderFilterTabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => { setOrderFilter(tab.id); setSelectedOrders([]); }}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                            orderFilter === tab.id
                              ? `bg-${tab.color}-500 text-white shadow-md`
                              : `bg-${tab.color}-50 text-${tab.color}-600 hover:bg-${tab.color}-100`
                          }`}
                          style={orderFilter === tab.id ? {
                            backgroundColor: tab.color === "slate" ? "#64748b" : tab.color === "amber" ? "#f59e0b" : tab.color === "green" ? "#22c55e" : tab.color === "blue" ? "#3b82f6" : "#ef4444",
                            color: "white"
                          } : {}}
                        >
                          {tab.label}
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            orderFilter === tab.id ? "bg-white/20 text-white" : "bg-white text-slate-600"
                          }`}>{tab.count}</span>
                        </button>
                      ))}
                    </div>

                    {/* Search and actions bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="relative w-full sm:w-80">
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input
                          type="text"
                          placeholder="ابحث بالاسم أو رقم الهاتف..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 outline-none focus:border-amber-500 text-sm"
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {selectedOrders.length > 0 && (
                          <>
                            <button
                              onClick={archiveSelectedOrders}
                              className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                            >
                              📁 أرشفة ({selectedOrders.length})
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm("selected")}
                              className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors flex items-center gap-1.5"
                            >
                              🗑️ حذف ({selectedOrders.length})
                            </button>
                          </>
                        )}
                        {orders.length > 0 && (
                          <button
                            onClick={() => setShowDeleteConfirm("all")}
                            className="bg-slate-50 text-slate-500 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            حذف الكل
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center text-slate-400">
                       <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                       </svg>
                       <p className="text-lg font-medium text-slate-600">لا توجد طلبات في هذا التصنيف</p>
                    </div>
                  ) : (
                    <>
                      {/* Select All */}
                      <div className="flex items-center gap-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-amber-600 border-slate-300 rounded cursor-pointer"
                        />
                        <span className="text-sm text-slate-500 font-medium">
                          {selectedOrders.length > 0 ? `تم تحديد ${selectedOrders.length} من ${filteredOrders.length}` : "تحديد الكل"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {[...filteredOrders].reverse().map((order) => (
                          <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-2xl border overflow-hidden flex flex-col relative transition-all ${
                              selectedOrders.includes(order.id) ? "border-amber-400 ring-2 ring-amber-200" :
                              order.status === 'archived' ? "border-blue-100 opacity-75" :
                              order.status === 'rejected' ? "border-red-100 opacity-75" :
                              order.status === 'accepted' ? "border-slate-100 shadow-sm" :
                              "border-amber-200 shadow-md shadow-amber-100/50"
                            }`}
                          >
                            {/* Selection checkbox */}
                            <div className="absolute top-4 left-4 z-10">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={() => toggleOrderSelection(order.id)}
                                className="w-4 h-4 text-amber-600 border-slate-300 rounded cursor-pointer"
                              />
                            </div>

                            {/* Header */}
                            <div className={`p-5 flex items-center justify-between border-b border-slate-100 ${
                              order.status === 'archived' ? 'bg-blue-50/30' :
                              order.status === 'rejected' ? 'bg-red-50/30' :
                              order.status !== 'accepted' ? 'bg-amber-50/30' : 'bg-slate-50/50'
                            }`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                  order.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                  order.status === 'archived' ? 'bg-blue-100 text-blue-600' :
                                  order.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                  'bg-amber-100 text-amber-600'
                                }`}>
                                  {order.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                      {order.name}
                                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded italic font-normal">
                                        {order.orderId || `#${order.id.toString().slice(-6)}`}
                                      </span>
                                    </h3>
                                    <div className="text-slate-500 text-[10px] flex flex-wrap items-center gap-3 mt-1">
                                      <span className="flex items-center gap-1 font-mono">📱 {order.phone}</span>
                                      {order.userEmail && (
                                        <span className="flex items-center gap-1">📧 {order.userEmail}</span>
                                      )}
                                      {order.location && (
                                        <a href={order.location} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md">
                                          📍 الخريطة
                                        </a>
                                      )}
                                    </div>
                                  </div>
                              </div>
                              
                              <div className="text-left flex flex-col items-end gap-2">
                                {statusBadge(order.status)}
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.paymentMethod === 'cash' ? 'bg-slate-100 text-slate-600' : 'bg-purple-100 text-purple-600'}`}>
                                   {order.paymentMethod === "cash" ? "نقدي" : "تحويل"}
                                </span>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 flex-1">
                              <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">سلة المشتريات</h4>
                              <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {order.cart?.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                       <span className="font-semibold text-slate-700">{item.name}</span>
                                       <span className="text-slate-500 text-xs">× {item.quantity}</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{item.price * item.quantity} ريال</span>
                                  </div>
                                ))}
                                <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between items-center text-sm">
                                   <span className="font-bold text-slate-600">الإجمالي:</span>
                                   <span className="font-extrabold text-amber-600 text-base">{order.cart?.reduce((t, i) => t + (i.price * i.quantity), 0)} ريال</span>
                                </div>
                              </div>

                              {order.paymentImage && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-bold text-slate-800 mb-2">إيصال التحويل:</h4>
                                  <a href={order.paymentImage} target="_blank" rel="noreferrer" className="block w-full">
                                    <img src={order.paymentImage} alt="سند التحويل" className="h-32 w-full object-cover rounded-xl border border-slate-200 shadow-sm hover:opacity-90 transition-opacity" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-2 items-center justify-between mt-auto">
                              <div className="flex gap-2 flex-wrap">
                                <div className="flex gap-1.5 flex-wrap">
                                  {order.status === "pending" && (
                                    <button onClick={() => updateOrderStatus(order.id, "confirmed")} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">تأكيد الطلب ✅</button>
                                  )}
                                  {order.status === "confirmed" && (
                                    <button onClick={() => updateOrderStatus(order.id, "processing")} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">جاري التجهيز 📦</button>
                                  )}
                                  {order.status === "processing" && (
                                    <button onClick={() => updateOrderStatus(order.id, "shipped")} className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors">تم الشحن 🚚</button>
                                  )}
                                  {order.status === "shipped" && (
                                    <button onClick={() => updateOrderStatus(order.id, "delivered")} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors">تم التسليم 🏁</button>
                                  )}
                                  {order.status !== "cancelled" && order.status !== "delivered" && (
                                    <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">إلغاء ✕</button>
                                  )}
                                  {order.cancelledBy && (
                                    <span className="text-[10px] text-red-500 font-bold self-center">بواسطة: {order.cancelledBy}</span>
                                  )}
                                </div>
                                {/* أرشفة */}
                                {order.status !== "archived" && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "archived")}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5"
                                  >
                                    📁 أرشفة
                                  </button>
                                )}
                                {/* رفض */}
                                {order.status !== "rejected" && order.status !== "archived" && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "rejected")}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5"
                                  >
                                    ✕ رفض
                                  </button>
                                )}
                                {/* استعادة */}
                                {(order.status === "archived" || order.status === "rejected") && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "pending")}
                                    className="bg-amber-50 hover:bg-amber-100 text-amber-600 font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5"
                                  >
                                    🔄 استعادة
                                  </button>
                                )}
                              </div>
                              {/* حذف */}
                              <button
                                onClick={() => setShowDeleteConfirm(order.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                title="حذف الطلب"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Confirmation Modals */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteModal
            title={
              showDeleteConfirm === "all" ? "حذف جميع الطلبات" :
              showDeleteConfirm === "selected" ? `حذف ${selectedOrders.length} طلب` :
              "حذف هذا الطلب"
            }
            message={
              showDeleteConfirm === "all" ? "هل أنت متأكد من حذف جميع الطلبات؟ لا يمكن التراجع عن هذا الإجراء." :
              showDeleteConfirm === "selected" ? `هل أنت متأكد من حذف ${selectedOrders.length} طلب محدد؟` :
              "هل أنت متأكد من حذف هذا الطلب نهائياً؟"
            }
            onConfirm={() => {
              if (showDeleteConfirm === "all") deleteAllOrders();
              else if (showDeleteConfirm === "selected") deleteSelectedOrders();
              else deleteOrder(showDeleteConfirm);
            }}
            onCancel={() => setShowDeleteConfirm(null)}
          />
        )}
        {showProductDeleteConfirm && (
          <DeleteModal
            title="حذف المنتج"
            message="هل أنت متأكد من حذف هذا المنتج نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
            onConfirm={() => deleteProduct(showProductDeleteConfirm)}
            onCancel={() => setShowProductDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Admin;