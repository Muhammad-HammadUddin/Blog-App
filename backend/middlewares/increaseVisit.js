import post from "../models/postModel.js"

const inscreaseVisit = async(req,res,next)=>{
    const slug=req.params.slug;

    await post.findOneAndUpdate({slug},{$inc:{visit:1}})
    next();
}

export default inscreaseVisit