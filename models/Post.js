const ObjectID = require("mongodb").ObjectID

const postsCollection = require('../db').db().collection("posts");
const User = require('./User')

let Post = function(data, userId){
    this.data = data;
    this.errors = []
    this.userId = userId;
}

Post.prototype.cleanUp = function(){
    if(typeof(this.data.title) != "string"){this.data.title = ""}
    if(typeof(this.data.body) != "string"){this.data.body = ""}

    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date(),
        author: ObjectID(this.userId)
    }
}

Post.prototype.validate = function(){
    if(this.data.title == ""){this.errors.push("you must provide a title")}
    if(this.data.body == ""){this.errors.push("you must provide a body")}
}

Post.prototype.createPost = function(){
    return new Promise((resolve, reject)=>{
        this.cleanUp()
        this.validate()

        if(!this.errors.length){
            postsCollection.insertOne(this.data).then(info=>{
                resolve(info.insertedId)
            }).catch(()=>{
                this.errors.push("please try again later..")
                reject(this.errors)
            })
        }else{
            reject(this.errors)
        }
    })
}

Post.findSingleById = function(id, visitorId){
    return new Promise(async (resolve, reject)=>{
        if(typeof(id) !== 'string' || !ObjectID.isValid(id)){
            reject();
            return
        }

        let posts = await postsCollection.aggregate([
            {$match: {_id: new ObjectID(id)}},
            {$lookup: {from: "users", localField:"author", foreignField:"_id", as: "authorDocument"}},
            {$project:{
                title: 1,
                body: 1,
                createdDate: 1,
                authorId: "$author",
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ]).toArray();

        posts = posts.map(function(post){
            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.authorId = undefined
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })

        // let post = await postsCollection.findOne({_id: new ObjectID(id)})
        if(posts.length){
            console.log(posts[0])
            resolve(posts[0])
        }else{
            reject()
        }
    })
}

Post.findByAuthorId = function(authorId){
    return new Promise(async (resolve, reject)=>{
        let posts = await postsCollection.find({author: new ObjectID(authorId)}).toArray();
        console.log(posts)
        resolve(posts)
    })
}

module.exports = Post