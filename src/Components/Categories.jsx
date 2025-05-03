import React, { use } from 'react';
import { NavLink } from 'react-router';

const categoriesPromise = fetch('/categories.json')
    .then((res) => res.json())
    
    const Categories = () => {
        const categories = use(categoriesPromise);

    return (
        <div>
            <h2 className='font-bold'>All Categories : {categories.length} </h2>
            <div className='grid grid-cols-1 gap-2 mt-5'>
                {
                    categories.map(category =>(<NavLink to={`/category/${category.id}`} key={category.id} className={'btn bg-base-100 border-0 hover:bg-base-300 font-semibold text-accent'}>{category.name}</NavLink>))
                }
            </div>
        </div>
    );
};

export default Categories;