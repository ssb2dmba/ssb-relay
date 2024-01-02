#!/bin/sh
# sudo /sbin/ifconfig wlan0 up
sudo /sbin/iw dev wlan0 scan | grep SSID | awk -F: '{ print $2 }'