import React, { useState } from 'react';
import { X, Database, Check, RefreshCw, FileSpreadsheet, ExternalLink } from 'lucide-react';

export default function SheetConfigModal({ isOpen, onClose, currentSheetId, onSaveSheetId, onResetToMock }) {
  if (!isOpen) return null;

  const [inputVal, setInputVal] = useState(currentSheetId || '');

  const handleSave = (e) => {
    e.preventDefault();
    let cleanedId = inputVal.trim();

    // If full URL was pasted (e.g. https://docs.google.com/spreadsheets/d/1ABCXYZ.../edit)
    const match = cleanedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanedId = match[1];
    }

    onSaveSheetId(cleanedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#181824] rounded-2xl p-6 border border-gray-200 dark:border-gray-700/80 shadow-2xl transition-colors duration-300">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kết Nối Google Sheets API</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nhập ID hoặc Đường dẫn Google Sheet của bạn</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Google Sheet ID hoặc URL:
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="VD: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-[11px] text-gray-700 dark:text-gray-300 space-y-1.5">
            <p className="font-semibold text-amber-700 dark:text-amber-300">💡 Hướng dẫn cấu hình Google Sheet:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Mở file Google Sheet và bấm <strong>Chia sẻ (Share)</strong> ➔ Chọn "Bất kỳ ai có liên kết đều có thể xem".</li>
              <li>Đặt tên trang tính (Tab name) là: <code className="text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-black/40 px-1 py-0.5 rounded">DANH MỤC SẢN PHẨM</code>.</li>
              <li>Dùng cấu hình 15 cột như trong template file <code className="text-gray-800 dark:text-gray-200">Bang_gia_Makoto_Decor_2026_GoogleSheet_Template.xlsx</code>.</li>
            </ol>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                onResetToMock();
                setInputVal('');
                onClose();
              }}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Dùng Dữ Liệu Mẫu (Mock)</span>
            </button>

            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold crimson-gradient-bg text-white hover:opacity-95 shadow-lg shadow-red-900/40 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu & Tải Lại Dữ Liệu</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
