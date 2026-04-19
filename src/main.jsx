import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />


    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      containerStyle={{ top: 20 }}
      toastOptions={{

        duration: 3000,

        style: {
          background: "#1f2937",
          color: "#fff",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
        },

        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fff",
          },
        },

        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  </>
)