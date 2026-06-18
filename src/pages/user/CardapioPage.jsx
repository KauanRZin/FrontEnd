// ============================================================
// Cardápio — Pág do Cliente: navegar produtos e adicionar ao carrinho - Kauan
// ============================================================

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Plus, Minus, UtensilsCrossed } from 'lucide-react'
import { productsApi, categoriesApi } from '../../api'
import { useCart } from '../../contexts/CartContext'
import toast from 'react-hot-toast'

export default function CardapioPage() {
  const [produtos, setProdutos] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('') // '' = Todas
  const navigate = useNavigate()
  const { items, addItem, incrementItem, decrementItem, itemCount, total } = useCart()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Cardápio mostra só o que está disponível para venda
      const [pRes, cRes] = await Promise.all([productsApi.listAvailable(), categoriesApi.list()])
      setProdutos(pRes.data || [])
      setCategories(cRes.data || [])
    } catch {
      toast.error('Erro ao carregar o cardápio')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const qtyOf = (productId) => items.find(i => i.productId === productId)?.quantity || 0

  const filtered = produtos.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCat || p.categoryId === activeCat || p.category?.id === activeCat
    return matchSearch && matchCat
  })

  const handleAdd = (p) => {
    addItem(p, 1)
    toast.success(`${p.name} adicionado ao carrinho`)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Cardápio</h2>
          <p>Escolha seus itens favoritos</p>
        </div>
      </div>

      <div className="action-row">
        <div className="search-bar">
          <Search size={15} color="var(--cream-faint)" />
          <input placeholder="Buscar no cardápio…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        <button className={`tab-btn${!activeCat ? ' active' : ''}`} onClick={() => setActiveCat('')}>
          Todas
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`tab-btn${activeCat === c.id ? ' active' : ''}`}
            onClick={() => setActiveCat(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <UtensilsCrossed size={32} />
          <h3>Nenhum item encontrado</h3>
          <p>Tente outra busca ou categoria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map(p => {
            const qty = qtyOf(p.id)
            return (
              <div key={p.id} className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <strong style={{ color: 'var(--cream)', fontSize: 15 }}>{p.name}</strong>
                  <span className="badge badge-muted">{p.category?.name || '—'}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--cream-faint)', flex: 1, minHeight: 36 }}>
                  {p.description || 'Sem descrição.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="price">R$ {parseFloat(p.price || 0).toFixed(2)}</span>
                  {qty === 0 ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handleAdd(p)}>
                      <Plus size={14} /> Adicionar
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => decrementItem(p.id)}>
                        <Minus size={13} />
                      </button>
                      <strong style={{ minWidth: 18, textAlign: 'center' }}>{qty}</strong>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => incrementItem(p.id)}>
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {itemCount > 0 && (
        <div
          style={{
            position: 'sticky', bottom: 20, marginTop: 28,
            display: 'flex', justifyContent: 'center',
          }}
        >
          <button
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: 15, boxShadow: 'var(--shadow-lg)' }}
            onClick={() => navigate('/user/carrinho')}
          >
            <ShoppingCart size={16} />
            Ver carrinho · {itemCount} {itemCount === 1 ? 'item' : 'itens'} · R$ {total.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  )
}
