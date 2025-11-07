import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    
    console.log('Auth me - Token received:', token ? 'Yes' : 'No');
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      console.log('Auth me - User not found from token');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Auth me - User found:', user.email, user.role);
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Auth me error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
