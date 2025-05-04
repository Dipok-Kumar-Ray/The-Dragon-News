import React, { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import { Navigate } from 'react-router';
import Loading from '../Pages/Loading';

const PrivateRoute = ({children}) => {
    const {user, loading} = useContext(AuthContext);
    console.log(user);

    if(loading){
        return Loading;
    }

    if(user && user?.email){

        return children;
    }
    //if-> user thakle return children, nahole navigate to login page
    return <Navigate to='/auth/login'></Navigate>
};

export default PrivateRoute;