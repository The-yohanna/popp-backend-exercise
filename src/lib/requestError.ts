export class RequestError extends Error {
    errors?: Record<string, string | object>;
    name: string;

    constructor(message: string, errors?: Record<string, string | object>) {
        super(message);

        this.errors = errors;
        this.name = 'RequestError';
    }
}