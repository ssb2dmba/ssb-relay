FROM node:16

ARG USER_ID
ARG GROUP_ID

RUN userdel -f node &&\
    if getent group node ; then groupdel node; fi &&\
    groupadd -g ${GROUP_ID} node &&\
    useradd -l -u ${USER_ID} -g node node &&\
    install -d -m 0755 -o node -g node /home/node

WORKDIR /app
RUN git clone https://github.com/ssb2dmba/ssb-postgres.git
RUN cd ssb-postgres && npm install

WORKDIR ssb-relay

COPY package.json .

RUN npm install

COPY . .

RUN npm run build
USER node
CMD ["node", "./dist/index.js"]
