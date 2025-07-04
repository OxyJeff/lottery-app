
import React, { useEffect, useRef, useState } from 'react';
import type { RollingSpeed } from '../App';
import type { Prize } from '../types';
import { SparklesIcon } from './icons';

interface LotteryPageProps {
  participants: string[];
  numberOfWinnersToSelect: number;
  rollingSpeed: RollingSpeed;
  backgroundImageUrl: string | null;
  navigateToSettings: () => void;
  onWinnersDrawn: (winners: string[], selectedPrize: Prize | null) => void;
  setErrorApp: (error: string | null) => void;
  prizes: Prize[];
  selectedPrizeId: string | null;
}

const StopIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);

const getRollingInterval = (speed: RollingSpeed): number => {
  switch (speed) {
    case 'slow':
      return 150;
    case 'medium':
      return 70;
    case 'fast':
      return 30;
    default:
      return 70;
  }
};

const LotteryPage: React.FC<LotteryPageProps> = ({
  participants,
  numberOfWinnersToSelect,
  rollingSpeed,
  backgroundImageUrl,
  navigateToSettings,
  onWinnersDrawn,
  setErrorApp,
  prizes,
  selectedPrizeId
}) => {
  const [currentRollingName, setCurrentRollingName] = useState<string[]>([]);
  const [displayedNameForStop, setDisplayedNameForStop] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);
  const isRollingRef = useRef<boolean>(false);
  const participantCount = participants.length;

  useEffect(() => {
    if (isRollingRef.current) return; 

    let initialNames: string[];
    if (participantCount === 0) {
      initialNames = Array(Math.max(1, numberOfWinnersToSelect)).fill("请先设置参与者");
    } else if (participantCount > 0 && numberOfWinnersToSelect > 0) {
      // Shuffle participants to ensure different initial names if multiple winners
      const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
      initialNames = Array(numberOfWinnersToSelect).fill('').map((_, i) =>
        shuffledParticipants[i % participantCount] // Use modulo to avoid out-of-bounds if not enough unique participants
      );
    } else {
      initialNames = ["等待配置"];
    }
    setCurrentRollingName(initialNames);
    // setDisplayedNameForStop([]); 
  }, [participants, participantCount, numberOfWinnersToSelect]);


  const startRolling = () => {
    if (participantCount === 0) {
      setErrorApp("没有参与者无法开始抽奖。");
      return;
    }
    if (numberOfWinnersToSelect <= 0) {
      setErrorApp("中奖人数必须至少为1。");
      return;
    }
    if (numberOfWinnersToSelect > participantCount) {
      setErrorApp(`中奖人数 (${numberOfWinnersToSelect}) 不能超过参与者总数 (${participantCount})。`);
      return;
    }

    setErrorApp(null);
    isRollingRef.current = true;
    setDisplayedNameForStop([]); 

    // Initial display for rolling start
    const initialRollingNames = Array(numberOfWinnersToSelect).fill('').map(() => {
        const shuffled = [...participants].sort(() => 0.5 - Math.random());
        return shuffled[0];
    });
    setCurrentRollingName(initialRollingNames);
    
    const rollingIntervalMs = getRollingInterval(rollingSpeed);

    intervalRef.current = window.setInterval(() => {
      setCurrentRollingName(prevNames => {
        if (participantCount === 0) return prevNames; // Should not happen due to checks, but safeguard
        if (isRollingRef.current === false) return prevNames; // Stop if rolling is set to false
        // Ensure unique names are picked for rolling display if multiple winners
        const availableParticipants = [...participants];
        const newRollingNames: string[] = [];
        
        for (let i = 0; i < numberOfWinnersToSelect; i++) {
            if (availableParticipants.length === 0) { // If not enough unique participants, reuse
                newRollingNames.push(participants[Math.floor(Math.random() * participantCount)]);
                continue;
            }
            const randomIndex = Math.floor(Math.random() * availableParticipants.length);
            newRollingNames.push(availableParticipants.splice(randomIndex, 1)[0]);
        }
        return newRollingNames;
      });
    }, rollingIntervalMs);
  };

  const stopRollingAndDrawWinners = () => {
    isRollingRef.current = false;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // The names currently on screen when stop is pressed are the winners
    const finalDrawnWinners = [...currentRollingName]; 
    
    setDisplayedNameForStop(finalDrawnWinners); // Keep displaying these names

    setTimeout(() => {
      onWinnersDrawn(finalDrawnWinners, selectedPrize || null);
    }, 500); 
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const canStartLottery = participantCount > 0 && numberOfWinnersToSelect > 0 && numberOfWinnersToSelect <= participantCount;

  const namesToDisplay = isRollingRef.current 
    ? currentRollingName 
    : (displayedNameForStop.length > 0 ? displayedNameForStop : currentRollingName);

  // Get current selected prize
  const selectedPrize = prizes.find(prize => prize.id === selectedPrizeId);

  return (
    <div
      className="w-full flex-grow flex flex-col items-center justify-center p-4 text-white relative overflow-hidden"
      style={{
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'linear-gradient(to br, #1f2937, #3730a3, #1f2937)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-live="polite"
    >
      <button
        onClick={navigateToSettings}
        className="absolute top-4 left-4 bg-gray-700 bg-opacity-70 hover:bg-opacity-100 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors z-10"
        aria-label="返回设置页面"
      >
        返回设置
      </button>

      <div className="text-center z-0">
        {/* Prize Display Section */}
        {selectedPrize && (
          <div className="mb-8 p-6 bg-gradient-to-br from-yellow-400/20 via-amber-500/20 to-orange-500/20 rounded-2xl shadow-2xl border-4 animate-gradient-border animate-prize-glow">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-70 animate-pulse"></div>
                <div className="relative">
                  {selectedPrize.imageUrl ? (
                    <img
                      src={selectedPrize.imageUrl}
                      alt={selectedPrize.name}
                      className="w-56 h-56 object-cover rounded-full shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-transform duration-300"
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                      }}
                    />
                  ) : (
                    <div className="w-56 h-56 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-400">
                      <span className="text-8xl animate-pulse">🎁</span>
                    </div>
                  )}
                </div>
                {/* Floating sparkles */}
                <div className="absolute -top-2 -right-2 text-yellow-300 animate-sparkle">
                  <span className="text-2xl">✨</span>
                </div>
                <div className="absolute -bottom-2 -left-2 text-yellow-300 animate-sparkle" style={{animationDelay: '0.5s'}}>
                  <span className="text-2xl">✨</span>
                </div>
                <div className="absolute -top-2 -left-2 text-yellow-300 animate-sparkle" style={{animationDelay: '1s'}}>
                  <span className="text-xl">⭐</span>
                </div>
                <div className="absolute -bottom-2 -right-2 text-yellow-300 animate-sparkle" style={{animationDelay: '1.5s'}}>
                  <span className="text-xl">⭐</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl animate-bounce">🎉</span>
                  <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 drop-shadow-lg">
                    {selectedPrize.name}
                  </h3>
                  <span className="text-2xl animate-bounce" style={{animationDelay: '0.3s'}}>🎉</span>
                </div>
                <p className="text-lg text-yellow-200 font-semibold opacity-90 animate-pulse">
                  🏆 本次抽奖奖品 🏆
                </p>
              </div>
            </div>
          </div>
        )}

        <div 
          className="my-8 md:my-12 p-6 bg-black bg-opacity-40 rounded-xl shadow-2xl flex flex-col items-center justify-center"
          style={{minWidth: '300px', width: 'auto', maxWidth: '90vw', minHeight: `${numberOfWinnersToSelect * (numberOfWinnersToSelect === 1 ? 80 : 50) + 40}px`}} // Adjust minHeight based on number of winners
        >
          {namesToDisplay.length > 0 ? (
            namesToDisplay.map((name, index) => (
              <p 
                key={index} 
                className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-red-400 break-all text-center ${
                  numberOfWinnersToSelect === 1 ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl' : 'text-3xl sm:text-4xl md:text-5xl my-1 md:my-2'
                }`}
                style={{ 
                    lineHeight: '1.2',
                    textShadow: '0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,105,180,0.3)',
                    padding: '0 10px', // Add some padding for very long names
                }} 
              >
                {name}
              </p>
            ))
          ) : (
             <p className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500 ${numberOfWinnersToSelect === 1 ? 'text-5xl' : 'text-3xl'}`}>
                {participantCount > 0 ? "准备就绪" : "请先设置参与者"}
             </p>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-4 opacity-75">
          总参与人数: {participantCount}名 | 抽取人数: {numberOfWinnersToSelect}名
        </p>

        <div>
          {isRollingRef.current && (
            <span className="animate-pulse-slow block text-sm text-gray-300 mt-2">正在飞速抽取...</span>
          )}
          {!isRollingRef.current && displayedNameForStop.length === 0 && (
            canStartLottery ? (
              <span className="block text-sm text-gray-300 mt-2">点击“开始抽奖”</span>
            ) : (
              <span className="block text-sm text-red-400 mt-2">请检查参与者或中奖人数设置</span>
            )
          )}
        </div>


        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
          {!isRollingRef.current ? (
            <button
              onClick={startRolling}
              disabled={!canStartLottery}
              className={`w-full sm:w-auto text-lg font-semibold py-4 px-10 rounded-lg shadow-xl transition-all duration-150 ease-in-out text-white flex items-center justify-center
                ${!canStartLottery
                  ? 'bg-gray-600 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 transform hover:scale-105'}`}
              aria-label="开始抽奖"
            >
              <SparklesIcon className="w-7 h-7 mr-3" />
              开始抽奖
            </button>
          ) : (
            <button
              onClick={stopRollingAndDrawWinners}
              className="w-full sm:w-auto text-lg font-semibold py-4 px-10 rounded-lg shadow-xl transition-all duration-150 ease-in-out text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 transform hover:scale-105 flex items-center justify-center"
              aria-label="停止抽奖并公布结果"
            >
              <StopIcon className="w-7 h-7 mr-3" />
              停止抽奖
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotteryPage;
