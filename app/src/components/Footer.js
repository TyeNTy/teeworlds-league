import React from "react";

const Footer = () => {
  return (
    <footer className="flex w-full flex-col justify-center border-t border-gray-300 bg-gray-800">
      <div className="flex w-full items-center justify-center divide-x divide-gray-300 px-20 py-4 text-sm text-white">
        Join our discord here :{" "}
        <a href="https://pic.zcat.ch/" className="ml-2 text-blue-400">
          https://pic.zcat.ch/
        </a>
      </div>
    </footer>
  );
};

export default Footer;
