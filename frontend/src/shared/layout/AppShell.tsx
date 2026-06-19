import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  AccountBalanceOutlined,
  AssessmentOutlined,
  ArticleOutlined,
  DashboardOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  LogoutOutlined,
  MenuOutlined,
  PaymentsOutlined,
  PeopleOutlined,
  ShoppingCartOutlined,
  WarehouseOutlined,
} from '@mui/icons-material'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useUiPreferences } from '../../app/AppProviders'
import { useAuth } from '../../core/auth/AuthContext'

type NavItem = {
  label: string
  to: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardOutlined /> },
  { label: 'Articulos', to: '/articles', icon: <ArticleOutlined /> },
  { label: 'Ordenes', to: '/orders', icon: <ShoppingCartOutlined /> },
  { label: 'Inventario', to: '/inventory', icon: <WarehouseOutlined /> },
  { label: 'Proveedores', to: '/suppliers', icon: <PeopleOutlined /> },
  { label: 'Cuentas por pagar', to: '/payables', icon: <AccountBalanceOutlined /> },
  { label: 'Pagos', to: '/payments', icon: <PaymentsOutlined /> },
  { label: 'Reportes', to: '/reports', icon: <AssessmentOutlined /> },
]

const drawerWidth = 280

export function AppShell() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const { mode, toggleMode } = useUiPreferences()
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const currentSection = useMemo(() => {
    const active = navItems.find((item) => location.pathname.startsWith(item.to))
    return active?.label ?? 'ERP'
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
          ERP1
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
          Gestion operativa
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Compras, inventario, cuentas y reportes
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 0.75,
              borderRadius: 2,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2.5 }}>
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sesion activa
          </Typography>
          <Typography sx={{ fontWeight: 800 }}>{session?.user.nombreCompleto ?? 'Usuario'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {session?.user.roleName ?? 'Rol no definido'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(7, 17, 31, 0.68)',
          color: 'text.primary',
          ml: isDesktop ? `${drawerWidth}px` : 0,
          width: isDesktop ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3 } }}>
          {!isDesktop ? (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuOutlined />
            </IconButton>
          ) : null}

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {currentSection}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              ERP ejecutivo
            </Typography>
          </Box>

          <Tooltip title={mode === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}>
            <IconButton onClick={toggleMode} sx={{ mr: 1 }}>
              {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Cerrar sesion">
            <IconButton onClick={handleLogout}>
              <LogoutOutlined />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          pt: 10,
          px: { xs: 2, sm: 3, md: 4 },
          pb: 4,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
