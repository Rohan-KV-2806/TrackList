import QueueBuilder from '../components/core/QueueBuilder';
import { type Track } from '../components/core/SongAdd';

interface Page1Props {
  queue: Track[];
  setQueue: React.Dispatch<React.SetStateAction<Track[]>>;
  targetCommuteTime: number;
  setTargetCommuteTime: React.Dispatch<React.SetStateAction<number>>;
}

export default function Page1({ 
  queue, 
  setQueue, 
  targetCommuteTime, 
  setTargetCommuteTime 
}: Page1Props) {
  return (
    <div>
      <QueueBuilder 
        queue={queue} 
        setQueue={setQueue} 
        targetCommuteTime={targetCommuteTime} 
        setTargetCommuteTime={setTargetCommuteTime} 
      />
    </div>
  );
}