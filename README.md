# Node + Typescript Monorepo Starter

A boilerplate for a microservice monorepo built with Node.js and Typescript.
Opinionated towards AWS, Serverless, and GraphQL, it provides ESLint, Prettier,
and Jest configurations out of the box.

## Getting Started

1. Clone the repo:

```bash
git clone url
```

2. Install dependencies:

```bash
npm install
```

## Adding A Service

Adding a service can be done one of two ways:

1. Navigating to the packages directory, creating a directory, and running

   ```bash
   npm init -y
   ```

or

2. Running the following command:

```bash
npm init -w ./packages/{SERVICE_NAME} -y
```
