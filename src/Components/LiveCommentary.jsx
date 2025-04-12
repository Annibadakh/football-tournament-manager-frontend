import { useEffect, useState } from 'react';
import api from '../Api';
import axios from 'axios';

const operationMap = {
  '01': 'made a Faul',
  '02': 'got a Penalty',
  '03': 'scored a Goal',
  '04': 'made a Pass',
  '05': 'took a Shot',
  '06': 'took a Freekick',
  '07': 'got an Away',
  '08': 'did a Throw',
  '09': 'started the game',
};

const LiveCommentary = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/operations/get`);
      setEvents(response.data); // reverse to show latest first
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => {
        fetchEvents(); // fetch every 10 seconds
      }, 5000);
  
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded shadow-md max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📢 Live Commentary</h2>
      <span className="font-bold text-blue-600">{events.teamName}</span> {operationMap[events.operationId] || 'did something'}.
      
    </div>
  );
};

export default LiveCommentary;
