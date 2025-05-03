import React from 'react';
import Marquee from 'react-fast-marquee';

const LatestNews = () => {
    return (
        <div className='flex items-center gap-5  bg-base-200 p-3'>
            <h2 className='text-base-100 bg-secondary  px-3 py-2 '>Latest.....</h2>
            <Marquee pauseOnHover={true} speed={50} className='text-accent font-bold flex gap-3' >
            <p className='font-bold '>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
            <p className='font-bold'>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
            <p className='font-bold'>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>

            </Marquee>
            </div>
    );
};

export default LatestNews;      