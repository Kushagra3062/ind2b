"use client"
import { useState, useEffect, useRef } from "react"
import { getCurrentUser } from "@/actions/auth"

export default function IdlePopup() {
  const [isIdle, setIsIdle] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const idleTime = 5000 // 5 seconds

  const observerRef = useRef<MutationObserver | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    const checkSellerOnboardingStatus = async () => {
      try {
        const user = await getCurrentUser()
        if (user && user.type === "seller" && user.onboardingStatus === "light_completed") {
          const response = await fetch("/api/seller/profile-status")
          if (response.ok) {
            const data = await response.json()
            if (data.status === "Pending Completion") {
              if (isMountedRef.current) {
                setShouldShow(false)
              }
              return
            }
          }
        }
        if (isMountedRef.current) {
          setShouldShow(true)
        }
      } catch (error) {
        console.error("Error checking seller onboarding status:", error)
        if (isMountedRef.current) {
          setShouldShow(true)
        }
      }
    }

    checkSellerOnboardingStatus()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const checkForOpenModals = () => {
      const hasOpenDialog = document.querySelector('[role="dialog"][data-state="open"]') !== null
      const hasOpenModal = document.querySelector("[data-radix-dialog-content]") !== null
      if (isMountedRef.current) {
        setIsModalOpen(hasOpenDialog || hasOpenModal)
      }
    }

    checkForOpenModals()

    const handleFocusChange = () => {
      checkForOpenModals()
    }

    // Check on focus/blur events instead of observing all DOM changes
    window.addEventListener("focus", handleFocusChange, { passive: true })
    window.addEventListener("blur", handleFocusChange, { passive: true })
    document.addEventListener("click", handleFocusChange, { passive: true, capture: true })

    return () => {
      window.removeEventListener("focus", handleFocusChange)
      window.removeEventListener("blur", handleFocusChange)
      document.removeEventListener("click", handleFocusChange)

      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!shouldShow) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsIdle(true)
      }
    }, idleTime)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMountedRef.current) setIsIdle(false)
    }
    window.addEventListener("keydown", onKeyDown, { passive: true })

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [shouldShow])

  if (!isIdle || !shouldShow || isModalOpen) return null

  const ORANGE = "#FF6A00"
  const BLACK = "#111111"
  const WHITE = "#FFFFFF"
  const OVERLAY_BG = "rgba(0,0,0,0.55)"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Idle notice"
      style={{
        position: "fixed",
        inset: 0,
        background: OVERLAY_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "min(420px, 90vw)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
          background: WHITE,
          color: BLACK,
          transform: "translateY(8px)",
          animation: "slideUp 240ms ease-out forwards",
          position: "relative",
        }}
      >
        <button
          onClick={() => setIsIdle(false)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 10,
            width: "28px",
            height: "28px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.7)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.5)"
          }}
          aria-label="Close popup"
        >
          <div style={{ position: "relative", width: "14px", height: "14px" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "10px",
                height: "2px",
                background: WHITE,
                transform: "translate(-50%, -50%) rotate(45deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "10px",
                height: "2px",
                background: WHITE,
                transform: "translate(-50%, -50%) rotate(-45deg)",
              }}
            />
          </div>
        </button>

        <div
          style={{
            height: 5,
            background: ORANGE,
          }}
        />

        <div
          style={{
            padding: "16px 18px 14px 18px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 9px",
              borderRadius: 999,
              background: "#FFF5EE",
              color: ORANGE,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              border: `1px solid ${ORANGE}1A`,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: ORANGE,
                boxShadow: `0 0 0 2px ${ORANGE}26`,
              }}
            />
            Exclusive
          </div>

          <h2
            style={{
              margin: "12px 0 6px 0",
              fontSize: 18,
              lineHeight: 1.2,
              letterSpacing: -0.2,
              fontWeight: 800,
              color: BLACK,
            }}
          >
            Don't miss out on exclusive offers for our B2B partners!
          </h2>

          <p
            style={{
              margin: "0 0 10px 0",
              color: "#333",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            Unlock partner-only pricing, priority support, and tailored solutions designed to scale with your business.
          </p>

          <p
            style={{
              margin: "0 0 14px 0",
              color: "#333",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            Explore products with the lowest rates from across our range of products across all categories and across
            all brands
          </p>

          <a
            href="https://www.ind2b.com/seller"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: "6px",
              overflow: "hidden",
              marginBottom: "12px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)"
              e.currentTarget.style.boxShadow = "0 5px 14px rgba(0,0,0,0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.1)"
            }}
          >
            <img
              src="/sell.jpg"
              alt="B2B Partnership Advertisement"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </a>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
