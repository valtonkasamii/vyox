import React, {useEffect, useState} from 'react'
import { useDispatch } from 'react-redux';
import { addPosts, addRefresh, deletePost, addId } from '../reducers/postsReducer.js';
import { useSelector } from 'react-redux';

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
    
    console.log(posts)
    console.log(allPosts)
    console.log(allPosts.length ,num)

    const get10posts = async (currentNum) => {
      if ((refresh >= allPosts.length) || allPosts.length < 80 || allPosts.length - 60 <= currentNum) {
        try {  
            setWait(true)
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
            const max = data[data.length - 1].id
            const since = allPosts[0].id
            console.log(max, since)
            dispatch(addPosts(data))
            dispatch(addId({max, since}))
            } 
            } catch (error) {
                console.error(error.message)
              } finally {
                setWait(false)
                setLoading(false)
              }
        } else {
            setLoading(false)
        }
        
    } 
    
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
            if (!wait) {
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
        } else return 'space-x-3'
    } 

    const css3 = (array) => {
        if (array.length === 1) {
            return 'w-[360px] max-sm:w-[310px]'
        } else return 'w-[300px] max-sm:w-[260px]'
    }

    if (loading) {
        return <div className="flex flex-col justify-center items-center text-5xl text-white font-[500]"><h1 className='px-5 pt-3 pb-4 rounded-[30px] border-2'>Loading</h1></div>
      }

  return (
    <div>
        <div className='flex justify-center mb-3'>
        <select value={select} onChange={(e) => setSelect(e.target.value)} className="bg-[#115999] pl-1  rounded-full text-2xl">
            <option value="Media">Media</option>
            <option value="Text">Text</option>
        </select>
        </div>
        
        {posts.length > 0 && posts.map((post, index) => (
            <div key={index} className='break-words flex justify-center'>
            {swap(post) && ((post.media_attachments.length > 0 && post.media_attachments[0].type != "unknown") || post) && <div>
                <div className='bg-[#113e85] pl- mb-5 sm:w-[400px] w-[340px] rounded-[20px] py-3'>
    
                <div className='flex items-center mx-3'>
                <img className='w-[70px] object-cover rounded-full' src={post.account.avatar}/>
                <p className='break-all text-2xl ml-3 font-[500]'>@{post.account.username}</p>
                </div>

                <div className='text-2xl mx-3 mt-3 font-[] overflow-wrap' dangerouslySetInnerHTML={{ __html: post.content }} />
                
                {post.media_attachments.length > 0 && <div className={`px-3 ${css(post.media_attachments)} ${css2(post.media_attachments)} space-x-3 flex overflow-x-auto pb-[3px]`}>
                    
                    {post.media_attachments.map((media, index) => (
                        <div key={index} className='mt-3 flex-shrink-0 flex items-center'>
                            { <div className=''>
                            {media.type === "image" && <img className={`${css3(post.media_attachments)} border-[4px] border-[#0e1d36] rounded-[20px]`} src={media.url}/>}

                            {(media.type === "video" || media.type === "gifv") && <div> 
                            <video className={`${css3(post.media_attachments)} rounded-[20px] border-[3px] border-[#0e1d36]`} controls>
                            <source src={media.url} type="video/mp4"/>
                            Your browser does not support the video tag.
                          </video>
                            </div>}

                            {media.type === "audio" && (
                            <audio controls className={`${css3(post.media_attachments)}`}>
                            <source src={media.url} type="audio/mp3" />
                            Your browser does not support the audio element.
                            </audio>
                            )}

                           </div>} 
                        </div>
                    ))}

                    </div>}

                </div>
                </div>}
            </div>
        ))}
    </div>
  )
}

export default Posts