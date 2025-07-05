
import React, { useState, useCallback, useEffect } from 'react';
import SettingsPage from './components/SettingsPage';
import LotteryPage from './components/LotteryPage';
import Modal from './components/Modal';
import WinnerDisplay from './components/WinnerDisplay';
import type { Prize, WinnerRecord } from './types';

export type PageView = 'settings' | 'lottery';
export type RollingSpeed = 'slow' | 'medium' | 'fast';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('settings');
  const [participantsText, setParticipantsText] = useState<string>('');
  const [numberOfWinnersToSelect, setNumberOfWinnersToSelect] = useState<number>(1);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [appTitle, setAppTitle] = useState<string>('抽奖系统');
  const [appSubtitle, setAppSubtitle] = useState<string>('公平公正，好运连连！'); // New state for app subtitle
  const [rollingSpeed, setRollingSpeed] = useState<RollingSpeed>('medium'); // New state for rolling speed
  const [excludePreviousWinners, setExcludePreviousWinners] = useState<boolean>(false); // New state for excluding previous winners
  
  // Prize-related states
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);
  
  const [winnerRecords, setWinnerRecords] = useState<WinnerRecord[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

  const actualParticipants = participantsText.split('\n').map(name => name.trim()).filter(name => name.length > 0);
  
  // Filter out previous winners if the exclude setting is enabled
  const availableParticipants = excludePreviousWinners 
    ? actualParticipants.filter(participant => !winners.includes(participant))
    : actualParticipants;

  // Handle winners drawn with prize information
  const handleWinnersDrawn = useCallback((drawnWinners: string[], selectedPrize: Prize | null) => {
    const newWinnerRecords: WinnerRecord[] = drawnWinners.map(winner => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      winnerName: winner,
      prize: selectedPrize,
      drawTime: new Date()
    }));

    setWinnerRecords(prevRecords => [...prevRecords, ...newWinnerRecords]);
    setWinners(prevWinners => [...prevWinners, ...drawnWinners]);
  }, []);
  
  const handleFileUpload = useCallback((newParticipants: string[]) => {
    setParticipantsText(prevText => {
      const existingNames = prevText.split('\n').map(name => name.trim()).filter(name => name.length > 0);
      const uniqueNewNames = newParticipants.filter(newName => !existingNames.includes(newName.trim()));
      
      const cleanedPrevText = existingNames.join('\n');
      
      if (cleanedPrevText.length === 0 && uniqueNewNames.length > 0) {
        return uniqueNewNames.join('\n');
      }
      if (cleanedPrevText.length > 0 && uniqueNewNames.length > 0) {
        return cleanedPrevText + '\n' + uniqueNewNames.join('\n');
      }
      return cleanedPrevText;
    });
    setError(null);
  }, []);
  
  useEffect(() => {
    const numParticipants = availableParticipants.length;
    if (numParticipants > 0) {
      if (numberOfWinnersToSelect > numParticipants) {
        setNumberOfWinnersToSelect(numParticipants);
      } else if (numberOfWinnersToSelect <= 0) {
        setNumberOfWinnersToSelect(1);
      }
    } else {
      setNumberOfWinnersToSelect(1);
    }
  }, [participantsText, numberOfWinnersToSelect, availableParticipants.length]);

  const navigateToLottery = () => {
    if (availableParticipants.length === 0) {
      if (excludePreviousWinners && actualParticipants.length > 0) {
        setError("所有参与者都已中奖，请关闭「排除已中奖人员」设置或添加新的参与者。");
      } else {
        setError("请先添加参与者名单。");
      }
      return;
    }
    if (numberOfWinnersToSelect <=0) {
        setError("中奖人数必须至少为1。");
        return;
    }
    if (numberOfWinnersToSelect > availableParticipants.length) {
      setError(`中奖人数 (${numberOfWinnersToSelect}) 不能超过可参与者总数 (${availableParticipants.length})。`);
      return;
    }
    setError(null);
    setCurrentPage('lottery');
  };

  const navigateToSettings = () => {
    setCurrentPage('settings');
    setShowWinnerModal(false);
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-900 text-white selection:bg-purple-500 selection:text-white">
      {/* <header className="text-center py-6 px-4 bg-gray-800 shadow-lg sticky top-0 z-40">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            {appTitle} <SparklesIcon className="inline-block w-10 h-10 mb-2"/>
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-400">{appSubtitle}</p>
      </header> */}

      <div className="flex-grow flex flex-col">
        {currentPage === 'settings' && (
          <main className="w-full max-w-3xl mx-auto p-4 md:p-8">
            <SettingsPage
              appTitle={appTitle}
              onAppTitleChange={setAppTitle}
              appSubtitle={appSubtitle}
              onAppSubtitleChange={setAppSubtitle}
              participantsText={participantsText}
              onParticipantsTextChange={setParticipantsText}
              onFileUpload={handleFileUpload}
              numberOfWinners={numberOfWinnersToSelect}
              onNumberOfWinnersChange={setNumberOfWinnersToSelect}
              rollingSpeed={rollingSpeed}
              onRollingSpeedChange={setRollingSpeed}
              backgroundImageUrl={backgroundImageUrl}
              onBackgroundImageChange={setBackgroundImageUrl}
              navigateToLottery={navigateToLottery}
              maxWinners={availableParticipants.length}
              setLoading={setIsLoadingFile}
              setError={setError}
              excludePreviousWinners={excludePreviousWinners}
              onExcludePreviousWinnersChange={setExcludePreviousWinners}
              winners={winners}
              onResetWinners={() => {
                setWinners([]);
                setWinnerRecords([]);
              }}
              prizes={prizes}
              onPrizesChange={setPrizes}
              selectedPrizeId={selectedPrizeId}
              onSelectedPrizeIdChange={setSelectedPrizeId}
              winnerRecords={winnerRecords}
            />
          </main>
        )}
        {currentPage === 'lottery' && (
          <LotteryPage
            participants={availableParticipants}
            numberOfWinnersToSelect={numberOfWinnersToSelect}
            rollingSpeed={rollingSpeed}
            backgroundImageUrl={backgroundImageUrl}
            navigateToSettings={navigateToSettings}
            onWinnersDrawn={handleWinnersDrawn}
            setErrorApp={setError}
            prizes={prizes}
            selectedPrizeId={selectedPrizeId}
          />
        )}
      </div>

      {(error && currentPage === 'settings') || isLoadingFile ? (
        <div className="fixed bottom-4 right-4 max-w-sm w-full z-50">
            {isLoadingFile && (
            <div role="status" aria-live="polite" className="bg-blue-600 text-white p-4 rounded-lg shadow-xl animate-pulse">
                <p>正在处理Excel文件...</p>
            </div>
            )}
            {error && !isLoadingFile && (
            <div role="alert" className="bg-red-600 text-white p-4 rounded-lg shadow-xl mt-2">
                <div className="flex justify-between items-center">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="ml-2 text-red-100 hover:text-white font-bold" aria-label="关闭错误提示">✕</button>
                </div>
            </div>
            )}
        </div>
      ) : null}

      <Modal isOpen={showWinnerModal && currentPage === 'lottery'} onClose={() => setShowWinnerModal(false)} title="🎉 恭喜中奖者！🎉">
        <WinnerDisplay winners={winners} />
      </Modal>
      
      {/* <footer className="text-center py-6 border-t border-gray-700 bg-gray-800">
        <p className="text-sm text-gray-500">{appTitle} &copy; {new Date().getFullYear()}</p>
      </footer> */}
    </div>
  );
};

export default App;
