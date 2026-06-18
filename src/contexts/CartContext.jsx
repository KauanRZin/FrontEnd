// ============================================================
// CartContext — carrinho do cliente (em memória, sem persistência) - Kauan
// ============================================================

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // items: [{ productId, name, price, quantity, categoryName }]
  const [items, setItems] = useState([])
  const [note, setNote] = useState('')

  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price || 0),
        quantity,
        categoryName: product.category?.name,
      }]
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId))
      return
    }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i))
  }, [])

  const incrementItem = useCallback((productId) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i))
  }, [])

  const decrementItem = useCallback((productId) => {
    setItems(prev => {
      const target = prev.find(i => i.productId === productId)
      if (target && target.quantity <= 1) return prev.filter(i => i.productId !== productId)
      return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setNote('')
  }, [])

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])

  const value = useMemo(() => ({
    items, note, setNote,
    addItem, removeItem, setQuantity, incrementItem, decrementItem, clearCart,
    itemCount, total,
  }), [items, note, addItem, removeItem, setQuantity, incrementItem, decrementItem, clearCart, itemCount, total])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
