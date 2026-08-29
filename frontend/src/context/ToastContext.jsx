import { createContext, useContext, useState } from "react"
import Toast from "../components/Toast"

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type
    })

    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  const hideToast = () => {
    setToast(null)
  }

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast
      }}
    >
      {children}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}