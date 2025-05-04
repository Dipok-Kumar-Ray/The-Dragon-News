import Header from './Header';
import RightAside from '../homeLayout/RightAside';
import NewsDetailsCard from './NewsDetailsCard';
import { useLoaderData, useParams } from 'react-router';
import { useEffect, useState } from 'react';

const NewsDetails = () => {
    const [news, setNews] = useState({})

    const data = useLoaderData();
    const { id } = useParams();
    console.log(data, id, news);

    useEffect(() =>{
        const newsDetails = data.find((singleNews) => singleNews.id === id);
        setNews(newsDetails);
        console.log(newsDetails);
    },[data, id])
    return (
        <div>
           <header className='py-3'>
           <Header></Header>
           </header>
           <main className='w-11/12 mx-auto grid grid-cols-12'>
            <section className='col-span-9'>
                <h2 className='font-bold mb-5'>News Details</h2>
                <NewsDetailsCard news={news}></NewsDetailsCard>
            </section>
            <aside className='col-span-3'>
                <RightAside></RightAside>
            </aside>
           </main>
        </div>
    );
};

export default NewsDetails;