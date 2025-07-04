
import React, { useState, useRef } from 'react';
import { parseExcelFile } from '../services/excelService';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (participants: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, setLoading, setError }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setError(null);
      setFileName(file.name);
      try {
        const names = await parseExcelFile(file);
        onFileUpload(names);
      } catch (err: any) {
        setError(err.message || "处理Excel文件失败。"); // Default fallback
        setFileName(null); // Reset filename on error
      } finally {
        setLoading(false);
        // Reset file input to allow re-uploading the same file if needed
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-xl">
      <h3 className="text-xl font-semibold mb-3 text-white flex items-center">
        <UploadIcon className="w-6 h-6 mr-2" />
        上传参与者名单
      </h3>
      <p className="text-sm text-white mb-3">
        上传Excel文件（.xlsx, .xls）。姓名应位于第一个工作表的第一列。
      </p>
      <input
        type="file"
        id="excelUpload"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <label
        htmlFor="excelUpload"
        className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-sky-500 hover:bg-gray-700 transition-colors"
      >
        <UploadIcon className="w-5 h-5 mr-2 text-gray-400" />
        <span className="text-sm text-white">{fileName || "选择Excel文件..."}</span>
      </label>
    </div>
  );
};

export default FileUpload;