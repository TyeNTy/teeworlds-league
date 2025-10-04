# Teeworlds League


## Setup

### Docker Compose (recommended)
You need to have docker & docker-compose installed on your pc.

Then just run the following command in the root of the project :

```bash
docker-compose up
```

Open two other terminals, one for the API and one for the APP, and run the following commands in each terminal :
```bash
docker-compose exec api npm run dev
```

```bash
docker-compose exec app npm run dev
```

You can then access the app at http://localhost:3000 and the api at http://localhost:8080

You can also open terminals in the running containers with the following two commands:
```bash
docker-compose exec api sh
docker-compose exec app sh
```

### Manual Setup

Install MongoDB, and a service should be running on you pc for you local db. You can change port & db name from the .env file.
Install node & npm (latest versions should work, my current config is : node v20.10.0, npm: 10.2.3)

For API :

```bash
cd api
npm i
```

For APP :
```bash
cd app
npm i
```

### Running the project

Add a `.env` file in the API directory.
For dev, you can copy paste the .env.example, it should work:

```
cp api/.env.example api/.env
```

Then start the API and the APP with `npm run dev` in each terminal.

Now, you need to initialize the database with an admin user and some default config.
To do so, you can use the following docker compose commands:

```bash
docker-compose exec api node src/scripts/createAdmin.js
docker-compose exec api node src/scripts/initSeasons.js
```



Then hf ! :)

See you ingame !
Cheers, TNT

## Contributions welcome

P.S. : all feedbacks and PRs are welcomed, feel free !!