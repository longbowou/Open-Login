import {DynamoDBClient, ScanCommand} from "@aws-sdk/client-dynamodb";
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

        const scanParams = {
            TableName: DYNAMO_TABLE_NAME,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': {S: email}
            }
        };

        const data = await dynamoDbClient.send(new ScanCommand(scanParams));
        console.log(data)
        if (data.Count === 0) {
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

        const existingUser = data.Items[0]
        if (!bcrypt.compareSync(password, existingUser.password.S)) {
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
            {id: existingUser.id.S, email: existingUser.email.S},
            JWT_SECRET,
            {expiresIn: '24h'}
        );

        const user = {
            id: existingUser.id.S,
            name: existingUser.name.S,
            email: existingUser.email.S,
            address: existingUser.address.S,
            imageUrl: existingUser.imageUrl.S,
            createdOn: existingUser.createdOn.S,
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