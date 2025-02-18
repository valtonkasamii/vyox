import React, {useEffect, useState, useRef} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addPosts, addRefresh, addId, deletePosts, hide, addLike, addUnlike } from '../reducers/postsReducer.js';
import { faStar as solidHeart, faEllipsisH, faImage } from '@fortawesome/free-solid-svg-icons';
import { faStar as faHeart, faComment as faReply } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { firstData } from './firstData.js';

const Posts = ({profile, user, starr, single}) => {
    const [select, setSelect] = useState('Text')
    const [select2, setSelect2] = useState('Explore')
    const [num, setNum] = useState(0)
    const dispatch = useDispatch();
    const allPosts = useSelector((state) => state.posts.posts);
    const [profilePosts, setProfilePosts] = useState([])
    const [followingPosts, setFollowingPosts] = useState([])
    const refresh = useSelector((state) => state.posts.refresh);
    const max_id = useSelector((state) => state.posts.maxId);
    const since_id = useSelector((state) => state.posts.sinceId);
    const [postSwitcher, setPostSwitcher] = useState(firstData) 
    const posts = postSwitcher.slice(0, num)
    const [loading2, setLoading2] = useState(false)
    const isFetchingRef = useRef(false)
    const [create, setCreate] = useState(false)
    const parser = new DOMParser()
    const [moreToggle, setMoreToggle] = useState([])
    const [localMax, setLocalMax] = useState(null)
    const [caption, setCaption] = useState('')
    const [createWait, setCreateWait] = useState(false)
    const [threeList, setThreeList] = useState([])
    const [deleteWait, setDeleteWait] = useState(false)
    const [postimg, setPostimg] = useState([])
    const fileInputRef = useRef(null)
    const [error, setError] = useState(false)
    const accessToken = useSelector((state) => state.user.token);
    const [replies1, setReplies1] = useState([])
    const replies = replies1.slice(0, num)
    const [comment, setComment] = useState('')
    const [replyWait, setReplyWait] = useState(false)

    console.log(allPosts.length, profilePosts.length, followingPosts.length, num)
    console.log(posts)

    const get10posts = async (currentNum) => {
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
      if (((refresh >= allPosts.length || allPosts.length <= 200 || (allPosts.length - 200) <= currentNum || (allPosts.length - 200) <= refresh) || profile || select2 === "Following" || single)) {
        try {  
            setLoading2(true)
            let response
            let response2
            if (!profile && select2 === "Explore" && !single) {
         response = await fetch('https://vyox-backend.vercel.app/api/posts', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({max_id, since_id, accessToken})            
            })
        } else if (profile && !starr && !single) {
            let url
            if (localMax) {
                url = `${mastodonServer}/api/v1/accounts/${profile.id}/statuses?limit=40&max_id=${localMax}`                
            } else {
                url = `${mastodonServer}/api/v1/accounts/${profile.id}/statuses?limit=40`
            }
            response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
            })
        } else if (profile && starr && !single) {
            let url
            if (localMax) {
                url = `${mastodonServer}/api/v1/favourites?limit=40&max_id=${localMax}`                
            } else {
                url = `${mastodonServer}/api/v1/favourites?limit=40`                
            }

            response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
        })
        } else if (((!profile && select2 === "Following" && !single))) {
            let url
            if (localMax && followingPosts.length != 0) {
                url = `${mastodonServer}/api/v1/timelines/home?limit=40&max_id=${localMax}`                
            } else {
                url = `${mastodonServer}/api/v1/timelines/home?limit=40`
            }
            response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
        })
    } else if (single) {
        const idPost = window.location.href.split("/").pop()
        response = await fetch(`${mastodonServer}/api/v1/statuses/${idPost}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
         response2 = await fetch(`${mastodonServer}/api/v1/statuses/${idPost}/context`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
    }
        if (single) {
        if (response2.ok) {
            const data = await response2.json()
            setReplies1(data.descendants)
        }
    }
        if (!response.ok) {
            const data = await response.json()
            console.log(data)
            if (data.error === "Failed to fetch posts" || data.error === "Too many requests") {
                setError(true)
            }
        } else {
            setError(false)
            const data = await response.json()
            const since = allPosts.length > 0 ? allPosts[0].id : null
            if (!profile && select2 === "Explore" && !single) {
            const max = data[data.length - 1].id
            const filteredData = data.filter(post => post.in_reply_to_id === null)
            const filteredVideos = filteredData.filter(post => (post.media_attachments.length > 0 ? post.media_attachments[0].type !== "video" : true))
            dispatch(addPosts(filteredVideos))
            dispatch(addId({max, since}))
            } else if (profile && !single) {
                const max = data[data.length - 1].id
                const filteredData = data.filter(post => post.in_reply_to_id === null)
                setLocalMax(max)
                if (profilePosts.length > 0) {
                    setProfilePosts([...profilePosts, ...filteredData])
                } else {
                    setProfilePosts(filteredData)
                }
            } else if (((!profile && select2 === "Following" && !single))) {
                const max = data[data.length - 1].id
                const filteredData = data.filter(post => post.in_reply_to_id === null)
                setLocalMax(max)
                if (followingPosts.length > 0) {
                    setFollowingPosts([...followingPosts, ...filteredData])
                } else {
                        setNum(20)
                        setFollowingPosts(filteredData)
                        console.log(data)
                }
            } else if (single) {
                setProfilePosts([data])
            }
            } 
            } catch (error) {
                console.error(error.message)
              } finally {
                setLoading2(false)
                isFetchingRef.current = false
              }
        } else {
            isFetchingRef.current = false
        }
        
    } 

    const toggleLike = async (postId, isLiked) => {
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

    const createPost = async (e) => {
        e.preventDefault()
        if (createWait === false) {
        setCreateWait(true)
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
        try {
            const mediaIds = []
            if (postimg.length > 0) {
                for (const img of postimg) {
                    const formData = new FormData();
                    formData.append('file', img)

                    const response = await fetch(`${mastodonServer}/api/v1/media`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                        body: formData
                    });
            
                    const data = await response.json();
                    mediaIds.push(data.id)  
                }
            }
        const response = await fetch(`${mastodonServer}/api/v1/statuses`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({status: caption, media_ids: mediaIds})
        })

        if (response.ok) {
            const data = await response.json()

            if (postimg.length > 0) {
            setPostimg([])
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              setSelect('Media')
            } else setSelect('Text')

                setLocalMax(null)
                setCaption('')
                if (select2 === "Explore" && !profile) {
                    setSelect2("Following")
                } 
                if (!profile) {
                setFollowingPosts([data, ...followingPosts])      
                } else {
                    setProfilePosts([data, ...profilePosts])      
                }
         }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setCreateWait(false)
        }
    }
    }

    const deletePost = async (id) => {
        setDeleteWait(true)
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
        try {
            const response = await fetch(`${mastodonServer}/api/v1/statuses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }

            })

            if (response.ok) {
                if (!profile) {
                    const filteredPosts = followingPosts.filter(post => post.id != id)
                    setFollowingPosts(filteredPosts)
                } else {
                    const filteredPosts = profilePosts.filter(post => post.id != id)
                    setProfilePosts(filteredPosts)
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setDeleteWait(false)
        }
    }

    const sendReply = async (e) => {
        e.preventDefault()
        const mastodonServer = import.meta.env.VITE_FEDIVERSE_INSTANCE_URL
        if (!replyWait) {
            setReplyWait(true)
        try {
          const apiUrl = `${mastodonServer}/api/v1/statuses`;
    
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              status: comment,
              in_reply_to_id: profilePosts[0].id
            })
          });
    
          if (!response.ok) {
            throw new Error('Network response was not ok');
          } else {
            setComment('')
            const data = await response.json();
            console.log(data)
            setReplies1([...replies1, data])
          }
    
        } catch (error) {
          console.error('Error sending reply:', error);
        } finally {
            setReplyWait(false)
        }
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
         if (!profile && select2 != "Following" && !single) {
            dispatch(deletePosts());
            setNum(outside)
            dispatch(addRefresh(outside));
            if (!isFetchingRef.current) {
                isFetchingRef.current = true
            get10posts(outside)
            }
         } else {
            setNum(outside)
            if (!isFetchingRef.current) {
                isFetchingRef.current = true
            get10posts(outside)
            }
         }

         if (single) {
            get10posts(outside)
         }
        }, [])

        useEffect(() => {
            if (!profile && select2 != "Following" && !single) {
                if (allPosts.length > 0) {
                    setPostSwitcher(allPosts)
                    } else {
                        setPostSwitcher(firstData)
                    }
            }
    }, [allPosts])

    useEffect(() => {
    if (profile || single) {
        setPostSwitcher(profilePosts)
        }
    }, [profilePosts])

    useEffect(() => {
        const handleScroll = () => {
          const scrollPosition = window.scrollY + window.innerHeight;
          const pageHeight = document.documentElement.scrollHeight;
          if (scrollPosition >= pageHeight - 1) {
            const outside = num + 20
            if (!single) {
            if ((postSwitcher === allPosts && allPosts.length >= (num - 20)) || (postSwitcher === profilePosts && profilePosts.length >= (num - 20)) || (postSwitcher === followingPosts && followingPosts.length >= (num - 20))) {
                if (!profile) {
                    setNum(outside)
                } else if (profile && posts.length >= 20) {
                    setNum(outside)
                }
            }
        } else {
            if ((num - 20) <= posts.length) {
                setNum(outside)
            }
        }
            if (!profile && select2 != "Following"){
                dispatch(addRefresh(outside))
            }
            if (!isFetchingRef.current) {
                isFetchingRef.current = true
                if(!profile) {
                    get10posts(outside)
                } else if (profile && profilePosts.length % 40 === 0) {
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

      useEffect(() => {
        setNum(20)
        if (!isFetchingRef.current && select2 === "Explore") {
            isFetchingRef.current = true
            get10posts(20)
        }
        if (select2 === "Following") {
            get10posts(20)
            isFetchingRef.current = true
        } else {
            setLocalMax(null)
            setFollowingPosts([])
        }
      }, [select2])

    useEffect(() => {
        if (select2 === "Following" && !profile) {
            setPostSwitcher(followingPosts)
        } else if (!profile && select2 === "Explore" && !single) {
            if (allPosts.length > 0) {
            setPostSwitcher(allPosts)
            } else {
                setPostSwitcher(firstData)
            }
        }
    }, [followingPosts, select2])

    useEffect(() => {
        if (followingPosts.length > 1) {
        if (followingPosts[0].id === followingPosts[1].id) {
           const filteredPosts = followingPosts.filter((post, index) => index !== 0)
           setFollowingPosts(filteredPosts)
        }
    }
    }, [followingPosts])

    const swap = (post) => {
        if (!single) {
        if (select === 'Media') {
            return post.media_attachments.length > 0
        } else return post.media_attachments.length === 0
    } else return true
    }

    const swap2 = () => {
        if (select === 'Media') {
            if (posts.filter(post => post.media_attachments.length > 0).length > 0) {
                return true
            } else return false
        } else {
        if (posts.filter(post => post.media_attachments.length === 0).length > 0) {
            return true
        } else return false
    }
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

    const css6 = () => {
        if (posts.length !== 0) {
            return 'mt-[-5px]'
        } else return 'mt-1'
    }

    const likePost = (id) => {
        toggleLike(id, false)

        if (!profile && select2 === "Explore" && !single) {
            dispatch(addLike(id))
        } else if (!profile && select2 === "Following" & !single) {
            setFollowingPosts((prevPosts) => prevPosts.map((post) => post.id === id ? { ...post, favourited: true, favourites_count: post.favourites_count + 1 } : post ) );
        } else if (profile || single) {
            setProfilePosts((prevPosts) => prevPosts.map((post) => post.id === id ? { ...post, favourited: true, favourites_count: post.favourites_count + 1 } : post ) );
        }
    }
    
    const unlikePost = (id) => {
        toggleLike(id, true)

        if (!profile && select2 === "Explore" && !single) {
            dispatch(addUnlike(id))
        } else if (!profile && select2 === "Following" && !single) {
            setFollowingPosts((prevPosts) => prevPosts.map((post) => post.id === id ? { ...post, favourited: false, favourites_count: post.favourites_count - 1 } : post ) );
        } else if (profile || single) {
            setProfilePosts((prevPosts) => prevPosts.map((post) => post.id === id ? { ...post, favourited: false, favourites_count: post.favourites_count - 1 } : post ) );
        }
    }

    const insertSpaceAfterTags = (html, tags = ['a', 'u', 'p', 'n']) => {
        const regex = new RegExp(`</(${tags.join('|')})>`, 'gi');
        return html.replace(regex, '</$1> ');
      };

    const seeMore = posts.filter(post => parser.parseFromString(insertSpaceAfterTags(post.content), "text/html").body.innerText.length >= 100).map(post => post.id)
    const seeMore2 = replies.filter(reply => parser.parseFromString(insertSpaceAfterTags(reply.content), "text/html").body.innerText.length >= 100).map(reply => reply.id)
      
    const moreText = (text, id, id2) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
    
        const anchorElements = tempDiv.querySelectorAll('a');
    
        anchorElements.forEach(element => {
            element.style.color = 'yellow';
    
            if (element.href.startsWith('https://mastodon.social')) {
                element.href = element.href.replace('https://mastodon.social', 'http://localhost:5173');
            }
        });
    
        text = tempDiv.innerHTML;

        const modifiedHTML = insertSpaceAfterTags(text)
        if (parser.parseFromString(modifiedHTML, "text/html").body.textContent.length >= 100 && !id) {
            const doc = parser.parseFromString(modifiedHTML, "text/html")
            return doc.body.innerText.replace(/\s+/g, ' ').trim().substring(0, 70) + '...'
        } else if (text && !id && !id2) {
            return text
        } else if (id) {
            return seeMore.includes(id)
        } else if (id2) {
            return seeMore2.includes(id2)
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

    const handleThree = (id) => {
        if (threeList.includes(id)) {
            const threeFiltered = threeList.filter(ids => ids !== id)
            setThreeList(threeFiltered)
        } else {
            setThreeList([...threeList, id])
        }
    }

    const handleImageClick = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      };

      const handleFileChange = (e) => {
        const file = e.target.files[0]

        if (postimg.length > 0 && postimg[0].startsWith('data:video/')) {
            alert("You can only upload one video at a time.");
            e.target.value = ""; 
            return
            } else {
                if (postimg.length >= 4) {
                    alert("You can only upload 4 images at a time.");
                    e.target.value = ""; 
                    return
                }
            } 

        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPostimg([...postimg, reader.result])
            }
            reader.readAsDataURL(file)
        }
    }

    const mediaInputs = () => {
        if (postimg.length > 0) {
            if (postimg[0].startsWith('data:image/')) {
                return "image/*"
            } else if (postimg[0].startsWith('data:video/')) {
                return "video/*"
            }
        } else return "video/*, image/*"
    }
    
    const mediaSwitch = (img) => {
        if (img.startsWith('data:image/')) {
            return true;
        } else return false
}

    const mediaSwitch2 = (img) => {
        if (img.startsWith('data:video/')) {
            return true;
        } else return false
    }

    const removeMedia = (img) => {
        const filtered = postimg.filter(imgs => imgs != img)
        setPostimg(filtered)
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
    }

    const processHTML = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
    
        const anchorElements = tempDiv.querySelectorAll('a');
    
        anchorElements.forEach(element => {
            element.style.color = 'silver';
    
            if (element.href.startsWith('https://mastodon.social')) {
                element.href = element.href.replace('https://mastodon.social', 'http://localhost:5173');
            }
        });
    
        return tempDiv.innerHTML;
    };

    const hiding = (id) => {
        if (!profile) {
        if (select2 === "Explore") {
            dispatch(hide(id))
        } else {
            setFollowingPosts(followingPosts.filter(post => post.id != id))
        }
    } else {
        setProfilePosts(profilePosts.filter(post => post.id != id))
    }
    }   

    const handleClickContainer = (id, e) => {
        if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
            window.location.href = `http://localhost:5173/post/${id}`;
        }
    };
  return (
    <div >
        {!single && <div className='flex max-xss:flex-col items-center max-xss:space-y-3 xss:justify-center mb-3 space-x-2'>
        <select value={select} onChange={(e) => setSelect(e.target.value)} className={`${selectWidth(select)} hover:bg-blue-600 cursor-pointer bg-[#115999] pl-1 rounded-full text-2xl`}>
            <option value="Media">Media</option>
            <option value="Text">Text</option>
        </select>
        {!profile && <select value={select2} onChange={(e) => setSelect2(e.target.value)} className={`${select2Width(select2)} hover:bg-blue-600 cursor-pointer bg-[#115999] pl-1 rounded-full text-2xl`}>
            <option value="Explore">Explore</option>
            <option value="Following">Following</option>
        </select>}
        {((profile && user.other_data.acct === profile.acct) || !profile) && <button onClick={() => setCreate(!create)} className='hover:bg-[#115999] rounded-full h-[31px] w-[31px] bg-blue-600 flex items-center justify-center text-4xl'>+</button>}        
        </div>}
    
       {create && !single && <form onSubmit={createPost} className='flex justify-center mb-4 px-2'>
        <div className='flex flex-col items-center bg-[#113e85] rounded-[20px] px-4 pt-2 pb-2'>
           <div className='flex justify-between w-full pr-3 pl-2'>
           <h2 className='text-2xl font-[500]'>Make a Post!</h2>
           <button type='button' onClick={() => setCreate(false)} className='px-3 max-sxx:h-8 bg-[#0e1d36] rounded-full font-[600] border-[3px] border-blue-600 mb-2'>^^^</button>
            </div>
        {!createWait && <input required value={caption} onChange={(e) => setCaption(e.target.value)} type='text' className='bg-[#0e1d36] border- w-[270px] max-sxx:w-full h-12 text-xl px-3 rounded-full' placeholder='Type your caption here...'/>}
        {createWait && <div className='bg-blue-600 border- w-[270px] max-sxx:w-full h-12 text-xl px-3 rounded-full'></div>}
        <input ref={fileInputRef} onChange={handleFileChange} className='hidden' accept={mediaInputs()} type='file'/>
        <div className='mt-2 flex justify-between w-full items-center'>
        {!createWait && <button onClick={handleImageClick} type='button' className='bg-[#0e1d36] h-10 w-10 rounded-full flex items-center justify-center border-blue-600 border-[3px]'><FontAwesomeIcon className='text-xl mt-[0.5px]' icon={faImage}/></button>}
        {createWait && <button type='button' className='bg-blue-600 h-10 w-10 rounded-full flex items-center justify-center border-blue-600 border-[3px]'></button>}
        <p className='text-3xl text-blue-300'>-------------</p>
        {!createWait && <button className='font-[500] text-xl bg-[#0e1d36] px-3  rounded-full border-[3px] border-blue-600'>{`>>>`}</button>}
        {createWait && <button type='button' className='font-[500] text-xl bg-blue-600 text-blue-600 px-3  rounded-full border-[3px] border-blue-600'>{`>>>`}</button>}
        </div>

        {postimg.length > 0 && <div className='mb-2 space-y-5'>
            {createWait && <div className='mt-3'></div>}
        {postimg.length > 0 && postimg.map((img, index) => (
            <div key={index} className=''>
                <div className='flex justify-center'>
                {!createWait && <button type='button' onClick={() => removeMedia(img)} className='text-xl font-[500] bg-[#0e1d36] px-3 py-1 mb-[5px] rounded-full'>Remove</button>}
                </div>
            {mediaSwitch(img) && !createWait && <img className='w-[270px] rounded-[30px] border-[4px] border-[#0e1d36]' src={img}/>}        
            {mediaSwitch2(img) && !createWait && <video className='w-[270px] rounded-[30px] border-[3px] border-[#0e1d36]' src={img} controls />}
            {createWait && <div className='bg-blue-600 w-[270px] h-[130px] rounded-[30px]'></div>}
            </div>
        ))}
        </div>}

        </div>
        </form>}

        {posts.length > 0 && posts.map((post, index) => (
            <div onClick={(e) => handleClickContainer(post.id, e)} key={index} className='break-words flex justify-center '>
            {swap(post) && ((post.media_attachments.length > 0 && post.media_attachments[0].type != "unknown") || post.content.length > 0) && <div>
                <div className='bg-[#113e85] mb-5 sm:w-[400px] max-sm:w-[95vw]  rounded-[20px] pt-3 pb-1'>
    
                <a className='flex justify-start w-fit' onClick={(e) => e.stopPropagation()} href={`/${post.account.acct}`}><div className='flex items-center mx-3 w-fit'>
                <img className='w-[70px] object-cover rounded-full' src={post.account.avatar}/>
                <p className='break-all text-2xl ml-3 font-[500]'>@{post.account.username}</p>
                </div></a>

                <div className='text-2xl mx-3 mt-3 font-[] overflow-wrap  items-end'>
                {!moreToggle.includes(post.id) && <div dangerouslySetInnerHTML={{ __html: moreText(post.content)}} />}
                {moreToggle.includes(post.id) && <div dangerouslySetInnerHTML={{ __html: processHTML(post.content)}} />}
                {!moreToggle.includes(post.id) && moreText("hello", post.id) && <div onClick={(e) => (moreFunc(post.id), e.stopPropagation())} className='cursor-pointer bg-[#0e1d36] px-3 py-1 w-fit rounded-full mt-2 whitespace-nowrap'>See More</div>}
                {moreToggle.includes(post.id) && moreText("hello", post.id) && <div onClick={(e) => (moreFunc(post.id), e.stopPropagation())} className='cursor-pointer bg-[#0e1d36] px-3 py-1 w-fit rounded-full mt-2 whitespace-nowrap'>See Less</div>}
                </div>
                
                {post.media_attachments.length > 0 && <div className={`px-3 ${css(post.media_attachments)} ${css2(post.media_attachments)} space-x-3 flex overflow-x-auto`}>
                    
                    {post.media_attachments.map((media, index) => (
                        <div key={index} className={`mt-3 flex items-center ${css4(post.media_attachments)}`}>
                            { <div className=''>
                            {media.type === "image" && <img className={`${css3(post.media_attachments)} border-[4px] border-[#0e1d36] rounded-[20px]`} src={media.url}/>}

                            {(media.type === "video" || media.type === "gifv") && <div onClick={(e) => e.stopPropagation()}> 
                            <video className={`${css3(post.media_attachments)} rounded-[20px] border-[4px] border-[#0e1d36]`} controls>
                            <source src={media.url} type="video/mp4"/>
                            Your browser does not support the video tag.
                          </video>
                            </div>}

                            {media.type === "audio" && (
                            <audio onClick={(e) => e.stopPropagation()} controls className={`${css5(post.media_attachments)}`}>
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
                    {!post.favourited && <FontAwesomeIcon onClick={(e) => (likePost(post.id), e.stopPropagation())} className='cursor-pointer w-[37px] h-[37px]' icon={faHeart}/>}
                    {post.favourited && <FontAwesomeIcon onClick={(e) => (unlikePost(post.id), e.stopPropagation())} className='cursor-pointer w-[37px] h-[37px] text-yellow-300' icon={solidHeart}/>}    
                        <p className='text-xl font-[500] mb-[-5px]'>{post.favourites_count}</p>
                        </div>

                        <div className='ml-[px] mt-[-3px] flex space-x-[5px]'>
                        <FontAwesomeIcon  className='cursor-pointer w-8 h-8 -10' icon={faReply}/>
                        </div>

                        <div className='mb-[px]'>
                        <FontAwesomeIcon onClick={(e) => (handleThree(post.id), e.stopPropagation())} className='cursor-pointer bg-[#0e1d36] rounded-full px-3 w-8 h-8 -10' icon={faEllipsisH}/>
                        </div>
                    </div>

                </div>
                <div className='flex justify-end'>
                {threeList.includes(post.id) && <div className='bg-[#113e85] mb-5 mt-[-10px] px-3 py-3 rounded-[20px] mr-5'>
                    {post.account.acct === user.other_data.acct && !deleteWait && <button onClick={() => deletePost(post.id)} className='text-xl font-[500] bg-[#0e1d36] px-3 pb-[3px] pt-[4px]  rounded-full'>Delete</button>}
                    {post.account.acct === user.other_data.acct && deleteWait && <button className='text-xl font-[500] bg-blue-600 text-blue-600 px-3 pb-[3px] pt-[4px]  rounded-full'>Delete</button>}
                    {post.account.acct !== user.other_data.acct && <button onClick={() => hiding(post.id)} className='text-xl font-[500] bg-[#0e1d36] px-3 pb-[3px] pt-[4px]  rounded-full'>Hide</button>}
                </div>}
                </div>
                </div>}
            </div>
        ))}
        {single && <div className='flex flex-col items-center'>
            <form onSubmit={sendReply} className='mb-3 mt-[-8px] bg-[#0e1d36] text-2xl sm:w-[400px] border-2 border-blue-300 max-sm:w-[95vw]  rounded-[20px] flex justify-between'>
                <input value={comment} onChange={(e) => setComment(e.target.value)} type='text' placeholder='Type your reply...' className='placeholder:text-gray-200 w-full bg-blue-900 px-3 h-[50px] rounded-l-[20px]'/>
                {!replyWait && <button className='rounded-r-[20px] font-[500] px-3'>{`>>>`}</button>}
                {replyWait && <button type='button' className='rounded-r-[20px] text-blue-600 bg-blue-600 font-[500] px-3'>{`>>>`}</button>}
            </form>

            <div className=' py-3 bg-[#113e85] mb-3 sm:w-[400px] max-sm:w-[95vw]  rounded-[20px]'>           
           <div className='flex items-center justify-between px-3 mb-2'>
            <h1 className='text-3xl font-[500] text-gray-200'>Replies</h1>
            <h1 className='text-3xl font-[500] ml-3 mt-[-3px]'>{replies1.length}</h1>
           </div>
           <div className='border-b-[2px] mb-3 border-blue-300'></div>
           <div className='space-y-3'>
            {replies.map((reply, index) => (
                <div key={index} className={`${reply.id !== replies[replies.length -1].id ? 'border-b-[3px] pb-3' : ''} border-blue-300`}>
                    <div className='px-3'>

                    <div className='flex items-center mb-2'>
                        <img className='w-[68px] rounded-full' src={reply.account.avatar}/>
                        <p className='ml-2 font-[500] text-2xl break-all'>@{reply.account.username}</p>
                    </div>
                    {!moreToggle.includes(reply.id) && <div className='text-2xl' dangerouslySetInnerHTML={{ __html: moreText(reply.content)}} />}
                    {moreToggle.includes(reply.id) && <div className='text-2xl' dangerouslySetInnerHTML={{ __html: processHTML(reply.content)}} />}
                {!moreToggle.includes(reply.id) && moreText("hello", null, reply.id) && <div onClick={(e) => (moreFunc(reply.id), e.stopPropagation())} className='cursor-pointer text-2xl bg-[#0e1d36] px-3 py-1 w-fit rounded-full mt-2 whitespace-nowrap'>See More</div>}
                {moreToggle.includes(reply.id) && moreText("hello", null, reply.id) && <div onClick={(e) => (moreFunc(reply.id), e.stopPropagation())} className='cursor-pointer text-2xl bg-[#0e1d36] px-3 py-1 w-fit rounded-full mt-2 whitespace-nowrap'>See Less</div>}
                </div>
                </div>
            ))}
            </div>
            </div></div>}
        {!swap2() && <div className='mb-2'></div>}
        {((loading2 && num >= allPosts.length && select2 === "Explore") || (select2 === "Explore" && allPosts.length === 0) || (select2 === "Following" && followingPosts.length === 0) || (profile && profilePosts.length === 0) || (single && profilePosts.length === 0)) && !error && (!single || single && profilePosts.length === 0) && <div className='flex justify-center'> 
            <div className={`flex justify-center text-4xl px-4 pt-[6px] py-2 border-2 w-fit rounded-[15px] ${css6()} mb-3`}>
            Loading
            </div>
            </div>}
            {error && <div className={`${css6()} flex justify-center text-2xl mb-2`}>
                <p className=''>please take a break</p>
                </div>}
    </div>
  )
}

export default Posts