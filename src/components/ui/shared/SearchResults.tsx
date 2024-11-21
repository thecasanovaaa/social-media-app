import { Models } from 'appwrite'
import React from 'react'
import Loader from './Loader';
import GridPostList from './GridPostList';
type Searchresultprops ={
  IsSearchFetching:boolean;
  searchedPosts:Models.Document[];
}
const SearchResults = ({IsSearchFetching,searchedPosts}:Searchresultprops) => {
  if(IsSearchFetching) return <Loader/>
  if(searchedPosts && searchedPosts.documents.length > 0){
    return(
      <GridPostList posts={searchedPosts.documents}/>
    )
  }
  return (
    <p className='text-light-4 mt-10 text-center w-full'>
      No results found
    </p>
  )
}

export default SearchResults
