// CredHub
// Server to input data into MongoDB
// MongoDB used to store mock data for UW and WYOID

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const csv = require('csv-parser');
const fs = require('fs');

const uri = "mongodb+srv://credhub57:CredHub*2024@credhub.dglqyvp.mongodb.net/?retryWrites=true&w=majority&appName=CredHub";

const app = express();
const port = 3000;

app.use(bodyParser.json());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Could not connect to MongoDB:', error);
        process.exit(1);
    }
}

app.get('/', (req, res) => {
    res.send('Welcome to the Account Management API!');
});

app.post('/addAccount', async (req, res) => {
    try {
        const accountsCollection = client.db("UWDegree").collection("DegreeData");

        // Read data from the CSV file
        fs.createReadStream('degreeData.csv') 
            .pipe(csv())
            .on('data', async (row) => {
                try {
                    // Insert data into MongoDB
                    const result = await accountsCollection.insertOne(row);
                    console.log(`Account inserted with ID: ${result.insertedId}`);
                } catch (error) {
                    console.error('Error adding account:', error);
                }
            })
            .on('end', () => {
                console.log('All accounts inserted');
                res.status(201).send({ message: 'All accounts inserted successfully' });
            });
    } catch (error) {
        console.error('Error processing CSV file:', error);
        res.status(500).send({ message: 'Failed to process CSV file' });
    }
});

app.listen(port, async () => {
    await connectToMongo();
    console.log(`Server running on port ${port}`);
});
