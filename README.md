# Backend Coding Exercise Project

This project implements an integration system for AI messaging, it has a webhook handler that handles incoming job application events creating new conversations and exposes endpoints for retrieving conversations.

It is developed using TypeScript, Node.js, Express, PostgreSQL, and Prisma ORM. It uses Mocha/Chai for testing.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Docker and Docker Compose
- Git
- Node.js (v14 or later)
- Yarn

## Getting Started

1. Clone this repository.

2. Install dependencies:
   ```
   yarn install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```
   POSTGRES_PASSWORD=your_postgres_password
   DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@localhost:5432/postgres
   API_TOKEN=your_api_token
   ```
   Note: The `DATABASE_URL` format is `postgresql://username:password@host:port/database_name`

4. Start the PostgreSQL database using Docker:
   ```
   docker-compose up -d db
   ```

5. Run database migrations and generate Prisma client:
   ```
   yarn prisma:migrate:deploy
   ```

6. Start the development server:
   ```
   yarn dev
   ```
   
7. You can run the tests using:
    ```
   yarn test
    ```

The application should now be running at `http://localhost:3000`. 
You can verify this by accessing the health check endpoint at `http://localhost:3000/api/status`.
The list of available endpoints can be found in `src/routes/index.ts`.

## Available Scripts

- `yarn start`: Run the production build
- `yarn dev`: Start the development server with hot-reloading
- `yarn build`: Build the project using Webpack
- `yarn build:start`: Build and start the Docker containers
- `yarn prisma:generate`: Generate Prisma client
- `yarn prisma:migrate`: Run Prisma migrations in development (also generates the client)
- `yarn prisma:migrate:deploy`: Run Prisma migrations in production (also generates the client)
- `yarn prisma:studio`: Open Prisma Studio for database management
- `yarn test`: To run the test suites

## API Endpoints

1. `GET api/status` returns a simple health check string
2. `GET api/conversations` returns all the conversations
3. `GET api/conversations/:id` returns a single conversation with the given id.
4. `GET api/conversations/:status` filters the conversations by status
5. `POST api/webhook/job-application` handles incoming job events creating new conversations after validation.

Sample payload for the webhook handler

```json
{
  "id": "application-i136",
  "job_id": "associated-job-i136",
  "candidate_id": "candidate-i136",
  "candidate": {
    "phone_number": "+1234567890",
    "first_name": "John",
    "last_name": "Doe",
    "email_address": "john.doe@example.com"
  }
}
```

## Database Schema

The project uses Prisma ORM with a PostgreSQL database. Here's an overview of the main models:

### Conversation

- Fields: `id`, `candidateId`, `jobId`, `status`, `createdAt`, `updatedAt`
- Status can be: `CREATED`, `ONGOING`, `COMPLETED`
- Unique constraint on `candidateId` and `jobId` combination

### Candidate

- Fields: `id`, `phoneNumber`, `firstName`, `lastName`, `emailAddress`
- Has a one-to-many relationship with `Conversation`

For the full schema details, refer to the `prisma/schema.prisma` file in the project.



