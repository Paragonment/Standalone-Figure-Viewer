export const getDanceEmoji = (dance: string) => {
  switch (dance.toLowerCase()) {
    case 'waltz': return '⏳';
    case 'tango': return '🌹';
    case 'foxtrot': return '🦊';
    case 'quickstep': return '⚡';
    case 'cha cha cha': return '🌶️';
    case 'samba': return '🥁';
    case 'rumba': return '❤️';
    case 'paso doble': return '🐂';
    case 'jive': return '🎷';
    default: return '💃';
  }
};

export const getStyleEmoji = (style: string) => {
  switch (style) {
    case 'Standard': return '🎩';
    case 'Latin': return '🔥';
    default: return '💃';
  }
};

export const getLevelEmoji = (level: string) => {
  switch (level) {
    case 'Pre-Bronze': return '⚪';
    case 'Bronze': return '🥉';
    case 'Silver': return '🥈';
    case 'Gold': return '🥇';
    default: return '🌐';
  }
};
