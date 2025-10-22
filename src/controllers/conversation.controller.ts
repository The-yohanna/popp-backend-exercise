import { Request, Response } from 'express';
import { ConversationService } from '@/services/conversation.service';
import { parseConversationStatus } from '@/lib/utils';
import { RequestError } from '@/lib/requestError';


export class ConversationController {

    static async getConversations(req: Request, res: Response) {
        try {
            const conversations = await ConversationService.getConversations();
            return res
                .status(200)
                .json({
                    success: true,
                    data: conversations,
                })

        } catch (error) {
            console.error('Error in conversations handler', error)
            return res
                .status(500)
                .json({
                    success: false,
                    error: 'Internal server error'
                });
        }
    }

    static async getConversationsByStatus(req: Request, res: Response) {
        try {
            const status = parseConversationStatus(req.params.status);
            const conversations = await ConversationService.getConversationsFilteredByStatus(status);
            return res
                .status(200)
                .json({
                    success: true,
                    data: conversations,
                })

        } catch (error) {
            console.error('Error in conversations handler', error)
            return res
                .status(500)
                .json({
                    success: false,
                    error: 'Internal server error'
                });
        }
    }

    static async getConversationById(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const conversation = await ConversationService.getConversationById(id);
            return res
                .status(200)
                .json({
                    success: true,
                    data: conversation,
                })
        } catch (error) {
            if (error instanceof RequestError) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        error: {
                            message: error.message,
                        }
                    })
            }

            console.error('Error in conversations handler', error)
            return res
                .status(500)
                .json({
                    success: false,
                    error: 'Internal server error'
                });
        }
    }

}