
import React, { useRef } from 'react';
import ParticipantInputArea from './ParticipantInputArea';
import FileUpload from './FileUpload';
import { CogIcon, UsersIcon, PhotoIcon } from './icons';
import type { RollingSpeed } from '../App';

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
  winners,
  onResetWinners
}) => {
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);

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
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={excludePreviousWinners}
                onChange={(e) => onExcludePreviousWinnersChange(e.target.checked)}
                className="w-4 h-4 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-500 focus:ring-2"
                aria-describedby="exclude-winners-info"
              />
              <span className="text-sm font-medium text-gray-300">排除已中奖人员</span>
            </label>
            <p id="exclude-winners-info" className="text-xs text-gray-400 mt-1">
              {excludePreviousWinners ? '开启后，已中奖的人员将不会再次被抽中' : '关闭时，所有参与者都可能被重复抽中'}
              {winners.length > 0 && (
                <span className="block mt-1 text-yellow-400">
                  当前已中奖人员 ({winners.length} 人): {winners.join(', ')}
                  <button 
                    onClick={onResetWinners}
                    className="ml-2 text-xs text-red-400 hover:text-red-300 underline"
                    title="重置中奖记录"
                  >
                    重置
                  </button>
                </span>
              )}
            </p>
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
