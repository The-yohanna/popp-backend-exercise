import { ConversationStatus, PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../src/app';
import { expect } from 'chai';

const prisma = new PrismaClient();
const API_TOKEN = process.env.API_TOKEN;
describe('POST /webhook', () => {

    beforeEach(async () => {
        await prisma.conversation.deleteMany({});
    });

    afterEach(async () => {
        await prisma.$disconnect();
    })

    const starterPayload = {
        id: "application-i136",
        job_id: "associated-job-i136",
        candidate_id: "candidate-i136",
        candidate: {
            phone_number: "+1234567890",
            first_name: "John",
            last_name: "Doe",
            email_address: "john.doe@example.com"
        }
    }

    it('should reject request without authentication', async () => {
        const response = await request(app)
            .post('/api/webhook/job-application')
            .send(starterPayload)
            .expect(401);

        expect(response.body.error).to.equal('Missing or invalid Authorization header');
    })

    it('should reject request with invalid token', async () => {
        const response = await request(app)
            .post('/api/webhook/job-application')
            .set('Authorization', 'Bearer not-a-valid-one')
            .send(starterPayload)
            .expect(401);

        expect(response.body.error).to.equal('Unauthorized: Invalid token');
    })

    it('should reject an invalid payload i.e. missing required fields', async () => {
        const invalidPayload = {
            ...starterPayload,
            job_id: "",
        }
        const response = await request(app)
            .post('/api/webhook/job-application')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .send(invalidPayload)
            .expect(400);

        expect(response.body.success).to.be.false;
        expect(response.body.error.message).to.equal('Validation errors');
    })

    describe('should reject a payload with an invalid phone number', async () => {

        it('should not contain invalid characters', async () => {
            const invalidPayload = {
                ...starterPayload,
                candidate: {
                    ...starterPayload.candidate,
                    phone_number: '+534ebc978'
                }
            };

            const response = await request(app)
                .post('/api/webhook/job-application')
                .set('Authorization', `Bearer ${API_TOKEN}`)
                .send(invalidPayload)
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.details).to.include({
                'candidate.phone_number': 'Invalid phone number format.'
            });
        })

        it('should include the country code', async () => {
            const invalidPayload = {
                ...starterPayload,
                candidate: {
                    ...starterPayload.candidate,
                    phone_number: '5346789032'
                }
            };

            const response = await request(app)
                .post('/api/webhook/job-application')
                .set('Authorization', `Bearer ${API_TOKEN}`)
                .send(invalidPayload)
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.details).to.include({
                'candidate.phone_number': 'Invalid phone number format.'
            });
        })
    })

    it('should reject a payload with an invalid email address', async () => {
        const invalidPayload = {
            ...starterPayload,
            candidate: {
                ...starterPayload.candidate,
                email_address: 'not-quite-an-email'
            }
        };

        const response = await request(app)
            .post('/api/webhook/job-application')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .send(invalidPayload)
            .expect(400);

        expect(response.body.success).to.be.false;
        expect(response.body.error.details).to.include({
            'candidate.email_address': 'Invalid email address format.'
        });
    })

    it('should create a new conversation given a valid payload', async () => {
        const response = await request(app)
            .post('/api/webhook/job-application')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .send(starterPayload)
            .expect(201);

        expect(response.body.success).to.be.true;
        expect(response.body.data.status).to.equal('CREATED');
    })

    it('should prevent new conversation if candidate has an active conversation', async () => {
        await request(app)
            .post('/api/webhook/job-application')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .send(starterPayload)
            .expect(201);

        const newJobPayload = {
            ...starterPayload,
            id: 'application-i138',
            job_id: 'associated-job-i138'
        };

        const response = await request(app)
            .post('/api/webhook/job-application')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .send(newJobPayload)
            .expect(400);

        expect(response.body.error.message).to.equal('Candidate has an active conversation');
    });

    it('should prevent duplicate applications for same job', async () => {
        await request(app)
            .post('/api/webhook/job-application')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .send(starterPayload)
            .expect(201);

        await prisma.conversation.update({
            where: {
                id: starterPayload.id,
            },
            data: {
                status: ConversationStatus.COMPLETED,
            }
        })

        const duplicatePayload = {
            ...starterPayload,
            id: 'application-i139'
        };

        const response = await request(app)
            .post('/api/webhook/job-application')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .send(duplicatePayload)
            .expect(400);

        expect(response.body.error.message).to.equal('Candidate has already applied for job');
    });

})