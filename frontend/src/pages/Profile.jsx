import React, {useState, useEffect, useRef} from 'react'
import Posts from '../components/Posts.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as sstar } from '@fortawesome/free-solid-svg-icons';

const Profile = ({user}) => {
    const [profile, setProfile] = useState(null)   
    const [following, setFollowing] = useState([])   
    const [loading2, setLoading2] = useState(true)
    const [star, setStar] = useState(false)
    const [fixed, setFixed] = useState(false)
    const fileInputRef = useRef(null);
    const [pfp, setPfp] = useState(null)
    const accessToken = user.access_token
    
    const getProfile = async () => {
        const username = window.location.href.split("/").pop()
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
        try {
            const response = await fetch(`${mastodonServer}/api/v1/accounts/lookup?acct=${username}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }})

            if (!response.ok) {
                const data = await response.json()
                console.log(data)
            } else {
            const data = await response.json()

            const response2 = await fetch(`${mastodonServer}/api/v1/accounts/${user.other_data.id}/following`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }})

                if (response2.ok) {
                    const data2 = await response2.json()
                    setFollowing(data2)
                    console.log(data2)
                }

            setProfile(data)
            console.log(data)
            console.log(user)
        }
        
        
        setLoading2(false)
        } catch (error) {
            console.error(error.message)
        }
    }

    const follow = async () => {
        setFollowing([profile])
        setProfile((prevProfile) => ({
            ...prevProfile,
            followers_count: prevProfile.followers_count + 1,
        }))
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
        try {
            const response = await fetch(`${mastodonServer}/api/v1/accounts/${profile.id}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }})

                if (response.ok) {
                    const data = await response.json()
                    console.log(data)
                }
        } catch (error) {
            console.error(error.message)
        }
    }

    const unfollow = async () => {
        setFollowing([])
        setProfile((prevProfile) => ({
            ...prevProfile,
            followers_count: prevProfile.followers_count - 1,
        }))
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
        try {
            const response = await fetch(`${mastodonServer}/api/v1/accounts/${profile.id}/unfollow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }})

                if (response.ok) {
                    const data = await response.json()
                    console.log(data)
                }
        } catch (error) {
            console.error(error.message)
        }
    }

    const updateAvatar = async () => {
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL

        const apiUrl = `${mastodonServer}/api/v1/accounts/update_credentials`;
      
        const formData = new FormData();
        formData.append('avatar', pfp);
      
        const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        });
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        setProfile(null)
        const data = await response.json();
        console.log('Avatar updated successfully:', data);
        getProfile()
        setFixed(false)
      };

        useEffect(() => {
            getProfile()
        }, [])

        useEffect(() => {
            if (pfp) {
            updateAvatar()
            }
        }, [pfp])

        const handleImageClick = () => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          };

          const handleFileChange = (e) => {
            const file = e.target.files[0]
            
            if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPfp(reader.result)
                }
                reader.readAsDataURL(file)
            }
        }
        
  return (
    <div className='space-y-3'>
    <div className='text-3xl mt-[95px] border-b-[2px] border-blue-800 pb-4'>
    {loading2 && <div className='flex font-[500] justify-center'><h1 className='border-2 px-3 pb-[6px] rounded-full pt-[5px]'>Loading</h1></div>}

        {profile && <div className='flex justify-center mb-3'>
            <h1 className='text-2xl flex break-all px-3 bg-gray-800 border-blue-600 border-[3px] font-[500] pb-[4.5px] pt-[2px] rounded-full'>@{profile.username}</h1>
            {/*<button className='ml-2 text-2xl px-2 bg-blue-800 font-[600] border-blue-400 border-[3px] pb-[3px] rounded-full '><p className='pb-[0.5px]'>vyox</p></button>*/}
            </div>}

        {profile && <div className='space-x-4 mx-3 flex items-center justify-center'> <div className='flex flex-col justify-center items-center space-y-3'>
        <img className='w-[150px] rounded-full border-4 border-blue-600' src={profile.avatar}/>
        </div>
        
        <div >
            <div className='font-[500] flex text-xl space-x-4'>
            <div className='flex flex-col items-center'>
                <p>{profile.followers_count}</p>
            <h3>Followers</h3>
            </div>
            
            <div className='flex flex-col items-center'>
                <p>{profile.following_count}</p>
            <h3>Following</h3>
            </div>
            </div>

            <div className='flex items-center mt-2'>
            {user.other_data.acct != profile.acct && !following.some(one => one.id === profile.id) && <button onClick={() => follow()} className='text-2xl px-3 bg-gray-800 border-blue-600 border-2 pt-[1.3px] rounded-full'>Follow</button>}
            {user.other_data.acct != profile.acct && following.some(one => one.id === profile.id) && <button onClick={() => unfollow()} className='text-2xl px-3 bg-gray-800 border-blue-600 border-2 pt-[1.3px] rounded-full'>Unfollow</button>}
            {user.other_data.acct === profile.acct && <button className='text-2xl px-3 bg-gray-800 border-blue-600 border-2 pt-[1.3px] rounded-full' onClick={() => setFixed(!fixed)}>Edit</button>}
            {user.other_data.acct === profile.acct && <div onClick={() => setStar(!star)} className='ml-2 bg-gray-900 h-10 w-10 rounded-full border-[3px] border-yellow-400 flex justify-center items-center'><FontAwesomeIcon className='w-[29px] mb-[2px] text-yellow-400' icon={!star ? faStar : sstar}/></div>}
            </div>
        </div>
        {fixed && <div className='bg-[#0e1d36] space-y- flex flex-col items-center px-3 py-3 font-[500] py- fixed z-40 top-[30%] border-blue-600 border-[3px] rounded-[30px]'>
            <input ref={fileInputRef} onChange={handleFileChange} className='hidden' accept="image/*" type='file'/>
            <button onClick={handleImageClick} className='text-2xl bg-blue-800 rounded-full px-3 py-2'>Profile Picture</button>
            {/* <button className='text-2xl bg-blue-800 rounded-full px-3 py-2'>Password</button> */}
            {/* <button className='text-2xl bg-blue-800 rounded-full px-3 py-2'>Username</button> */}
        </div>}
        {fixed && <div onClick={() => setFixed(false)} className='fixed bg-black opacity-[40%] w-full h-full top-0 right-0 z-30'></div>}
        </div>}
    </div>
    {profile && user && !star && <Posts profile={profile} user={user} />}
    {profile && user && star && <Posts profile={profile} user={user}  starr={true}/>}
    </div>
  )
}

export default Profile