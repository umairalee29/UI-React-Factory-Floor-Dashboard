import { useState, useEffect } from 'react';

interface LiveClock {
  time: string;
  date: string;
  shift: string;
}

export default function useLiveClock(): LiveClock {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const date = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const hour = now.getHours();
  let shift: string;
  if (hour >= 6 && hour < 14) shift = 'Morning Shift';
  else if (hour >= 14 && hour < 22) shift = 'Afternoon Shift';
  else shift = 'Night Shift';

  return { time, date, shift };
}
