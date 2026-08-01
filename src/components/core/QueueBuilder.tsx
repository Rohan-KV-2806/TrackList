import { useState, useMemo } from 'react';
import SongAdd, { type Track } from './SongAdd';
import PlayListAdder from './PlayListAdder';

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
  
  // Handle adding a single track from SongAdd
  const handleAddTrack = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  // Handle adding multiple tracks from PlayListAdder
  const handleAddMultiple = (tracks: Track[]) => {
    setQueue((prev) => [...prev, ...tracks]);
  };

  // Handle removing a track
  const handleRemoveTrack = (id: string) => {
    setQueue((prev) => prev.filter((track) => track.id !== id));
  };

  // Calculate total queue duration ONLY when the queue changes
  const totalQueueDuration = useMemo(() => {
    return queue.reduce((acc, track) => acc + track.duration, 0);
  }, [queue]);

  // Simple time formatting (seconds -> M:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate time difference to show if user is over/under target time
  const timeDifference = totalQueueDuration - targetCommuteTime;

  return (
    <div>
      <h2>Build Your Queue</h2>

      {/* Commute Time Setter */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Target Commute Time (minutes):
        </label>
        <input
          type="number"
          min="1"
          value={Math.floor(targetCommuteTime / 60)}
          onChange={(e) => setTargetCommuteTime((parseInt(e.target.value) || 0) * 60)}
          style={{ width: '80px', padding: '5px' }}
        />
      </div>

      {/* Add Components */}
      <SongAdd onAddTrack={handleAddTrack} />
      <PlayListAdder onAddMultiple={handleAddMultiple} />

      {/* Queue Display */}
      <div style={{ marginTop: '20px' }}>
        <h3>Queue List</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Total Queue Time: {formatTime(totalQueueDuration)}</span>
          <span style={{ color: timeDifference > 0 ? 'red' : 'green' }}>
            {timeDifference === 0 ? 'Perfect match!' : 
             timeDifference > 0 ? `+${formatTime(timeDifference)} over` : 
             `${formatTime(Math.abs(timeDifference))} under`}
          </span>
        </div>

        <div style={{ marginTop: '10px', borderTop: '1px solid #ccc' }}>
          {queue.length === 0 && (
            <p style={{ padding: '10px', color: 'gray' }}>No tracks added yet.</p>
          )}
          {queue.map((track, index) => (
            <div 
              key={track.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee' 
              }}
            >
              <span>
                {index + 1}. {track.title} ({formatTime(track.duration)})
              </span>
              <button onClick={() => handleRemoveTrack(track.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}