
export interface ChangeRoleDto{
    member_id: number;
    member_role: string;
};

export interface CreateJoinedOrganizationDto{
    organization_id: number;
    member_id: number;
    member_role: string;
};