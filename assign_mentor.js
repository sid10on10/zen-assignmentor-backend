// importing packages
const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb")
const cors = require("cors")

// defining variables
const app = express();
const PORT = process.env.PORT || 8080;
const mongoClient = mongodb.MongoClient;
const url = "mongodb+srv://siddhant:qwerty123@cluster0.fqer8.mongodb.net/<dbname>?retryWrites=true&w=majority";

app.use(bodyParser.json())
app.use(cors({
    origin:"http://127.0.0.1:5500"
}))

app.get("/",function(req,res){
    res.write("<h1>You are at Root of API <br> Endpoints are -----> /students /teachers <h1>")
    res.end()
})

app.post("/students",async function(req,res){
    let client;
    try{
        client = await mongoClient.connect(url)
        let db = client.db("assignmentor")
        let insertedStudent = await db.collection("students").insertOne({
            name:req.body.name,
            mentorId:null
        })
        client.close()
        res.json({
            message:"Student Created",
            id:insertedStudent.insertedId
        })
        res.end()
    }catch(error){
        client.close()
        console.log(error)
    }
})

app.post("/mentors",async function(req,res){
    let client;
    try{
        client = await mongoClient.connect(url)
        let db = client.db("assignmentor")
        let insertedTeacher = await db.collection("teachers").insertOne({
            name:req.body.name,
            students:[]
        })
        client.close()
        res.json({
            message:"Mentor Created",
            id:insertedTeacher.insertedId
        })
        res.end()
    }catch(error){
        client.close()
        console.log(error)
    }
})

app.get("/students",async function(req,res){
    let client;
    try{
        client = await mongoClient.connect(url)
        let db = client.db("assignmentor")
        let students = await db.collection("students").find().toArray()
        client.close()
        res.json(students)
        res.end()
    }catch(error){
        client.close()
        console.log(error)
    }
})

app.get("/mentors",async function(req,res){
    let client;
    try{
        client = await mongoClient.connect(url)
        let db = client.db("assignmentor")
        let students = await db.collection("teachers").find().toArray()
        client.close()
        res.json(students)
        res.end()
    }catch(error){
        client.close()
        console.log(error)
    }
})

app.post("/mentors/:mentorname",async function(req,res){
    let client;
    try{
        client = await mongoClient.connect(url)
        let db = client.db("assignmentor")
        let mentor = await db.collection("teachers").findOne({name:req.params.mentorname})
        let mentorid = mentor._id
        let studentarr = mentor.students
        for(each_stud of req.body.students){
            let student = await db.collection("students").findOne({name:each_stud})
            let studentid  = student._id
            studentarr.push(studentid)
            await db.collection("students").findOneAndUpdate({name:each_stud},{$set:{mentorId:mentorid}})
        }
        await db.collection("teachers").findOneAndUpdate({name:req.params.mentorname},{$set:{students:studentarr}})
        res.json({
            message:"Mentor Assigned",
            mentorID:mentorid
        })
        res.end()
        client.close()
    }catch(error){
        client.close()
        console.log(error)
    }
})

app.post("/changementor",async function(req,res){
    let client;
    try{
        client = await mongoClient.connect(url)
        let db = client.db("assignmentor")
        let mentor = await db.collection("teachers").findOne({name:req.body.mentor})
        let student = await db.collection("students").findOne({name:req.body.student})
        let studentid  = student._id
        let mentorid = mentor._id
        await db.collection("students").findOneAndUpdate({name:req.body.student},{$set:{mentorId:mentorid}})
        await db.collection("teachers").findOneAndUpdate({name:req.body.mentor},{$push:{students:studentid}})
        client.close()
        res.json({
            message:"Succesfully Changed"
        })
    }catch(error){
        client.close()
        console.log(error)
    }
})

app.get("/students/:mentorname",async function(req,res){
    let client;
    try{
        client = await mongoClient.connect(url)
        let db = client.db("assignmentor")
        let mentor = await db.collection("teachers").findOne({name:req.params.mentorname})
        let students = mentor.students
        let outarr = []
        for(each of students){
            let student = await db.collection("students").findOne({_id:mongodb.ObjectID(each)})
            let name = student.name
            outarr.push(name)
        }
        res.json(outarr)
        client.close()
        res.end()
    }catch(error){
        client.close()
        console.log(error)
    }
})


app.listen(PORT,()=>{
    console.log("Server is running")
})