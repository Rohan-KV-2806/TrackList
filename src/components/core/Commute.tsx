import { useState, useEffect, useRef } from 'react';
import { type Track } from './SongAdd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
      setIsRunning(true);
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.error("Audio play was blocked:", e));
      }
    } else {
      setIsRunning(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Timer Effect
  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - elapsedTime * 1000;

      intervalRef.current = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(newElapsed);

        if (newElapsed >= targetCommuteTime) {
          setElapsedTime(targetCommuteTime);
          setIsRunning(false);
          setHasArrived(true);
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
      }, 1000);
    } else {
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
  }, [isRunning]);

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
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Commute Timer</h2>
        <p className="text-muted-foreground mt-2">
          Press start to begin your perfectly timed commute.
        </p>
      </div>

      {/* HTML5 Audio Element bound directly to the current track's URI */}
      {currentIndex !== -1 && (
        <audio 
          ref={audioRef} 
          src={queue[currentIndex].fileUri} 
          onEnded={handleAudioEnded} 
        />
      )}

      <Card className="w-full">
        <CardContent className="flex flex-col items-center p-8 space-y-8">
          
          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center">
            {hasArrived ? (
              <span className="text-5xl font-bold text-green-600">🎉 Arrived!</span>
            ) : (
              <div className="text-6xl font-bold tabular-nums tracking-tighter">
                {formatTime(elapsedTime)} <span className="text-2xl text-muted-foreground">/ {formatTime(targetCommuteTime)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress 
              value={progress} 
              className={`h-3 w-full ${hasArrived ? '[&>div]:bg-green-600' : '[&>div]:bg-blue-600'}`} 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Elapsed</span>
              <span>Target</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 w-full justify-center">
            <Button 
              onClick={toggleTimer} 
              disabled={hasArrived || queue.length === 0} 
              size="lg"
              className="min-w-[160px]"
            >
              {isRunning ? 'Pause' : elapsedTime > 0 ? 'Resume' : 'Start Commute'}
            </Button>
            <Button 
              onClick={handleReset} 
              disabled={elapsedTime === 0 && !isRunning} 
              variant="outline" 
              size="lg"
            >
              Reset
            </Button>
          </div>

          {/* Empty Queue Warning */}
          {queue.length === 0 && (
            <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-md border border-red-200">
              Your queue is empty. Go back to Page 1 and add some tracks!
            </div>
          )}

        </CardContent>
      </Card>

      {/* Now Playing / Next Up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Card className={`overflow-hidden ${currentIndex !== -1 ? 'border-blue-500 shadow-md' : 'border-border'}`}>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Now Playing
            </CardTitle>
            {currentIndex !== -1 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Active</Badge>
            )}
          </CardHeader>
          <CardContent>
            {currentIndex !== -1 ? (
              <p className="text-xl font-bold truncate">{queue[currentIndex].title}</p>
            ) : hasArrived ? (
              <p className="text-xl font-bold text-muted-foreground">Commute Finished</p>
            ) : (
              <p className="text-xl font-bold text-muted-foreground">Press Start to begin</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextIndex !== -1 ? (
              <p className="text-xl font-bold truncate">{queue[nextIndex].title}</p>
            ) : (
              <p className="text-xl font-bold text-muted-foreground">None</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}