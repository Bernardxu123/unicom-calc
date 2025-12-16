export async function onRequestGet({ env, request }) {
    const url = new URL(request.url);
    const monthKey = url.searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM

    const scores = await env.DB.prepare(
        'SELECT username, score, updated_at FROM monthly_scores WHERE month_key = ? ORDER BY score DESC LIMIT 5'
    ).bind(monthKey).all();

    return new Response(JSON.stringify(scores.results), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost({ request, env, data }) {
    if (!data.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { score } = await request.json();
        const monthKey = new Date().toISOString().slice(0, 7);

        // Check for existing score for this user in this month
        const existing = await env.DB.prepare(
            'SELECT id, score FROM monthly_scores WHERE user_id = ? AND month_key = ?'
        ).bind(data.user.sub, monthKey).first();

        if (existing) {
            // Update existing record
            await env.DB.prepare(
                'UPDATE monthly_scores SET score = ?, username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
            ).bind(score, data.user.username, existing.id).run();
        } else {
            // Insert new record
            await env.DB.prepare(
                'INSERT INTO monthly_scores (user_id, username, score, month_key) VALUES (?, ?, ?, ?)'
            ).bind(data.user.sub, data.user.username, score, monthKey).run();
        }

        return new Response(JSON.stringify({ message: 'Score submitted successfully' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
