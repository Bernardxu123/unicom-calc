import { jwtVerify } from 'jose';

export async function onRequest({ request, env, next, data }) {
    const authHeader = request.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const secretKey = env.JWT_SECRET || 'dev-secret-key-change-me';
            if (!env.JWT_SECRET) console.warn('WARNING: Using default development JWT secret. Set JWT_SECRET in Cloudflare Dashboard for production.');
            const secret = new TextEncoder().encode(secretKey);
            const { payload } = await jwtVerify(token, secret);
            data.user = payload; // Attach user info to the data object
        } catch (err) {
            // Invalid token, ignore or log. user remains undefined.
            console.error('Invalid token:', err);
        }
    }

    return next();
}
