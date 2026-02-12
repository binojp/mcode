import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceLogger = ({ onLog }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!isSupported) {
      alert("Voice logging is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setTranscript('');

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      processCommand(speechToText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processCommand = (text) => {
    onLog({ name: text, isCustom: true });
  };

  if (!isSupported) return null;

  return (
    <div className="flex flex-col items-center mt-4">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`p-4 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
        }`}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
      <p className="mt-2 text-xs text-slate-400 font-medium h-4">
        {isListening ? "Listening..." : "Tap to Speak"}
      </p>
      {transcript && (
          <p className="text-xs text-indigo-400 mt-1">"{transcript}"</p>
      )}
    </div>
  );
};

export default VoiceLogger;
