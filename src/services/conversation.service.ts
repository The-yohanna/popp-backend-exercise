import { ConversationStatus, PrismaClient } from '@prisma/client';
import { ValidationService } from '@/services/validation.service';
import { RequestError } from '@/lib/requestError';
import { WebhookPayload } from '@/types';

const prisma = new PrismaClient();

export class ConversationService {

    static async createConversation(payload: WebhookPayload) {

        const validationErrors = ValidationService.validateWebhookPayload(payload);
        if (Object.keys(validationErrors).length > 0) {
            throw new RequestError('Validation errors', validationErrors);
        }

        const { id, job_id, candidate_id, candidate } = payload;

        await prisma.candidate.upsert({
            where: {
                id: candidate_id,
            },
            update: {},
            create: {
                id: candidate_id,
                phoneNumber: candidate.phone_number,
                firstName: candidate.first_name,
                lastName: candidate.last_name,
                emailAddress: candidate.email_address,
            }
        })

        const activeConversation = await prisma.conversation.findFirst(
            {
                where: {
                    candidateId: candidate_id,
                    status: {
                        in: [ConversationStatus.CREATED, ConversationStatus.ONGOING],
                    }
                }
            }
        );

        if (activeConversation) {
            throw new RequestError('Candidate has an active conversation')
        }

        const existingApplication = await prisma.conversation.findFirst({
            where: {
                candidateId: candidate_id,
                jobId: job_id
            }
        });
        if (existingApplication) {
            throw new RequestError('Candidate has already applied for job')
        }

        return prisma.conversation.create({
            data: {
                id         : id,
                jobId      : job_id,
                candidateId: candidate_id,
                status     : ConversationStatus.CREATED,
            }
        });
    }

    static async getConversations() {
        return prisma.conversation.findMany({
            orderBy: { createdAt: 'desc'}
        })
    }

    static async getConversationsFilteredByStatus(status: ConversationStatus | undefined) {
        return prisma.conversation.findMany({
            where: { status },
            orderBy: { createdAt: 'desc'},
        });
    }

    static async getConversationById(id: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id }
        });

        if (!conversation) {
            throw new RequestError('Conversation not found');
        }

        return conversation;
    }
}