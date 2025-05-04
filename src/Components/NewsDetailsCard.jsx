import React from 'react';
import { Link } from 'react-router';

const NewsDetailsCard = ({news}) => {
    return (
        <div className='space-y-5 px-4'>
            <img className='w-full h-[350px] object-cover' src={news.image_url} alt="" />
            <h2 className='text-max-2xl'>{news.title}</h2>
            <p>{news.details}</p>
            <Link className='btn btn-secondary' to={`/category/${news.category_id}`}>Back to Category</Link>
        </div>
    );
};

export default NewsDetailsCard;