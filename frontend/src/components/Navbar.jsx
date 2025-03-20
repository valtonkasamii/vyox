import React, {useEffect, useState} from 'react'
import { faUser, faSearch, faHome, faBell } from '@fortawesome/free-solid-svg-icons'
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logout } from '../reducers/userReducer';

const Navbar = ({profile}) => {
    const dispatch = useDispatch()
    const [menu, setMenu] = useState(false)
    const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
    const [username, setUsername] = useState('')
    const [results, setResults] = useState([])
    const accessToken = useSelector((state) => state.user.token);
    const [search, setSearch] = useState(false)
    
    const logout2 = async () => {
        dispatch(logout())

        window.location = '/login'
}

    const searchUser = async () => {
        try {
          const response = await fetch(`${mastodonServer}/api/v2/search?q=${username}&type=accounts&resolve=true`,
        {
        headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

        if (!response.ok) {
          throw new Error("Failed to fetch");
       }

        const data = await response.json();
       setResults(data.accounts); // The accounts matching the search query
       console.log(data.accounts)
      } catch (error) {
        console.error("Error fetching Mastodon users:", error);
      }
    };

    useEffect(() => {
      if (username.length != 0) {
        searchUser()
      }
    }, [username])

  return (
    <div className='flex justify-center items-center'>
        <div className='z-10 fixed border-[3px] bg-[#0e1d36] rounded-full px-2 py-2 text-3xl flex justify-center items-center top-3 border-[#1557bf] space-x-3'>
            {<button onClick={() => setSearch(!search)} className='bg-[#1557bf] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon className='mb-[2px]' icon={faSearch}/></button>}
            <a href='/'><button className='bg-[#1557bf] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon className='mb-[2px]' icon={faHome}/></button></a>
            {<button className='bg-[#1557bf] bg-[#444444] text-[gray] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon className='mb-[]' icon={faBell}/></button>}
            {<button className='bg-[#1557bf] bg-[#444444] text-[gray] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon className='w-[29px] mt-1' icon={faMessage}/></button>}
            <button onClick={() => setMenu(!menu)} className='bg-[#1557bf] rounded-full h-12 w-12 flex justify-center items-center'><FontAwesomeIcon icon={faUser}/></button>
        </div>
        
        {menu && <div className='z-50 border-[3.5px] border-blue-600 border-y-yellow-300 fixed top-[90px] bg-gray-900 flex flex-col items-center justify-center px-3 text-2xl font-[500] rounded-[20px] space-y-2.5 pt-2.5 pb-2.5'>
        <a href={`/${profile.other_data.acct}`}><button className='text-yellow-200 border-[3px] px-2 rounded-full border-blue-400'>Profile</button></a>
        <button onClick={logout2} className='bg-blue-700 px-3 py-1 rounded-full'>Log Out</button>
        </div>}
        {menu && <div onClick={() => setMenu(false)} className='z-0 bg- h-[100vh] w-full top-0 left-0 fixed bg-black opacity-[60%]'></div>}
          <div className='flex flex-col items-center'>
          {search && <input value={username} onChange={(e) => setUsername(e.target.value)} className='mt-[93px] h-10 w-[260px] rounded-full bg-[#0e1d36] border-[3px] border-blue-600 text-xl px-2' placeholder='Search username' type='text'/>}
          {search && username.length === 0 && <div className='mb-[-80px]'></div>}
          {search && username.length != 0 && <div className='bg-blue-800 px-3 py-3 text-2xl space-y-4 rounded-[20px] mb-[-80px] mt-3'>
            {results.map((result, index) => (
              <div key={index} className='font-[500]'>
                <a href={`/${result.acct}`} className='flex items-center space-x-2'>
                <img src={result.avatar} className='w-[70px] rounded-full'/>
                <h2 className='w-[200px] break-words'>{result.acct}</h2>
                </a>
              </div>
            ))}
            </div>}
          </div>
    </div>
  )
}

export default Navbar