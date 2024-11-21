import { Models } from 'appwrite'
import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from '../../../lib/react-query/queriesAndMutations';
import { useEffect, useState } from 'react';
import { checkIsLiked } from '../../../lib/utils';
import React from 'react';
import Loader from './Loader';
type poststatprops = {
    post? : Models.Document;
    userId:string;
}
const PostStats = ({post , userId}:poststatprops) => {

    const likesList = post?.likes.map((user:Models.Document) => user.$id)

    const [likes,setLikes] = useState(likesList);
    const [isSaved,setIsSaved] = useState(false);

    const {mutate:likepost} = useLikePost();
    const {mutate:savepost , isPending :isSavingPost} = useSavePost();
    const {mutate:deleteSavedpost, isPending :isDeletingSaved} = useDeleteSavedPost();

    const {data: currentUser} = useGetCurrentUser();

    const savedPostRecord = currentUser?.save.find((record:Models.
        Document) => record.post.$id === post?.$id);

    useEffect(() => {
        setIsSaved(!!savedPostRecord)
    },[currentUser])
    // functions 
    const handleLikePost = (e:React.MouseEvent) =>{
        e.stopPropagation();
        let newLikes = [...likes];
        const hasLiked = newLikes.includes(userId)
        if(hasLiked) {
            newLikes = newLikes.filter((id) => id !== userId)
        }
        else{
            newLikes.push(userId);
        }
        setLikes(newLikes);
        likepost({postId:post?.$id || '', likesArray: newLikes})
    }

    const handleSavePost = (e:React.MouseEvent) =>{
        e.stopPropagation();
        
        
        if(savedPostRecord){
            setIsSaved(false);
            deleteSavedpost(savedPostRecord.$id);
        }
        else{
            savepost({ postId : post?.$id || '' ,userId });
            setIsSaved(true);
        }
    }



  return (
    <div className="flex justify-between items-center z-20">
        <div className="flex gap-2 mr-5">
            <img 
            src= {checkIsLiked(likes,userId)
                    ?  "/assets/icons/liked.svg"
                    : "/assets/icons/like.svg"
                }
            alt="like" 
            width={20} 
            height={20}
            className='cursor-pointer' 
            onClick={handleLikePost} />
            <p className='small-medium lg:base-medium'>{likes.length}</p>
        </div>
        <div className="flex gap-2">
            {isSavingPost || isDeletingSaved ? <Loader/>: <img 
            src={isSaved
                ? "/assets/icons/saved.svg"
                : "/assets/icons/save.svg"}
            alt="like" 
            width={20} 
            height={20}
            className='cursor-pointer' 
            onClick={handleSavePost} />}
        </div>
    </div>
  )
}

export default PostStats




