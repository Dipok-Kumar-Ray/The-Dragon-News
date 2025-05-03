import React, { Suspense } from 'react';
import Categories from '../Components/Categories';

const LeftAside = () => {
    return (
        <div>
          <Suspense fallback={<span className="loading loading-bars loading-md"></span>}>
            <Categories></Categories>
            </Suspense>
        </div>
    );
};

export default LeftAside;<h3>LeftAside section...</h3>