import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, signDeveloperToken } from '@/lib/auth';
import { logActivity, extractRequestMetadata } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  console.log('Login attempt received');
  
  try {
    const body = await request.json();
    console.log('Login request for email:', body.email);
    
    const { email, password } = body;
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ success: false, error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // First try to find User account (Admin, SuperAdmin)
    const user = await prisma.users.findUnique({ where: { email } });
    console.log('User found:', !!user);
    
    if (user) {
      // Login as User (Admin/SuperAdmin)
      console.log('Checking password for user:', email);
      const ok = await comparePassword(password, user.password);
      if (!ok) {
        console.log('Password incorrect for user:', email);
        return NextResponse.json({ success: false, error: 'Password salah' }, { status: 401 });
      }

      console.log('Password correct, generating token for user:', email);
      let token: string;
      // Check if user has DEVELOPER role (string comparison to handle new enum value)
      const isDeveloper = String(user.role) === 'DEVELOPER';
      if (isDeveloper) {
        // default developerSession: activeRole = DEVELOPER, DEV mode
        token = signDeveloperToken(user.id, user.role, {
          actualRole: 'DEVELOPER' as any,
          activeRole: 'DEVELOPER' as any,
          isProduction: false,
        });
      } else {
        token = signToken({ userId: user.id, role: user.role });
      }

      const response = { 
        success: true, 
        data: { 
          token, 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role 
          } 
        } 
      };
      
      // ✅ Activity Logging for User Login
      const { ipAddress, userAgent } = extractRequestMetadata(request);
      await logActivity({
        userId: user.id,
        userRole: user.role,
        action: 'LOGIN',
        module: 'AUTH',
        description: `User logged in: ${user.name} (${user.role})`,
        metadata: { email: user.email },
        ipAddress,
        userAgent,
      }).catch(err => console.error('[Activity Logger] Failed:', err));
      
      console.log('Login successful for user:', email);
      return NextResponse.json(response);
    }

    // If not found in User, try SupplierProfile (direct supplier registration)
    const supplier = await prisma.supplier_profiles.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        businessName: true,
        ownerName: true,
        phone: true,
        address: true,
        password: true,
        status: true,
        paymentStatus: true
      }
    });
    console.log('Supplier found:', !!supplier);

    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Email tidak terdaftar' }, { status: 401 });
    }

    if (!supplier.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Akun supplier ini belum memiliki password. Silakan hubungi admin.' 
      }, { status: 401 });
    }

    // Check password for supplier
    console.log('Checking password for supplier:', email);
    const supplierPasswordOk = await comparePassword(password, supplier.password);
    if (!supplierPasswordOk) {
      console.log('Password incorrect for supplier:', email);
      return NextResponse.json({ success: false, error: 'Password salah' }, { status: 401 });
    }

    // 🔥 CHECK: Block login if supplier not approved yet
    if (supplier.status === 'PENDING') {
      console.log('Supplier status PENDING, blocking login:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'Akun Anda masih menunggu persetujuan admin. Kami akan menghubungi Anda melalui email setelah akun disetujui.',
        status: 'PENDING'
      }, { status: 403 });
    }

    if (supplier.status === 'REJECTED') {
      console.log('Supplier status REJECTED, blocking login:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'Pendaftaran Anda ditolak oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.',
        status: 'REJECTED'
      }, { status: 403 });
    }

    // 🔥 QUICK FIX: Auto-create entry in suppliers table if not exists (only for APPROVED suppliers)
    let supplierEntry = await prisma.suppliers.findFirst({
      where: { email: supplier.email }
    });

    if (!supplierEntry) {
      console.log('Creating suppliers table entry for:', email);
      
      // Generate unique supplier code (SUP-YYYYMMDD-XXX)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const supplierCode = `SUP-${dateStr}-${randomSuffix}`;
      
      supplierEntry = await prisma.suppliers.create({
        data: {
          id: supplier.id, // Use same ID from supplier_profiles
          code: supplierCode,
          name: supplier.businessName,
          contact: supplier.ownerName || supplier.businessName,
          email: supplier.email,
          phone: supplier.phone || '',
          address: supplier.address || '',
          isActive: supplier.status === 'APPROVED',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log('Suppliers table entry created:', supplierEntry.id, 'code:', supplierCode);
    }

    // Generate token for supplier (role: SUPPLIER)
    console.log('Password correct, generating token for supplier:', email);
    const token = signToken({ userId: supplier.id, role: 'SUPPLIER' });

    const response = { 
      success: true, 
      data: { 
        token, 
        user: { 
          id: supplier.id, 
          email: supplier.email, 
          name: supplier.businessName, 
          role: 'SUPPLIER',
          status: supplier.status,
          paymentStatus: supplier.paymentStatus
        } 
      } 
    };
    
    // ✅ Activity Logging for Supplier Login
    const { ipAddress, userAgent } = extractRequestMetadata(request);
    await logActivity({
      userId: supplier.id,
      userRole: 'SUPPLIER',
      action: 'LOGIN',
      module: 'AUTH',
      description: `Supplier logged in: ${supplier.businessName}`,
      metadata: { email: supplier.email, status: supplier.status },
      ipAddress,
      userAgent,
    }).catch(err => console.error('[Activity Logger] Failed:', err));
    
    console.log('Login successful for supplier:', email);
    return NextResponse.json(response);
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
