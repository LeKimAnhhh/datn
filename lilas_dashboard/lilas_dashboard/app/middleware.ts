import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
const rateLimit = new Map();

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per windowMs
};

// Helper function to get client IP
const getIP = (request: NextRequest) => {
  const xff = request.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0] : '127.0.0.1';
};

export async function middleware(request: NextRequest) {
  const ip = getIP(request);
  
  // Rate limiting
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  
  // Clean old entries
  for (const [key, timestamp] of rateLimit.entries()) {
    if (timestamp < windowStart) {
      rateLimit.delete(key);
    }
  }
  
  // Count requests in current window
  const requestCount = [...rateLimit.entries()]
    .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
    .length;
    
  if (requestCount >= RATE_LIMIT.max) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
  
  // Add current request to rate limit map
  rateLimit.set(`${ip}-${now}`, now);
  
  // Validate request size
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB limit
    return new NextResponse('Request Entity Too Large', {
      status: 413
    });
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000');
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}; 