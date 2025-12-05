export const MONTEZ_A_APARTMENTS = [
  // Floor 1
  { number: '1A1', floor: 1, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '1A2', floor: 1, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '1B1', floor: 1, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '1B2', floor: 1, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 2
  { number: '2A1', floor: 2, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '2A2', floor: 2, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '2B1', floor: 2, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '2B2', floor: 2, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 3
  { number: '3A1', floor: 3, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '3A2', floor: 3, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '3B1', floor: 3, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '3B2', floor: 3, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 4
  { number: '4A1', floor: 4, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '4A2', floor: 4, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '4B1', floor: 4, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '4B2', floor: 4, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 5
  { number: '5A1', floor: 5, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '5A2', floor: 5, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '5B1', floor: 5, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '5B2', floor: 5, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Rooftop
  { number: '6A1', floor: 6, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '6A2', floor: 6, type: 'TWO_BEDROOM' as const, rent: 18000 },
]

export const TOTAL_UNITS = MONTEZ_A_APARTMENTS.length

export const FLOORS = [1, 2, 3, 4, 5, 6]

export const UNIT_TYPES = {
  ONE_BEDROOM: {
    label: 'One Bedroom',
    rent: 15000,
    count: MONTEZ_A_APARTMENTS.filter(apt => apt.type === 'ONE_BEDROOM').length
  },
  TWO_BEDROOM: {
    label: 'Two Bedroom',
    rent: 18000,
    count: MONTEZ_A_APARTMENTS.filter(apt => apt.type === 'TWO_BEDROOM').length
  }
}