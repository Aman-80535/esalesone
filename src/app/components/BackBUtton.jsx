import React from 'react';
import { FaArrowLeft } from 'react-icons/fa'; // Import the desired icon

const BackButton = ({ onClick }) => {
  return (
    <>
      <button onClick={onClick} className=" flex items-center justify-center p-2 -300 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none  transition-colors duration-200">
        <FaArrowLeft className="h-5 w-5" />
      </button>
    </>
  );
};

export default BackButton;