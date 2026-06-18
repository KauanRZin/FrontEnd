// ============================================================
// Layout — Área do Cliente Final (role CUSTOMER)
// ============================================================
import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  UtensilsCrossed, ShoppingCart, Truck, ListOrdered, LogOut, Pizza
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

const navItems = [
  { to: '/user/cardapio',      icon: UtensilsCrossed, label: 'Cardápio' },
  { to: '/user/carrinho',      icon: ShoppingCart,     label: 'Carrinho' },
  { to: '/user/em-andamento',  icon: Truck,            label: 'Em andamento' },
  { to: '/user/pedidos',       icon: ListOrdered,      label: 'Meus pedidos' },
]

const pageTitles = {
  '/user/cardapio':     'Cardápio',
  '/user/carrinho':     'Carrinho',
  '/user/em-andamento': 'Em andamento',
  '/user/pedidos':      'Meus pedidos',
}

export default function UserLayout() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'PizzaSystem'

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand">
            <Pizza size={20} color="var(--ember)" />
            PizzaSystem
          </div>
          <div className="brand-sub">Área do Cliente</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Pedir</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} className="nav-icon" />
              {label}
              {to === '/user/carrinho' && itemCount > 0 && (
                <span className="badge badge-ember" style={{ marginLeft: 'auto' }}>{itemCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info" style={{ flex: 1, overflow: 'hidden' }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Cliente</div>
            </div>
            <button onClick={logout} className="btn btn-ghost btn-icon btn-sm" title="Sair">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <span className="page-title">{title}</span>
          <NavLink to="/user/carrinho" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            <ShoppingCart size={14} />
            Carrinho{itemCount > 0 ? ` (${itemCount})` : ''}
          </NavLink>
        </header>
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
