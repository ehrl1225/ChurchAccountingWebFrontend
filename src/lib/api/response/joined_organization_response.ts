import { MemberRole } from "../common_enum";

export interface JoinedOrganizatinoResponse{
    id: number;
    member_id:number;
    member_name: string;
    member_role: MemberRole;
}