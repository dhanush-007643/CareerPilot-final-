// ═══════════════════════════════════════════════════════════════════════════
// profileApi.js — Frontend service for profile GET/PUT calls
// ═══════════════════════════════════════════════════════════════════════════
import api from './api';

/** Fetch a fresher's full profile (includes resume + applications) */
export const getFresherProfile = (userId) =>
  api.get(`/profile/fresher/${userId}`).then(r => r.data);

/** Update fresher profile fields */
export const updateFresherProfile = (userId, data) =>
  api.put(`/profile/fresher/${userId}`, data).then(r => r.data);

/** Fetch a company's full profile */
export const getCompanyProfile = (companyId) =>
  api.get(`/profile/company/${companyId}`).then(r => r.data);

/** Update company profile fields */
export const updateCompanyProfile = (companyId, data) =>
  api.put(`/profile/company/${companyId}`, data).then(r => r.data);

/** Follow/Unfollow a company */
export const followCompany = (companyId) =>
  api.post(`/profile/company/${companyId}/follow`).then(r => r.data);

/** Fetch all companies for Explore page */
export const getAllCompanies = (search = '') =>
  api.get(`/companies${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(r => r.data);

/** Remove a follower */
export const removeFollower = (companyId, followerId) =>
  api.delete(`/profile/company/${companyId}/followers/${followerId}`).then(r => r.data);
