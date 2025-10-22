import { Router } from "express";
import { statusController } from "@/controllers/status.controller";
import { WebhookController } from '@/controllers/webhook.controller';
import { ConversationController } from '@/controllers/conversation.controller';

const router = Router();

router.get("/status", statusController);
router.get("/conversations", ConversationController.getConversations);
router.get("/conversations/:status", ConversationController.getConversationsByStatus)
router.get("/conversation/:id", ConversationController.getConversationById);

router.post("/webhook/job-application", WebhookController.handleWebhook);

export default router;
