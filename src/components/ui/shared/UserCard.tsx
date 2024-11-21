// import { Models } from "appwrite";
// import { Link } from "react-router-dom";
// import { Button } from "../button";
// type UserCardProps = {
//   user: Models.Document;
// };

import { Models } from "appwrite";
import { useEffect, useState } from "react";
import { useFollowMutation, useFollowStatusQuery, useUnfollowMutation } from "../../../lib/react-query/queriesAndMutations";
import { Link } from "react-router-dom";
import { Button } from "../button";


// const UserCard = ({ user }: UserCardProps) => {
//   return (
//     <Link to={`/profile/${user.$id}`} className="user-card">
//       <img
//         src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
//         alt="creator"
//         className="rounded-full w-14 h-14"
//       />

//       <div className="flex-center flex-col gap-1">
//         <p className="base-medium text-light-1 text-center line-clamp-1">
//           {user.name}
//         </p>
//         <p className="small-regular text-light-3 text-center line-clamp-1">
//           @{user.username}
//         </p>
//       </div>

//       <Button type="button" size="sm" className="shad-button_primary px-5">
//         Follow
//       </Button>
//     </Link>
//   );
// };

// export default UserCard;


type UserCardProps = {
  user: Models.Document;
  currentUserId: string; // The logged-in user's ID
};

const UserCard = ({ user, currentUserId }: UserCardProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Query to check if the current user is following this user
  const { data: followStatus, isPending: followStatusLoading, isError: followStatusError, refetch: refetchFollowStatus } = useFollowStatusQuery(currentUserId, user.$id);

  // Log the followStatus to debug
  useEffect(() => {
    if (followStatus !== undefined) {
      console.log("Follow Status:", followStatus); // Debugging output
      setIsFollowing(followStatus); // Update follow state
    }
  }, [followStatus]);

  // Handle loading or error states for follow status
  useEffect(() => {
    if (followStatusError) {
      console.error("Error fetching follow status:", followStatusError);
    }
  }, [followStatusError]);

  // Mutations for follow/unfollow
  const { mutate: follow, isPending: isFollowingLoading } = useFollowMutation();
  const { mutate: unfollow, isPending: isUnfollowingLoading } = useUnfollowMutation();

  // Handle follow/unfollow button click
  const handleFollowClick = async () => {
    if (isFollowing) {
      // Unfollow the user
      const result = await unfollow({ followerId: currentUserId, followingId: user.$id });
      if (result?.success) {
        console.log("Unfollowed successfully");
        setIsFollowing(false); // Update local state to reflect unfollow
        refetchFollowStatus(); // Refetch the follow status after mutation
      }
    } else {
      // Follow the user
      const result = await follow({ followerId: currentUserId, followingId: user.$id });
      if (result?.success) {
        console.log("Followed successfully");
        setIsFollowing(true); // Update local state to reflect follow
        refetchFollowStatus(); // Refetch the follow status after mutation
      }
    }
  };

  // Disable button during follow/unfollow actions
  const isLoading = isFollowingLoading || isUnfollowingLoading;

  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">{user.name}</p>
        <p className="small-regular text-light-3 text-center line-clamp-1">@{user.username}</p>
      </div>

      <Button
        type="button"
        size="sm"
        className="shad-button_primary px-5"
        onClick={handleFollowClick}
        disabled={isLoading}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </Link>
  );
};

export default UserCard;
