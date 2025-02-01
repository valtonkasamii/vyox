import React, {useEffect, useState, useRef} from 'react'
import { useDispatch } from 'react-redux';
import { addPosts, addRefresh, deletePost, addId } from '../reducers/postsReducer.js';
import { useSelector } from 'react-redux';
import { faHeart as solidHeart, faReply, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Posts = () => {
    const [select, setSelect] = useState('Media')
    const [loading, setLoading] = useState(true)
    const [num, setNum] = useState(0)
    const dispatch = useDispatch();
    const allPosts = useSelector((state) => state.posts.posts);
    const refresh = useSelector((state) => state.posts.refresh);
    const max_id = useSelector((state) => state.posts.maxId);
    const since_id = useSelector((state) => state.posts.sinceId);
    const posts = allPosts.slice(0, num)
    const [wait, setWait] = useState(false) 
    const [loading2, setLoading2] = useState(false)
    const [localLike, setLocalLike] = useState([])
    const isFetchingRef = useRef(false)

    console.log(posts)
    console.log(allPosts)
    console.log(allPosts.length ,num)

    const get10posts = async (currentNum) => {
      if (refresh >= allPosts.length || allPosts.length <= 60 || (allPosts.length - 60) <= currentNum || (allPosts.length - 60) <= refresh) {
        try {  
            setLoading2(true)
        const response = await fetch('http://127.0.0.1:5000/posts', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({max_id, since_id})            
            })
        if (!response.ok) {

        } else {
            const data = await response.json()
            console.log(data)
            const max = data[data.length - 1].id
            const since = allPosts.length > 0 ? allPosts[0].id : null
            console.log(max, since)
            dispatch(addPosts(data))
            dispatch(addId({max, since}))
            } 
            } catch (error) {
                console.error(error.message)
              } finally {
                setWait(false)
                setLoading(false)
                setLoading2(false)
                isFetchingRef.current = false
              }
        } else {
            isFetchingRef.current = false
            setLoading(false)
        }
        
    } 
    
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
    
    useEffect(() => {
        const outside = num + 20
         dispatch(deletePost());
         setNum(outside)
         dispatch(addRefresh(outside));
         get10posts(outside)
        }, [])

    useEffect(() => {
        if (allPosts.length != 0) {
            setLoading(false)
        } else setLoading(true)
    }, [allPosts])

    useEffect(() => {
        const handleScroll = () => {
          const scrollPosition = window.scrollY + window.innerHeight;
          const pageHeight = document.documentElement.scrollHeight;
          const threshold = pageHeight * 0.9; // 90% of the page height
    
          if (scrollPosition >= threshold) {
            const outside = num + 20
            if (allPosts.length >= num || (num - 20) < allPosts.length) {
                setNum(outside)
            }
            dispatch(addRefresh(outside))
            if (!isFetchingRef.current) {
                isFetchingRef.current = true

                if ((num - 20) < allPosts.length) {
                    setNum(outside)
                }
                get10posts(outside)
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
            return 'max-sm:w-[95vw]'
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

    if (loading) {
        return <div className="flex flex-col justify-center items-center text-5xl text-white font-[500]"><h1 className='px-5 pt-3 pb-4 rounded-[30px] border-2'>Loading</h1></div>
      }

  return (
    <div >
        <div className='flex justify-center mb-3'>
        <select value={select} onChange={(e) => setSelect(e.target.value)} className="bg-[#115999] pl-1 rounded-full text-2xl">
            <option value="Media">Media</option>
            <option value="Text">Text</option>
        </select>
        </div>
        
        {posts.length > 0 && posts.map((post, index) => (
            <div key={index} className='break-words flex justify-center '>
            {swap(post) && ((post.media_attachments.length > 0 && post.media_attachments[0].type != "unknown") || post) && <div>
                <div className='bg-[#113e85] mb-5 sm:w-[400px] max-sm:w-[95vw]  rounded-[20px] pt-3 pb-1'>
    
                <div className='flex items-center mx-3'>
                <img className='w-[70px] object-cover rounded-full' src={post.account.avatar}/>
                <p className='break-all text-2xl ml-3 font-[500]'>@{post.account.username}</p>
                </div>

                <div className='text-2xl mx-3 mt-3 font-[] overflow-wrap' dangerouslySetInnerHTML={{ __html: post.content }} />
                
                {post.media_attachments.length > 0 && <div className={`px-3 ${css(post.media_attachments)} ${css2(post.media_attachments)} space-x-3 flex overflow-x-auto pb-[3px]`}>
                    
                    {post.media_attachments.map((media, index) => (
                        <div key={index} className={`mt-3 flex items-center ${css4(post.media_attachments)}`}>
                            { <div className=''>
                            {media.type === "image" && <img className={`${css3(post.media_attachments)} border-[4px] border-[#0e1d36] rounded-[20px]`} src={media.url}/>}

                            {(media.type === "video" || media.type === "gifv") && <div> 
                            <video className={`${css3(post.media_attachments)} rounded-[20px] border-[3px] border-[#0e1d36]`} controls>
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

                    <div className='sm:pl-7 pl-6 mt-3 mb-1 w-full flex items-center justify-between sm:w-[390px] pr-5'>
                        <div className='flex  items-center space-x-[5px]'>
                    {!likedPost(post.id) && <FontAwesomeIcon onClick={() => likePost(post.id)} className='w-8 h-8' icon={faHeart}/>}
                    {likedPost(post.id) && <FontAwesomeIcon onClick={() => unlikePost(post.id)} className='w-8 h-8 text-red-500' icon={solidHeart}/>}    
                        <p className='text-xl font-[500]'>{likedPosts(post.id, post.favourites_count)}</p>
                        </div>

                        <div className='ml-[px] flex space-x-[5px]'>
                        <FontAwesomeIcon className=' w-8 h-8 -10' icon={faReply}/>
                        <p className='text-xl font-[500] mt-[3px]'>{post.replies_count}</p>
                        </div>

                        <div className='mb-[px]'>
                        <FontAwesomeIcon className='bg-[#0e1d36] rounded-full px-3 w-8 h-8 -10' icon={faEllipsisH}/>
                        </div>
                    </div>

                </div>
                </div>}
            </div>
        ))}
        {loading2 && <div className='flex justify-center'> 
            <div className='flex justify-center text-4xl px-4 pt-[6px] py-2 border-2 w-fit rounded-[15px] mt-[-5px] mb-3'>
            Loading
            </div>
            </div>}
    </div>
  )
}

export default Posts