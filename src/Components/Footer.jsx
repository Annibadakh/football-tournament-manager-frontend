import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white text-center py-4 mt-10">
      <p className="text-sm">
        © Football Tournament Manager | All rights reserved by{' '}
        <a
          href="https://annibadakh.github.io/my-portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline hover:text-red-400"
        >
          Aniket Badakh
        </a>
      </p>
    </footer>
  );
};

export default Footer;
