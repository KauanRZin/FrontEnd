// ============================================================
// Carrinho — Pág do Cliente: revisar itens e finalizar pedido - Kauan
// ============================================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'
import { ordersApi } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import toast from 'react-hot-toast'

export default function CarrinhoPage() {
  const { items, note, setNote, incrementItem, decrementItem, removeItem, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState(user?.address || '')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio')
      return
    }
    if (!address.trim()) {
      toast.error('Informe o endereço de entrega')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        userId: user.id,
        address,
        note: note || undefined,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      }
      const res = await ordersApi.create(payload)
      toast.success('Pedido realizado com sucesso!')
      clearCart()
      const newOrderId = res.data?.id
      navigate(newOrderId ? `/user/em-andamento/${newOrderId}` : '/user/em-andamento', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao confirmar o pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Carrinho</h2>
            <p>Seus itens antes de finalizar o pedido</p>
          </div>
        </div>
        <div className="empty-state">
          <ShoppingCart size={32} />
          <h3>Seu carrinho está vazio</h3>
          <p>Adicione itens do cardápio para continuar.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/user/cardapio')}>
            <ArrowLeft size={14} /> Ir para o cardápio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Carrinho</h2>
          <p>{items.length} {items.length === 1 ? 'item' : 'itens'} no carrinho</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/user/cardapio')}>
          <ArrowLeft size={14} /> Continuar comprando
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card col-full" style={{ gridColumn: 'span 1' }}>
          <div className="order-items">
            {items.map(i => (
              <div key={i.productId} className="order-item-row" style={{ alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'var(--cream)', display: 'block' }}>{i.name}</strong>
                  <span style={{ color: 'var(--cream-faint)', fontSize: 12 }}>
                    R$ {i.price.toFixed(2)} cada
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => decrementItem(i.productId)}>
                    <Minus size={13} />
                  </button>
                  <strong style={{ minWidth: 18, textAlign: 'center' }}>{i.quantity}</strong>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => incrementItem(i.productId)}>
                    <Plus size={13} />
                  </button>
                </div>
                <strong className="price" style={{ minWidth: 80, textAlign: 'right' }}>
                  R$ {(i.price * i.quantity).toFixed(2)}
                </strong>
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  style={{ marginLeft: 12 }}
                  onClick={() => removeItem(i.productId)}
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Endereço de entrega *</label>
            <input
              className="form-input"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Rua, número, bairro"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Observações</label>
            <textarea
              className="form-input"
              rows={3}
              style={{ resize: 'vertical' }}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ex: sem cebola, troco para R$ 50…"
            />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--cream-muted)', fontSize: 14 }}>Total</span>
            <span className="price" style={{ fontSize: 20 }}>R$ {total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary" disabled={submitting} onClick={handleConfirm} style={{ justifyContent: 'center' }}>
            {submitting ? <div className="spinner" /> : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
