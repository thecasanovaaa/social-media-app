import { Models } from "appwrite";
import Loader from "../../components/ui/shared/Loader";
import { useGetRecentPosts } from "../../lib/react-query/queriesAndMutations";
import PostCard from "../../components/ui/shared/PostCard";

const Home = () => {
  const {data : posts, isPending: ispostloading, isError: isErrorPosts}=useGetRecentPosts();
  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">
            Home Feed
          </h2>
          {ispostloading && !posts ?(
            <Loader/>
          ):(
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {posts?.documents.map((post:Models.Document)=>{
                return <PostCard post={post} key={post.$id}/>
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
