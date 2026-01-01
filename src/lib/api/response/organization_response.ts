import { MemberRole } from "../common_enum";
import { JoinedOrganizatinoResponse } from "./joined_organization_response";

export interface OrganizationResponseDto{
    id: number;
    name: string;
    description: string | null;
    start_year: number;
    end_year: number;
    my_role: MemberRole;
    members: JoinedOrganizatinoResponse[];
}