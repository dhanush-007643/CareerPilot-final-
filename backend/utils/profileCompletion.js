// ═══════════════════════════════════════════════════════════════════════════
// profileCompletion.js — Calculates how complete a fresher profile is (0-100)
// Each filled section earns points; total is normalised to a percentage
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param {Object} user - Mongoose User document (plain object or doc)
 * @returns {number} - Integer 0-100
 */
const calculateCompletion = (user) => {
  const checks = [
    // Basic info (40 pts)
    { label: 'name',     pts: 10, ok: !!user.name?.trim() },
    { label: 'phone',    pts: 5,  ok: !!user.phone?.trim() },
    { label: 'headline', pts: 5,  ok: !!user.headline?.trim() },
    { label: 'bio',      pts: 5,  ok: !!user.bio?.trim() },
    { label: 'avatar',   pts: 5,  ok: !!user.avatarUrl },
    { label: 'resume',   pts: 10, ok: !!user.resumeUrl },

    // Skills (15 pts)
    { label: 'skills_1', pts: 5,  ok: user.skills?.length >= 1 },
    { label: 'skills_3', pts: 5,  ok: user.skills?.length >= 3 },
    { label: 'skills_5', pts: 5,  ok: user.skills?.length >= 5 },

    // Education (15 pts)
    { label: 'education', pts: 15, ok: user.education?.length >= 1 },

    // Projects (15 pts)
    { label: 'project_1', pts: 8,  ok: user.projects?.length >= 1 },
    { label: 'project_2', pts: 7,  ok: user.projects?.length >= 2 },

    // Certifications (15 pts)
    { label: 'cert', pts: 15, ok: user.certifications?.length >= 1 },
  ];

  const earned = checks.reduce((sum, c) => sum + (c.ok ? c.pts : 0), 0);
  const total  = checks.reduce((sum, c) => sum + c.pts, 0);

  return Math.min(100, Math.round((earned / total) * 100));
};

module.exports = calculateCompletion;
