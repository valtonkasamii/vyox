import React, {useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faSearch, faHome, faMessage, faBell } from '@fortawesome/free-solid-svg-icons'

const Navbar = ({profile}) => {
    const [menu, setMenu] = useState(false)

    const logout = async () => {
        const response = await fetch('https://vyox-backend.onrender.com/api/logout', {
            credentials: 'include',
            method: 'POST'
        })

        window.location = '/login'
    }

  return (
    <div className='flex justify-center items-center'>
        <div className='z-10 fixed border-[3px] bg-[#0e1d36] rounded-full px-2 py-2 text-3xl flex justify-center items-center top-3 border-[#1557bf] space-x-3'>
            {<button className='bg-[#1557bf] bg-[#444444] text-[gray] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon className='mb-[2px]' icon={faSearch}/></button>}
            <a href='/'><button className='bg-[#1557bf] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon className='mb-[2px]' icon={faHome}/></button></a>
            {<button className='bg-[#1557bf] bg-[#444444] text-[gray] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon className='mb-[]' icon={faBell}/></button>}
            {<button className='bg-[#1557bf] bg-[#444444] text-[gray] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon className='w-[29px] mt-1' icon={faMessage}/></button>}
            <button onClick={() => setMenu(true)} className='bg-[#1557bf] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon icon={faUser}/></button>
        </div>
        
        {menu && <div className='z-50 border-[3.5px] border-blue-600 border-y-yellow-300 fixed top-[90px] bg-gray-900 flex flex-col items-center justify-center px-3 text-2xl font-[500] rounded-[20px] space-y-2.5 pt-2.5 pb-2.5'>
        <a href={`/${profile.other_data.acct}`}><button className='text-yellow-200 border-[3px] px-2 rounded-full border-blue-400'>Profile</button></a>
        <button onClick={logout} className='bg-blue-700 px-3 py-1 rounded-full'>Log Out</button>
        </div>}
        {menu && <div onClick={() => setMenu(false)} className='z-10 bg- h-[100vh] w-full top-0 left-0 fixed'></div>}

    </div>
  )
}

export default Navbar