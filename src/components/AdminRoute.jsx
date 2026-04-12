import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"

const ADMIN_EMAIL = "test@gmail.com" // 🔥 غيره لإيميلك

function AdminRoute({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  if (user === undefined) {
    return <div className="text-center mt-10">جاري التحقق...</div>
  }

  // ❌ غير مسجل
  if (!user) {
    return <Navigate to="/login" />
  }

  // ❌ ليس أدمن
  if (user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" />
  }

  // ✅ أدمن
  return children
}

export default AdminRoute