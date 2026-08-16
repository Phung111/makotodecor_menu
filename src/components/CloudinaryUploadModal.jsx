import React, { useState } from 'react';
import { UploadCloud, Copy, Check, RefreshCw, Trash2, Image as ImageIcon, X, ExternalLink, AlertCircle, Layers, FileText } from 'lucide-react';

export default function CloudinaryUploadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Cloudinary Config read directly from .env variables
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const folderName = import.meta.env.VITE_CLOUDINARY_FOLDER;

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'convert' | 'history'

  // Upload Tab State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({}); // { fileIndex: 'uploading' | 'success' | 'error' }
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [failedFiles, setFailedFiles] = useState([]); // Array of { name: string, reason: string }
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');

  // Link Formatter State
  const [rawTextLinks, setRawTextLinks] = useState('');
  const [formattedResult, setFormattedResult] = useState('');

  // General State
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [recentHistory, setRecentHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('MAKOTO_CLOUDINARY_HISTORY') || '[]');
    } catch {
      return [];
    }
  });

  // Save batch to history
  const saveToHistory = (resultString, count) => {
    if (!resultString) return;
    const newEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      count: count,
      string: resultString
    };
    const updated = [newEntry, ...recentHistory.slice(0, 9)];
    setRecentHistory(updated);
    localStorage.setItem('MAKOTO_CLOUDINARY_HISTORY', JSON.stringify(updated));
  };

  // Handle File Selection with 10MB Validation
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      const validFiles = [];
      const oversizedFiles = [];

      filesArr.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          const mbSize = (file.size / (1024 * 1024)).toFixed(2);
          oversizedFiles.push({
            name: file.name,
            reason: `Vượt quá dung lượng 10MB (${mbSize} MB)`
          });
        } else {
          validFiles.push(file);
        }
      });

      if (oversizedFiles.length > 0) {
        setFailedFiles(prev => {
          const existingNames = new Set(prev.map(p => p.name));
          const newEntries = oversizedFiles.filter(o => !existingNames.has(o.name));
          return [...prev, ...newEntries];
        });
        setUploadErrorMessage(`Có ${oversizedFiles.length} ảnh bị từ chối do dung lượng lớn hơn 10MB.`);
      } else {
        setUploadErrorMessage('');
      }

      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  // Remove single file from selected batch
  const handleRemoveFile = (index) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove) {
      setFailedFiles(prev => prev.filter(item => item.name !== fileToRemove.name));
    }
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  // Clear upload batch
  const handleClearUploadBatch = () => {
    setSelectedFiles([]);
    setUploadedUrls([]);
    setUploadProgress({});
    setFailedFiles([]);
    setUploadErrorMessage('');
    setCopiedStatus(false);
  };

  // Execute Bulk Upload to Cloudinary with Size Check & Error Listing
  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadErrorMessage('');
    const newUrls = [];
    const newProgress = { ...uploadProgress };
    const newFailedList = [...failedFiles];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validate max file size 10MB before uploading
      if (file.size > MAX_FILE_SIZE) {
        const mbSize = (file.size / (1024 * 1024)).toFixed(2);
        newProgress[i] = 'error';
        if (!newFailedList.some(item => item.name === file.name)) {
          newFailedList.push({
            name: file.name,
            reason: `Vượt quá dung lượng 10MB (${mbSize} MB)`
          });
        }
        setUploadProgress({ ...newProgress });
        continue;
      }

      newProgress[i] = 'uploading';
      setUploadProgress({ ...newProgress });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        if (folderName.trim()) {
          formData.append('folder', folderName.trim());
        }

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.secure_url) {
          newUrls.push(data.secure_url);
          newProgress[i] = 'success';
        } else {
          newProgress[i] = 'error';
          console.error('Cloudinary upload error:', data);
          const errReason = (data.error && data.error.message) ? data.error.message : 'Tải lên thất bại';
          if (!newFailedList.some(item => item.name === file.name)) {
            newFailedList.push({
              name: file.name,
              reason: `Lỗi Cloudinary: ${errReason}`
            });
          }
        }
      } catch (err) {
        newProgress[i] = 'error';
        console.error('Network / Upload error:', err);
        if (!newFailedList.some(item => item.name === file.name)) {
          newFailedList.push({
            name: file.name,
            reason: 'Lỗi kết nối mạng'
          });
        }
      }
      setUploadProgress({ ...newProgress });
    }

    setIsUploading(false);
    setUploadedUrls(newUrls);
    setFailedFiles(newFailedList);

    if (newUrls.length > 0) {
      const resultStr = newUrls.join(', ');
      saveToHistory(resultStr, newUrls.length);
    }
  };

  // Format Raw Text Links
  const handleFormatTextLinks = () => {
    if (!rawTextLinks.trim()) return;
    const links = rawTextLinks
      .split(/[\n,\s]+/)
      .map(str => str.trim())
      .filter(str => str.startsWith('http://') || str.startsWith('https://'));

    const joined = links.join(', ');
    setFormattedResult(joined);
    if (joined) {
      saveToHistory(joined, links.length);
    }
  };

  // Copy Result String to Clipboard
  const handleCopyString = (str) => {
    if (!str) return;
    navigator.clipboard.writeText(str);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const currentResultString = uploadedUrls.join(', ');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#161622] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col transition-all duration-300 z-10 text-gray-900 dark:text-gray-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/60 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800/50 shadow-sm">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide">Tool Tải & Tạo Link Ảnh Cloudinary</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tải ảnh theo cụm $\rightarrow$ tạo chuỗi phân cách dấu phẩy (,) dán vào Google Sheet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 px-4 pt-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Tải Ảnh Hàng Loạt (Direct Upload)</span>
          </button>

          <button
            onClick={() => setActiveTab('convert')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'convert'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dán & Gộp Chuỗi Link</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Lịch Sử Cụm Link ({recentHistory.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          
          {/* TAB 1: DIRECT BULK UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              
              {/* File Select Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-6 text-center transition-all bg-gray-50/50 dark:bg-gray-900/50 flex flex-col items-center justify-center space-y-2 cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 text-red-500 flex items-center justify-center border border-red-200 dark:border-red-900/50">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Nhấp để chọn cụm ảnh (5 - 10 ảnh) hoặc kéo thả vào đây
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Hỗ trợ định dạng JPG, PNG, WEBP, GIF (Yêu cầu dung lượng &lt; 10MB / tệp)
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Đã chọn {selectedFiles.length} tệp ảnh trong cụm này:
                    </span>
                    <button
                      onClick={handleClearUploadBatch}
                      className="text-xs font-semibold text-rose-500 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa cụm này</span>
                    </button>
                  </div>

                  {/* Preview Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                    {selectedFiles.map((file, idx) => {
                      const status = uploadProgress[idx];
                      const isOversized = file.size > MAX_FILE_SIZE;
                      return (
                        <div key={idx} className={`relative rounded-xl overflow-hidden border p-2 flex items-center space-x-2 ${
                          isOversized 
                            ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30' 
                            : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900'
                        }`}>
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0">
                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1 text-[11px] truncate">
                            <div className="font-medium truncate text-gray-800 dark:text-gray-200">{file.name}</div>
                            <div className={`text-[10px] ${isOversized ? 'text-rose-500 font-bold' : 'text-gray-400'}`}>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB {isOversized && '(Quá 10MB)'}
                            </div>
                          </div>
                          {status === 'uploading' && <RefreshCw className="w-4 h-4 text-amber-500 animate-spin shrink-0" />}
                          {status === 'success' && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                          {(status === 'error' || isOversized) && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                          {!status && (
                            <button
                              onClick={() => handleRemoveFile(idx)}
                              className="text-gray-400 hover:text-rose-500 p-1 rounded-md"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Upload Action Button */}
                  <button
                    onClick={handleStartUpload}
                    disabled={isUploading}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      isUploading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'crimson-gradient-bg hover:opacity-90 active:scale-98 shadow-red-900/30'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang tải cụm ảnh lên Cloudinary ({selectedFiles.length} tệp)...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Tải Cụm Ảnh Này Lên Cloudinary ({selectedFiles.length} tệp)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Failed Files List Box */}
              {failedFiles.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                    <div className="flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Danh sách {failedFiles.length} tệp ảnh bị lỗi / vượt quá 10MB:</span>
                    </div>
                    <button
                      onClick={() => setFailedFiles([])}
                      className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                    >
                      Xóa danh sách lỗi
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5 pt-1">
                    {failedFiles.map((item, idx) => (
                      <div key={idx} className="text-xs p-2 rounded-xl bg-white dark:bg-gray-900 border border-rose-100 dark:border-rose-900/50 flex items-center justify-between text-rose-600 dark:text-rose-300 shadow-sm">
                        <span className="font-semibold truncate max-w-[60%]" title={item.name}>
                          📄 {item.name}
                        </span>
                        <span className="text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-md text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 shrink-0">
                          {item.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message Alert */}
              {uploadErrorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>{uploadErrorMessage}</strong>
                    <p className="text-[11px] pt-1">
                      Kiểm tra biến môi trường <code>VITE_CLOUDINARY_CLOUD_NAME</code> và <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> trong file <code>.env</code>.
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Result Box */}
              {uploadedUrls.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Đã tải lên thành công {uploadedUrls.length} ảnh trong cụm này!</span>
                    </span>

                    <button
                      onClick={handleClearUploadBatch}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Tải cụm tiếp theo</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block uppercase tracking-wider">
                      Chuỗi Link (Đã phân cách bằng dấu phẩy để dán vào Google Sheet):
                    </label>
                    <textarea
                      readOnly
                      rows={3}
                      value={currentResultString}
                      className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-gray-900 text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-none custom-scrollbar"
                    />
                  </div>

                  <button
                    onClick={() => handleCopyString(currentResultString)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer ${
                      copiedStatus
                        ? 'bg-emerald-600 text-white shadow-emerald-700/30'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    }`}
                  >
                    {copiedStatus ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Đã Sao Chép Chuỗi Link Vào Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao Chép Chuỗi Link (Dán vào cột Danh_Sach_Anh)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LINK FORMATTER */}
          {activeTab === 'convert' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Nếu bạn đã tải ảnh lên trực tiếp trên giao diện <strong>Console Cloudinary</strong>, hãy dán danh sách URL (mỗi URL một dòng) vào đây để gộp thành chuỗi dấu phẩy.
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                  Dán danh sách URL (xuống dòng hoặc dán liền):
                </label>
                <textarea
                  rows={5}
                  value={rawTextLinks}
                  onChange={(e) => setRawTextLinks(e.target.value)}
                  placeholder="https://res.cloudinary.com/cloudinarymen/image/upload/v1/img1.jpg&#10;https://res.cloudinary.com/cloudinarymen/image/upload/v1/img2.jpg"
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono custom-scrollbar focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                onClick={handleFormatTextLinks}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold crimson-gradient-bg text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                Gộp Thành Chuỗi Ngăn Cách Dấu Phẩy (,)
              </button>

              {formattedResult && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3 animate-fadeIn">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">Kết quả gộp:</div>
                  <textarea
                    readOnly
                    rows={3}
                    value={formattedResult}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs font-mono text-gray-800 dark:text-gray-200 custom-scrollbar"
                  />
                  <button
                    onClick={() => handleCopyString(formattedResult)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Sao Chép Chuỗi Link</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Các cụm link đã gộp gần đây (tối đa 10 cụm):</span>
                {recentHistory.length > 0 && (
                  <button
                    onClick={() => {
                      setRecentHistory([]);
                      localStorage.removeItem('MAKOTO_CLOUDINARY_HISTORY');
                    }}
                    className="text-rose-500 hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Xóa lịch sử
                  </button>
                )}
              </div>

              {recentHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">Chưa có lịch sử cụm link nào.</div>
              ) : (
                <div className="space-y-3">
                  {recentHistory.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="font-bold text-gray-700 dark:text-gray-300">Cụm {item.count} ảnh ({item.time})</span>
                        <button
                          onClick={() => handleCopyString(item.string)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/50 hover:bg-red-100 flex items-center space-x-1 cursor-pointer font-bold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy lại</span>
                        </button>
                      </div>
                      <div className="text-[11px] font-mono text-gray-600 dark:text-gray-300 truncate bg-white dark:bg-gray-950 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
                        {item.string}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Link */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>Truy cập nhanh Cloudinary Console:</span>
          <a
            href="https://console.cloudinary.com/console"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
          >
            <span>console.cloudinary.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
