import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import XLSX from 'xlsx';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to convert Excel serial date to JS Date
function excelDateToJSDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Parse ANGGOTA sheet
    const anggotaSheet = workbook.Sheets['ANGGOTA'];
    if (!anggotaSheet) {
      return NextResponse.json({ error: 'Sheet ANGGOTA not found' }, { status: 400 });
    }

    const anggotaData = XLSX.utils.sheet_to_json<{
      NO: number;
      'NAMA ANGGOTA': string;
      'PENDAFTARAN ANGGOTA': number;
      'SIMPANAN POKOK': number;
      'TOTAL SIMPANAN WAJIB': number;
    }>(anggotaSheet, { header: 1 }) as any[];

    // Skip header row
    const members = anggotaData.slice(1).filter(row => row[1]); // Filter out empty rows

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of members) {
      const [no, nama, pendaftaranSerial, simpananPokok, simpananWajib] = row;

      if (!nama) {
        skipped++;
        continue;
      }

      try {
        // Convert Excel date serial to JS Date
        const joinDate = excelDateToJSDate(pendaftaranSerial);
        
        // Generate unique IDs
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const memberId = `member-import-${timestamp}-${random}`;
        const userId = `user-import-${timestamp}-${random}`;
        const nomorAnggota = `A${String(no).padStart(4, '0')}`; // A0001, A0002, etc.

        // Check if member already exists by name
        const existing = await prisma.members.findFirst({
          where: { name: nama.trim() }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create user first (required by foreign key)
        await prisma.users.create({
          data: {
            id: userId,
            name: nama.trim(),
            email: `member${no}@koperasi.local`, // Dummy email
            password: 'dummy_hash', // Will need to be reset
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });

        // Create member
        await prisma.members.create({
          data: {
            id: memberId,
            userId: userId,
            nomorAnggota: nomorAnggota,
            name: nama.trim(),
            email: `member${no}@koperasi.local`,
            phone: null,
            address: null,
            gender: 'MALE', // Default, can be updated later
            unitKerja: 'Import', // Default
            joinDate: joinDate,
            status: 'ACTIVE',
            simpananPokok: simpananPokok || 0,
            simpananWajib: simpananWajib || 0,
            simpananSukarela: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });

        imported++;
      } catch (error: any) {
        errors.push(`Row ${no} (${nama}): ${error.message}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${imported} imported, ${skipped} skipped`,
      stats: {
        total: members.length,
        imported,
        skipped,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      error: 'Failed to import members', 
      details: error.message 
    }, { status: 500 });
  }
}
