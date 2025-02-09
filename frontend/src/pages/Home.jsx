import React from 'react'
import Posts from '../components/Posts.jsx'
const Home = ({user}) => {
  return (
    <div className='mt-[95px]'>
    <Posts user={user} profile={false}/>    
    </div>
  )
}

export default Home