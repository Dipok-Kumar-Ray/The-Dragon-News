import React from 'react';
import { Outlet } from 'react-router';
import Header from '../Components/Header';
import LatestNews from '../Components/LatestNews';
import Navbar from '../Components/Navbar';

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
            <main>
                <section className="left_nav"></section>
                <section className="main">
                    <Outlet/>
                </section>
                <section className="right_nav"></section>
            </main>
        </div>
    );
};

export default HomeLayout;