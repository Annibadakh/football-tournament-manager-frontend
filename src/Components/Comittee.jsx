import React from 'react';
import amitdada from "./Images/amitdada.jpg"
import director from "./Images/director.jpg";
import demo from "./Images/dummy.jpg";
import pankaj from "./Images/pankaj.jpg";
import aniket from "./Images/image.jpg";
import kunal from "./Images/kunal.jpg";

const committeeMembers = [
  {
    name: 'Hon’ble Shri Amit Nitinrao Kolhe',
    post: 'Managing Trustee',
    image: `${amitdada}`,
  },
  {
    name: 'Dr. Madhva Nagarhalli',
    post: 'Director',
    image: `${director}`,
  },
  {
    name: 'Dr. Makrand Kulkarni',
    post: 'Dean SAC',
    image: `${demo}`,
  },
  {
    name: 'Dr. Ganesh Narode',
    post: 'Pyhsical Director',
    image: `${demo}`,
  },
  {
    name: 'Dr. Virupaksh Reddy',
    post: 'Pyhsical Director',
    image: `${demo}`,
  },
  {
    name: 'Prof. Pankaj Patil',
    post: 'In-charge',
    image: `${pankaj}`,
  },
  {
    name: 'Moti Kumar Sir',
    post: 'Coach',
    image: `${demo}`,
  },
  {
    name: 'Atharva Bhadane',
    post: 'Sports Secretary',
    image: `${demo}`,
  },{
    name: 'Rushikesh Gadhave',
    post: 'President',
    image: `${demo}`,
  },{
    name: 'Aniket Badakh',
    post: 'Vice-President',
    image: `${aniket}`,
  },{
    name: 'Kunal Sonawale',
    post: 'Chairperson',
    image: `${kunal}`,
  },{
    name: 'Om Gokhale',
    post: 'Treasurer',
    image: `${demo}`,
  },
  {
    name: 'Yash',
    post: 'Social Media Handler',
    image: `${demo}`,
  },
  {
    name: 'Aaryan Reddy',
    post: 'Event Coordinator',
    image: `${demo}`,
  },
  {
    name: 'Shubham Kadam',
    post: 'Event Coordinator',
    image: `${demo}`,
  },
];

const Comittee = () => {
  return (
    <div className="py-10 px-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-blue-800">
        Sanjivani Football Club
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {committeeMembers.map((member, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center text-center"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4"
            />
            <h3 className="text-xl font-semibold">{member.name}</h3>
            <p className="text-gray-600">{member.post}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comittee;
