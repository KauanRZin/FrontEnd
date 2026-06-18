  import axios from 'axios'

  const BASE_URL = "https://fullstack-server-kw1p.onrender.com"

  const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  })

  // ── Interceptador de requisição: anexar JWT - ──────────────────────────
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pizza_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  // ── Interceptador de resposta: logout automático em caso de erro 401 - ─────────────────
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('pizza_token')
        localStorage.removeItem('pizza_user')
        window.location.href = '/login'
      }
      return Promise.reject(err)
    }
  )

  // ============================================================
  // AUTH
  // ============================================================
  export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
  }

  // ============================================================
  // Usuárfios - 
  // ============================================================
  export const usersApi = {
    list: () => api.get('/users'),
    listActive: () => api.get('/users/active'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.patch(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  }

  // ============================================================
  // Produtos
  // ============================================================
  export const productsApi = {
    list: () => api.get('/products'),
    listAvailable: () => api.get('/products/available'),
    listByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.patch(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
  }

  // ============================================================
  // Categorias
  // ============================================================
  export const categoriesApi = {
    list: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.patch(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
  }

  // ============================================================
  // Ordens
  // ============================================================
  export const ordersApi = {
    list: () => api.get('/orders'),
    listByStatus: (status) => api.get(`/orders/status/${status}`),
    listByUser: (userId) => api.get(`/orders/user/${userId}`),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    update: (id, data) => api.patch(`/orders/${id}`, data),
    delete: (id) => api.delete(`/orders/${id}`),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  }

  export default api
