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
    const lowerText = text.toLowerCase();
    let type = null;
    let intensity = 3; // Default

    // Simple keyword matching
    if (lowerText.includes('chai') || lowerText.includes('tea')) {
      type = 'Chai';
      intensity = 2;
    } else if (lowerText.includes('sweet') || lowerText.includes('dessert') || lowerText.includes('cake')) {
      type = 'Sweet';
      intensity = 4;
    } else if (lowerText.includes('cold') || lowerText.includes('drink') || lowerText.includes('soda')) {
      type = 'Cold Drink';
      intensity = 5;
    } else if (lowerText.includes('snack') || lowerText.includes('chips') || lowerText.includes('biscuit')) {
      type = 'Snack';
      intensity = 3;
    }

    if (type) {
      onLog(type, null, intensity); // Pass type and optional icon (null here), intensity
    } else {
        alert(`Could not recognize a sugar item in "${text}". Try saying "Chai", "Sweet", "Cold Drink", or "Snack".`);
    }
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
