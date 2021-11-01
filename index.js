const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


// Middle Ware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2tgv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("online_shop");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        // GET products API
        app.get('/products', async (req, res) => {
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
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products
            });
        });

        // use POST to get products by keys
        app.post('/products/byKeys', async (req, res) => {
            console.log(req.body);
            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();
            res.json(products);
        });

        // Order post

        app.get('/orders', async (req, res) => {
            let query = {};
            const email = req.query.email;

            if (email) {
                query = {email: email}
            }
            const cursor = orderCollection.find(query);

            console.log(query)

            const result = await cursor.toArray();
            res.json(result);
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            order.createdAt = new Date();
            // console.log(order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Ema john is running on the server side..')
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});