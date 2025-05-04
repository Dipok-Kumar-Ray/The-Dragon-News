import React from "react";
import swimmingImage from '../assets/swimming.png'
import classImage from '../assets/class.png'
import playImage from '../assets/playground.png'

const QZone = () => {
  return (
    <div className="bg-base-100 shadow-xl p-5 mb-5">
      <h2 className="font-bold mb-5">Q-Zone</h2>
      <div className="space-y-5">
        <img src={swimmingImage} alt="" />
        <img src={classImage} alt="" />
        <img src={playImage} alt="" />
      </div>
    </div>
  );
};

export default QZone;
