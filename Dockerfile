FROM node:16


WORKDIR /usr/src/app/
RUN git clone https://github.com/ssb2dmba/ssb-postgres.git
RUN cd ssb-postgres && npm install

WORKDIR /usr/src/app/ssb-relay

COPY packag*.json .

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "./dist/index.js"]
