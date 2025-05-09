import React, { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import { Navigate, useLocation } from 'react-router';
import Loading from '../Pages/Loading';

const PrivateRoute = ({children}) => {
    const {user, loading} = useContext(AuthContext);
    // console.log(user);

    const location = useLocation();
    console.log(location);

    if(loading){
        return Loading;
    }

    if(user && user?.email){

        return children;
    }
    //if-> user thakle return children, nahole navigate to login page
    return <Navigate state={location.pathname} to='/auth/login'></Navigate>
};

export default PrivateRoute;