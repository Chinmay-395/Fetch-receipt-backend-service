FROM node:22.14.0-alpine3.20

#Create a app directory
WORKDIR /app

#Install app dependencies
COPY package*.json ./

#Run npm install
RUN npm install

#Bundle app souce
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]