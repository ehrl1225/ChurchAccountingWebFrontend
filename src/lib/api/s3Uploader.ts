interface PresignedPostData {
    url: string;
    fields: { [key: string]:string};
}

export async function uploadFileToS3(file: File, PresignedPostData: PresignedPostData): Promise<Response> {
    const {url, fields} = PresignedPostData;

    const formData = new FormData();


    Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value)
    });


    formData.append('file', file);
    
    const response = await fetch(url, {
        method: "POST",
        body: formData
    })

    if (!response.ok){
        throw new Error("S3 upload faild")
    }
    return response;
}