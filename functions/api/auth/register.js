import bcrypt from 'bcryptjs';

export async function onRequestPost({ request, env }) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ error: 'Username and password required' }), { status: 400 });
        }

        if (username.length < 3 || username.length > 20) {
            return new Response(JSON.stringify({ error: 'Username must be between 3 and 20 characters' }), { status: 400 });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return new Response(JSON.stringify({ error: 'Username can only contain letters, numbers, and underscores' }), { status: 400 });
        }

        if (password.length < 6) {
            return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400 });
        }

        // Check if user exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
        if (existing) {
            return new Response(JSON.stringify({ error: 'User already exists' }), { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await env.DB.prepare(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)'
        ).bind(username, passwordHash).run();

        if (!result.success) {
            throw new Error('Failed to create user');
        }

        return new Response(JSON.stringify({ message: 'User created successfully' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
