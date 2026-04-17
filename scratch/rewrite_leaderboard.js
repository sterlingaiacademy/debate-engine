const fs = require('fs');

let py = fs.readFileSync('backend/leaderboard.py', 'utf8');

// 1. Delete GforceSystem class
py = py.replace(/class GforceSystem:[\s\S]*?return max\(100, round\(new_elo, 1\)\)/, '');

// 2. Fix Tiers
const newTiers = `
    def _gforce_tier(tokens: int) -> dict:
        \"\"\"Map absolute Gforce tokens to competitive tier.\"\"\"
        if tokens >= 7500: return {"name": "Conqueror", "icon": "🏆", "min_tokens": 7500}
        if tokens >= 5000: return {"name": "Master", "icon": "👑", "min_tokens": 5000}
        
        # Diamond
        if tokens >= 4800: return {"name": "Diamond I", "icon": "💠", "min_tokens": 4800}
        if tokens >= 4600: return {"name": "Diamond II", "icon": "💠", "min_tokens": 4600}
        if tokens >= 4400: return {"name": "Diamond III", "icon": "💠", "min_tokens": 4400}
        if tokens >= 4200: return {"name": "Diamond IV", "icon": "💠", "min_tokens": 4200}
        if tokens >= 4000: return {"name": "Diamond V", "icon": "💠", "min_tokens": 4000}
        
        # Platinum
        if tokens >= 3800: return {"name": "Platinum I", "icon": "💎", "min_tokens": 3800}
        if tokens >= 3600: return {"name": "Platinum II", "icon": "💎", "min_tokens": 3600}
        if tokens >= 3400: return {"name": "Platinum III", "icon": "💎", "min_tokens": 3400}
        if tokens >= 3200: return {"name": "Platinum IV", "icon": "💎", "min_tokens": 3200}
        if tokens >= 3000: return {"name": "Platinum V", "icon": "💎", "min_tokens": 3000}
        
        # Gold
        if tokens >= 2800: return {"name": "Gold I", "icon": "🥇", "min_tokens": 2800}
        if tokens >= 2600: return {"name": "Gold II", "icon": "🥇", "min_tokens": 2600}
        if tokens >= 2400: return {"name": "Gold III", "icon": "🥇", "min_tokens": 2400}
        if tokens >= 2200: return {"name": "Gold IV", "icon": "🥇", "min_tokens": 2200}
        if tokens >= 2000: return {"name": "Gold V", "icon": "🥇", "min_tokens": 2000}
        
        # Silver
        if tokens >= 1800: return {"name": "Silver I", "icon": "🥈", "min_tokens": 1800}
        if tokens >= 1600: return {"name": "Silver II", "icon": "🥈", "min_tokens": 1600}
        if tokens >= 1400: return {"name": "Silver III", "icon": "🥈", "min_tokens": 1400}
        if tokens >= 1200: return {"name": "Silver IV", "icon": "🥈", "min_tokens": 1200}
        if tokens >= 1000: return {"name": "Silver V", "icon": "🥈", "min_tokens": 1000}
        
        # Bronze
        if tokens >= 800: return {"name": "Bronze I", "icon": "🥉", "min_tokens": 800}
        if tokens >= 600: return {"name": "Bronze II", "icon": "🥉", "min_tokens": 600}
        if tokens >= 400: return {"name": "Bronze III", "icon": "🥉", "min_tokens": 400}
        if tokens >= 200: return {"name": "Bronze IV", "icon": "🥉", "min_tokens": 200}
        return {"name": "Bronze V", "icon": "🥉", "min_tokens": 0}
`;

py = py.replace(/    def _gforce_tier[\s\S]*?return \{"name": "Unranked", "icon": "⬜", "min_gforce": 0\}/, newTiers.trim());

// 3. Fix Badge definitions
py = py.replace(/"elo_1200":\s*\{.*\},/g, '"tokens_1000":         {"name": "Silver Rank",      "desc": "Reached Silver Tier"},');
py = py.replace(/"elo_1500":\s*\{.*\},/g, '"tokens_2000":         {"name": "Gold Rank",      "desc": "Reached Gold Tier"},');
py = py.replace(/"elo_1800":\s*\{.*\},/g, '"tokens_3000":         {"name": "Platinum Rank",        "desc": "Reached Platinum Tier"},');
py = py.replace(/"elo_2000":\s*\{.*\},/g, '"tokens_4000":         {"name": "Diamond Rank",    "desc": "Reached Diamond Tier"},');
py = py.replace(/"elo_2200":\s*\{.*\},/g, '"tokens_5000":         {"name": "Master Rank",     "desc": "Reached Master Tier"},');

