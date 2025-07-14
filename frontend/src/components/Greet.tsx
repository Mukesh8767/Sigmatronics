import React from 'react';
import { Calendar, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { DateTime } from 'luxon';

interface GreetProps {
  name: string;
}

const Greet: React.FC<GreetProps> = ({ name }) => {
    const date = DateTime.now().setZone('Asia/Kolkata');
  const hour = date.hour;

  let greeting = '';
  let Icon: React.FC<any> = Sun; 

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
    Icon = Sunrise;
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
    Icon = Sun;
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening';
    Icon = Sunset;
  } else {
    greeting = 'Good Night';
    Icon = Moon;
  }

    return (
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center text-gray-900"><Icon className="inline w-6 h-6 mr-1" />{greeting}, {name}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your systems today.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Greet;
