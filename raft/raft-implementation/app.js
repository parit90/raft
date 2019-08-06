const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fetch = require('node-fetch');
const grpc = require('grpc')
const notesProto = grpc.load('notes.proto')
let nodeURIsArray = new Array();
const CurrentNodeURI = process.argv[3];
// const server = new grpc.Server()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
// const notes = [
//     { id: '1', title: 'Note 1', content: 'Content 1'},
//     { id: '2', title: 'Note 2', content: 'Content 2'}
// ]

// server.addService(notesProto.NoteService.service, {
//     list: (_, callback) => {
//         callback(null, notes)
//     },
// })

app.post('/register/node',function(req,res,next){
    if(!nodeURIsArray.includes(req.body.nodeURI)){
        nodeURIsArray.push(req.body.nodeURI)
        nodeURIsArray.push(CurrentNodeURI)
    }
    console.log('nodeURIsArray',nodeURIsArray)
})

app.listen(process.argv[2], function(){
    console.log(`BlockchainServer listening on port...${process.argv[2]}`)
})
// server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure())
// console.log('Server running at http://127.0.0.1:50051')
// server.start()