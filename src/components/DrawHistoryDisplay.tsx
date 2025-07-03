import React from 'react';
import React, { useState } from 'react';
import type { Draw } from '../types';
import { TrophyIcon, PencilIcon, CheckIcon, XMarkIcon } from './icons'; // Added icons

interface DrawHistoryDisplayProps {
  drawHistory: Draw[];
  onEditDraw: (drawId: string, updatedWinners: string[]) => void;
}

const DrawHistoryDisplay: React.FC<DrawHistoryDisplayProps> = ({ drawHistory, onEditDraw }) => {
  const [editingDrawId, setEditingDrawId] = useState<string | null>(null);
  const [editedWinnersText, setEditedWinnersText] = useState<string>('');

  if (drawHistory.length === 0) {
    return <p className="text-gray-400 text-center py-4">还没有抽奖记录。</p>;
  }

  const handleEditClick = (draw: Draw) => {
    setEditingDrawId(draw.id);
    setEditedWinnersText(draw.winners.join('\n'));
  };

  const handleSaveEdit = (drawId: string) => {
    const updatedWinners = editedWinnersText.split('\n').map(w => w.trim()).filter(w => w);
    onEditDraw(drawId, updatedWinners);
    setEditingDrawId(null);
    setEditedWinnersText('');
  };

  const handleCancelEdit = () => {
    setEditingDrawId(null);
    setEditedWinnersText('');
  };

  return (
    <div className="space-y-6">
      {drawHistory.slice().reverse().map((draw) => (
        <div key={draw.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
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
            </div>
            {draw.editable && editingDrawId !== draw.id && (
              <button
                onClick={() => handleEditClick(draw)}
                className="text-sky-400 hover:text-sky-300 p-1 rounded hover:bg-gray-600 transition-colors"
                aria-label="修改中奖名单"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mt-2">
            <h4 className="text-sm font-medium text-gray-300 mb-1">中奖名单:</h4>
            {editingDrawId === draw.id ? (
              <div className="space-y-2">
                <textarea
                  value={editedWinnersText}
                  onChange={(e) => setEditedWinnersText(e.target.value)}
                  rows={Math.max(3, draw.winners.length)}
                  className="w-full bg-gray-600 border border-gray-500 text-gray-200 rounded-md p-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  placeholder="每行输入一个中奖者"
                />
                <div className="flex space-x-2 justify-end">
                  <button
                    onClick={() => handleSaveEdit(draw.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-md text-sm flex items-center"
                  >
                    <CheckIcon className="w-4 h-4 mr-1" /> 保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-400 text-white font-semibold py-1 px-3 rounded-md text-sm flex items-center"
                  >
                    <XMarkIcon className="w-4 h-4 mr-1" /> 取消
                  </button>
                </div>
              </div>
            ) : (
              draw.winners.length > 0 ? (
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
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrawHistoryDisplay;
