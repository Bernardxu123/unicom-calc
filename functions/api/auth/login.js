import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function onRequestPost({ request, env }) {
    try {
        const { username, password } = await request.json();

        const user = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        const secretKey = env.JWT_SECRET || 'dev-secret-key-change-me';
        if (!env.JWT_SECRET) console.warn('WARNING: Using default development JWT secret. Set JWT_SECRET in Cloudflare Dashboard for production.');
        const secret = new TextEncoder().encode(secretKey);
        const token = await new SignJWT({ sub: user.id, username: user.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        // Return token in JSON body for simplicity in this demo, or Set-Cookie
        return new Response(JSON.stringify({ token, user: { id: user.id, username: user.username } }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
