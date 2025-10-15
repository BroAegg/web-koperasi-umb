import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

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
    const user = await prisma.user.findUnique({ where: { email } });
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
      const token = signToken({ userId: user.id, role: user.role });

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
