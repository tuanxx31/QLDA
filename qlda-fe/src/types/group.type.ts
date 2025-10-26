export interface Group {
    id: string;
    name: string;
    description?: string;
    inviteCode: string;
    leader: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }
  