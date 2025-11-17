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

export interface CreateGroupDto {
  name: string;
  description?: string;
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

export interface InviteGroupDto {
  groupId: string;
  groupName: string;
  leader: {
    id: string;
    name: string;
    email: string;
  };
  invitedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}