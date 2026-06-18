// ============================================================
// Meus Pedidos — Pág do Cliente: histórico completo de pedidos
// ============================================================

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListOrdered, Eye } from 'lucide-react'
import { ordersApi } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const STATUS_MAP = {
  PENDING:          { label: 'Recebido',        badge: 'badge-pending' },
  PREPARING:        { label: 'Preparando',       badge: 'badge-info' },
  OUT_FOR_DELIVERY: { label: 'A caminho',        badge: 'badge-ember' },
  DELIVERED:        { label: 'Entregue',         badge: 'badge-active' },
  CANCELLED:        { label: 'Cancelado',        badge: 'badge-danger' },
}

const ACTIVE_STATUSES = ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY']

export default function MeusPedidosPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ordersApi.listByUser(user.id)
      const sorted = (res.data || []).sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
      setOrders(sorted)
    } catch {
      toast.error('Erro ao carregar seus pedidos')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const filtered = orders.filter(o => !filterStatus || o.status === filterStatus)

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Meus pedidos</h2>
          <p>{orders.length} pedidos realizados</p>
        </div>
      </div>

      <div className="action-row">
        <select className="form-select" style={{ width: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_MAP).map(([key, v]) => (
            <option key={key} value={key}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-full"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ListOrdered size={32} />
            <h3>Nenhum pedido encontrado</h3>
            <p>Seus pedidos aparecerão aqui depois de finalizados no carrinho.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Itens</th>
                <th>Endereço</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const s = STATUS_MAP[o.status] || STATUS_MAP.PENDING
                const itemsList = o.items || o.orderItems || []
                const isActive = ACTIVE_STATUSES.includes(o.status)
                return (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td style={{ color: 'var(--cream-faint)', fontSize: 13 }}>
                      {itemsList.length} {itemsList.length === 1 ? 'item' : 'itens'}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.address || '—'}
                    </td>
                    <td><span className="price">R$ {parseFloat(o.total || 0).toFixed(2)}</span></td>
                    <td><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title={isActive ? 'Acompanhar pedido' : 'Ver detalhes'}
                          onClick={() => navigate(isActive ? `/user/em-andamento/${o.id}` : `/user/pedidos/${o.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}