import express from 'express';
import { fetchPosts,addPost,getPost,deletePost,uploadAuth,featurePost } from '../controllers/postController.js';
import { requireAuth } from '@clerk/express';
import inscreaseVisit from './../middlewares/increaseVisit.js';

const router =express.Router();

router.get("/upload-auth",uploadAuth)


router.get("/", fetchPosts);
router.post("/",addPost)
router.get("/:slug",inscreaseVisit,getPost)
router.delete("/:id",deletePost)
router.patch("/feature",featurePost)



export default router;