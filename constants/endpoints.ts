const REVIEWS_BASE = "/api/reviews";

export const ENDPOINTS = {
  REVIEWS: {
    LIST: REVIEWS_BASE,
    DETAIL: (id: string) => `${REVIEWS_BASE}/${id}`,
    START: `${REVIEWS_BASE}/start`,
    SIGNAL_FORM_SUBMITTED: (id: string) =>
      `${REVIEWS_BASE}/${id}/signal/form_submitted`,
    SIGNAL_LEAD_APPROVED: (id: string) =>
      `${REVIEWS_BASE}/${id}/signal/lead_approved`,
    HISTORY: (id: string) => `${REVIEWS_BASE}/${id}/history`,
  },
} as const;
