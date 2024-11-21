import {ID, Query} from 'appwrite';
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "../../types";
import { account, appwriteConfig, avatars, databases, storage } from './config';


// ============================== creating a new user
export async function createUserAccount(user: INewUser){
    try{
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,
        );

        if(!newAccount) throw Error("Problem creating account");
        
        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        });



        return newUser;
    }
    catch(error){
        console.log(error);
        return error;
    }
}


// ============================== saving user to databse
export async function saveUserToDB(user:{
    accountId: string;
    email:string;
    name:string;
    imageUrl:URL;
    username?:string;
}){
    try{
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )

        return newUser;
    }
    catch(error){
        console.log(error)
    }
}


// ============================== sign in account
export async function signInAccount(user:{ email:string; password:string;}) {
    try{
        const session = await account.createEmailPasswordSession(user.email,user.password);
        return session;
    }
    catch(error){
        console.log(error, "Idhar vandha hai bhai");
    }
    
}


// ============================== getting current user
export async function getCurrentUser(){
    try{
        const currentAccount = await account.get();
        if(!currentAccount) throw Error("error in get current user");

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )
        if(!currentUser) throw Error;
        return currentUser.documents[0];
    }
    catch(error){
        console.log(error);
    }
}

// ============================== signout
export async function signOutAccount(){
    try{
        const session = await account.deleteSession("current");
        return session;
    }
    catch(error){
        console.log(error);
    }
}

// ============================== Create Post
export async function createPost(post: INewPost) {
    try {
      // Upload file to Appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw new Error('File upload failed');
  
      // Get file preview URL
      const fileUrl = await getFilePreview(uploadedFile.$id); // Ensure to await the promise
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error('Failed to get file preview');
      }
  
      // Convert tags into an array (if any)
      const tags = post.tags?.replace(/ /g, "").split(",") || [];
  
      // Create post document
      const newPost = await createPostDocument({
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags,
      });
  
      if (!newPost) {
        await deleteFile(uploadedFile.$id);
        throw new Error('Post creation failed');
      }
  
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error; // Propagate the error if needed
    }
}
  
// ============================== Create Post Document
export async function createPostDocument(postData: {
    creator: string;
    caption: string;
    imageUrl: string;
    imageId: string;
    location: string;
    tags: string[];
  }) {
    try {
      const newPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        ID.unique(),
        postData
      );
      return newPost;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error; // Handle the error and propagate
    }
}
  
// ============================== Delete File
export async function deleteFile(fileId: string) {
    try {
      await storage.deleteFile(appwriteConfig.storageId, fileId);
      return { status: "ok" };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error; // Handle and propagate error
    }
}
  
// ============================== Upload File
export async function uploadFile(file: File) {
    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
      );
      return uploadedFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Propagate error
    }
}
  
// ============================== Get File Preview URL
export async function getFilePreview(fileId: string) {
    try {
      const fileUrl = await storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000, 2000, "top", 100
      );
      if (!fileUrl) throw new Error('Failed to get file preview URL');
      return fileUrl;
    } catch (error) { 
      console.error('Error getting file preview:', error);
      throw error; // Propagate error
    }
}

  // ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export function getRecentPosts() {
  try {
    const posts = databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

//============================== INFINITE POSTS
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(10)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}


// ============================== SEARCH POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}


// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to Appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) {
        console.error("File upload failed.");
        throw new Error("File upload failed.");
      }

      // Get new file URL
      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        console.error("Failed to get file URL.");
        throw new Error("Failed to get file URL.");
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Update user document
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // If update fails, delete the new file and throw error
    if (!updatedUser) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      console.error("User update failed.");
      throw new Error("User update failed.");
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.error("An error occurred during the update process:", error);
    return null; // Indicating failure to the caller
  }
}



// Function to follow a user
export const followUser = async (followerId: string, followingId: string) => {
  try {
    // Prevent following yourself
    if (followerId === followingId) {
      return { success: false, message: "You can't follow yourself" };
    }

    // Check if the user is already following
    const existingFollow = await databases.listDocuments(
      appwriteConfig.databaseId, 
      appwriteConfig.followersCollectionId,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
      ]
    );

    // If the follow relationship already exists, prevent creating a duplicate
    if (existingFollow.documents.length > 0) {
      return { success: false, message: 'Already following' };
    }

    // Create the follow relationship
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      ID.unique(),
      { followerId, followingId }
    );

    return { success: true, message: 'Followed successfully', response };
  } catch (error) {
    console.log('Error following user:', error);
    return { success: false, message: 'Something went wrong', };
  }
};

// Function to unfollow a user
export const unfollowUser = async (followerId: string, followingId: string) => {
  try {
    // Prevent unfollowing yourself
    if (followerId === followingId) {
      return { success: false, message: "You can't unfollow yourself" };
    }

    // Check if the follow relationship exists
    const existingFollow = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
      ]
    );

    // If the follow relationship doesn't exist, return an error
    if (existingFollow.documents.length === 0) {
      return { success: false, message: 'Not following' };
    }

    // Get the document ID of the follow relationship
    const followDocId = existingFollow.documents[0].$id;

    // Delete the follow relationship
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      followDocId
    );

    return { success: true, message: 'Unfollowed successfully' };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, message: 'Error unfollowing user'};
  }
};
