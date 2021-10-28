const express = require('express');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


// Middle Ware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2tgv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run (){
    try{
        await client.connect();
        const database = client.db("online_shop");
        const productCollection = database.collection("products");

        // GET API
        app.get('/products', async(req, res)=>{
            const cursor = productCollection.find({});
            // console.log(req.query);
            const page = req.query.page;
            const size = parseInt(req.query.size);
            // console.log(page, size)
            // console.log(typeof(page))
            // console.log(typeof(size))
            let products;
            const count = await cursor.count();
            if (page) {
                products = await cursor.skip(page*size).limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }
            
            res.send({
                count,
                products
            });
        })
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('Ema john is running on the server side..')
});

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
});