// 4. Update check_badges logic
const oldBadgeLogic = `    # ELO leagues\\r?\\n    if gforce >= 1200: award\\("elo_1200"\\)\\r?\\n    if gforce >= 1500: award\\("elo_1500"\\)\\r?\\n    if gforce >= 1800: award\\("elo_1800"\\)\\r?\\n    if gforce >= 2000: award\\("elo_2000"\\)\\r?\\n    if gforce >= 2200: award\\("elo_2200"\\)`;
const newBadgeLogic = `    # Tiers Based Badges
    tokens = user.get("gforce_tokens", 0)
    if tokens >= 1000: award("tokens_1000")
    if tokens >= 2000: award("tokens_2000")
    if tokens >= 3000: award("tokens_3000")
    if tokens >= 4000: award("tokens_4000")
    if tokens >= 5000: award("tokens_5000")`;
py = py.replace(new RegExp(oldBadgeLogic, 'g'), newBadgeLogic);

// 5. Update submit_result calculation
const oldTokenCalc = /# ── Calculate new user stats ──[\s\S]*?"updated_at": datetime\.now\(timezone\.utc\)\.isoformat\(\),\r?\n        \}/;
const tokenCalc = `
        # ── Calculate new user stats ──
        new_total = user["total_debates"] + 1
        debate_words = result.get("stats", {}).get("total_words", 0)
        new_words = user["total_words_spoken"] + debate_words
        new_best = max(user["best_score"], result["overall_score"])
        new_avg = round(((user["avg_score"] * user["total_debates"]) + result["overall_score"]) / new_total, 2)

        new_streak = user.get("current_streak") or 0
        if new_streak == 0:
            new_streak = 1
        
        if prev_resp.data and prev_resp.data[0].get("created_at"):
            last_date_str = prev_resp.data[0]["created_at"]
            try:
                from datetime import datetime, timezone, timedelta
                last_dt = datetime.fromisoformat(last_date_str.replace("Z", "+00:00"))
                ist_last = last_dt + timedelta(hours=5, minutes=30)
                ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
                delta_days = (ist_now.date() - ist_last.date()).days
                
                if delta_days == 1:
                    new_streak += 1
                elif delta_days > 1:
                    new_streak = 1
            except Exception:
                pass
        new_longest = max(user["longest_streak"], new_streak)

        # ── Gforce Token Calculation ──
        # 1 token per 30 words (approx 5 tokens per min)
        base_tokens = debate_words // 30
        streak_bonus = new_streak * 5
        win_bonus = 20 if result["overall_score"] >= 7.0 else 0
        
        # We need to pre-check badges to add badge bounty
        temp_user = user.copy()
        temp_user.update({
            "total_debates": new_total,
            "total_words_spoken": new_words,
            "current_streak": new_streak,
            "avg_score": new_avg
        })
        new_badges = check_badges(temp_user, result, prev_score)
        badge_bonus = len(new_badges) * 25

        tokens_earned = int(base_tokens + streak_bonus + win_bonus + badge_bonus)
        new_gforce = int(user.get("gforce_tokens") or 0) + tokens_earned

        # ── Update user ──
        update_data = {
            "username": username,
            "total_debates": new_total,
            "total_wins": user["total_wins"] + (1 if result["overall_score"] >= 7.0 else 0),
            "best_score": new_best,
            "avg_score": new_avg,
            "gforce_tokens": new_gforce,
            "current_streak": new_streak,
            "longest_streak": new_longest,
            "total_words_spoken": new_words,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }`;

py = py.replace(oldTokenCalc, tokenCalc.trim());

// 6. Fix "new_elo" vars in submit_result
py = py.replace(/"new_gforce": new_gforce,/g, '"new_tokens": new_gforce, "tokens_earned": tokens_earned,');
py = py.replace(/"gforce_change": gforce_change,/g, '');

fs.writeFileSync('backend/leaderboard.py', py);
console.log('Script ran!');
