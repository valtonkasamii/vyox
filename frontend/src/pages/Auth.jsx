import React from 'react'
import { faMastodon } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const Auth = () => {

    const handleClick = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                
            })
            
            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData)
              } else {
            const data = await response.json()
            console.log(data)
              
                window.location = "/"
              }
              
            } catch (error) {
                console.error(error.message)
            }
        }

  return (
    <div className=' flex items-center justify-center h-[100vh]'>

        <a href="http://127.0.0.1:5000/login"><button className='text-xl flex font-[600] bg-[#6114FF] px-4 py-2 rounded-full items-center justify-center'>
            <FontAwesomeIcon className='mr-2 text-3xl' icon={faMastodon}/>
            Continue with Mastodon
        </button></a>

    </div>
  )
}

export default Auth