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
    members: GroupMember[];
  }
  

export interface GroupMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    status: string;
    joinedAt: string;
}

export interface InviteMemberDto {
    groupId: string;
    email: string;
}