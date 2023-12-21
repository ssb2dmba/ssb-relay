# ssb-relay

## build Debian package

```
./make-pkg.sh main
```


## install

### rasbian

```
apt-get install postgresql nginx nodejs libsodium23 coreutils bash tor libsecp256k1-1
```

### ubuntu

```
apt-get install postgresql nginx nodejs libsodium23 coreutils bash tor libsecp256k1-1
dpkg -i ssb-relay_$version_all.deb
```