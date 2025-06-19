
import React from 'react';
import { TrophyIcon } from './icons';

interface WinnerDisplayProps {
  winners: string[];
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winners }) => {
  if (winners.length === 0) {
    return <p className="text-gray-400 text-center py-4">暂无中奖者信息。</p>;
  }

  return (
    <div className="max-h-80 overflow-y-auto pr-2">
      <ul className="space-y-3">
        {winners.map((winner, index) => (
          <li 
            key={index} 
            className="bg-gray-700 p-4 rounded-lg shadow-md flex items-center text-lg transition-all duration-300 ease-in-out hover:bg-gray-600"
            style={{ animation: `fadeInUp 0.5s ${index * 0.1}s ease-out forwards`, opacity: 0 }}
          >
            <TrophyIcon className="w-6 h-6 mr-3 text-yellow-400 flex-shrink-0" />
            <span className="font-medium text-gray-100">{winner}</span>
          </li>
        ))}
      </ul>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default WinnerDisplay;