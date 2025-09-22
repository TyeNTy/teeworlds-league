# Teeworlds League


## Setup

### Docker Compose (recommended)
You need to have docker & docker-compose installed on your pc.

Then just run the following command in the root of the project :

```bash
docker-compose up
```

You can then access the app at http://localhost:3000 and the api at http://localhost:8080

You can easily open two terminals in the running containers with the following two commands (execute them in two different terminals):
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


Then hf ! :)

See you ingame !
Cheers, TNT

## Contributions welcome

P.S. : all feedbacks and PRs are welcomed, feel free !!