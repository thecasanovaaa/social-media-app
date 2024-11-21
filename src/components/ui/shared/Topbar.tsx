import { useEffect } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import logo from "../../../../public/assets/images/logo.svg";
import logoutt from "../../../../public/assets/icons/logout.svg";
import { Button } from '../button'
import { useSignOutAccount } from '../../../lib/react-query/queriesAndMutations';
import { useUserContext } from '../../../context/AuthContext';
import defaultprofile from '../../../../public/assets/images/profile.png';



const Topbar = () => {
    const {mutate:signOut, isSuccess } = useSignOutAccount();
    const navigate = useNavigate();
    const {user} = useUserContext();
    useEffect(()=>{
        if(isSuccess) navigate(0);

    },[isSuccess])
  return (
    <section className='topbar'>
        <div className="flex-between py-4 px-5">
            <Link to="/" className='flex gap-3 items-center'>
                <img src={logo}
                alt='logo'
                width={130}
                height={325}/>
            </Link>
            <div className="flex gap-4">
                <Button variant="ghost" className='shad-button_ghost' onClick={()=>signOut()}>
                    <img src={logoutt} alt="logout" />
                </Button>
                <Link to={`/profile/${user.id}`} className='flex-center gap-3'>
                <img src={user.imageUrl || defaultprofile}  alt='profile'
                 className='h-8 w-8 rounded-full'/></Link>
            </div>
        </div>
    </section>
  )
}

export default Topbar
