import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

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

    // Parse Data sheet (savings transactions)
    const dataSheet = workbook.Sheets['Data'];
    let transactionData: any[] = [];
    if (dataSheet) {
      const rawTransactionData = XLSX.utils.sheet_to_json(dataSheet, { header: 1 }) as any[];
      transactionData = rawTransactionData.slice(1).filter(row => row[1]); // Skip header, filter empty
    }

    // Skip header row
    const members = anggotaData.slice(1).filter(row => row[1]); // Filter out empty rows

    let imported = 0;
    let skipped = 0;
    let transactionsImported = 0;
    const errors: string[] = [];
    const memberNameMap = new Map<string, string>(); // Map nama → memberId for transactions

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

        // Map nama untuk transactions nanti
        memberNameMap.set(nama.trim().toUpperCase(), memberId);
        imported++;
      } catch (error: any) {
        errors.push(`Row ${no} (${nama}): ${error.message}`);
        skipped++;
      }
    }

    // Import savings transactions from Data sheet
    if (transactionData.length > 0) {
      console.log(`[Import] Processing ${transactionData.length} transactions from Data sheet`);
      
      for (const txRow of transactionData) {
        const [txNo, nama, tahun, bulan, nominal, tipe] = txRow;
        
        if (!nama || !nominal || !tipe) {
          continue; // Skip incomplete rows
        }

        try {
          // Find member by name (case insensitive)
          const namaUpper = nama.toString().trim().toUpperCase();
          let memberId = memberNameMap.get(namaUpper);
          
          // If not found in new imports, check existing members
          if (!memberId) {
            const existingMember = await prisma.members.findFirst({
              where: { 
                name: {
                  contains: nama.trim()
                }
              }
            });
            if (existingMember) {
              memberId = existingMember.id;
              memberNameMap.set(namaUpper, memberId);
            }
          }

          if (!memberId) {
            errors.push(`Transaction ${txNo}: Member "${nama}" not found`);
            continue;
          }

          // Convert month name to date
          const monthNames: { [key: string]: number } = {
            'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MEI': 5, 'JUN': 6,
            'JUL': 7, 'AUG': 8, 'SEP': 9, 'OKT': 10, 'NOV': 11, 'DES': 12
          };
          const bulanStr = bulan?.toString().toUpperCase() || '';
          const monthNum = monthNames[bulanStr] || 1;
          const transactionDate = new Date(parseInt(tahun) || 2024, monthNum - 1, 15); // Mid-month

          // Determine transaction type and amount
          const amount = Math.abs(parseFloat(nominal) || 0);
          const savingType = tipe?.toString().toUpperCase() === 'TARIK' ? 'WITHDRAWAL' : 'SUKARELA';
          const description = `${tipe?.toString().toUpperCase()} - ${bulan} ${tahun}`;

          // Create savings transaction
          await prisma.savings.create({
            data: {
              id: `saving-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              memberId: memberId,
              type: savingType as any,
              amount: amount,
              description: description,
              date: transactionDate,
              createdAt: new Date(),
            }
          });

          transactionsImported++;
        } catch (error: any) {
          errors.push(`Transaction ${txNo} (${nama}): ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${imported} members, ${transactionsImported} transactions imported, ${skipped} skipped`,
      stats: {
        total: members.length,
        imported,
        skipped,
        transactionsTotal: transactionData.length,
        transactionsImported,
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
