export interface Complaint {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  votes: number;
  submittedDate: string;
  status: 'pending' | 'verified' | 'resolved';
  photo: string;
  resolutionImage?: string;
  resolvedDate?: string;
}

export const categories = [
  { id: 'roads', name: 'Roads & Potholes', icon: '' },
  { id: 'waste', name: 'Waste / Garbage', icon: '' },
  { id: 'streetlights', name: 'Streetlights', icon: '' },
  { id: 'water', name: 'Water Supply', icon: '' },
  { id: 'sewage', name: 'Sewage', icon: '' },
  { id: 'others', name: 'Others', icon: '' },
];

export const complaints: Complaint[] = [
  {
    id: '1',
    category: 'roads',
    title: 'Large pothole on MG Road',
    description: 'Deep pothole near traffic signal causing accidents. Urgent attention needed.',
    location: 'MG Road, Junction 4',
    votes: 127,
    submittedDate: '2025-10-28T09:30:00',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400',
  },
  {
    id: '2',
    category: 'roads',
    title: 'Road damage near school',
    description: 'Broken road surface creating safety hazard for children.',
    location: 'Station Road, Near St. Mary School',
    votes: 89,
    submittedDate: '2025-10-27T14:20:00',
    status: 'verified',
    photo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
  },
  {
    id: '3',
    category: 'waste',
    title: 'Overflowing garbage bins',
    description: 'Multiple bins overflowing for past 3 days. Creating health hazard.',
    location: 'Park Street, Block A',
    votes: 156,
    submittedDate: '2025-10-26T08:15:00',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1622396636175-0c6bb16bb184?w=400',
  },
  {
    id: '4',
    category: 'waste',
    title: 'Illegal dumping site',
    description: 'Construction waste dumped illegally in residential area.',
    location: 'Green Avenue, Sector 12',
    votes: 203,
    submittedDate: '2025-10-25T16:45:00',
    status: 'resolved',
    photo: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400',
    resolutionImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    resolvedDate: '2025-10-27T14:30:00',
  },
  {
    id: '5',
    category: 'streetlights',
    title: 'Street lights not working',
    description: 'All street lights on this road have been non-functional for 2 weeks.',
    location: 'Lake View Road',
    votes: 94,
    submittedDate: '2025-10-29T19:30:00',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=400',
  },
  {
    id: '6',
    category: 'streetlights',
    title: 'Damaged light pole',
    description: 'Light pole damaged in accident, wires exposed.',
    location: 'NH-44, KM 23',
    votes: 78,
    submittedDate: '2025-10-28T11:00:00',
    status: 'verified',
    photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  },
  {
    id: '7',
    category: 'water',
    title: 'No water supply for 3 days',
    description: 'Entire colony without water supply. No prior notice given.',
    location: 'Sunrise Colony, Sector 8',
    votes: 245,
    submittedDate: '2025-10-27T07:00:00',
    status: 'verified',
    photo: 'https://images.unsplash.com/photo-1548691905-57c36cc8d935?w=400',
  },
  {
    id: '8',
    category: 'water',
    title: 'Leaking water pipeline',
    description: 'Major water leakage wasting thousands of liters daily.',
    location: 'Market Road',
    votes: 167,
    submittedDate: '2025-10-26T12:30:00',
    status: 'resolved',
    photo: 'https://images.unsplash.com/photo-1582889877888-5c86ffe1d6da?w=400',
    resolutionImage: 'https://images.unsplash.com/photo-1581092918484-8313e1b9b6d3?w=400',
    resolvedDate: '2025-10-28T16:20:00',
  },
  {
    id: '9',
    category: 'sewage',
    title: 'Sewage overflow in street',
    description: 'Sewage overflowing causing foul smell and health issues.',
    location: 'Gandhi Nagar, Lane 5',
    votes: 189,
    submittedDate: '2025-10-30T06:45:00',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
  },
  {
    id: '10',
    category: 'sewage',
    title: 'Blocked drainage system',
    description: 'Drainage blocked causing waterlogging during rain.',
    location: 'Temple Street',
    votes: 134,
    submittedDate: '2025-10-29T15:20:00',
    status: 'verified',
    photo: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400',
  },
  {
    id: '11',
    category: 'others',
    title: 'Stray dogs menace',
    description: 'Pack of aggressive stray dogs in residential area.',
    location: 'Colony Park, Sector 15',
    votes: 112,
    submittedDate: '2025-10-28T17:00:00',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  },
  {
    id: '12',
    category: 'others',
    title: 'Park maintenance needed',
    description: 'Public park equipment broken, needs maintenance.',
    location: 'Central Park',
    votes: 67,
    submittedDate: '2025-10-27T10:30:00',
    status: 'resolved',
    photo: 'https://images.unsplash.com/photo-1585581428707-7a0b085f1a17?w=400',
    resolutionImage: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400',
    resolvedDate: '2025-10-29T11:45:00',
  },
];

