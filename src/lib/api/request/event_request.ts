

export interface CreateEventDTO{
    organization_id: number;
    year: number;
    name: string;
    start_date: Date;
    end_date: Date;
    description: string;
};

export interface DeleteEventDto{
    organization_id: number;
    event_id: number;
}

export interface EditEventDto{
    event_id: number;
    organization_id: number;
    event_name: string;
    start_date: Date;
    end_date: Date;
    description:string;
};


