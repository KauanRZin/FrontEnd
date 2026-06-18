// ============================================================
// Detalhe do Pedido — Pág do Cliente: visão somente-leitura de um pedido finalizado
// ============================================================

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { ordersApi } from '../../api'
import toast from 'react-hot-toast'

const STATUS_MAP = {
  PENDING:          { label: 'Recebido',  badge: 'badge-pending' },
  PREPARING:        { label: 'Preparando', badge: 'badge-info' },
  OUT_FOR_DELIVERY: { label: 'A caminho', badge: 'badge-ember' },
  DELIVERED:        { label: 'Entregue',  badge: 'badge-active' },
  CANCELLED:        { label: 'Cancelado', badge: 'badge-danger' },
}

export default function PedidoDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ordersApi.getById(id)
      setOrder(res.data)
    } catch {
      toast.error('Pedido não encontrado')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="loading-full"><div className="spinner" /></div>

  if (!order) {
    return (
      <div className="empty-state">
        <h3>Pedido não encontrado</h3>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/user/pedidos')}>
          <ArrowLeft size={14} /> Voltar para meus pedidos
        </button>
      </div>
    )
  }

  const s = STATUS_MAP[order.status] || STATUS_MAP.PENDING
  const items = order.items || order.orderItems || []

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Pedido #{order.id}</h2>
          <p>{order.address}</p>
        </div>
        <Link to="/user/pedidos" className="btn btn-ghost">
          <ArrowLeft size={14} /> Voltar
        </Link>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {order.status === 'DELIVERED' && <CheckCircle2 size={18} color="var(--green)" />}
          {order.status === 'CANCELLED' && <XCircle size={18} color="var(--red)" />}
          <span className={`badge ${s.badge}`}>{s.label}</span>
        </div>

        <div className="order-items">
          {items.map((it, idx) => (
            <div key={it.id || idx} className="order-item-row">
              <span>{it.quantity}x {it.product?.name || it.name}</span>
              <span style={{ color: 'var(--cream-faint)' }}>
                R$ {parseFloat((it.price ?? it.product?.price ?? 0) * it.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {order.note && <div className="tag" style={{ width: 'fit-content' }}>Obs: {order.note}</div>}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--cream-muted)' }}>Total</span>
          <span className="price" style={{ fontSize: 18 }}>R$ {parseFloat(order.total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}