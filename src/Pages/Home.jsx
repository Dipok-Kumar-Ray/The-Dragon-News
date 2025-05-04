import React from 'react';
import { Navigate } from 'react-router';

const Home = () => {
    return <Navigate to="/category/0"  replace={true} />;
};

export default Home;