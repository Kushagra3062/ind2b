"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Provider } from "react-redux"
import { store } from "@/store"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as HotToaster } from "react-hot-toast"
import CartProvider from "@/components/providers/CartProvider"
import WishlistProvider from "@/components/providers/WishlistProvider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CartProvider>
          <WishlistProvider>
            {children}
            <Toaster />
            <HotToaster />
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </Provider>
  )
}
