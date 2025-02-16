import React from 'react'
import { faMastodon } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const Auth = () => {

  return (
    <div className=' flex items-center justify-center h-[100vh]'>

        <a href="https://vyox-frontend.onrender.com/login"><button className='text-xl flex font-[600] bg-[#6114FF] px-4 py-2 rounded-full items-center justify-center'>
            <FontAwesomeIcon className='mr-2 text-3xl' icon={faMastodon}/>
            Continue with Mastodon
        </button></a>

    </div>
  )
}

export default Auth