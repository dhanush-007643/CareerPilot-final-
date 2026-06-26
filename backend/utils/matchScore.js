/**
 * Match Percentage Engine
 * Calculates skill overlap between fresher and job requirements.
 */
const calculateMatch = (fresherSkills = [], jobSkills = []) => {
  if (!jobSkills.length) return 0;
  if (!fresherSkills.length) return 0;
  const normalize = (s) => s.toLowerCase().trim();
  const set = new Set(fresherSkills.map(normalize));
  const matched = jobSkills.filter((s) => set.has(normalize(s)));
  return Math.round((matched.length / jobSkills.length) * 100);
};

module.exports = { calculateMatch };
