export async function onRequestGet({ env, data }) {
    if (!data.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const config = await env.DB.prepare('SELECT config_json FROM user_configs WHERE user_id = ?').bind(data.user.sub).first();

    return new Response(JSON.stringify(config || { config_json: null }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost({ request, env, data }) {
    if (!data.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const configJson = JSON.stringify(body);

        const result = await env.DB.prepare(
            `INSERT INTO user_configs (user_id, config_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET config_json = excluded.config_json, updated_at = CURRENT_TIMESTAMP`
        ).bind(data.user.sub, configJson).run();

        if (!result.success) {
            throw new Error('Failed to save config');
        }

        return new Response(JSON.stringify({ message: 'Config saved' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
