import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addToken } from './reducers/userReducer.js';
import './App.css'
import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from './components/Navbar.jsx'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Post from './pages/Post.jsx'

function App() {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.user.token);
  console.log(accessToken)
  const getMe = async () => {
    if (accessToken) {
    try {
      const response = await fetch("https://vyox-backend.vercel.app/api/me", {
           method: 'POST',
           headers: {
              'Content-Type': 'application/json',
           },
           body: JSON.stringify({accessToken})
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
  } else {
    setLoading(false)
  }
  }

  const getToken = () => {
    if (window.location.href.split('/')[3] === 'access_token') {
      if (window.location.href.split('/').length >= 4) {
        dispatch(addToken(window.location.href.split('/')[4]))
      }
    }
  }

  useEffect(() => {
    getToken()
    getMe()
  }, [])

  useEffect(() => {
    getMe()
  }, [accessToken])

  if (loading) {
    return <div className="flex flex-col h-[100vh] justify-center items-center text-5xl text-white font-[500]"><h1 className='px-5 pt-3 pb-4 rounded-full border-2'>Loading</h1></div>
  }
  return (
    <>
    {auth && <Navbar profile={auth}/>}
        <Routes>
        <Route path='/' element={auth ? <Home user={auth}/> : <Navigate to='/login'/>}/>
        <Route path='/login' element={!auth ? <Auth /> : <Navigate to='/'/>}/>
        <Route path='*' element={!auth ? <Navigate to='/login'/> : <Navigate to='/'/>}/>
        <Route path='/:username' element={auth ? <Profile user={auth}/> : <Navigate to="/login"/>} />
        <Route path='/post/:id' element={auth ? <Post user={auth}/> : <Navigate to='/login'/>}/>
        </Routes>
    </>
  )
}

export default App
