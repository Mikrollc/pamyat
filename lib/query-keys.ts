export const queryKeys = {
  graves: {
    all: ['graves'] as const,
    bySlug: (slug: string) => ['graves', 'bySlug', slug] as const,
    byUser: (userId: string) => ['graves', 'byUser', userId] as const,
    map: ['graves', 'map'] as const,
  },
  cemeteries: {
    all: ['cemeteries'] as const,
    allMap: ['cemeteries', 'map'] as const,
    nearby: (lat: number, lng: number, radiusKm: number) =>
      ['cemeteries', 'nearby', lat, lng, radiusKm] as const,
    search: (query: string) => ['cemeteries', 'search', query] as const,
  },
  profiles: {
    byId: (userId: string) => ['profiles', userId] as const,
  },
  waitlist: {
    status: (graveId: string) => ['waitlist', graveId] as const,
  },
  graveMembers: {
    byGraveAndUser: (graveId: string, userId: string) =>
      ['graveMembers', graveId, userId] as const,
  },
  invitations: {
    byGrave: (graveId: string) => ['invitations', 'byGrave', graveId] as const,
    received: (phone: string) => ['invitations', 'received', phone] as const,
  },
} as const;
