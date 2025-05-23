import { Link, NavLink } from 'react-router';
import userIcon from '../assets/user.png'
import {useContext } from 'react';
import { AuthContext } from '../provider/AuthProvider';


const Navbar = () => {

    const {user, logOUt} = useContext(AuthContext);

    const handleLogOut = () => {
        console.log('logout clicked');
        logOUt()
        .then(() => {
            console.log('logout successful');
            alert('Your Logout is successfully')
        })
        .catch(error => {
            console.log('logout error', error.message);
        })
    }
    return (
        <div className='flex justify-between items-center'>
            <div className=''>{user && user.email}</div>
            <div className='nav flex gap-5 text-accent '> 
                <NavLink to='/home'>Home</NavLink>
                <NavLink to='/about'>About</NavLink>
                <NavLink to='/career'>Career</NavLink>
            </div>
            <div className='login-btn flex gap-5 '>
                <img src={userIcon} alt="" />

                {
                    user ? (<button onClick={handleLogOut} className="btn btn-primary px-10">LogOut</button>) :
                     (<Link to='/auth/login'  className='btn btn-primary px-3'> Login</Link>)
                }
                
            </div>
        </div>
    );
};

export default Navbar;