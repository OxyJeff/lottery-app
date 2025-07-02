import React from 'react';
import type { Draw } from '../types';
import { TrophyIcon } from './icons';

interface DrawHistoryDisplayProps {
  drawHistory: Draw[];
}

const DrawHistoryDisplay: React.FC<DrawHistoryDisplayProps> = ({ drawHistory }) => {
  if (drawHistory.length === 0) {
    return <p className="text-gray-400 text-center py-4">还没有抽奖记录。</p>;
  }

  return (
    <div className="space-y-6">
      {drawHistory.slice().reverse().map((draw) => ( // Show newest first
        <div key={draw.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-sky-300 mb-2">{draw.prizeName}</h3>
          {draw.prizeImageUrl && (
            <img
              src={draw.prizeImageUrl}
              alt={`Image for ${draw.prizeName}`}
              className="max-w-xs max-h-24 object-contain rounded mt-1 mb-2"
            />
          )}
          <p className="text-xs text-gray-400 mb-1">
            抽奖时间: {new Date(draw.timestamp).toLocaleString()}
          </p>
          <div className="mt-2">
            <h4 className="text-sm font-medium text-gray-300 mb-1">中奖名单:</h4>
            {draw.winners.length > 0 ? (
              <ul className="list-disc list-inside pl-1 space-y-1">
                {draw.winners.map((winner, index) => (
                  <li key={index} className="text-gray-200 flex items-center">
                    <TrophyIcon className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0" />
                    {winner}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">本次抽奖无中奖者。</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrawHistoryDisplay;
