const Post = require('../models/Post')

exports.viewCreatePage = (req,res)=>{
    res.render('create-post')
}

exports.createPost = (req, res) => {
    let post = new Post(req.body, req.session.user._id)
    post.createPost().then((newId)=>{
        req.session.save(()=>res.redirect(`/post/${newId}`))
    }).catch(err =>{
        res.send(err)
    })
}

exports.viewSingle = async (req, res)=>{
    try{
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        console.log("post",post)
        res.render('single-post-screen', {post: post})
    }catch{
        res.render('404')
    }
}