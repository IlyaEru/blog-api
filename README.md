# Blog API

## Description

This is the backend for a blog application. It is a REST API that allows users to create, read, update and delete blog posts. It also allows users to create, read, update and delete comments on blog posts.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have Node.js and npm (Node Package Manager) installed on your machine. You can download and install them from the official website (https://nodejs.org/en/).

### Installing

1. Clone the repository to your local machine

```sh
git clone https://github.com/IlyaEru/blog-api.git
```

2. Install NPM packages

```sh
npm install
```

or

```sh
yarn install
```

or (my favorite)

```sh
pnpm install
```

3. Create a .env file in the root directory of the project with the environment variables, like the .env.example file

4. Run the app

```sh
npm start
```

or for development

```sh
npm run devstart
```

The application will now be running on http://localhost:3000.

## Built With

#### Production

- Express - Web framework for Node.js
- MongoDB - NoSQL database
- Mongoose - MongoDB object modeling tool
- Helmet - Security middleware
- Bcryptjs - Password hashing
- Jsonwebtoken - Authentication
- Passport - Authentication middleware
- Dotenv - Environment variables

#### Development

- TypeScript - Typed superset of JavaScript
- Jest - JavaScript testing framework
- Mongodb-memory-server - MongoDB in-memory server for testing
- Supertest - HTTP assertions for testing
- Nodemon - Development server
- Faker - Generate fake data

## Testing

To run the tests, run the following command

```sh
npm test *
```
