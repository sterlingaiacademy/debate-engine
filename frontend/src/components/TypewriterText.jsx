import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text, wpm = 200 }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    // Calculate interval duration based on Words Per Minute parameter
    // Standard speaking voice is ~150-200 WPM
    // Let's default to 200 WPM (about 300ms per word) for a steady readable subtitle effect
    const msPerWord = Math.floor(60000 / wpm);
    
    const interval = setInterval(() => {
      currentWordIndex++;
      setDisplayedText(words.slice(0, currentWordIndex).join(' '));
      
      if (currentWordIndex >= words.length) {
        clearInterval(interval);
      }
    }, msPerWord);

    return () => clearInterval(interval);
  }, [text, wpm]);

  return <span>{displayedText}</span>;
}
