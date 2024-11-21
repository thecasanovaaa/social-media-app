// import Loader from "../../components/ui/shared/Loader";
// import UserCard from "../../components/ui/shared/UserCard";
// import { useUserContext } from "../../context/AuthContext";
// import { useToast } from "../../hooks/use-toast";
// import { useGetUsers } from "../../lib/react-query/queriesAndMutations";

import Loader from "../../components/ui/shared/Loader";
import UserCard from "../../components/ui/shared/UserCard";
import { useUserContext } from "../../context/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { useGetUsers } from "../../lib/react-query/queriesAndMutations";

// const AllUsers = () => {
//   const { toast } = useToast();
//   const {currentuser} = useUserContext();
//   const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();
//   if (isErrorCreators) {
//     toast({ title: "Something went wrong." });
    
//     return;
//   }

//   return (
//     <div className="common-container">
//       <div className="user-container">
//         <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
//         {isLoading && !creators ? (
//           <Loader />
//         ) : (
//           <ul className="user-grid">
//             {creators?.documents.map((creator) => (
//               <li key={creator?.$id} className="flex-1 min-w-[200px] w-full  ">
//                 <UserCard user={creator} currentUserId={currentuser} />


//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AllUsers;


const AllUsers = () => {
  const { toast } = useToast();
  const { user } = useUserContext();
  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  // Handle error in fetching creators
  if (isErrorCreators) {
    toast({ title: "Something went wrong while fetching users." });
    return null; // You can return a fallback UI here if needed
  }

  // Loader while fetching data
  if (isLoading) {
    return <Loader />;
  }

  // Handle case where no creators are found
  if (!creators?.documents || creators.documents.length === 0) {
    return <div>No users found.</div>; // Display a message if no creators are available
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        <ul className="user-grid">
          {creators.documents.map((creator) => {
            // Check if creator exists and has the necessary data
            if (!creator?.$id) {
              return null; // Skip any invalid or incomplete creator data
            }

            return (
              <li key={creator.$id} className="flex-1 min-w-[200px] w-full">
                {/* Pass creator and currentUserId to the UserCard */}
                <UserCard user={creator} currentUserId={user.id} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AllUsers;
