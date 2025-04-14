# FETCH RECEIPT PROCESSOR

Webservice to calculate the reward points based on receipt

# Installation

Clone the git repository.

## Docker installation and execution procedure.

#### STEP-1: Install docker

install docker if you don't have already installed on your local machine -> [LINK](https://docs.docker.com/get-started/get-docker/)

#### STEP-2: spin up the container

spin up the docker, for which open the command line where the dockerfile exists <br>
and excute the below command in your shell.

```bash
docker build . -t chinmay/fetch-web-server:v1
```

###### explaination:

`docker build` will create the container, <br>
`-t` is the tag by which it will be identified, <br>
`.` use it in the current directory <br>
`chinmay/fetch-web-server:v1` the name of docker image (`v1` states that it's the first version)

By now you should be able to see that you have a new image in your docker desktop.

#### STEP-3: Run the container

write the below command

```bash
docker run -d -p 8080:8080 chinmay/fetch-web-server:v1
```

###### explaination:

`docker run` to execute a particular docker container, <br>
`-d` to run in detached mode so that we can run the container in the background <br>
`-p` the port that it will map to, `8080` that is 8080 <br>
`chinmay/fetch-web-server:v1` name of the container <br>

## Local nodejs server

#### STEP-1: Installation

open terminal in the folder after cloning the repository <br>

```bash
nvm -v #nvm version 22 and up will be ideal.
```

if didn't find, nvm install it. [LINK](https://nodejs.org/en/download)

```bash
npm install
```

#### STEP-2: execute the program

```bash
npm start
```

# Language selected: Javascript

I am still learning golang, I find JavaScript's familiarity allows me to write code effectively.

# API summary
