import React, { createContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from '../firebase/firebase.config';


export const AuthContext = createContext();

const auth = getAuth(app);
const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    console.log(user, loading);


    const createUser = (email, password) => {
        setLoading(true); 
        return createUserWithEmailAndPassword(auth, email, password)        
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password)
    }


    const logOUt =() => {
        return signOut(auth)
    };


    useEffect(() => { 
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false); 
        });
      
        return () => {
          unsubscribe(); 
        };
      }, []);


    const  authData = {
        user,
        setUser,
        createUser,
        logOUt,
        signIn,
        loading,
        setLoading
    }
    // return <AuthContext value={authData}>
    //     {children}
    // </AuthContext>

return <AuthContext.Provider value={authData}>
{children}
</AuthContext.Provider>

};

export default AuthProvider;