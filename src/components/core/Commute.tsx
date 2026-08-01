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

  // useRef holds the interval ID so we can clear it and prevent duplicate timers
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleTimer = () => {
    if (hasArrived) return;
    setIsRunning((prev) => !prev);
  };

  useEffect(() => {
    if (isRunning) {
      // Record the exact start time to prevent drift on resume
      const startTime = Date.now() - elapsedTime * 1000;

      intervalRef.current = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        
        setElapsedTime(newElapsed);

        // Check if we reached the target commute time
        if (newElapsed >= targetCommuteTime) {
          setElapsedTime(targetCommuteTime); // Cap it exactly at the target
          setIsRunning(false);
          setHasArrived(true);
        }
      }, 1000); // Update every second
    } else {
      // Clean up interval when paused or stopped to prevent duplicate timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]); // Only depend on isRunning to trigger interval start/stop

  // Logic to auto-advance "Now Playing" and "Next Up" based on elapsedTime
  let currentIndex = -1;
  let nextIndex = -1;
  let runningTotal = 0;

  for (let i = 0; i < queue.length; i++) {
    if (elapsedTime < runningTotal + queue[i].duration) {
      currentIndex = i;
      nextIndex = i + 1 < queue.length ? i + 1 : -1;
      break; // Found the current track, exit loop
    }
    runningTotal += queue[i].duration;
  }

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setHasArrived(false);
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
        <button onClick={toggleTimer} disabled={hasArrived}>
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