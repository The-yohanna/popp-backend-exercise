export type WebhookPayload = {
    id: string;
    job_id: string;
    candidate_id: string;
    candidate: CandidateInfo;
}

export type CandidateInfo = {
    phone_number: string;
    first_name: string;
    last_name: string;
    email_address: string;
}