
// Tasmota: object.prefix.channel = { state: value; state: value }

// VirtualDeviceTasmota:Constructor
function VirtualDeviceTasmota (object) {
 // sanity check
 if (typeof object !== 'object') {
   log('VirtualDeviceTasmota:Constructor() - sanity check failed, no device created', 'warn');
   return;
 }
 this.original = object;

};

// read from device (translate MQTT to VirtualDevice)
VirtualDeviceTasmota.prototype.read = function (property) {
/* read:
mqtt.0.tasmota.sonoff_powr2_sw002.tele.SENSOR =
{"Time":"2021-03-13T12:53:11","ENERGY":{"TotalStartTime":"2021-03-07T18:47:11","Total":0.404,"Yesterday":0.000,"Today":0.404,"Period":0,"Power":0,"ApparentPower":0,"ReactivePower":0,"Factor":0.00,"Voltage":232,"Current":0.000}}
*/
}

// write to device (translate VirtualDevice to MQTT)
VirtualDeviceTasmota.prototype.write = function (property, value) {
}

module.exports = VirtualDeviceTasmota;