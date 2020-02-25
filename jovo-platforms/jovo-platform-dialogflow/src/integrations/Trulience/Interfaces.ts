export interface TrulienceUserPayload {
    timeZoneId: string;
    lastSeen: string;
    locale: string;
    userId: string;
    accessToken: string; 
}

export interface TruliencePayload {
    source: string;
    version: string;
    user: TrulienceUserPayload;
}