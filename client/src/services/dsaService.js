import api from "./api";

/**
 * DSA API service.
 */

export const fetchDSATaxonomy = () => api.get("/dsa/taxonomy");

export const fetchAlgoDetails = (name) => api.get(`/dsa/algo/${encodeURIComponent(name)}`);
