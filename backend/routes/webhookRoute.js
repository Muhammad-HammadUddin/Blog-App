import express from "express";
import { clerkWebhook } from "../controllers/webhookController.js";
import  bodyParser  from 'body-parser';

const router =express.Router();


const secret = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";

router.post('/clerk', bodyParser.raw({ type: 'application/json' }), clerkWebhook);

export default router;
