#!/bin/sh

ifdown wlan0

SSID="$1"
PASS="$2"

cat << EOF > /etc/wpa_supplicant/wpa_supplicant.conf
auto wlan0
iface wlan0 inet dhcp
  wpa-ssid "$SSID"
  wpa-psk "$PASS"
EOF

ifup wlan0