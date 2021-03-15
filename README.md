# iobroker-modules-virtualdevice

## Introduction

* VirtualDevice.Main.js: Main application (script), which needs to be imported in ioBroker JavaScript adapter
* VirtualDevice.Factory.js: creates new VirtualDevice instance based on Namespaces
* VirtualDevice.tasmota.js: VirtualDevice 'class' of namespace tasmota
* VirtualDevice.zigbee2mqtt.js: VirtualDevice 'class' of namespace zigbee2mqtt

## Installation
1. create directory /etc/iobroker/iobroker-data/modules_virtualdevice/
2. change working directory to /etc/iobroker/iobroker-data/modules_virtualdevice/
3. git clone git@github.com:0x01af/iobroker-modules-virtualdevice.git
4. Create new script VirtualDevice.Main.js within ioBroker JavaScript-Adapter, paste content auf VirtualDevice.Main.js, configure your device types, and let the script run.

# Further readings
- File path of JavaScript modules: https://forum.iobroker.net/topic/19170/nochmal-globale-variable/13?_=1615653501532&lang=de
- Short introduction to Factory Pattern with JavaScript: https://medium.com/@thebabscraig/javascript-design-patterns-part-1-the-factory-pattern-5f135e881192
