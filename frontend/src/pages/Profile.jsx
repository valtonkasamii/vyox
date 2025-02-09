import React, {useState, useEffect, useRef} from 'react'
import Posts from '../components/Posts.jsx';

const Profile = ({user}) => {
    const [profile, setProfile] = useState(null)   
    const [following, setFollowing] = useState([])   
    const [loading2, setLoading2] = useState(true)
    const getProfile = async () => {
        const username = window.location.href.split("/").pop()
        const accessToken = import.meta.env.VITE_FEDIVERSE_ACCESS_TOKEN;
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
        const accessToken = import.meta.env.VITE_FEDIVERSE_ACCESS_TOKEN;
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
        const accessToken = import.meta.env.VITE_FEDIVERSE_ACCESS_TOKEN;
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

        useEffect(() => {
            getProfile()
        }, [])
        
  return (
    <div className='space-y-3'>
    <div className='text-3xl mt-[95px] border-b-[2px] border-blue-800 pb-4'>
    {loading2 && <div className='flex font-[500] justify-center'><h1 className='border-2 px-3 pb-[6px] rounded-full pt-[5px]'>Loading</h1></div>}

        {profile && <div className='flex justify-center mb-3'>
            <h1 className='text-2xl break-all px-3 bg-gray-800 border-blue-600 border-[3px] font-[500] pb-[4.5px] pt-[3px] rounded-full'>@{profile.username}</h1>
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

            <div className='flex mt-2'>
            {user.other_data.acct != profile.acct && !following.some(one => one.id === profile.id) && <button onClick={() => follow()} className='text-2xl px-3 bg-gray-800 border-blue-600 border-2 pt-[1.3px] rounded-full'>Follow</button>}
            {user.other_data.acct != profile.acct && following.some(one => one.id === profile.id) && <button onClick={() => unfollow()} className='text-2xl px-3 bg-gray-800 border-blue-600 border-2 pt-[1.3px] rounded-full'>Unfollow</button>}
            {user.other_data.acct === profile.acct && <button className='text-2xl px-3 bg-gray-800 border-blue-600 border-2 pt-[1.3px] rounded-full'>Edit</button>}
            </div>
        </div>
        
        </div>}
    </div>
    {profile && user && <Posts profile={profile} user={user} />}
    </div>
  )
}

export default Profile