const express = require('express');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())

// mongodb connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        const usersCollection = client.db("saucyDb").collection("users")
        const classesCollection = client.db("saucyDb").collection("classes")
        const instructorsCollection = client.db("saucyDb").collection("instructors")
        const cartCollection = client.db("saucyDb").collection("cart")

        // JWT
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })

        // users API's
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            console.log("existing user", existingUser);
            if (existingUser) {
                return res.send({ message: 'User already exist!' })
            }
            else {
                const result = await usersCollection.insertOne(user);
                res.send(result);
            }

        })

        // make admin API
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        // popular classes API
        app.get('/popularClasses', async (req, res) => {
            const query = {};
            const options = {
                sort: { students: -1 },
            };

            const limit = parseInt(req.query.limit) || 6;
            const skip = parseInt(req.query.skip) || 0;
            const result = await classesCollection.find(query, options).limit(limit).skip(skip).toArray()
            res.send(result)
        })

        // popular classes API
        app.get('/popularInstructors', async (req, res) => {
            const query = {};
            const options = {
                sort: { students: -1 },
            };

            const limit = parseInt(req.query.limit) || 6;
            const skip = parseInt(req.query.skip) || 0;
            const result = await instructorsCollection.find(query, options).limit(limit).skip(skip).toArray()
            res.send(result)
        })

        // classes API
        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray()
            res.send(result)
        })

        // instructors API
        app.get('/instructors', async (req, res) => {
            const result = await instructorsCollection.find().toArray()
            res.send(result)
        })

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

        // cart item delete API
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query)
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