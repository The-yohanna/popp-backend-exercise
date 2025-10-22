import { WebhookPayload } from '@/types';

export class ValidationService {

    static validateWebhookPayload(payload: WebhookPayload) {
        const errors: {[key: string]: string} = {};

        this.validateRequiredFields(payload, errors)

        const phoneRegex = /^\+[1-9]\d{7,14}$/;
        if (!phoneRegex.test(payload.candidate.phone_number)) {
            errors['candidate.phone_number'] = 'Invalid phone number format.';
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(payload.candidate.email_address)) {
            errors['candidate.email_address'] = 'Invalid email address format.';
        }

        return errors;
    }

    private static validateRequiredFields(obj: {[key: string]: any} , errors: {[key: string]: string}) {
        Object.entries(obj).forEach(([key, _]) => {
           if (typeof obj[key] === "object" && obj[key] !== null) {
               this.validateRequiredFields(obj[key], errors);
           }

           if (!obj[key]) {
               errors[key] = 'This field is required';
           }
        })
    }
}