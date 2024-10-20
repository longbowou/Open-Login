import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const region = 'us-east-2'

const dynamoDbClient = new DynamoDBClient({region});

const DYNAMO_TABLE_NAME = 'ProjectOpen';
const JWT_SECRET = process.env.JWT_SECRET;

export const handler = async (event) => {
    try {
        const {
            email,
            password,
        } = JSON.parse(event.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({message: 'All fields are required'}),
            };
        }

        const getParams = {
            TableName: DYNAMO_TABLE_NAME,
            Key: {email: {S: email}},
        };

        const existingUser = await dynamoDbClient.send(new GetItemCommand(getParams));
        if (!existingUser.Item) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({errors: [{field: "email", message: "Account not found."}]}),
            };
        }

        console.log(existingUser.Item)
        if (!bcrypt.compareSync(password, existingUser.Item.password.S)) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({errors: [{field: "password", message: "Incorrect password."}]}),
            };
        }

        const authToken = jwt.sign(
            {id: existingUser.Item.id, email: existingUser.Item.email},
            JWT_SECRET,
            {expiresIn: '24h'}
        );

        const user = {
            id: existingUser.Item.id.S,
            name: existingUser.Item.name.S,
            email: existingUser.Item.email.S,
            address: existingUser.Item.address.S,
            imageUrl: existingUser.Item.imageUrl.S,
            createdOn: existingUser.Item.createdOn.S,
        };

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                errors: [],
                user,
                authToken,
            }),
        };
    } catch (error) {
        console.error('Error login user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({message: 'Internal Server Error'}),
        };
    }
};