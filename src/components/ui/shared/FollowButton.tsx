import { useEffect, useState } from "react";
import { useFollowMutation, useFollowStatusQuery, useUnfollowMutation } from "../../../lib/react-query/queriesAndMutations";

interface FollowButtonProps {
  followerId: string;
  followingId: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ followerId, followingId }) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Use the query to check if the user is following the other user
  const { data: followStatus, isLoading: isFollowStatusLoading } = useFollowStatusQuery(followerId, followingId);

  // Check if the user is following the other user
  useEffect(() => {
    if (!isFollowStatusLoading) {
      setIsFollowing(followStatus ?? false); // Set following state
    }
  }, [isFollowStatusLoading, followStatus]);

  // Mutations for following and unfollowing
  const { mutate: follow, isPending: isFollowingLoading } = useFollowMutation();
  const { mutate: unfollow, isPending: isUnfollowingLoading } = useUnfollowMutation();

  const handleFollowClick = async () => {
    if (isFollowing) {
      // Unfollow the user
      const result = await unfollow({ followerId, followingId });
      if (result?.success) {
        setIsFollowing(false); // Update state to "not following"
      }
    } else {
      // Follow the user
      const result = await follow({ followerId, followingId });
      if (result?.success) {
        setIsFollowing(true); // Update state to "following"
      }
    }
  };

  if (isFollowStatusLoading || isFollowingLoading || isUnfollowingLoading) {
    return <button disabled>Loading...</button>;
  }

  return (
    <button onClick={handleFollowClick}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
