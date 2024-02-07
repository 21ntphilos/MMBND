export interface enquiry{
    id: string,
    name:string,
    email:string,
    message: string,
    response:string,
    status: Estatus
    
}

export enum Estatus{
    Open = "Open",
    Closed = "Closed"
}