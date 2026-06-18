import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

import AppLayout from './components/layout/AppLayout'
import UserLayout from './components/layout/UserLayout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import DashboardPage from './pages/admin/DashboardPage'
import ClientesPage from './pages/admin/ClientesPage'
import ProdutosPage from './pages/admin/ProdutosPage'
import PedidosPage from './pages/admin/PedidosPage'
import UsuariosPage from './pages/admin/UsuariosPage'
import CategoriasPage from './pages/admin/CategoriasPage'

import CardapioPage from './pages/user/CardapioPage'
import CarrinhoPage from './pages/user/CarrinhoPage'
import PedidoAndamentoPage from './pages/user/PedidoAndamentoPage'
import MeusPedidosPage from './pages/user/MeusPedidosPage'
import PedidoDetalhePage from './pages/user/PedidoDetalhePage'

// SUPER_ADMIN e MANAGER caem no mesmo painel (AppLayout) por enquanto.
// Quando pages/manager ganhar telas próprias, é só trocar MANAGER de
// STAFF_ROLES para seu próprio bloco de rotas com um ManagerLayout.
const STAFF_ROLES = ['SUPER_ADMIN', 'MANAGER']

function homeRouteFor(user) {
  if (!user) return '/login'
  return STAFF_ROLES.includes(user.role) ? '/dashboard' : '/user/cardapio'
}

function ProtectedRoute({ children, allowRoles }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="loading-full" style={{ minHeight: '100vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  // Papel sem permissão pra essa área -> manda pra home correta dele,
  // em vez de tela em branco ou erro
  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to={homeRouteFor(user)} replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to={homeRouteFor(user)} replace /> : children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* ===== Área staff: SUPER_ADMIN e MANAGER ===== */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowRoles={STAFF_ROLES}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="produtos" element={<ProdutosPage />} />
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
      </Route>

      {/* ===== Área do cliente final: CUSTOMER ===== */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowRoles={['CUSTOMER']}>
            <CartProvider>
              <UserLayout />
            </CartProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="cardapio" replace />} />
        <Route path="cardapio" element={<CardapioPage />} />
        <Route path="carrinho" element={<CarrinhoPage />} />
        <Route path="em-andamento" element={<PedidoAndamentoPage />} />
        <Route path="em-andamento/:id" element={<PedidoAndamentoPage />} />
        <Route path="pedidos" element={<MeusPedidosPage />} />
        <Route path="pedidos/:id" element={<PedidoDetalhePage />} />
      </Route>

      {/* Coringa: logado vai pra home certa do seu papel, deslogado pro login */}
      <Route path="*" element={<Navigate to={homeRouteFor(user)} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
