
import React, { useRef, useState } from 'react';
import ParticipantInputArea from './ParticipantInputArea';
import FileUpload from './FileUpload';
import { CogIcon, UsersIcon, PhotoIcon, TrophyIcon } from './icons';
import type { RollingSpeed } from '../App';
import type { Prize, Draw } from '../types'; // Added Draw
import DrawHistoryDisplay from './DrawHistoryDisplay'; // Added DrawHistoryDisplay

interface SettingsPageProps {
  appTitle: string;
  onAppTitleChange: (title: string) => void;
  appSubtitle: string;
  onAppSubtitleChange: (subtitle: string) => void;
  participantsText: string;
  onParticipantsTextChange: (text: string) => void;
  onFileUpload: (participants: string[]) => void;
  numberOfWinners: number;
  onNumberOfWinnersChange: (num: number) => void;
  rollingSpeed: RollingSpeed;
  onRollingSpeedChange: (speed: RollingSpeed) => void;
  backgroundImageUrl: string | null;
  onBackgroundImageChange: (url: string | null) => void;
  navigateToLottery: () => void;
  maxWinners: number;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  prizes: Prize[];
  onAddPrize: (prize: Omit<Prize, 'id'>) => void;
  onDeletePrize: (prizeId: string) => void;
  selectedPrizeId: string | null;
  onSelectedPrizeIdChange: (prizeId: string | null) => void;
  availablePrizes: Prize[];
  drawHistory: Draw[]; // Added drawHistory
  excludeWinners: boolean; // Added
  onExcludeWinnersChange: (exclude: boolean) => void; // Added
  onEditDrawHistory: (drawId: string, updatedWinners: string[]) => void; // Added
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  appTitle,
  onAppTitleChange,
  appSubtitle,
  onAppSubtitleChange,
  participantsText,
  onParticipantsTextChange,
  onFileUpload,
  numberOfWinners,
  onNumberOfWinnersChange,
  rollingSpeed,
  onRollingSpeedChange,
  backgroundImageUrl,
  onBackgroundImageChange,
  navigateToLottery,
  maxWinners,
  setLoading,
  setError,
  prizes, // This is the same as availablePrizes, kept for consistency with previous step if used directly
  onAddPrize,
  onDeletePrize,
  selectedPrizeId,
  onSelectedPrizeIdChange,
  availablePrizes,
  drawHistory, // Added drawHistory
  excludeWinners, // Added
  onExcludeWinnersChange, // Added
  onEditDrawHistory, // Added
}) => {
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const [prizeName, setPrizeName] = useState('');
  const [prizeImageUrl, setPrizeImageUrl] = useState('');
  const [showHistory, setShowHistory] = useState<boolean>(false); // Added showHistory state

  const handleAddPrizeInternal = () => {
    if (!prizeName.trim()) {
      setError("奖品名称不能为空。");
      return;
    }
    onAddPrize({ name: prizeName.trim(), imageUrl: prizeImageUrl.trim() || undefined });
    setPrizeName('');
    setPrizeImageUrl('');
    setError(null); // Clear error
  };

  const handleNumberOfWinnersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let num = parseInt(e.target.value, 10);
    if (isNaN(num)) {
        onNumberOfWinnersChange(1);
        return;
    }
    if (num < 1) {
      num = 1;
    }
    if (maxWinners > 0 && num > maxWinners) {
        num = maxWinners;
    }
    onNumberOfWinnersChange(num);
  };

  const handleBackgroundImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("背景图片文件不能超过5MB。");
        if (backgroundImageInputRef.current) {
            backgroundImageInputRef.current.value = "";
        }
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        onBackgroundImageChange(reader.result as string);
      };
      reader.onerror = () => {
        setError("读取背景图片失败。");
        onBackgroundImageChange(null);
      }
      reader.readAsDataURL(file);
    } else {
      onBackgroundImageChange(null);
    }
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="participant-settings-heading">
        <h2 id="participant-settings-heading" className="text-2xl font-semibold mb-4 text-sky-400 flex items-center">
          <UsersIcon className="w-7 h-7 mr-2" />
          参与者设置
        </h2>
        <ParticipantInputArea
          participantsText={participantsText}
          onParticipantsTextChange={onParticipantsTextChange}
        />
        <FileUpload
          onFileUpload={onFileUpload}
          setLoading={setLoading}
          setError={setError}
        />
      </section>

      <section aria-labelledby="lottery-config-heading">
        <h2 id="lottery-config-heading" className="text-2xl font-semibold mb-4 text-sky-400 flex items-center">
          <CogIcon className="w-7 h-7 mr-2" />
          抽奖参数设置
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
          <div>
            <label htmlFor="appTitle" className="block text-sm font-medium text-gray-300 mb-1">
              抽奖系统标题
            </label>
            <input
              type="text"
              id="appTitle"
              value={appTitle}
              onChange={(e) => onAppTitleChange(e.target.value)}
              placeholder="例如：年会抽奖"
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              aria-label="设置抽奖系统标题"
            />
            <p className="text-xs text-gray-400 mt-1">自定义显示在页面顶部的标题。</p>
          </div>

          <div>
            <label htmlFor="appSubtitle" className="block text-sm font-medium text-gray-300 mb-1">
              副标题/描述
            </label>
            <input
              type="text"
              id="appSubtitle"
              value={appSubtitle}
              onChange={(e) => onAppSubtitleChange(e.target.value)}
              placeholder="例如：公平公正，好运连连！"
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              aria-label="设置抽奖系统副标题"
            />
            <p className="text-xs text-gray-400 mt-1">自定义显示在主标题下方的小字描述。</p>
          </div>

          <div>
            <label htmlFor="excludeWinners" className="flex items-center text-sm font-medium text-gray-300 mb-1">
              <input
                type="checkbox"
                id="excludeWinners"
                checked={excludeWinners}
                onChange={(e) => onExcludeWinnersChange(e.target.checked)}
                className="mr-2 h-4 w-4 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
              />
              排除已中奖人员
            </label>
            <p className="text-xs text-gray-400 mt-1">开启后，在后续的抽奖中将自动排除已经中过奖的人员。</p>
          </div>

          <div>
            <label htmlFor="numberOfWinners" className="block text-sm font-medium text-gray-300 mb-1">
              抽取中奖人数
            </label>
            <input
              type="number"
              id="numberOfWinners"
              value={numberOfWinners}
              onChange={handleNumberOfWinnersChange}
              min="1"
              max={maxWinners > 0 ? maxWinners : undefined}
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              aria-describedby="max-winners-info"
            />
            {maxWinners > 0 ? (
              <p id="max-winners-info" className="text-xs text-gray-400 mt-1">最大中奖人数: {maxWinners} (基于当前参与者数量)</p>
            ) : (
              <p id="max-winners-info" className="text-xs text-gray-400 mt-1">请先添加参与者以确定最大中奖人数。</p>
            )}
          </div>

          <div>
            <label htmlFor="rollingSpeed" className="block text-sm font-medium text-gray-300 mb-1">
              滚动速度
            </label>
            <select
              id="rollingSpeed"
              value={rollingSpeed}
              onChange={(e) => onRollingSpeedChange(e.target.value as RollingSpeed)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              aria-label="设置抽奖滚动速度"
            >
              <option value="slow">慢</option>
              <option value="medium">中</option>
              <option value="fast">快</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">调整抽奖时名字滚动的快慢。</p>
          </div>

          <div>
            <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-300 mb-1">
              抽奖页面背景图 (可选)
            </label>
            <input
              type="file"
              id="backgroundImage"
              accept="image/*"
              onChange={handleBackgroundImageChange}
              ref={backgroundImageInputRef}
              className="hidden"
            />
            <label
              htmlFor="backgroundImage"
              className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-sky-500 hover:bg-gray-700 transition-colors"
            >
              <PhotoIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-sm text-gray-300">
                {backgroundImageUrl ? (backgroundImageInputRef.current?.files?.[0]?.name || '已选择图片') : "选择图片... (推荐小于2MB)"}
              </span>
            </label>
            {backgroundImageUrl && (
              <button 
                onClick={() => { 
                  onBackgroundImageChange(null); 
                  if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = "";
                }} 
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                清除背景图片
              </button>
            )}
            <p className="text-xs text-gray-400 mt-1">为抽奖页面设置一个背景图片。最大5MB。</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="prize-settings-heading">
        <h2 id="prize-settings-heading" className="text-2xl font-semibold mb-4 text-sky-400 flex items-center">
          <TrophyIcon className="w-7 h-7 mr-2" />
          奖品设置
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
          <div>
            <label htmlFor="prizeName" className="block text-sm font-medium text-gray-300 mb-1">
              奖品名称
            </label>
            <input
              type="text"
              id="prizeName"
              value={prizeName}
              onChange={(e) => setPrizeName(e.target.value)}
              placeholder="例如：一等奖"
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="prizeImageUrl" className="block text-sm font-medium text-gray-300 mb-1">
              奖品图片URL (可选)
            </label>
            <input
              type="text"
              id="prizeImageUrl"
              value={prizeImageUrl}
              onChange={(e) => setPrizeImageUrl(e.target.value)}
              placeholder="例如：https://example.com/image.png"
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>
          <button
            onClick={handleAddPrizeInternal}
            disabled={!prizeName.trim()}
            className={`w-full font-semibold py-3 px-6 rounded-lg shadow-md transition-colors text-white
              ${!prizeName.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800'}`}
          >
            添加奖品
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-300 mb-2">已添加奖品列表</h3>
          {prizes.length === 0 ? (
            <p className="text-gray-400">暂无奖品，请通过上方表单添加。</p>
          ) : (
            <ul className="space-y-3">
              {prizes.map((prize) => (
                <li key={prize.id} className="bg-gray-700 p-4 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-100">{prize.name}</p>
                    {prize.imageUrl && (
                      <a href={prize.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:text-sky-300 break-all">
                        {prize.imageUrl}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => onDeletePrize(prize.id)}
                    className="text-red-400 hover:text-red-300 font-medium py-1 px-3 rounded hover:bg-gray-600 transition-colors"
                    aria-label={`删除奖品 ${prize.name}`}
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {availablePrizes && availablePrizes.length > 0 && (
        <section aria-labelledby="prize-selection-heading" className="mt-8">
          <h2 id="prize-selection-heading" className="text-xl font-semibold mb-3 text-sky-400">
            选择当前抽奖奖品
          </h2>
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <label htmlFor="currentPrize" className="block text-sm font-medium text-gray-300 mb-1">
              当前奖品
            </label>
            <select
              id="currentPrize"
              value={selectedPrizeId || ''}
              onChange={(e) => onSelectedPrizeIdChange(e.target.value || null)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            >
              <option value="">-- 请选择一个奖品 --</option>
              {availablePrizes.map(prize => (
                <option key={prize.id} value={prize.id}>
                  {prize.name}
                </option>
              ))}
            </select>
            {!selectedPrizeId && <p className="text-xs text-red-400 mt-1">开始抽奖前必须选择一个奖品。</p>}
          </div>
        </section>
      )}

      <section aria-labelledby="draw-history-heading">
        <h2 id="draw-history-heading" className="text-2xl font-semibold mb-4 text-sky-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          抽奖历史记录
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full sm:w-auto font-semibold py-2 px-4 rounded-lg shadow-md transition-colors text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 mb-4"
          >
            {showHistory ? '隐藏抽奖历史' : '查看抽奖历史'} ({drawHistory.length} 条记录)
          </button>
          {showHistory && <DrawHistoryDisplay drawHistory={drawHistory} onEditDraw={onEditDrawHistory} />}
        </div>
      </section>

      <div className="mt-10 text-center">
        <button
          onClick={navigateToLottery}
          disabled={
            maxWinners === 0 ||
            numberOfWinners > maxWinners ||
            numberOfWinners < 1 ||
            (availablePrizes.length > 0 && !selectedPrizeId)
          }
          className={`w-full md:w-auto font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-150 ease-in-out text-white text-lg
            ${( maxWinners === 0 ||
                numberOfWinners > maxWinners ||
                numberOfWinners < 1 ||
                (availablePrizes.length > 0 && !selectedPrizeId)
              )
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105'}`}
        >
          保存设置并进入抽奖
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
