export interface LocationOption {
  label: string;
  location_code: number;
}

export const LOCATIONS: LocationOption[] = [
  { label: 'United States', location_code: 2840 },
  { label: 'United Kingdom', location_code: 2826 },
  { label: 'Canada', location_code: 2124 },
  { label: 'Australia', location_code: 2036 },
  { label: 'India', location_code: 2356 },
  { label: 'Germany', location_code: 2276 },
  { label: 'France', location_code: 2250 },
  { label: 'Spain', location_code: 2724 },
  { label: 'Italy', location_code: 2380 },
  { label: 'Netherlands', location_code: 2528 },
  { label: 'Brazil', location_code: 2076 },
  { label: 'Mexico', location_code: 2484 },
  { label: 'Japan', location_code: 2392 },
  { label: 'South Korea', location_code: 2410 },
  { label: 'Singapore', location_code: 2702 },
  { label: 'United Arab Emirates', location_code: 2784 },
  { label: 'South Africa', location_code: 2710 },
  { label: 'New Zealand', location_code: 2554 },
  { label: 'Ireland', location_code: 2372 },
  { label: 'Sweden', location_code: 2752 },
  { label: 'Switzerland', location_code: 2756 },
  { label: 'Belgium', location_code: 2056 },
  { label: 'Poland', location_code: 2616 },
  { label: 'Indonesia', location_code: 2360 },
  { label: 'Philippines', location_code: 2608 },
  { label: 'Turkey', location_code: 2792 },
  { label: 'Saudi Arabia', location_code: 2682 },
  { label: 'Portugal', location_code: 2620 },
  { label: 'Thailand', location_code: 2764 },
  { label: 'Vietnam', location_code: 2704 },
];

export const LOCATION_CODES = LOCATIONS.map((l) => l.location_code);
