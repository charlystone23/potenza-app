import { createRouter, createWebHistory } from "vue-router"
import Login from "../views/Login.vue"
import Dashboard from "../views/Dashboard.vue"
import Admin from "../views/Admin.vue"
import Alumnos from "../views/Alumnos.vue"
import AdminAlumnos from "../views/AdminAlumnos.vue"

const routes = [
  { 
    path: "/", 
    component: Login,
    meta: { requiresAuth: false }
  },
  { 
    path: "/dashboard", 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: "/alumnos",
    component: Alumnos,
    meta: { requiresAuth: true }
  },
  {
    path: "/admin",
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: "/admin/alumnos",
    component: AdminAlumnos,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // Get user from localStorage safely
  let user = null
  try {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      user = JSON.parse(userStr)
    }
  } catch (e) {
    console.error("Error parsing user from localStorage:", e)
    localStorage.removeItem("user")
  }

  // If route requires authentication and user is not logged in, redirect to login
  if (to.meta.requiresAuth && !user) {
    next("/")
    return
  }

  // If route requires admin and user is not admin, redirect to dashboard
  if (to.meta.requiresAdmin && user?.role !== "ADMIN") {
    next("/dashboard")
    return
  }

  // If user is admin trying to access dashboard or alumnos, redirect to admin panel
  if ((to.path === "/dashboard" || to.path === "/alumnos") && user?.role === "ADMIN") {
    next("/admin")
    return
  }

  // If user is common user trying to access admin, redirect to dashboard
  if (to.path === "/admin" && user?.role !== "ADMIN") {
    next("/dashboard")
    return
  }

  // Allow navigation
  next()
})

export default router
