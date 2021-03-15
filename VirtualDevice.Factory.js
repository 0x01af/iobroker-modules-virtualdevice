/*
 * VirtualDevice.Factory
 * author: Olaf Sonderegger (github.com/0x01af)
 *
 * Notes:
 * - https://forum.iobroker.net/topic/19170/nochmal-globale-variable/7?_=1615638263301&lang=de
 */
const tasmota = require("./VirtualDevice.tasmota");
const zigbee2mqtt = require("./VirtualDevice.zigbee2mqtt");

const VirtualDevice = { tasmota, zigbee2mqtt };

module.exports = {
  /*
   * VirtualDevice.Factory:createVirtualDevice(namespace, object)
   * - namespace: Namespace of the ioBroker object (tasmota or zigbee2mqtt)
   * - object: ioBroker object for which VirtualDevice will be created
   */
  createVirtualDevice(_ns, _obj) {
    const VirtualDeviceNamespace = VirtualDevice[_ns];
    return new VirtualDeviceNamespace(_obj);
  }
};
