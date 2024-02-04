---
layout: home
title: ssb-relay: A SecureScuttlebut (SSB) home server
---
A Secure Scuttlebutt (SSB) relay server is an entry point for accessing the SSB network. It is an instance that operates the Secret Handshake and SSB protocol. Plus some SSB Protocol Improvements Proposals aimed at making the network useful and friendly.
Users can register on one or more shared instances.

## How to Install?

### Individually

Get the latest release from [ssb2dmba/ssb-relay](
https://github.com/ssb2dmba/ssb-relay)


### From a Debian Repository

Download the [public key](dmba.gpg) and put it in
`/etc/apt/keyrings/dmba.gpg`. You can achieve this with:

- Debian:
```
wget -qO- https://ssb2dmba.github.io/ssb-relay/dmba.pgp | sudo tee /usr/share/keyrings/dmba.pgp >/dev/null
echo "deb [arch=all signed-by=/usr/share/keyrings/dmba.pgp] https://ssb2dmba.github.io/ssb-relay/dist stable main" | sudo tee /etc/apt/sources.list.d/dmba.list >/dev/null
```

- Ubuntu:
```
wget -qO- {{ site.url }}/dmba.asc | sudo tee /etc/apt/keyrings/dmba.asc >/dev/null
echo "deb [arch=all signed-by=/etc/apt/keyrings/dmba.asc] https://ssb2dmba.github.io/ssb-relay/dist stable main" | sudo tee /etc/apt/sources.list.d/dmba.list >/dev/null
```

Next, create the source in `/etc/apt/sources.list.d/`

```
echo "deb [arch=all signed-by=/etc/apt/keyrings/dmba.asc] https://ssb2dmba.github.io/ssb-relay/dist stable main" | sudo tee /etc/apt/sources.list.d/dmba.list >/dev/null
```

Then run `apt update && apt install -y` and the names of the packages you want to install.



### The packages you can install

Currently these are:

* ssb-relay



## How to contribute?

Please contribute changes and bug reports in the relevant repository above.

Have a security issue? Please email [Emmanuel Florent](mailto:emmanuel.florent@gmail.com) with details.

Have your own feature? Please create a 
[pull request on this repository](https://github.com/ssb2dmba/ssb-relay/pulls).

## Related

You might find [this website](https://dmba.info) useful.

## Thanks

This software would not have been possible without the SSB community.