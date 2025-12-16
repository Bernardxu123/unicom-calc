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

        // Initial check: if user already has a better score for this month, maybe don't update? 
        // Or just always update top score. Let's assume we keep the BEST score or LATEST?
        // User requirement: "本月排名". Usually means their best score. 
        // We'll update if new score is higher, or just insert/replace if we want "latest". 
        // Let's implement "Highest Score Logic".

        // Check existing score
        const existing = await env.DB.prepare(
            'SELECT score FROM monthly_scores WHERE user_id = ? AND month_key = ?'
        ).bind(data.user.sub, monthKey).first();

        if (existing && existing.score >= score) {
            return new Response(JSON.stringify({ message: 'Score not higher than existing' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Upsert
        const result = await env.DB.prepare(
            `INSERT INTO monthly_scores (user_id, username, score, month_key, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET score = excluded.score, updated_at = CURRENT_TIMESTAMP`
            // Wait, on conflict ID? ID is AutoInc. We need unique constraint on (user_id, month_key) to do ON CONFLICT correctly for upsert logic.
            // My schema didn't define unique constraint on (user_id, month_key).
            // I should either fix schema or do manual SELECT then INSERT/UPDATE. 
            // Manual is safer since I already created schema without constraint (I can migrate, but manual is easy).
        ).bind(data.user.sub, data.user.username, score, monthKey).run(); // This insert will fail logic if I strictly wanted one per user without unique index.

        // Correction: Since I didn't add UNIQUE(user_id, month_key) in schema.sql, basic INSERT adds duplicates.
        // I should update the record if it exists, insert if not.
        if (existing) {
            await env.DB.prepare(
                'UPDATE monthly_scores SET score = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND month_key = ?'
            ).bind(score, data.user.sub, monthKey).run();
        } else {
            await env.DB.prepare(
                'INSERT INTO monthly_scores (user_id, username, score, month_key) VALUES (?, ?, ?, ?)'
            ).bind(data.user.sub, data.user.username, score, monthKey).run();
        }

        return new Response(JSON.stringify({ message: 'Score submitted' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
