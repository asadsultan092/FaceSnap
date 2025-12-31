
import React, { useState, useCallback, useRef } from 'react';
import { Upload, Video, Image as ImageIcon, Download, Scissors, RefreshCcw, Sparkles } from 'lucide-react';
import { AppState, BoundingBox, ExportFormat } from './types';
import VideoUploader from './components/VideoUploader';
import FaceSelector from './components/FaceSelector';
import ResultPreview from './components/ResultPreview';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [extractedImage, setExtractedImage] = useState<string | null>(null);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setState('editor');
  };

  const handleExtraction = (imageData: string) => {
    setExtractedImage(imageData);
    setState('preview');
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl('');
    setExtractedImage(null);
    setState('upload');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Video size={24} />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            FaceSnap Pro by  ASAD
          </h1>
        </div>
        {state !== 'upload' && (
          <button
            onClick={reset}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <RefreshCcw size={18} />
            New Project
          </button>
        )}
      </header>

      <main className="w-full max-w-6xl flex-grow flex flex-col items-center">
        {state === 'upload' && (
          <VideoUploader onUpload={handleVideoUpload} />
        )}

        {state === 'editor' && videoUrl && (
          <FaceSelector 
            videoUrl={videoUrl} 
            onExtract={handleExtraction} 
            onBack={() => setState('upload')}
          />
        )}

        {state === 'preview' && extractedImage && (
          <ResultPreview 
            image={extractedImage} 
            onBack={() => setState('editor')} 
          />
        )}
      </main>

      <footer className="w-full max-w-6xl mt-12 py-6 border-t border-slate-200 text-center text-slate-400 text-sm">
        &copy; 2024 FaceSnap Pro. Powerful Face Extraction Created By ASAD SUlTAN.
      </footer>
    </div>
  );
};

export default App;
