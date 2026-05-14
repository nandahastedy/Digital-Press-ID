import { PressCardData } from '../types';

// Mock data for initial development if no URL is provided
const MOCK_DATA: PressCardData[] = [
  {
    id: '1',
    name: 'Andi Pratama',
    nia: '2024.001.042',
    position: 'Wartawan Utama',
    region: 'Jakarta',
    email: 'andi@press.id',
    phone: '081234567890',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    status: 'Aktif',
    description: 'Wartawan Aktif Wilayah DKI Jakarta',
    expiryDate: '2025-12-31',
    organization: 'TINTA INFORMASI'
  },
  {
    id: '2',
    name: 'Siti Aminah',
    nia: '2024.001.085',
    position: 'Redaktur Pelaksana',
    region: 'Bandung',
    email: 'siti@press.id',
    phone: '085298765432',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    status: 'Aktif',
    description: 'Liputan Investigasi Jawa Barat',
    expiryDate: '2024-06-15', // Near expiry
    organization: 'TINTA INFORMASI'
  },
  {
    id: '3',
    name: 'Budi Santoso',
    nia: '2024.002.110',
    position: 'Fotografer Jurnalistik',
    region: 'Surabaya',
    email: 'budi@press.id',
    phone: '081300001111',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    status: 'Aktif',
    description: 'Kontributor Foto Jawa Timur',
    expiryDate: '2026-01-20',
    organization: 'TINTA INFORMASI'
  }
];

const cleanPhotoUrl = (url: string): string => {
  if (!url) return '';
  // Convert Google Drive view links to direct links
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return url;
};

export async function fetchPressCards(): Promise<PressCardData[]> {
  const csvUrl = import.meta.env.VITE_SHEET_CSV_URL;
  
  if (!csvUrl) {
    console.warn('VITE_SHEET_CSV_URL not set. Using mock data.');
    return MOCK_DATA;
  }

  try {
    const response = await fetch(csvUrl);
    const text = await response.text();
    
    // Robust CSV parser to handle quoted values and varied line endings
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return MOCK_DATA;

    const parseCSVLine = (line: string) => {
      const result = [];
      let start = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') inQuotes = !inQuotes;
        if (line[i] === ',' && !inQuotes) {
          result.push(line.substring(start, i).replace(/^"(.*)"$/, '$1').trim());
          start = i + 1;
        }
      }
      result.push(line.substring(start).replace(/^"(.*)"$/, '$1').trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    
    return lines.slice(1).map((line, idx) => {
      const values = parseCSVLine(line);
      const data: any = {};
      headers.forEach((header, index) => {
        data[header] = values[index];
      });
      
      // Map sheet headers: Nama, NIA, Jabatan, Wilayah, Email, Kontak, Foto, Status, Keterangan
      return {
        id: data.ID || data.id || `row-${idx}`,
        name: data.Nama || data.name || '',
        nia: data.NIA || data.nia || '',
        position: data.Jabatan || data.position || '',
        region: data.Wilayah || data.region || 'Nasional',
        email: data.Email || data.email || '',
        phone: data.Kontak || data.phone || data.Telepon || '',
        photoUrl: cleanPhotoUrl(data.Foto || data.photoUrl || data.FotoURL || ''),
        status: data.Status || data.status || 'Aktif',
        description: data.Keterangan || data.description || '',
        expiryDate: data.ExpiryDate || data.expiryDate || data.Status || '2025-12-31',
        organization: data.Organisasi || data.organization || 'TINTA INFORMASI'
      };
    });

  } catch (error) {
    console.error('Error fetching sheets data:', error);
    return MOCK_DATA;
  }
}
