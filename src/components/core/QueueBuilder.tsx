import { useMemo } from 'react';
import SongAdd, { type Track } from './SongAdd';
import PlayListAdder from './PlayListAdder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface QueueBuilderProps {
  queue: Track[];
  setQueue: React.Dispatch<React.SetStateAction<Track[]>>;
  targetCommuteTime: number; // in seconds
  setTargetCommuteTime: React.Dispatch<React.SetStateAction<number>>;
}

export default function QueueBuilder({ 
  queue, 
  setQueue, 
  targetCommuteTime, 
  setTargetCommuteTime 
}: QueueBuilderProps) {
  
  const handleAddTrack = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const handleAddMultiple = (tracks: Track[]) => {
    setQueue((prev) => [...prev, ...tracks]);
  };

  const handleRemoveTrack = (id: string) => {
    setQueue((prev) => prev.filter((track) => track.id !== id));
  };

  const totalQueueDuration = useMemo(() => {
    return queue.reduce((acc, track) => acc + track.duration, 0);
  }, [queue]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeDifference = totalQueueDuration - targetCommuteTime;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Build Your Queue</h2>
        <p className="text-muted-foreground mt-2">
          Add songs or podcasts to match your daily commute perfectly.
        </p>
      </div>

      {/* Commute Time Setter */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Target Commute Time</CardTitle>
          <CardDescription>How long is your trip today? (in minutes)</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            min="1"
            value={Math.floor(targetCommuteTime / 60)}
            onChange={(e) => setTargetCommuteTime((parseInt(e.target.value) || 0) * 60)}
            className="max-w-[120px] text-lg"
          />
        </CardContent>
      </Card>

      {/* Responsive 2-Column Layout for Desktop */}
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
        
        {/* Left Column: Add Components */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Music</CardTitle>
              <CardDescription>Import audio files from your device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PlayListAdder onAddMultiple={handleAddMultiple} />
              <Separator />
              <SongAdd onAddTrack={handleAddTrack} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Queue Display */}
        <div className="space-y-4">
          <Card className="flex flex-col h-full max-h-[600px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Queue List</CardTitle>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Total: <span className="text-foreground">{formatTime(totalQueueDuration)}</span>
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${timeDifference === 0 ? 'bg-green-100 text-green-700' : timeDifference > 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {timeDifference === 0 ? 'Perfect match!' : 
                   timeDifference > 0 ? `+${formatTime(timeDifference)} over` : 
                   `${formatTime(Math.abs(timeDifference))} under`}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <p>Your queue is empty.</p>
                  <p className="text-xs">Add some tracks to get started!</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {queue.map((track, index) => (
                    <div key={track.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="w-6 text-sm text-muted-foreground">{index + 1}.</span>
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(track.duration)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveTrack(track.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}