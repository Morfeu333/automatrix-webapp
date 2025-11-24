import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import AgentsSidebar from './components/AgentsSidebar'
import LandingPage from './pages/LandingPage'
import ShopPage from './pages/ShopPage'
import AgentsPage from './pages/AgentsPage'
import AdminPanel from './pages/AdminPanel'
import { UserProvider } from './contexts/UserContext'

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <AgentsSidebar />
        <main className="pt-16 pl-12">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </UserProvider>
  )
}

export default App
