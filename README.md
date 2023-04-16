# ssb-relay

An SSB pub server that works with [Delog](https://github.com/ssb2dmba/delog).

## build

```
USER=$(id -u) GROUP=$(id -g) docker-compose build
```

## run

You must create two directory owned by your user :
```
mkdir pgdata
mkdir .ssb
```
copy config.exampe to ~/.ssb/ and edit your domain name 
also in docker-compose.yaml edit your domain name, 
set the same DB credential in both files
```
USER=$(id -u) GROUP=$(id -g) docker-compose up
```
