// ============================================================
// Em Andamento — Pág do Cliente: acompanhamento estilo iFood/99Food
// ============================================================

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Truck, Clock, ChefHat, CheckCircle2, XCircle, Package } from 'lucide-react'
import { ordersApi } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const POLL_INTERVAL_MS = 8000

const STEPS = [
  { key: 'PENDING', label: 'Pedido recebido', icon: Clock },
  { key: 'PREPARING', label: 'Preparando', icon: ChefHat },
  { key: 'OUT_FOR_DELIVERY', label: 'Saiu para entrega', icon: Truck },
  { key: 'DELIVERED', label: 'Entregue', icon: CheckCircle2 },
]

function StatusTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--red)' }}>
        <XCircle size={20} />
        <strong>Pedido cancelado</strong>
      </div>
    )
  }
  const currentIdx = STEPS.findIndex(s => s.key === status)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {STEPS.map((step, idx) => {
        const Icon = step.icon
        const done = idx < currentIdx
        const active = idx === currentIdx
        const color = done || active ? 'var(--ember)' : 'var(--cream-faint)'
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 84 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done || active ? 'var(--ember-subtle)' : 'var(--bg-elevated)',
                border: `1px solid ${done || active ? 'rgba(255,91,30,0.3)' : 'var(--border-strong)'}`,
              }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: 11, color, textAlign: 'center', fontWeight: active ? 600 : 400 }}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: idx < currentIdx ? 'var(--ember)' : 'var(--border)', marginBottom: 20 }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function OrderCard({ order }) {
  const items = order.items || order.orderItems || []
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <strong style={{ color: 'var(--cream)', fontSize: 16 }}>Pedido #{order.id}</strong>
          <p style={{ fontSize: 12, color: 'var(--cream-faint)', marginTop: 2 }}>{order.address}</p>
        </div>
        <span className="price">R$ {parseFloat(order.total || 0).toFixed(2)}</span>
      </div>

      <StatusTimeline status={order.status} />

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

      {order.note && (
        <div className="tag" style={{ width: 'fit-content' }}>Obs: {order.note}</div>
      )}
    </div>
  )
}

export default function PedidoAndamentoPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const ACTIVE_STATUSES = ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY']

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      if (id) {
        const res = await ordersApi.getById(id)
        setOrders(res.data ? [res.data] : [])
      } else {
        const res = await ordersApi.listByUser(user.id)
        const all = res.data || []
        setOrders(all.filter(o => ACTIVE_STATUSES.includes(o.status)))
      }
    } catch {
      if (!silent) toast.error('Erro ao buscar pedidos em andamento')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    load()
    timerRef.current = setInterval(() => load(true), POLL_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [load])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{id ? 'Acompanhar pedido' : 'Pedidos em andamento'}</h2>
          <p>Atualiza automaticamente a cada poucos segundos</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Package size={32} />
          <h3>Nenhum pedido em andamento</h3>
          <p>Que tal fazer um novo pedido?</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/user/cardapio')}>
            Ver cardápio
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {orders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}

      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--cream-faint)' }}>
        Quer ver pedidos já finalizados? <Link to="/user/pedidos" className="auth-link">Meus pedidos</Link>
      </p>
    </div>
  )
}