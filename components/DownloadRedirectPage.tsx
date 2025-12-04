 import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const DownloadRedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileId = searchParams.get('id') || searchParams.get('fileId');
  const fileName = searchParams.get('fileName') || 'video.mp4';

  useEffect(() => {
    if (!fileId) {
      setError('Download link is invalid or missing file ID');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          startDownload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fileId]);

  const startDownload = () => {
    setIsDownloading(true);
    
    if (!fileId) return;
    
    const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`;
    
    // Open download in new tab
    window.open(downloadUrl, '_blank');
  };

  const handleManualDownload = () => {
    startDownload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">AnimeBing Download</h1>
        </div>
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleGoBack}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">AnimeBing Download</h1>
      </div>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Download Ready</h1>
          <p className="text-gray-600 mb-4">Your file will download in:</p>
          
          <div className="text-5xl font-bold text-center my-6">
            {countdown}
          </div>
          
          <p className="text-center mb-6">
            File: <span className="font-semibold">{fileName}</span>
          </p>
          
          {isDownloading ? (
            <div className="text-center mb-6">
              <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4">Downloading...</p>
            </div>
          ) : null}
          
          <div className="space-y-3">
            <button
              onClick={handleManualDownload}
              disabled={isDownloading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isDownloading ? 'Downloading...' : 'Download Now'}
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DownloadRedirectPage;
