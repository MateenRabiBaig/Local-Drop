import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

type IconName = 'send' | 'receive' | 'device' | 'wifi' | 'back' | 'close' | 'home' | 'settings' | 'history';

export function Icon({ name, size = 22, color = '#2466B1' }: { name: IconName; size?: number; color?: string }) {
  const common = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  let content: React.ReactNode;
  switch (name) {
    case 'send': content = <><Path d="M12 17V4" {...common} /><Path d="m7 9 5-5 5 5" {...common} /><Path d="M5 20h14" {...common} /></>; break;
    case 'receive': content = <><Path d="M12 4v13" {...common} /><Path d="m7 12 5 5 5-5" {...common} /><Path d="M5 20h14" {...common} /></>; break;
    case 'device': content = <><Rect x="5" y="3" width="14" height="18" rx="2" {...common} /><Line x1="9" y1="17" x2="15" y2="17" {...common} /></>; break;
    case 'wifi': content = <><Path d="M3.5 8.5a13 13 0 0 1 17 0" {...common} /><Path d="M6.5 12a8.5 8.5 0 0 1 11 0" {...common} /><Path d="M9.5 15.5a4 4 0 0 1 5 0" {...common} /><Circle cx="12" cy="19" r=".8" fill={color} stroke="none" /></>; break;
    case 'back': content = <><Path d="M19 12H5" {...common} /><Path d="m11 6-6 6 6 6" {...common} /></>; break;
    case 'home': content = <><Path d="m4 10 8-6 8 6" {...common} /><Path d="M6 9v10h12V9" {...common} /><Path d="M10 19v-5h4v5" {...common} /></>; break;
    case 'settings': content = <><Circle cx="12" cy="12" r="3" {...common} /><Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 1.5-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.1v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.5-1.5.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H7v-2.1h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.5-1.5.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.5 1.5-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14h-.2a1.7 1.7 0 0 0-1.3 1z" {...common} /></>; break;
    case 'history': content = <><Path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" {...common} /><Path d="M3.5 5v5h5" {...common} /><Path d="M12 7v5l3 2" {...common} /></>; break;
    default: content = <><Path d="m7 7 10 10" {...common} /><Path d="m17 7-10 10" {...common} /></>;
  }
  return <Svg width={size} height={size} viewBox="0 0 24 24">{content}</Svg>;
}
