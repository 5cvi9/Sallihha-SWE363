/**
 * Initial Sallihha demo data.
 * Full demo records will be added later.
 */
export function createSeed() {
    return {
      users: [],
      categories: [],
      requests: [],
      offers: [],
      reviews: [],
      reports: [],
      auditLog: [],
      counters: {
        user: 0,
        category: 0,
        request: 0,
        offer: 0,
        review: 0,
        report: 0,
      },
    };
  }
  