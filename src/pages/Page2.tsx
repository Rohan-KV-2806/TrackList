import Commute from '../components/core/Commute';
import { type Track } from '../components/core/SongAdd';

interface Page2Props {
  queue: Track[];
  targetCommuteTime: number;
}

export default function Page2({ queue, targetCommuteTime }: Page2Props) {
  return (
    <div>
      <Commute queue={queue} targetCommuteTime={targetCommuteTime} />
    </div>
  );
}