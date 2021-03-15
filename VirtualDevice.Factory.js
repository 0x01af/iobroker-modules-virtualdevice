// https://forum.iobroker.net/topic/19170/nochmal-globale-variable/7?_=1615638263301&lang=de

const tasmota = require("./VirtualDevice.tasmota");
const zigbee2mqtt = require("./VirtualDevice.zigbee2mqtt");

const VirtualDevice = { tasmota, zigbee2mqtt };

module.exports = {
    createVirtualDevice(namespace, object) {
        const VirtualDeviceNamespace = VirtualDevice[type];
		
		return new VirtualDeviceNamespace(object);
    }
};