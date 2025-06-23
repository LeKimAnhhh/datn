import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple token bucket rate limiter for Edge Runtime
class EdgeRateLimiter {
  private static requests = new Map<string, number[]>();
  private static readonly WINDOW_MS = 60 * 1000; // 1 minute
  private static readonly MAX_REQUESTS = 100; // 100 requests per minute

  static isRateLimited(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    // Get existing requests for this IP
    let requests = this.requests.get(ip) || [];
    
    // Filter out old requests
    requests = requests.filter(timestamp => timestamp > windowStart);

    // Check if rate limited
    if (requests.length >= this.MAX_REQUESTS) {
      return true;
    }

    // Add current request
    requests.push(now);
    this.requests.set(ip, requests);

    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') ||
             'anonymous';

  // Check rate limit
  if (EdgeRateLimiter.isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Enhanced authorization check
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    const token = request.cookies.get('token')?.value;
    
    if (!authHeader && !token) {
      return new NextResponse('Unauthorized', { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer'
        }
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// // Simple in-memory store for rate limiting
// const rateLimit = new Map();

// // Rate limit configuration
// const RATE_LIMIT = {
//   windowMs: 60 * 1000, // 1 minute
//   max: 100 // limit each IP to 100 requests per windowMs
// };

// // Helper function to get client IP
// const getIP = (request: NextRequest) => {
//   const xff = request.headers.get('x-forwarded-for');
//   return xff ? xff.split(',')[0] : '127.0.0.1';
// };

// export async function middleware(request: NextRequest) {
//   const ip = getIP(request);
  
//   // Rate limiting
//   const now = Date.now();
//   const windowStart = now - RATE_LIMIT.windowMs;
  
//   // Clean old entries
//   for (const [key, timestamp] of rateLimit.entries()) {
//     if (timestamp < windowStart) {
//       rateLimit.delete(key);
//     }
//   }
  
//   // Count requests in current window
//   const requestCount = [...rateLimit.entries()]
//     .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
//     .length;
    
//   if (requestCount >= RATE_LIMIT.max) {
//     return new NextResponse('Too Many Requests', {
//       status: 429,
//       headers: {
//         'Retry-After': '60',
//         'Access-Control-Allow-Origin': '*',
//       }
//     });
//   }
  
//   // Add current request to rate limit map
//   rateLimit.set(`${ip}-${now}`, now);
  
//   // Validate request size
//   const contentLength = request.headers.get('content-length');
//   if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB limit
//     return new NextResponse('Request Entity Too Large', {
//       status: 413
//     });
//   }

//   // Add security headers
//   const response = NextResponse.next();
//   response.headers.set('X-Content-Type-Options', 'nosniff');
//   response.headers.set('X-Frame-Options', 'DENY');
//   response.headers.set('Strict-Transport-Security', 'max-age=63072000');
  
//   return response;
// }

// export const config = {
//   matcher: [
//     '/api/:path*',
//     '/((?!_next/static|_next/image|favicon.ico).*)',
//   ]
// }; 