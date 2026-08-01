import { useState, useEffect, useRef } from 'react';
import { type Track } from './SongAdd';

interface CommuteProps {
  queue: Track[];
  targetCommuteTime: number; // in seconds
}

export default function Commute({ queue, targetCommuteTime }: CommuteProps) {
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  // Refs for timer and audio element
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Logic to find current and next track based on elapsed time
  let currentIndex = -1;
  let nextIndex = -1;
  let runningTotal = 0;

  for (let i = 0; i < queue.length; i++) {
    if (elapsedTime < runningTotal + queue[i].duration) {
      currentIndex = i;
      nextIndex = i + 1 < queue.length ? i + 1 : -1;
      break;
    }
    runningTotal += queue[i].duration;
  }

  // Start / Pause / Resume logic
  const toggleTimer = () => {
    if (hasArrived || queue.length === 0) return;

    if (!isRunning) {
      // STARTING / RESUMING
      setIsRunning(true);
      // Play audio
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.error("Audio play was blocked:", e));
      }
    } else {
      // PAUSING
      setIsRunning(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Timer Effect
  useEffect(() => {
    if (isRunning) {
      // Record start time to prevent drift
      const startTime = Date.now() - elapsedTime * 1000;

      intervalRef.current = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(newElapsed);

        if (newElapsed >= targetCommuteTime) {
          setElapsedTime(targetCommuteTime); // Cap exactly at target
          setIsRunning(false);
          setHasArrived(true);
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
      }, 1000);
    } else {
      // Clean up interval to prevent duplicate timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]); // Only depend on isRunning

  // If a track naturally finishes playing before the timer moves to the next second,
  // listen to the "ended" event to jump to the next track.
  const handleAudioEnded = () => {
    if (nextIndex !== -1) {
      setElapsedTime((prev) => prev + queue[currentIndex].duration);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setHasArrived(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = targetCommuteTime > 0 ? Math.min((elapsedTime / targetCommuteTime) * 100, 100) : 0;

  return (
    <div>
      <h2>Commute Timer</h2>

      {/* HTML5 Audio Element bound directly to the current track's URI */}
      {currentIndex !== -1 && (
        <audio 
          ref={audioRef} 
          src={queue[currentIndex].fileUri} 
          onEnded={handleAudioEnded} 
        />
      )}

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '20px', backgroundColor: '#eee', marginBottom: '20px', borderRadius: '4px' }}>
        <div 
          style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: hasArrived ? 'green' : 'blue', 
            transition: 'width 1s linear',
            borderRadius: '4px'
          }} 
        />
      </div>

      {/* Timer Display */}
      <div style={{ fontSize: '24px', marginBottom: '20px' }}>
        {hasArrived ? (
          <span style={{ color: 'green', fontWeight: 'bold' }}>🎉 Arrived!</span>
        ) : (
          <span>{formatTime(elapsedTime)} / {formatTime(targetCommuteTime)}</span>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={toggleTimer} disabled={hasArrived || queue.length === 0}>
          {isRunning ? 'Pause' : elapsedTime > 0 ? 'Resume' : 'Start Commute'}
        </button>
        <button onClick={handleReset} disabled={elapsedTime === 0 && !isRunning}>
          Reset
        </button>
      </div>

      {/* Now Playing / Next Up */}
      <div>
        <h3>Now Playing:</h3>
        {currentIndex !== -1 ? (
          <p style={{ fontWeight: 'bold' }}>{queue[currentIndex].title}</p>
        ) : hasArrived ? (
          <p style={{ color: 'gray' }}>Commute Finished</p>
        ) : (
          <p style={{ color: 'gray' }}>Press Start to begin</p>
        )}

        <h3>Next Up:</h3>
        {nextIndex !== -1 ? (
          <p>{queue[nextIndex].title}</p>
        ) : (
          <p style={{ color: 'gray' }}>None</p>
        )}
      </div>
    </div>
  );
}