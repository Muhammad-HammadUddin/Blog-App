
import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"

export const getPostComments=async (req,res)=>{
    const comments=await commentModel.find({post:req.params.postId}).populate("user","username img email clerkId").sort({createdAt:-1})
    res.json(comments)

}
export const addComment = async (req, res) => {
  const clerkUserId = req.auth().userId;
  const postId = req.params.postId;
 
  if (!clerkUserId) {
    return res.status(401).json("Not Authenticated");
  }

  console.log(clerkUserId)
  const user = await userModel.findOne({ clerkId:clerkUserId });
  console.log(user)
  if (!user) {
    return res.status(404).json("User not found");
  }

  const newComment = new commentModel({
    ...req.body,
    user: user._id, // ✅ ab yeh sahi kaam karega
    post: postId,
  });

  try {
    const savedComment = await newComment.save();
    setTimeout(()=>{

        res.status(201).json(savedComment);
    },3000)
  } catch (error) {
    console.error("❌ Comment save error:", error);
    res.status(400).json({ error: error.message });
  }
};
export const deleteComment=async (req,res)=>{
    const clerkId=req.auth().userId;
    const id=req.params.id;
    if(!clerkId){
        return res.status(401).json("Not Authenticated")
    }
     const role=req.auth()?.sessionClaims.metadata?.role || "user"
         if(role==="admin"){
          await commentModel.findByIdAndDelete(req.params.id)
         return  res.status(200).json("Comment has been deleted ")
         }
    const user=await userModel.findOne({clerkId});
    console.log(user._id)
   
       const deletedComment=await commentModel.findByIdAndDelete({_id:req.params.id,user:user._id})
     if(!deletedComment){
        return res.json("you can delete only your Comment")
        
     }    
     res.status(200).json("Comment deleted")
    
    

}