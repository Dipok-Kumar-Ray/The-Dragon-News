import React from 'react';
import SocialLogin from './SocialLogin';
import FindUs from '../Components/FindUs';
import QZone from '../Components/QZone';

const RightAside = () => {
    return (
        <div className='space-y-8'>
            <SocialLogin></SocialLogin>  
            <FindUs></FindUs>  
            <QZone></QZone>      
        </div>
    );
};
           
export default RightAside;