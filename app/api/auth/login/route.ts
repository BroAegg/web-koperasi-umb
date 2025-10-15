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

    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', !!user);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 401 });
    }

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
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
