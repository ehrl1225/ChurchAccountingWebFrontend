import { MemberRole } from "../common_enum";

export interface ChangeRoleDto{
    member_id: number;
    member_role: MemberRole;
};

export interface CreateJoinedOrganizationDto{
    organization_id: number;
    member_id: number;
    member_role: MemberRole;
};

export interface DeleteJoinedOrganizationParams{
    organizatino_id: number;
    joined_organization_id: number;
}