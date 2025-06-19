
import React from 'react';
import { UsersIcon } from './icons';

interface ParticipantInputAreaProps {
  participantsText: string;
  onParticipantsTextChange: (text: string) => void;
}

const ParticipantInputArea: React.FC<ParticipantInputAreaProps> = ({ participantsText, onParticipantsTextChange }) => {
  const participantCount = participantsText.split('\n').filter(name => name.trim() !== '').length;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <label htmlFor="participants" className="flex items-center text-xl font-semibold mb-3 text-sky-400">
        <UsersIcon className="w-6 h-6 mr-2" />
        参与者 ({participantCount}名)
      </label>
      <p className="text-sm text-gray-400 mb-3">
        每行输入一名参与者。如果您上传Excel文件，此列表也会更新。
      </p>
      <textarea
        id="participants"
        rows={10}
        value={participantsText}
        onChange={(e) => onParticipantsTextChange(e.target.value)}
        placeholder="请在此处输入参与者名单，每行一个..."
        className="w-full bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-gray-500 resize-y"
      />
    </div>
  );
};

export default ParticipantInputArea;