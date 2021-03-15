/*
 * VirtualDevice.zigbee2mqtt
 * author: Olaf Sonderegger (github.com/0x01af)
 *
 * Notes:
 * - Zigbee2mqtt object representation within iobroker: object = { state: value; state: value }
 * - Discussion about function Constructor vs variable Constructor AND prototype vs function-in-function: https://stackoverflow.com/questions/4508313/advantages-of-using-prototype-vs-defining-methods-straight-in-the-constructor
 */

// VirtualDeviceZigbee2mqtt:Constructor
function VirtualDeviceZigbee2mqtt (object) {
 // sanity check
 if (typeof object !== 'object') {
   log('VirtualDeviceZigbee2mqtt:Constructor() - sanity check failed, no device created', 'warn');
   return;
 }
 this.original = object;
 
};

// read from device (translate MQTT to VirtualDevice)
VirtualDeviceZigbee2mqtt.prototype.read = function (property) {
}

// write to device (translate VirtualDevice to MQTT)
VirtualDeviceZigbee2mqtt.prototype.write = function (property, value) {
}

module.exports = VirtualDeviceZigbee2mqtt;
