import React from 'react';
import { useParams } from 'react-router';

const CategoryNews = () => {
    const {id} = useParams();
    console.log(id);
    return (
        <div>
            <h2>Category News{id}</h2>
        </div>
    );
};

export default CategoryNews;<h2>Category News...</h2>