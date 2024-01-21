# ssb-relay

An SSB pub server that works with [Delog](https://github.com/ssb2dmba/delog).

## build Debian package

```
cd deb-install
./make-pkg.sh main
```


## install
```
apt-get install postgresql, nginx, nodejs, libsodium23, coreutils, bash, tor, libsecp256k1-1
dpkg -i ssb-relay_$version_all.deb
```

ssb-relay over onion with namecoin companion is now setup.
