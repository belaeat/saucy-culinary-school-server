const express = require('express');
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())

// mongodb connection

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrgajyt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const cartCollection = client.db("saucyDb").collection("cart")

        // cartCollection api's
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([])
            }
            const query = { email: email }
            // console.log(email)
            const result = await cartCollection.find(query).toArray()
            res.send(result)
        })


        app.post('/carts', async (req, res) => {
            const item = req.body
            console.log(item)
            const result = await cartCollection.insertOne(item)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// getting server response

app.get('/', (req, res) => {
    res.send('Culinary School is on')
})

app.listen(port, () => {
    console.log(`Saucy Culinary is running on port ${port}`)
})