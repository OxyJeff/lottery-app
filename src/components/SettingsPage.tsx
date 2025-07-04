
import React, { useRef } from 'react';
import ParticipantInputArea from './ParticipantInputArea';
import FileUpload from './FileUpload';
import { CogIcon, UsersIcon, PhotoIcon } from './icons';
import type { RollingSpeed } from '../App';
import type { Prize, WinnerRecord } from '../types';

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
  excludePreviousWinners: boolean;
  onExcludePreviousWinnersChange: (exclude: boolean) => void;
  winners: string[];
  onResetWinners: () => void;
  prizes: Prize[];
  onPrizesChange: (prizes: Prize[]) => void;
  selectedPrizeId: string | null;
  onSelectedPrizeIdChange: (prizeId: string | null) => void;
  winnerRecords: WinnerRecord[];
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
  excludePreviousWinners,
  onExcludePreviousWinnersChange,
  onResetWinners,
  prizes,
  onPrizesChange,
  selectedPrizeId,
  onSelectedPrizeIdChange,
  winnerRecords,
}) => {
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);

  // Prize management methods
  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: '',
      imageUrl: null,
    };
    onPrizesChange([...prizes, newPrize]);
  };

  const updatePrize = (prizeId: string, updates: Partial<Prize>) => {
    const updatedPrizes = prizes.map(prize => 
      prize.id === prizeId ? { ...prize, ...updates } : prize
    );
    onPrizesChange(updatedPrizes);
  };

  const deletePrize = (prizeId: string) => {
    const updatedPrizes = prizes.filter(prize => prize.id !== prizeId);
    onPrizesChange(updatedPrizes);
    if (selectedPrizeId === prizeId) {
      onSelectedPrizeIdChange(null);
    }
  };

  const handlePrizeImageChange = (prizeId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("奖品图片文件不能超过5MB。");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePrize(prizeId, { imageUrl: reader.result as string });
      };
      reader.onerror = () => {
        setError("读取奖品图片失败。");
      }
      reader.readAsDataURL(file);
    }
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
        <h2 id="participant-settings-heading" className="text-2xl font-semibold mb-4 text-white flex items-center">
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
        <h2 id="lottery-config-heading" className="text-2xl font-semibold mb-4 text-white flex items-center">
          <CogIcon className="w-7 h-7 mr-2" />
          抽奖参数设置
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
          <div>
            <label htmlFor="appTitle" className="block text-sm font-medium text-white mb-1">
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
            <p className="text-xs text-white mt-1">自定义显示在页面顶部的标题。</p>
          </div>

          <div>
            <label htmlFor="appSubtitle" className="block text-sm font-medium text-white mb-1">
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
            <p className="text-xs text-white mt-1">自定义显示在主标题下方的小字描述。</p>
          </div>

          <div>
            <label htmlFor="numberOfWinners" className="block text-sm font-medium text-white mb-1">
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
              <p id="max-winners-info" className="text-xs text-white mt-1">最大中奖人数: {maxWinners} (基于当前参与者数量)</p>
            ) : (
              <p id="max-winners-info" className="text-xs text-white mt-1">请先添加参与者以确定最大中奖人数。</p>
            )}
          </div>

          <div>
            <label htmlFor="rollingSpeed" className="block text-sm font-medium text-white mb-1">
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
            <p className="text-xs text-white mt-1">调整抽奖时名字滚动的快慢。</p>
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={excludePreviousWinners}
                onChange={(e) => onExcludePreviousWinnersChange(e.target.checked)}
                className="w-4 h-4 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-500 focus:ring-2"
                aria-describedby="exclude-winners-info"
              />
              <span className="text-sm font-medium text-white">排除已中奖人员</span>
            </label>
            <p id="exclude-winners-info" className="text-xs text-white mt-1">
              {excludePreviousWinners ? '开启后，已中奖的人员将不会再次被抽中' : '关闭时，所有参与者都可能被重复抽中'}
              {winnerRecords.length > 0 && (
                <div className="block mt-2 text-white">
                  <div className="mb-2">
                    当前已中奖人员 ({winnerRecords.length} 人次):
                    <button 
                      onClick={onResetWinners}
                      className="ml-2 text-xs text-red-400 hover:text-red-300 underline"
                      title="重置中奖记录"
                    >
                      重置
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-gray-700 p-2 rounded text-xs space-y-1">
                    {winnerRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-1 border-b border-gray-600 last:border-b-0">
                        <span className="text-white">{record.winnerName}</span>
                        <span className="text-white">
                          {record.prize ? (
                            <span className="flex items-center space-x-1">
                              <span>🎁</span>
                              <span>{record.prize.name}</span>
                            </span>
                          ) : (
                            <span className="text-gray-500">无奖品</span>
                          )}
                        </span>
                        <span className="text-white text-xs">
                          {record.drawTime.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </p>
          </div>

          <div>
            <label htmlFor="backgroundImage" className="block text-sm font-medium text-white mb-1">
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
              <span className="text-sm text-white">
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
            <p className="text-xs text-white mt-1">为抽奖页面设置一个背景图片。最大5MB。</p>
          </div>
        </div>
      </section>

      {/* Prize Management Section */}
      <section aria-labelledby="prize-config-heading" className="mt-8">
        <h2 id="prize-config-heading" className="text-2xl font-semibold mb-4 text-white flex items-center">
          <span className="w-7 h-7 mr-2 text-2xl">🎁</span>
          奖品管理
        </h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-white">设置抽奖奖品，每次抽奖可以选择一个奖品</p>
            <button
              onClick={addPrize}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              添加奖品
            </button>
          </div>

          {prizes.length > 0 && (
            <div className="space-y-4">
              {prizes.map((prize) => (
                <div key={prize.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        奖品名称
                      </label>
                      <input
                        type="text"
                        value={prize.name}
                        onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                        placeholder="例如：一等奖"
                        className="w-full bg-gray-600 border border-gray-500 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        奖品图片 (可选)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePrizeImageChange(prize.id, e)}
                        className="w-full bg-gray-600 border border-gray-500 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                  {prize.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={prize.imageUrl}
                        alt={prize.name || '奖品图片'}
                        className="w-20 h-20 object-cover rounded-md border border-gray-500"
                      />
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => deletePrize(prize.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors"
                    >
                      删除奖品
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {prizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                选择当前抽奖奖品
              </label>
              <select
                value={selectedPrizeId || ''}
                onChange={(e) => onSelectedPrizeIdChange(e.target.value || null)}
                className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              >
                <option value="">不选择奖品</option>
                {prizes.map((prize) => (
                  <option key={prize.id} value={prize.id}>
                    {prize.name || '未命名奖品'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white mt-1">选择的奖品将在抽奖页面显示</p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-10 text-center">
        <button
          onClick={navigateToLottery}
          disabled={maxWinners === 0 || numberOfWinners > maxWinners || numberOfWinners < 1}
          className={`w-full md:w-auto font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-150 ease-in-out text-white text-lg
            ${(maxWinners === 0 || numberOfWinners > maxWinners || numberOfWinners < 1)
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
