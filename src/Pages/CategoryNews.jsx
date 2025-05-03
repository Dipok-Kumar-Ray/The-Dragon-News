import React, { useEffect, useState } from 'react';
import { useLoaderData, useParams } from 'react-router';

const CategoryNews = () => {
    const {id} = useParams();
    const data = useLoaderData();
    
    const [categoryNews, setCategoryNews] = useState([])

    // console.log(id, data);

    useEffect(()=>{
        if(id == '0'){
            setCategoryNews(data);
            return; 
        }
        else if(id == '1'){
            const filterNews = data.filter((news) =>news.others_is_today_pick  == true);
            setCategoryNews(filterNews);
        }
        else{
            const filterdNews =  data.filter((news) =>news.category_id == id);
        console.log(filterdNews);
        }

        setCategoryNews
    }, [data, id])
    return (
        <div>
            <h2>Total : {categoryNews.length} News Found</h2>
        </div>
    );
};

export default CategoryNews;