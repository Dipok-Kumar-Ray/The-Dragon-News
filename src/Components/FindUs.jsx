import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const FindUs = () => {
  return (
    <div>
      <h2 className="font-bold mb-5"> find us on</h2>
      <div>
        <div className="join join-vertical w-full">
          <button className="btn join-item bg-base-100 justify-start"> <FaFacebook/> Facebook</button>
          <button className="btn join-item bg-base-100 justify-start"> <FaInstagram/> Instagram</button>
          <button className="btn join-item bg-base-100 justify-start"> <FaTwitter/> Twitter</button>
        </div>
      </div>
    </div>
  ); 
};

export default FindUs;
