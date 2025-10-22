import { Request, Response } from 'express';
import { ConversationService } from '@/services/conversation.service';
import { RequestError } from '@/lib/requestError';

export class WebhookController {

    static async handleWebhook(req: Request, res: Response) {
        try {
            const conversation = await ConversationService.createConversation(req.body);
            return res
                .status(201)
                .json({
                    success: true,
                    data: conversation,
                })
        } catch (error) {
            if (error instanceof RequestError) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        error: {
                            message: error.message,
                            details: error.errors
                        }
                    })
            }

            console.error('Error in webhook handler', error)
            return res
                .status(500)
                .json({
                    success: false,
                    error: 'Internal server error'
                });

        }
    }

}