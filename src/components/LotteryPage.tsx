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
      className="w-full flex-grow flex flex-col items-center justify-center p-2 text-white relative overflow-hidden"
      style={{
        backgroundImage: backgroundImageUrl 
          ? `url(${backgroundImageUrl})` 
          : 'linear-gradient(135deg, #ff4500 0%, #ff6b35 25%, #f7931e 50%, #c77dff 75%, #7209b7 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
      aria-live="polite"
    >
      <div className="absolute top-4 left-4 z-10 group">
        <button
          onClick={navigateToSettings}
          className="bg-gray-700 bg-opacity-0 group-hover:bg-opacity-70 hover:bg-opacity-100 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="返回设置页面"
        >
          返回设置
        </button>
      </div>

      <div className="flex items-center justify-center w-full max-w-4xl mx-auto relative z-0">
        {/* Center Content */}
        <div className="flex-none text-center px-8 max-w-2xl">
          {/* 7th Anniversary Header */}
          <div className="mb-4">
            <div className="mb-3">
              <p className="text-3xl text-white font-semibold drop-shadow-lg">
                7势如虹 未来可7
              </p>
            </div>
            <div className="text-base text-white font-semibold opacity-95">
              🎉 成就客户 · 成就伙伴 · 成就美好世界 🎉
            </div>
          </div>

          {/* Prize Display Section */}
          {selectedPrize && (
            <div className="mb-4 p-4 bg-gradient-to-br from-orange-400/30 via-red-400/20 to-purple-600/30 rounded-2xl shadow-2xl border-4 border-yellow-400 animate-prize-glow backdrop-blur-sm">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-80 animate-pulse"></div>
                  <div className="relative">
                    {selectedPrize.imageUrl ? (
                      <img
                        src={selectedPrize.imageUrl}
                        alt={selectedPrize.name}
                        className="w-32 h-32 object-cover rounded-full shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-transform duration-300"
                        style={{
                          filter: 'drop-shadow(0 0 30px rgba(255, 165, 0, 0.8))',
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-400">
                        <span className="text-5xl animate-pulse">🎁</span>
                      </div>
                    )}
                  </div>
                  {/* Enhanced sparkles with 7th anniversary theme */}
                  <div className="absolute -top-2 -right-2 text-yellow-300 animate-sparkle">
                    <span className="text-xl">🎊</span>
                  </div>
                  <div className="absolute -bottom-2 -left-2 text-orange-300 animate-sparkle" style={{animationDelay: '0.5s'}}>
                    <span className="text-xl">🎉</span>
                  </div>
                  <div className="absolute -top-2 -left-2 text-yellow-300 animate-sparkle" style={{animationDelay: '1s'}}>
                    <span className="text-lg">✨</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 text-red-300 animate-sparkle" style={{animationDelay: '1.5s'}}>
                    <span className="text-lg">🌟</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-xl animate-bounce">🏆</span>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 drop-shadow-lg">
                      {selectedPrize.name}
                    </h3>
                    <span className="text-xl animate-bounce" style={{animationDelay: '0.3s'}}>🏆</span>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-lg p-2 mt-2">
                    <p className="text-base text-white font-bold opacity-95">
                      🎁 七周年庆典奖品 🎁
                    </p>
                    <p className="text-sm text-white font-semibold mt-1">
                      企企七周年 · 感谢有你
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div 
            className="my-4 p-6 bg-gradient-to-br from-black/40 via-purple-900/30 to-black/40 rounded-2xl shadow-2xl backdrop-blur-sm border-2 border-orange-400/50 animate-prize-glow flex flex-col items-center justify-center"
            style={{minWidth: '250px', width: 'auto', maxWidth: '600px', minHeight: `${numberOfWinnersToSelect * (numberOfWinnersToSelect === 1 ? 60 : 40) + 40}px`}}
          >
            {namesToDisplay.length > 0 ? (
              namesToDisplay.map((name, index) => (
                <p 
                  key={index} 
                  className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 break-all text-center ${
                    numberOfWinnersToSelect === 1 ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl' : 'text-xl sm:text-2xl md:text-3xl my-1 md:my-2'
                  }`}
                  style={{ 
                      lineHeight: '1.2',
                      textShadow: '0 0 15px rgba(255,165,0,0.8), 0 0 30px rgba(255,69,0,0.6), 0 0 45px rgba(255,140,0,0.4)',
                      padding: '0 15px',
                  }} 
                >
                  {name}
                </p>
              ))
            ) : (
               <p className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 ${numberOfWinnersToSelect === 1 ? 'text-3xl' : 'text-xl'}`}>
                  {participantCount > 0 ? "🎊 准备抽奖 🎊" : "请先设置参与者"}
               </p>
            )}
          </div>

          <p className="text-sm text-white mb-3 opacity-95 bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
            🎯 总参与人数: {participantCount}名 | 抽取人数: {numberOfWinnersToSelect}名 🎯
          </p>

          <div className="mb-3">
            {isRollingRef.current && (
              <span className="animate-pulse-slow block text-base text-white mt-2 font-semibold">
                ✨ 正在为您抽取幸运儿... ✨
              </span>
            )}
            {!isRollingRef.current && displayedNameForStop.length === 0 && (
              canStartLottery ? (
                <span className="block text-base text-white mt-2 font-semibold">
                  🎊 点击开始，见证幸运时刻 🎊
                </span>
              ) : (
                <span className="block text-sm text-white mt-2 bg-red-900/30 backdrop-blur-sm rounded-lg px-3 py-1">
                  ⚠️ 请检查参与者或中奖人数设置 ⚠️
                </span>
              )
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6 justify-center">
            {!isRollingRef.current ? (
              <button
                onClick={startRolling}
                disabled={!canStartLottery}
                className={`w-full sm:w-auto text-lg font-bold py-4 px-10 rounded-xl shadow-2xl transition-all duration-200 ease-in-out text-white flex items-center justify-center border-2
                  ${!canStartLottery
                    ? 'bg-gray-600 cursor-not-allowed opacity-70 border-gray-500'
                    : 'bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 border-yellow-400 focus:ring-4 focus:ring-orange-400 focus:ring-opacity-50 transform hover:scale-105 animate-pulse'}`}
                aria-label="开始抽奖"
              >
                <SparklesIcon className="w-6 h-6 mr-2" />
                🎊 开始抽奖 🎊
              </button>
            ) : (
              <button
                onClick={stopRollingAndDrawWinners}
                className="w-full sm:w-auto text-lg font-bold py-4 px-10 rounded-xl shadow-2xl transition-all duration-200 ease-in-out text-white bg-gradient-to-r from-red-600 via-pink-600 to-purple-700 hover:from-red-700 hover:via-pink-700 hover:to-purple-800 border-2 border-yellow-400 focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 transform hover:scale-105 flex items-center justify-center animate-pulse"
                aria-label="停止抽奖并公布结果"
              >
                <StopIcon className="w-6 h-6 mr-2" />
                🏆 停止抽奖 🏆
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryPage;
