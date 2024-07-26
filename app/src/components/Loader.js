import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="border-2 border-l-gray-700 animate-spin text-gray-700 inline-block h-16 w-16 rounded-full"
        role="status"
      >
        <span className="hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
