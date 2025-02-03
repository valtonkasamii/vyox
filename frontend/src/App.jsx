import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from './components/Navbar.jsx'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)

  const getMe = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/me", {
      credentials: "include"
      })
      if (!response.ok) {
        setAuth(null)
      } else {
      const data = await response.json()
        setAuth(data)
      }
    } catch (error) {
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMe()
  }, [])


  if (loading) {
    return <div className="flex flex-col h-[100vh] justify-center items-center text-5xl text-white font-[500]"><h1 className='px-5 pt-3 pb-4 rounded-full border-2'>Loading</h1></div>
  }
  return (
    <>
    {auth && <Navbar profile={auth}/>}
        <Routes>
        <Route path='/' element={auth ? <Home /> : <Navigate to='/login'/>}/>
        <Route path='/login' element={!auth ? <Auth /> : <Navigate to='/'/>}/>
        <Route path='*' element={!auth ? <Navigate to='/login'/> : <Navigate to='/'/>}/>
        <Route path='/:username' element={auth ? <Profile user={auth}/> : <Navigate to="/login"/>} />
        </Routes>
    </>
  )
}

export default App
