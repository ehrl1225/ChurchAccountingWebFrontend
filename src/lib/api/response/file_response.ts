
export interface FileInfoResponseDto{
    id: number;
    file_name: string,
    url: string,
    fields: Map<string, string>
}