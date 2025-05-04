import React, { useEffect, useState } from "react";
import { useLoaderData, useParams } from "react-router";
import NewsCard from "../Components/NewsCard";

const CategoryNews = () => {
  const { id } = useParams(); //string value
  const data = useLoaderData();

  const [categoryNews, setCategoryNews] = useState([]);

  // console.log(id, data);

  useEffect(() => {
    if (id == "0") {
      setCategoryNews(data);
      return;
    } else if (id == "1") {
      const filterNews = data.filter(
        (news) => news.others_is_today_pick == true
      );
      setCategoryNews(filterNews);
    } else {
      const filterdNews = data.filter((news) => news.category_id == id);
      setCategoryNews(filterdNews);
    }

    setCategoryNews;
  }, [id, data]);
  return (
    <div>
      <h2 className="font-bold mt-5">
        Total : <span className="text-secondary">{categoryNews.length}</span>{" "}
        News Found
      </h2>
      <div className="grid grid-cols-1  gap-5 mt-5">
        {categoryNews.map((news) => (
          <NewsCard key={news.id} news={news}></NewsCard>
        ))}
      </div>
    </div>
  );
};

export default CategoryNews;
