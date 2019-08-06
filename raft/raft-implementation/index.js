const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fetch = require('node-fetch');
let nodeURIsArray = new Array();
const CurrentNodeURI = process.argv[3];


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

/**
 * Test
 * get Data
 */

app.get('/get-data',function(req,res,next){
    res.send(nodeURIsArray)
})

/**
 * This APi used to form blockchain network
 * register new instance with the running instance
 * @param instanceURI is the IP of newly added instance eg: `http://localhost:8002`
 */
app.post('/register/instance',function(req,res){
    if(CurrentNodeURI !==  req.body.nodeURI){
        if(!nodeURIsArray.includes(req.body.nodeURI)){
            nodeURIsArray.push(req.body.nodeURI)
        }
    }
    console.log("1------nodeURIsArray------",nodeURIsArray)
    console.log('1------CurrentNodeURI------',CurrentNodeURI)
    res.send('Success Instance Added')
})

/**
 * This API is used to broadcast newly added instance to each other instance in the network
 * Mechanism would be: First send the incoming request URI to each other instances using `fetch-API` and the 
 * other instances register those intanceURI to their network basically in `foreignInstanceURI`
 * Next register all other instance URI with the new instance using `/register/otherInstance/newInstance`
 */
app.post('/register/broadcast/instance',function(req,res){
    try{
        const body = {
            nodeURI: req.body.nodeURI
        }
        /**
         * check if newly instanceURI is already present or not
         */
        if(!nodeURIsArray.includes(req.body.nodeURI)){
            nodeURIsArray.push(req.body.nodeURI)
        }
        let allRequest = []
        /**
         * Broadcast each and every other instance in the network that new instance is invoked
         * so that they can copy this newly instantiated instance by using `/register/instance` API 
         */
        nodeURIsArray.forEach(nodeURI=>{
            const options = {
                method: 'POST',
                body:    JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
                json: true
            }
            //fetch(instanceURI+'/register/instance', options);
            allRequest.push(fetch(nodeURI+'/register/instance', options))
        })
        /**
         * Register all other instance IP to newly Intantiated instance
         * Copy all the `foreignInstanceURI` and take `localInstanceURI` and send it to the new instance 
         * so that it can link with every other instance 
         */
        Promise.all(allRequest).then(data=>{
            const option = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({allIntantiatedInstances: [...nodeURIsArray, CurrentNodeURI]}),
                json: true
            }
            return fetch(req.body.nodeURI+ '/register/other-node/new-node', option)
        })
        .then(data=>{
            console.log("2------nodeURIsArray------",nodeURIsArray)
            console.log('2------CurrentNodeURI------',CurrentNodeURI)
            res.send('Success')
        })
    }catch(err){
        throw err;
    }
    
})

/**
 * This API will push other instanceURI to current instance `foreignInstanceURI`
 */
app.post('/register/other-node/new-node',function(req,res){
    let data = req.body.allIntantiatedInstances
    for(let i=0; i<data.length; i++){
        if(nodeURIsArray.includes(data[i]) && nodeURI !== data[i]){
            nodeURIsArray.push(data[i])
        }
    }
    console.log("3------nodeURIsArray------",nodeURIsArray)
    console.log('3------CurrentNodeURI------',CurrentNodeURI)
    res.send('register otherInstance success')
})



app.listen(process.argv[2], function(){
    console.log(`BlockchainServer listening on port...${process.argv[2]}`)
})
