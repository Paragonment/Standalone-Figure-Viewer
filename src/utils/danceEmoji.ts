export const getDanceEmoji = (dance: string) => {
  switch (dance.toLowerCase()) {
    case 'waltz': return '⏳';
    case 'tango': return '🌹';
    case 'foxtrot': return '🦊';
    case 'quickstep': return '⚡';
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
