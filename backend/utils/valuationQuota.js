const crypto = require('crypto');

// 简易内存配额管理：按“草稿键”计数，默认上限3次，可配置TTL
const MAX_ATTEMPTS = 3;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24小时

// 存储结构：Map<draftKey, { count: number, expiresAt: number }>
const quotaStore = new Map();

function buildDraftKey(userId, title, category, images = []) {
	const raw = `${userId || 'anon'}|${(title || '').trim()}|${(category || '').trim()}|${(images && images[0]) || ''}`;
	return crypto.createHash('sha256').update(raw).digest('hex');
}

function cleanupExpired() {
	const now = Date.now();
	for (const [key, value] of quotaStore.entries()) {
		if (value.expiresAt <= now) quotaStore.delete(key);
	}
}

function getRecord(draftKey, ttlMs = DEFAULT_TTL_MS) {
	cleanupExpired();
	const now = Date.now();
	let rec = quotaStore.get(draftKey);
	if (!rec) {
		rec = { count: 0, expiresAt: now + ttlMs };
		quotaStore.set(draftKey, rec);
	}
	return rec;
}

function getRemainingAttempts(draftKey, maxAttempts = MAX_ATTEMPTS) {
	const rec = getRecord(draftKey);
	return Math.max(0, maxAttempts - rec.count);
}

function incrementAttempts(draftKey, maxAttempts = MAX_ATTEMPTS) {
	const rec = getRecord(draftKey);
	if (rec.count < maxAttempts) rec.count += 1;
	return getRemainingAttempts(draftKey, maxAttempts);
}

function resetAttempts(draftKey) {
	quotaStore.delete(draftKey);
}

module.exports = {
	MAX_ATTEMPTS,
	buildDraftKey,
	getRemainingAttempts,
	incrementAttempts,
	resetAttempts,
};


