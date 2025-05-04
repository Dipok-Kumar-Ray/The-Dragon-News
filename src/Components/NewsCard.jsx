import { FaStar, FaEye, FaRegBookmark, FaCreativeCommonsShare } from 'react-icons/fa';
import { CiShare2 } from "react-icons/ci";
import { Link } from 'react-router';


const NewsCard = ({ news }) => {
  const {
    id,
    title,
    rating,
    total_view,
    author,
    thumbnail_url,
    details,
  } = news;

  return (
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          <img src={author?.img} alt={author?.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold">{author?.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(author?.published_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div >
        <button className='flex items-center gap-2'>
            <FaRegBookmark/>
            <CiShare2 />
        </button>
        </div>
      
      </div>

      <div className="card-body">
        <h2 className="card-title text-lg">{title}</h2>
        <figure className="my-3">
          <img src={thumbnail_url} alt="News" className="rounded-lg w-full max-h-60 object-cover" />
        </figure>
        <p>
          {details.length > 200 ? details.slice(0, 200) + '...' : details}
        </p>
        <Link to={`/news-details/${id}`} className="text-blue-600 font-medium cursor-pointer">Read More</Link>

        <div className="card-actions mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-orange-500">
            <FaStar />
            <span className="text-black font-semibold">{rating?.number}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FaEye />
            <span>{total_view}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;

