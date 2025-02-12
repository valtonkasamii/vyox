import React from 'react'
import Posts from '../components/Posts.jsx'

const Post = ({user}) => {
  return (
    <div className='mt-24'>
      <Posts user={user} single={true}/>
    </div>
  )
}

export default Post