export const monthlyData = [
  { month: 'Apr', roads: 45, waste: 32, streetlights: 18, water: 25, sewage: 20, others: 15 },
  { month: 'May', roads: 52, waste: 38, streetlights: 22, water: 28, sewage: 24, others: 18 },
  { month: 'Jun', roads: 68, waste: 45, streetlights: 25, water: 35, sewage: 30, others: 22 },
  { month: 'Jul', roads: 89, waste: 52, streetlights: 30, water: 42, sewage: 45, others: 28 },
  { month: 'Aug', roads: 95, waste: 48, streetlights: 28, water: 38, sewage: 52, others: 25 },
  { month: 'Sep', roads: 78, waste: 42, streetlights: 24, water: 32, sewage: 38, others: 20 },
  { month: 'Oct', roads: 65, waste: 35, streetlights: 20, water: 28, sewage: 28, others: 18 },
];

export const departmentPerformance = [
  { 
    department: 'Roads & Potholes', 
    total: 156, 
    resolved: 132, 
    avgResolutionTime: '4.2 days', 
    score: 85 
  },
  { 
    department: 'Waste / Garbage', 
    total: 98, 
    resolved: 89, 
    avgResolutionTime: '2.1 days', 
    score: 91 
  },
  { 
    department: 'Water Supply', 
    total: 87, 
    resolved: 76, 
    avgResolutionTime: '3.5 days', 
    score: 87 
  },
  { 
    department: 'Streetlights', 
    total: 64, 
    resolved: 58, 
    avgResolutionTime: '1.8 days', 
    score: 91 
  },
  { 
    department: 'Sewage', 
    total: 112, 
    resolved: 89, 
    avgResolutionTime: '5.1 days', 
    score: 79 
  },
  { 
    department: 'Others', 
    total: 45, 
    resolved: 38, 
    avgResolutionTime: '3.2 days', 
    score: 84 
  },
];

export const states = [
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    municipals: [
      { id: 'mumbai', name: 'Mumbai Municipal Corporation', password: 'mumbai123' },
      { id: 'pune', name: 'Pune Municipal Corporation', password: 'pune123' },
      { id: 'nagpur', name: 'Nagpur Municipal Corporation', password: 'nagpur123' },
    ],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    municipals: [
      { id: 'bangalore', name: 'Bangalore City Municipal Corporation', password: 'blr123' },
      { id: 'mysore', name: 'Mysore City Corporation', password: 'mysore123' },
      { id: 'hubli', name: 'Hubli-Dharwad Municipal Corporation', password: 'hubli123' },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    municipals: [
      { id: 'ndmc', name: 'New Delhi Municipal Council', password: 'ndmc123' },
      { id: 'sdmc', name: 'South Delhi Municipal Corporation', password: 'sdmc123' },
      { id: 'edmc', name: 'East Delhi Municipal Corporation', password: 'edmc123' },
    ],
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    municipals: [
      { id: 'ahmedabad', name: 'Ahmedabad Municipal Corporation', password: 'amd123' },
      { id: 'surat', name: 'Surat Municipal Corporation', password: 'surat123' },
      { id: 'vadodara', name: 'Vadodara Municipal Corporation', password: 'vad123' },
    ],
  },
];
