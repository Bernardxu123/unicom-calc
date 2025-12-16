import { jwtVerify } from 'jose';

export async function onRequest({ request, env, next, data }) {
    const authHeader = request.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const secret = new TextEncoder().encode(env.JWT_SECRET || 'dev-secret-key-change-me');
            const { payload } = await jwtVerify(token, secret);
            data.user = payload; // Attach user info to the data object
        } catch (err) {
            // Invalid token, ignore or log. user remains undefined.
            console.error('Invalid token:', err);
        }
    }

    return next();
}
