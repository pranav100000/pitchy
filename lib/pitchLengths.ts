import { PitchLength } from './types';

export const pitchLengths: Record<string, PitchLength> = {
  elevator: {
    id: 'elevator',
    name: 'Elevator Pitch',
    duration: 30,
    description: '30 seconds - Quick hook and value proposition'
  },
  
  short: {
    id: 'short',
    name: 'Short Pitch',
    duration: 60,
    description: '1 minute - Brief but comprehensive overview'
  },
  
  standard: {
    id: 'standard',
    name: 'Standard Pitch',
    duration: 120,
    description: '2 minutes - Full pitch with problem, solution, benefits'
  },
  
  extended: {
    id: 'extended',
    name: 'Extended Pitch',
    duration: 300,
    description: '5 minutes - Detailed presentation with examples'
  }
};

export function getPitchLengthById(id: string): PitchLength | null {
  return pitchLengths[id] || null;
}

export function getAllPitchLengths(): PitchLength[] {
  return Object.values(pitchLengths);
}