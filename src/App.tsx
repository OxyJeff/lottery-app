
import React, { useState, useCallback, useEffect } from 'react';
import SettingsPage from './components/SettingsPage';
import LotteryPage from './components/LotteryPage';
import type { Prize, Draw } from './types';
// Modal and WinnerDisplay will be removed
import { SparklesIcon } from './components/icons';

export type PageView = 'settings' | 'lottery';
export type RollingSpeed = 'slow' | 'medium' | 'fast';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('settings');
  const [participantsText, setParticipantsText] = useState<string>('');
  const [numberOfWinnersToSelect, setNumberOfWinnersToSelect] = useState<number>(1);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [appTitle, setAppTitle] = useState<string>('抽奖系统');
  const [appSubtitle, setAppSubtitle] = useState<string>('公平公正，好运连连！');
  const [rollingSpeed, setRollingSpeed] = useState<RollingSpeed>('medium');
  const [excludeWinners, setExcludeWinners] = useState<boolean>(false); // New state for excluding winners
  
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [drawHistory, setDrawHistory] = useState<Draw[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);

  const actualParticipants = participantsText.split('\n').map(name => name.trim()).filter(name => name.length > 0);
  
  const getParticipantsForCurrentDraw = useCallback(() => {
    if (!excludeWinners) {
      return actualParticipants;
    }
    const allPastWinnersSet = new Set<string>(drawHistory.flatMap(draw => draw.winners));
    return actualParticipants.filter(participant => !allPastWinnersSet.has(participant));
  }, [actualParticipants, drawHistory, excludeWinners]);

  const participantsForCurrentDraw = getParticipantsForCurrentDraw();
  const selectedPrize = selectedPrizeId ? prizes.find(p => p.id === selectedPrizeId) || null : null;

  const handleAddPrize = useCallback((prizeData: Omit<Prize, 'id'>) => {
    setPrizes(prevPrizes => [
      ...prevPrizes,
      { ...prizeData, id: Date.now().toString(), imageUrl: prizeData.imageUrl || undefined }
    ]);
  }, []);

  const handleDeletePrize = useCallback((prizeId: string) => {
    setPrizes(prevPrizes => prevPrizes.filter(prize => prize.id !== prizeId));
  }, []);

  const handleNewDrawRecorded = useCallback((newDraw: Draw) => {
    setDrawHistory(prevHistory => [...prevHistory, newDraw]);
    // Optionally, clear selected prize or perform other actions after a draw
    // setSelectedPrizeId(null);
    setError(null);
  }, [setDrawHistory, setError]);

  const handleEditDrawHistory = useCallback((drawId: string, updatedWinners: string[]) => {
    setDrawHistory(prevHistory =>
      prevHistory.map(draw =>
        draw.id === drawId ? { ...draw, winners: updatedWinners, editable: true } : draw
      )
    );
  }, [setDrawHistory]);

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
    // Adjust numberOfWinnersToSelect based on participantsForCurrentDraw
    const numAvailableParticipants = participantsForCurrentDraw.length;
    if (numAvailableParticipants > 0) {
      if (numberOfWinnersToSelect > numAvailableParticipants) {
        setNumberOfWinnersToSelect(numAvailableParticipants);
      } else if (numberOfWinnersToSelect <= 0) {
        setNumberOfWinnersToSelect(1);
      }
    } else {
      // If no one is available (e.g. all won, or no initial participants), default to 1,
      // navigateToLottery checks will prevent actual drawing if 0 available.
      setNumberOfWinnersToSelect(1);
    }
  }, [participantsText, numberOfWinnersToSelect, participantsForCurrentDraw.length, drawHistory]); // Added drawHistory as it affects participantsForCurrentDraw

  const navigateToLottery = () => {
    if (actualParticipants.length === 0) {
      setError("请先添加参与者名单。");
      return;
    }
    if (prizes.length > 0 && !selectedPrizeId) {
      setError("请选择一个奖品进行抽奖。");
      return;
    }
    // Use getParticipantsForCurrentDraw() to ensure fresh check based on current excludeWinners state
    const currentAvailableForDraw = getParticipantsForCurrentDraw();

    if (actualParticipants.length > 0 && currentAvailableForDraw.length === 0 && excludeWinners) {
      setError("所有参与者都已中奖！无法开始新的抽奖。");
      return;
    }
    if (currentAvailableForDraw.length === 0) {
        setError("没有可参与抽奖的成员。" + (excludeWinners && actualParticipants.length > 0 ? " (可能所有人都已中奖)" : ""));
        return;
    }
    if (numberOfWinnersToSelect <= 0) {
        setError("中奖人数必须至少为1。");
        return;
    }
    if (numberOfWinnersToSelect > participantsForCurrentDraw.length) {
      setError(`中奖人数 (${numberOfWinnersToSelect}) 不能超过当前可抽奖人数 (${participantsForCurrentDraw.length})。`);
      return;
    }
    setError(null);
    setCurrentPage('lottery');
  };

  const navigateToSettings = () => {
    setCurrentPage('settings');
    // setWinners([]); // Removed
    // setShowWinnerModal(false); // Removed
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-900 text-white selection:bg-purple-500 selection:text-white">
      <header className="text-center py-6 px-4 bg-gray-800 shadow-lg sticky top-0 z-40">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            {appTitle} <SparklesIcon className="inline-block w-10 h-10 mb-2"/>
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-400">{appSubtitle}</p>
      </header>

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
              maxWinners={participantsForCurrentDraw.length} // Use filtered list for maxWinners display in settings
              setLoading={setIsLoadingFile}
              setError={setError}
              prizes={prizes}
              onAddPrize={handleAddPrize}
              onDeletePrize={handleDeletePrize}
              selectedPrizeId={selectedPrizeId}
              onSelectedPrizeIdChange={setSelectedPrizeId}
              availablePrizes={prizes}
              drawHistory={drawHistory}
              excludeWinners={excludeWinners}
              onExcludeWinnersChange={setExcludeWinners}
              onEditDrawHistory={handleEditDrawHistory}
            />
          </main>
        )}
        {currentPage === 'lottery' && selectedPrize && (
          <LotteryPage
            participants={actualParticipants} // Pass all participants
            numberOfWinnersToSelect={numberOfWinnersToSelect}
            rollingSpeed={rollingSpeed}
            backgroundImageUrl={backgroundImageUrl}
            navigateToSettings={navigateToSettings}
            onWinnersDrawn={handleNewDrawRecorded} // Use the new handler
            setErrorApp={setError}
            selectedPrize={selectedPrize}
            excludeWinners={excludeWinners} // Pass excludeWinners setting
            allDrawHistory={drawHistory} // Pass all history for filtering
          />
        )}
      </div>

      {/* Error display remains, but Modal and WinnerDisplay are removed */}
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
      
      {/* Modal and WinnerDisplay removed from here */}
      <footer className="text-center py-6 border-t border-gray-700 bg-gray-800">
        <p className="text-sm text-gray-500">{appTitle} &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
