'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'

type NavItem = {
  name: string
  icon: any
  href: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Reservations', icon: Calendar, href: '/dashboard/reservations' },
  { name: 'Equipment', icon: Package, href: '/dashboard/equipment' },
  { name: 'Waivers', icon: FileText, href: '/dashboard/waivers' },
  { name: 'Users', icon: Users, href: '/dashboard/users', roles: ['ADMIN', 'STAFF'] },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['ADMIN'] },
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = session.user?.role || 'STUDENT'

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-indigo-600 text-white">
            <h1 className="text-lg font-semibold">Equipment Checkout</h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.href.replace('/dashboard/', '') || 
                             (currentPage === 'dashboard' && item.href === '/dashboard')
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setCurrentPage(item.href.replace('/dashboard/', '') || 'dashboard')
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </a>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                  {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
                <p className="text-xs text-indigo-600 font-medium mt-1">
                  {userRole}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 bg-white shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {filteredNavItems.find(item => 
                item.href === `/dashboard/${currentPage}` || 
                (currentPage === 'dashboard' && item.href === '/dashboard')
              )?.name || 'Dashboard'}
            </h1>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {currentPage === 'dashboard' && <DashboardOverview />}
          {currentPage === 'reservations' && <ReservationsList />}
          {currentPage === 'equipment' && <EquipmentList />}
          {currentPage === 'waivers' && <WaiversList />}
          {currentPage === 'users' && <UsersList />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  )
}

// Placeholder components for each section
function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to the Equipment Checkout System. Here's what's happening today.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Equipment
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">127</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Reservations
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">23</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approvals
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">8</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Users
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">45</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start">
                <div className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-600 mt-2"></div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">
                    Equipment reserved by Student Name
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(Date.now() - i * 3600000), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Returns</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Camera Kit A</p>
                  <p className="text-xs text-gray-500">Due: {format(new Date(Date.now() + i * 86400000), 'MMM d')}</p>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  On Time
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReservationsList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reservations</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          New Reservation
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Reservation management interface</p>
      </div>
    </div>
  )
}

function EquipmentList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Equipment Inventory</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Add Equipment
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Equipment inventory management</p>
      </div>
    </div>
  )
}

function WaiversList() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Digital Waivers</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Waiver management and PDF generation</p>
      </div>
    </div>
  )
}

function UsersList() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">User administration (Admin/Staff only)</p>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">System configuration (Admin only)</p>
      </div>
    </div>
  )
}
