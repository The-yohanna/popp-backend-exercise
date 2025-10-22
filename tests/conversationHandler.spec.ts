import { ConversationStatus, PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../src/app';
import { expect } from 'chai';

const prisma = new PrismaClient();
const API_TOKEN = process.env.API_TOKEN;
describe('POST /webhook', () => {

    beforeEach(async () => {
        await prisma.conversation.deleteMany({});
        await prisma.candidate.deleteMany({});

        await prisma.candidate.createMany({
            data: [
                {
                    id          : "candidate-i136",
                    phoneNumber : "+1234567890",
                    firstName   : "John",
                    lastName    : "Doe",
                    emailAddress: "john.doe@example.com"
                },
                {
                    id          : "candidate-i137",
                    phoneNumber : "+1234567891",
                    firstName   : "Jack",
                    lastName    : "Doe",
                    emailAddress: "jack.doe@example.com"
                },
                {
                    id          : "candidate-i138",
                    phoneNumber : "+1234567892",
                    firstName   : "Jane",
                    lastName    : "Doe",
                    emailAddress: "jane.doe@example.com"
                },
                {
                    id          : "candidate-i139",
                    phoneNumber : "+1234567894",
                    firstName   : "Jennifer",
                    lastName    : "Doe",
                    emailAddress: "jennifer.doe@example.com"
                }
            ]
        })

        await prisma.conversation.createMany({
            data: [
                {
                    id: "application-i136",
                    jobId: "associated-job-i136",
                    candidateId: "candidate-i136",
                    status: ConversationStatus.CREATED,
                },
                {
                    id: "application-i137",
                    jobId: "associated-job-i137",
                    candidateId: "candidate-i137",
                    status: ConversationStatus.ONGOING,
                },
                {
                    id: "application-i138",
                    jobId: "associated-job-i138",
                    candidateId: "candidate-i138",
                    status: ConversationStatus.COMPLETED,
                },
                {
                    id: "application-i139",
                    jobId: "associated-job-i139",
                    candidateId: "candidate-i139",
                    status: ConversationStatus.CREATED,
                }
            ]
        });
    });

    afterEach(async () => {
        await prisma.$disconnect();
    });

    it('should fetch all the conversations', async() => {
        const response = await request(app)
            .get('/api/conversations')
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .expect(200);

        expect(response.body.success).to.be.true;
        expect(response.body.data).to.have.lengthOf(4);
    });

    it('should fetch a single conversation given a valid id', async () => {
        const id = 'application-i136';

        const response = await request(app)
            .get(`/api/conversation/${id}`)
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .expect(200);

        expect(response.body.success).to.be.true;
        expect(response.body.data.status).to.equal(ConversationStatus.CREATED);
    });

    it('should return not found error for an id that does not match any document', async () => {
        const id = 'application-i5555';

        const response = await request(app)
            .get(`/api/conversation/${id}`)
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .expect(404);

        expect(response.body.success).to.be.false;
        expect(response.body.error.message).to.equal('Conversation not found');
    });

    it('should filter conversations with status', async () => {
        const status = ConversationStatus.COMPLETED;

        const response = await request(app)
            .get(`/api/conversations/${status}`)
            .set('Authorization', `Bearer ${API_TOKEN}`)
            .expect(200);

        expect(response.body.success).to.be.true;
        expect(response.body.data).to.have.lengthOf(1);
    })
})