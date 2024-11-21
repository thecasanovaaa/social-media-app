import { useEffect, useState } from 'react'
import { Input } from '../../components/ui/input'
import SearchResults from '../../components/ui/shared/SearchResults';
import GridPostList from '../../components/ui/shared/GridPostList';
import useDebounce from '../../hooks/useDebounce';
import { useGetPosts, useSearchPosts } from '../../lib/react-query/queriesAndMutations';
import Loader from '../../components/ui/shared/Loader';
import { useInView } from 'react-intersection-observer';
const Explore = () => {

  const{ref,inView}= useInView();
  const {data: posts , fetchNextPage,hasNextPage} = useGetPosts()
  const [searchValue, setSearchValue] = useState('');

  const debouncevalue = useDebounce(searchValue,500);
  const {data: searchedPosts, isFetching:IsSearchFetching} = useSearchPosts(debouncevalue)
  useEffect(()=>{
    if(inView && !searchValue ) fetchNextPage();
  },[inView,searchValue])
  if(!posts){
    return(
      <div className="flex-center w-full h-full">
        <Loader/>
      </div>
    )
  }
  console.log(posts)
  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts= !shouldShowSearchResults 
  && posts.pages.every((item)=> item.documents.length === 0)
  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className='h3-bold md:h2-bold w-full'>Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24} height={24}
            alt="search" />

          <Input
            type='text'
            placeholder='Search'
            className='explore-search'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)} />
        </div>
      </div>
      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className='body-bold md:h3-bold'>Popular Today</h3>

        
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults?(
          <SearchResults
          IsSearchFetching={IsSearchFetching}
          searchedPosts={searchedPosts}/>
        ): shouldShowPosts ? ( 
          <p className='text-light-4 mt-10 text-center w-full'>End of Posts</p>
        ): posts.pages.map((item,index) => (
          <GridPostList key={`page-${index}`} posts={item.documents}/>
        ))}
      </div>
      {hasNextPage && !searchValue &&(
        <div ref={ref} className="mt-10">
          <Loader/>
        </div>
      )}
    </div>
  )
}

export default Explore
