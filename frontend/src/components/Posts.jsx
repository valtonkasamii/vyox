import React, {useEffect, useState, useRef} from 'react'
import { useDispatch } from 'react-redux';
import { addPosts, addRefresh, deletePost, addId } from '../reducers/postsReducer.js';
import { useSelector } from 'react-redux';
import { faHeart as solidHeart, faReply, faEllipsisH, faImage } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Posts = ({profile, user}) => {
    const [select, setSelect] = useState('Media')
    const [select2, setSelect2] = useState('Explore')
    const [loading, setLoading] = useState(true)
    const [num, setNum] = useState(0)
    const dispatch = useDispatch();
    const allPosts = useSelector((state) => state.posts.posts);
    const [profilePosts, setProfilePosts] = useState([])
    const refresh = useSelector((state) => state.posts.refresh);
    const max_id = useSelector((state) => state.posts.maxId);
    const since_id = useSelector((state) => state.posts.sinceId);
    const [postSwitcher, setPostSwitcher] = useState([]) 
    const posts = postSwitcher.slice(0, num)
    const [loading2, setLoading2] = useState(false)
    const [localLike, setLocalLike] = useState([])
    const isFetchingRef = useRef(false)
    const [create, setCreate] = useState(false)
    const seeMore = posts.filter(post => post.content.length >= 90).map(post => post.id)
    const [moreToggle, setMoreToggle] = useState([])
    const [profileMax, setProfileMax] = useState(null)

    console.log(allPosts.length, profilePosts.length ,num)

    const get10posts = async (currentNum) => {
      if (((refresh >= allPosts.length || allPosts.length <= 60 || (allPosts.length - 60) <= currentNum || (allPosts.length - 60) <= refresh) || profile)) {
        try {  
            setLoading2(true)
            let response
            if (!profile) {
         response = await fetch('http://127.0.0.1:5000/posts', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({max_id, since_id})            
            })
        } else {
            const accessToken = import.meta.env.VITE_FEDIVERSE_ACCESS_TOKEN;
            const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
            let url
            if (profileMax) {
                url = `${mastodonServer}/api/v1/accounts/${profile.id}/statuses?limit=40&max_id=${profileMax}`                
            } else {
                url = `${mastodonServer}/api/v1/accounts/${profile.id}/statuses?limit=40`
            }
            response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
            })
        }
        if (!response.ok) {

        } else {
            const data = await response.json()
            const max = data[data.length - 1].id
            const since = allPosts.length > 0 ? allPosts[0].id : null
            if (!profile) {
            dispatch(addPosts(data))
            dispatch(addId({max, since}))
            } else {
                setProfileMax(max)
                if (profilePosts.length > 0) {
                    setProfilePosts([...profilePosts, ...data])
                } else {
                    setProfilePosts(data)
                }
            }
            } 
            } catch (error) {
                console.error(error.message)
              } finally {
                setLoading(false)
                setLoading2(false)
                isFetchingRef.current = false
              }
        } else {
            isFetchingRef.current = false
            setLoading(false)
        }
        
    } 
    console.log(profilePosts)
    const toggleLike = async (postId, isLiked) => {
        const accessToken = import.meta.env.VITE_FEDIVERSE_ACCESS_TOKEN;
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
    
        try {
            let response
            if (!isLiked){
             response = await fetch(`${mastodonServer}/api/v1/statuses/${postId}/favourite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } else {
             response = await fetch(`${mastodonServer}/api/v1/statuses/${postId}/unfavourite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
        }

            if (!response.ok) {
                throw new Error('Failed to like the post');
            }
    
            const data = await response.json();
            console.log('Post liked/unliked:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const selectWidth = (select) => {
        if (select === 'Text') {
            return 'w-[74px]'
        }
    }

    const select2Width = (select) => {
        if (select === 'Explore') {
            return 'w-[116px]'
        }
    }
    
    useEffect(() => {
        const outside = num + 20
         //dispatch(deletePost());
         setNum(outside)
         //dispatch(addRefresh(outside));
         get10posts(outside)
         if (!profile) {
            setPostSwitcher(allPosts)
         }
        }, [])

        useEffect(() => {
            if (profile) {
                setPostSwitcher(profilePosts)
             }
        }, [profilePosts])

        useEffect(() => {
            if (!profile) {
        if (allPosts.length != 0) {
            setLoading(false)
        } else setLoading(true)
    }
    }, [allPosts])

    useEffect(() => {
    if (profile) {
        if (profilePosts.length != 0) {
        setLoading(false)
        } else setLoading(true)
    }
    }, [profilePosts])

    useEffect(() => {
        const handleScroll = () => {
          const scrollPosition = window.scrollY + window.innerHeight;
          const pageHeight = document.documentElement.scrollHeight;
          if (scrollPosition >= pageHeight - 1) {
            const outside = num + 20
            if (allPosts.length >= (num - 20)) {
                if (!profile) {
                    setNum(outside)
                } else if (profile && posts.length >= 20) {
                    setNum(outside)
                }
            }
            if (!profile){
                dispatch(addRefresh(outside))
            }
            if (!isFetchingRef.current) {
                isFetchingRef.current = true
                if(!profile) {
                    get10posts(outside)
                } else if (profile && profilePosts.length >= 40) {
                    get10posts(outside)
                }
            }
            }
        };
        if (posts.length >= 1) {
          window.addEventListener("scroll", handleScroll);
    
        return () => {
          window.removeEventListener("scroll", handleScroll);
        };
    }
      }, [posts]);

    const swap = (post) => {
        if (select === 'Media') {
            return post.media_attachments.length > 0
        } else return post.media_attachments.length === 0
    }

    const css = (array) => {
        if (array.length === 1) {
            return 'justify-center'
        } else return ''
    }

    const css2 = (array) => {
        if (array.length === 1) {
            return ''
        } else return 'space-x-3 pb-2'
    } 

    const css3 = (array) => {
        if (array.length === 1) {
            return 'w-[380px] max-sm:w-[95vw]'
        } else return 'w-[300px] max-sm:w-[75vw]'
    }

    const css4 = (array) => {
        if (array.length === 1) {
            return ' '
        } else return 'flex-shrink-0'
    }

    const css5 = (array) => {
        if (array.length === 1) {
            return 'w-[370px] max-sm:w-[89vw]'
        } else return 'w-[270px] max-sm:w-[69vw]'
    }

    const likePost = (id) => {
        setLocalLike([...localLike, id])
        toggleLike(id, false)
    }
    
    const unlikePost = (id) => {
        setLocalLike(localLike.filter(oneId => oneId !== id));
        toggleLike(id, true)
    }
    
    const likedPost = (id) => {
        return localLike.includes(id)
    }

    const likedPosts = (id, likes) => {
        if (localLike.includes(id)) {
            return likes + 1
        } else return likes
    }

    const moreText = (text, id) => {
        if (text.length > 90 && !id) {
            return text.substring(0, 74) + '...'
        } else if (text && !id) {
            return text
        } else if (id) {
            return seeMore.includes(id)
        }
    }

   const moreFunc = (id) => {
        if (moreToggle.includes(id)) {
            setMoreToggle(moreToggle.filter(more => more != id))
        } else {
            setMoreToggle([...moreToggle, id])
        }
    }
    
    const corruptedfiles = (post) => {
        //map if images more than 1 and atleast 1 of them is working image
        //if image is 1 and corrupted return false
    }

    if (loading) {
        return <div className="flex flex-col justify-center items-center text-5xl text-white font-[500]"><h1 className='px-5 pt-3 pb-4 rounded-[30px] border-2'>Loading</h1></div>
      }

  return (
    <div >
        <div className='flex max-xss:flex-col items-center max-xss:space-y-3 xss:justify-center mb-3 space-x-2'>
        <select value={select} onChange={(e) => setSelect(e.target.value)} className={`${selectWidth(select)} hover:bg-blue-600 cursor-pointer bg-[#115999] pl-1 rounded-full text-2xl`}>
            <option value="Media">Media</option>
            <option value="Text">Text</option>
        </select>
        {!profile && <select value={select2} onChange={(e) => setSelect2(e.target.value)} className={`${select2Width(select2)} hover:bg-blue-600 cursor-pointer bg-[#115999] pl-1 rounded-full text-2xl`}>
            <option value="Explore">Explore</option>
            <option value="Following">Following</option>
        </select>}
        {((profile && user.other_data.acct === profile.acct) || !profile) && <button onClick={() => setCreate(!create)} className='hover:bg-[#115999] rounded-full h-[31px] w-[31px] bg-blue-600 flex items-center justify-center text-4xl'>+</button>}        
        </div>
    
       {create && <div className='flex justify-center mb-4 px-2'>
        <div className='flex flex-col items-center bg-[#113e85] rounded-[20px] px-4 pt-2 pb-2'>
           <div className='flex justify-between w-full pr-3 pl-2'>
           <h2 className='text-2xl font-[500]'>Make a Post!</h2>
           <button onClick={() => setCreate(false)} className='px-3 max-sxx:h-8 bg-[#0e1d36] rounded-full font-[600] border-[3px] border-blue-600 mb-2'>^^^</button>
            </div>
        <input type='text' className='bg-[#0e1d36] border- w-[270px] max-sxx:w-full h-12 text-xl px-3 rounded-full' placeholder='Type your caption here...'/>
        
        <div className='mt-2 flex justify-between w-full items-center'>
        <button className='bg-[#0e1d36] h-10 w-10 rounded-full flex items-center justify-center border-blue-600 border-[3px]'><FontAwesomeIcon className='text-xl mt-[0.5px]' icon={faImage}/></button>
        <p className='text-3xl text-blue-300'>-------------</p>
        <button className='font-[500] text-xl bg-[#0e1d36] px-3  rounded-full border-[3px] border-blue-600'>{`>>>`}</button>
        </div>
        
        </div>
        </div>}

        {posts.length > 0 && posts.map((post, index) => (
            <div key={index} className='break-words flex justify-center '>
            {swap(post) && ((post.media_attachments.length > 0 && post.media_attachments[0].type != "unknown") || post.content.length > 0) && <div>
                <div className='bg-[#113e85] mb-5 sm:w-[400px] max-sm:w-[95vw]  rounded-[20px] pt-3 pb-1'>
    
                <a href={`/${post.account.acct}`}><div className='flex items-center mx-3'>
                <img className='w-[70px] object-cover rounded-full' src={post.account.avatar}/>
                <p className='break-all text-2xl ml-3 font-[500]'>@{post.account.username}</p>
                </div></a>

                <div className='text-2xl mx-3 mt-3 font-[] overflow-wrap  items-end'>
                {!moreToggle.includes(post.id) && <div dangerouslySetInnerHTML={{ __html: moreText(post.content)}} />}
                {moreToggle.includes(post.id) && <div dangerouslySetInnerHTML={{ __html: post.content}} />}
                {!moreToggle.includes(post.id) && moreText("hello", post.id) && <div onClick={() => moreFunc(post.id)} className='cursor-pointer bg-[#0e1d36] px-3 py-1 w-fit rounded-full mt-2 whitespace-nowrap'>See More</div>}
                {moreToggle.includes(post.id) && moreText("hello", post.id) && <div onClick={() => moreFunc(post.id)} className='cursor-pointer bg-[#0e1d36] px-3 py-1 w-fit rounded-full mt-2 whitespace-nowrap'>See Less</div>}
                </div>
                
                {post.media_attachments.length > 0 && <div className={`px-3 ${css(post.media_attachments)} ${css2(post.media_attachments)} space-x-3 flex overflow-x-auto`}>
                    
                    {post.media_attachments.map((media, index) => (
                        <div key={index} className={`mt-3 flex items-center ${css4(post.media_attachments)}`}>
                            { <div className=''>
                            {media.type === "image" && <img className={`${css3(post.media_attachments)} border-[4px] border-[#0e1d36] rounded-[20px]`} src={media.url}/>}

                            {(media.type === "video" || media.type === "gifv") && <div> 
                            <video className={`${css3(post.media_attachments)} rounded-[20px] border-[4px] border-[#0e1d36]`} controls>
                            <source src={media.url} type="video/mp4"/>
                            Your browser does not support the video tag.
                          </video>
                            </div>}

                            {media.type === "audio" && (
                            <audio controls className={`${css5(post.media_attachments)}`}>
                            <source src={media.url} type="audio/mp3" />
                            Your browser does not support the audio element.
                            </audio>
                            )}

                           </div>} 
                        </div>
                    ))}

                    </div>}

                    <div className='mt-3 mb-1 w-full sm:pl-3 sm:space-x-20 flex items-center max-sm:justify-between max-sm:px-10 justify-center sm:w-[390px]'>
                        <div className='flex mt-[-6px] items-center space-x-[5px]'>
                    {!likedPost(post.id) && <FontAwesomeIcon onClick={() => likePost(post.id)} className='w-8 h-8' icon={faHeart}/>}
                    {likedPost(post.id) && <FontAwesomeIcon onClick={() => unlikePost(post.id)} className='w-8 h-8 text-red-500' icon={solidHeart}/>}    
                        <p className='text-xl font-[500]'>{likedPosts(post.id, post.favourites_count)}</p>
                        </div>

                        <div className='ml-[px] mt-[-3px] flex space-x-[5px]'>
                        <FontAwesomeIcon className=' w-8 h-8 -10' icon={faReply}/>
                        <p className='text-xl font-[500] mt-[1.5px]'>{post.replies_count}</p>
                        </div>

                        <div className='mb-[px]'>
                        <FontAwesomeIcon className='bg-[#0e1d36] rounded-full px-3 w-8 h-8 -10' icon={faEllipsisH}/>
                        </div>
                    </div>

                </div>
                </div>}
            </div>
        ))}
        {loading2 && num >= allPosts.length && <div className='flex justify-center'> 
            <div className='flex justify-center text-4xl px-4 pt-[6px] py-2 border-2 w-fit rounded-[15px] mt-[-5px] mb-3'>
            Loading
            </div>
            </div>}
    </div>
  )
}

export default Posts