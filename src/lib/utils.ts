import { ConversationStatus } from '@prisma/client';

export function parseConversationStatus(status: string): ConversationStatus | undefined {
    switch (status.toUpperCase()) {
        case ConversationStatus.CREATED:
            return ConversationStatus.CREATED;
        case ConversationStatus.ONGOING:
            return ConversationStatus.ONGOING;
        case ConversationStatus.COMPLETED:
            return ConversationStatus.COMPLETED;
        default:
            return undefined
    }
}