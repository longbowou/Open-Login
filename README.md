# Open Login Lambda

This Lambda function facilitates secure user authentication by validating credentials against stored user data in
DynamoDB and generating a JWT (JSON Web Token) for authenticated users. It integrates password hashing with bcrypt for
enhanced security, ensuring that users’ credentials are safely processed. Here's a detailed breakdown of its core
functionality.

![Screenshot 2024-10-22 at 10.04.10 PM.png](screenshots/apigateway/Screenshot%202024-10-22%20at%2010.04.10%E2%80%AFPM.png)

## Key Highlights

- **Password Validation with Bcrypt**:
  Users’ passwords are stored in a hashed format using bcrypt. During login, the provided password is compared against
  the stored hash, ensuring that sensitive information remains encrypted and secure.

- **JWT Token Generation**:
  After successful authentication, the function generates a JWT token that can be used for subsequent API calls,
  ensuring the user is securely authenticated for a duration of 24 hours. This token includes the user’s ID and email
  for verification.

- **User Data Retrieval from DynamoDB**:
  The function queries DynamoDB to retrieve the user’s account details, confirming the user’s email and allowing
  seamless access to their profile information once they log in.

## How It Works

- **Input Validation**:
  The function first checks if both the email and password fields are provided. If either is missing, a clear error
  message is returned to guide the user.

- **User Lookup in DynamoDB**:
  Using the ScanCommand, the function searches DynamoDB for an account with the provided email address. If no account is
  found, the user is notified that the email is not registered.

- **Password Comparison**:
  If a user is found, bcrypt is used to compare the provided password with the hashed password stored in the database.
  If the passwords don’t match, an error message is returned indicating that the password is incorrect.

- **JWT Token Creation**:
  Once the user is authenticated, a JWT token is created using the user’s ID and email. The token is signed with the
  secret key (JWT_SECRET) and is set to expire in 24 hours, ensuring both security and ease of use for future API
  requests.

- **Response with User Data**:
  Upon successful login, the function returns the user’s profile information (name, email, address, image, and more)
  along with the authToken, allowing the user to access protected resources securely.

## Why This Lambda is Awesome

This Lambda function ensures a secure, seamless login experience by combining modern security standards like bcrypt for
password hashing and JWT for token-based authentication. It’s highly scalable, serverless, and efficient, ensuring fast
and secure login even under heavy user loads. This function forms the backbone of any secure, modern authentication
system, protecting user data while offering smooth, intuitive access to applications.

### What's next ?

Check the [main](https://github.com/longbowou/open-frontend) repository this one is part of.

## Screenshot

![Screenshot 2024-10-22 at 9.49.33 PM.png](screenshots/lambda/Screenshot%202024-10-22%20at%209.49.33%E2%80%AFPM.png)

## License

This project is licensed under the [MIT License](LICENSE).







