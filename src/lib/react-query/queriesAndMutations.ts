import { useQuery,useMutation,useQueryClient,useInfiniteQuery } from "@tanstack/react-query";
import { createPost, createUserAccount, deletePost, deleteSavedPost, followUser, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, getUserById, getUsers, likePost, savePost, searchPosts, signInAccount, signOutAccount, unfollowUser, updatePost, updateUser } from "../appwrite/api";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "../../types";
import { QUERY_KEYS } from "./QUERY_KEYS";
import { Query } from "appwrite";
import { appwriteConfig, databases } from "../appwrite/config";

// creating account mutation 
export const useCreateUserAccount = ()=>{
    return useMutation({
        mutationFn:(user: INewUser)=> createUserAccount(user)
    })
}

// signing in account mutation 
export const useSignInAccount = ()=>{
    return useMutation({
        mutationFn:(user: { email:string; password:string; })=> signInAccount(user)
    })
}

//signing out mutation
export const useSignOutAccount = ()=>{
    return useMutation({
        mutationFn:signOutAccount
    })
}

//create post muataion
export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (post: INewPost) => createPost(post),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
      },
    });
  };
//fetching recent posts mutation
export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};

//use liked post mutation
export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// saving post mutation 
export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// deleting saved posts muataion
export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};
//getting data about current user
export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};


export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts,
    getNextPageParam: (lastPage) => {
      // If there's no data, there are no more pages.
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      // Use the $id of the last document as the cursor.
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};


export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS , searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};


export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

// // Mutation to follow a user
// export const followMutation = async (followerId: string, followingId: string) => {
//   const result = await followUser(followerId, followingId);
//   return result;
// };

// // Mutation to unfollow a user
// export const unfollowMutation = async (followerId: string, followingId: string) => {
//   const result = await unfollowUser(followerId, followingId);
//   return result;
// };

// Function to check if the user is following another user
const checkFollowStatus = async (followerId: string, followingId: string) => {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
      ]
    );
    return result.documents.length > 0;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

// Follow Mutation using React Query
export const useFollowMutation = () => {
  return useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
      const result = await followUser(followerId, followingId);
      return result; // Returning result so React Query can track success/error
    },
  });
};

// Unfollow Mutation using React Query
export const useUnfollowMutation = () => {
  return useMutation({
    mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
      const result = await unfollowUser(followerId, followingId);
      return result; // Returning result so React Query can track success/error
    },
  });
};

// Query to check if the user is following another user
export const useFollowStatusQuery = (followerId: string, followingId: string) => {
  return useQuery({
    queryKey: ['followStatus', followerId, followingId],
    queryFn: () => checkFollowStatus(followerId, followingId),
    enabled: Boolean(followerId && followingId), // Only run if both IDs are provided
  });
};

// Assuming you're using React Query v5

// Query to get the followers count
export const useFollowersCountQuery = (userId: string) => {
  return useQuery({
    queryKey: ['followersCount', userId], // Array for the query key
    queryFn: async () => {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.followersCollectionId,
        [Query.equal('followingId', userId)] // Assuming "followingId" stores the user's followers
      );
      return result.documents.length; // Return the count of followers
    },
    enabled: Boolean(userId), // Only run query if userId is available
  });
};

// Query to get the following count
export const useFollowingCountQuery = (userId: string) => {
  return useQuery({
    queryKey: ['followingCount', userId], // Array for the query key
    queryFn: async () => {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.followersCollectionId,
        [Query.equal('followerId', userId)] // Assuming "followerId" stores the user that is following others
      );
      return result.documents.length; // Return the count of followings
    },
    enabled: Boolean(userId), // Only run query if userId is available
  });
};
