# Tunix CRM Backend

Tunix is a fusion of the words "Tune" and "Fix", centralized around the idea of corrective exercise as means of building consistent strength. Tunix is a CRM application geared towards health and fitness, where our goal is to empower coaches and their clients through one data-driven hub. Some of the common headaches that coaches often face on a daily basis include:
- Scattered information: A lot of their client histories, program PDFs, and video links get scattered, preventing them from doing the creative planning process.
- Manual Scheduling: Coaches have to text or message their clients in order to set up sessions, even more so having to confirm.
- Progress blind spots: there exists no single dashboard for coaches to view their client's progress, often relying on anectodal evidence
- Exercise Clarity: Clients often face difficulties hunting through PDFs for demo links and clarifications, making workouts cumbersome

Tunix was built with a specific clientele in mind:

1. Coaches who have a multi modal approach to the body, offering an array of mobility and flexibility services on top of regular strength training and other fitness goals. Tunix provides them an integrated coaching workflow that consolidates their tooling
2. Clients that want a streamlined experience and a robust way of tracking their progress without too much logisitical friction with their coach


This is the backend monorepo of the application and is connected through the following:
- DB: Supabase
- JS Framework: NestJS

To run the application, you need an .env file at the root, please reach out to [@JCelestial](https://github.com/JCelestial) for more information.

The monorepo manages libraries using [Yarn](https://yarnpkg.com/)

```js
yarn install // downloads all of your dependencies
```

To run
```js
yarn start // to start the application detached
yarn dev // to start the application while watching
```