import React from 'react';
import { Outlet } from 'react-router';
import Header from '../Components/Header';
import LatestNews from '../Components/LatestNews';
import Navbar from '../Components/Navbar';
import LeftAside from '../homeLayout/LeftAside';
import RightAside from '../homeLayout/RightAside';

const HomeLayout = () => {
    return (
        <div>
            <header>
                <Header/>
            <section className='w-11/12 mx-auto'>
                <LatestNews >
              
                </LatestNews>
            </section>
            <nav className='w-11/12 mx-auto'>
                <Navbar  />
            </nav>
            </header>
            <main className='grid grid-cols-12 w-11/12 mx-auto mt-5'>
                <aside className='col-span-3'>
                    <LeftAside></LeftAside>
                </aside>
                <section className="main col-span-6">
                    <Outlet/>
                </section>
              <aside className='col-span-3'>
              <RightAside></RightAside>
              </aside>
            </main>
        </div>
    );
};

export default HomeLayout;