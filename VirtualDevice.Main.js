/*
 * ioBroker JavaScript VirtualDevice.Main
 * written by: Olaf Sonderegger (github.com/0x01af)
 * 
 * Description:
 * This ioBroker JavaScript acts as a translator between different MQTT clients and ioBroker object handling.
 * For each MQTT client, a object will be created with states corresponding to MQTT message content. Objects
 * will be called virtual devices. In addition, changeable states will trigger a MQTT message, which will be
 * interpretable by the MQTT client for setting something.
 * 
 * At the moment, following MQTT clients could be handled:
 * - ZigBee2MQTT
 * - Tasmota
 * 
 * TODOS:
 * - re-factoring script with usage of VirtualDevice Factory and Classes
 */
const VirtualDeviceFactory = require('../../../iobroker-data/modules_virtualdevice/VirtualDevice.Factory')
/*
 * Script-Basiskonfiguration:
 */
// ioBroker Instanz der relevanten Adapter JavaScript & MQTT
const ioAdapterJS = 'javascript.0'
const ioAdapterMQTT = 'mqtt.0'
const ioAdapterHistory = 'history.0'
const ioAdapterLovelace = 'lovelace.0'

// Configure, which Namespaces should be handled.
const namespaces = [ 'zigbee2mqtt', 'tasmota' ]

// ZigBee Base Topic (by default "zigbee2mqtt")
const zigbeeBaseTopic = 'zigbee2mqtt'
// ioBroker JavaScript Adapter: Namespace der Virtuellen Geräte Objekte
const namespaceVirtualDevices = ''


/*
 * Geräte-Basiskonfiguration:
 * Jeder Gerätetyp ist einzeln zu erfassen. Struktur ist verwandt wie bei VirtualDevice-Config.
 * 
 * common: {type: 'number', read: true, write: false, role: 'indicator', unit: '%', min: 'value', max: 'value'}
 * parameters - see: https://github.com/ioBroker/ioBroker.docs/blob/master/docs/en/dev/objectsschema.md
 * state.role - see https://github.com/ioBroker/ioBroker/blob/master/doc/STATE_ROLES.md
 * 
 * zigbee2mqtt bridge properties:
 * topic 'zigbee2mqtt/bridge/config'
 * payload '{"commit":"6b32f306", "coordinator": {
 *  "meta":{"maintrel":1,"majorrel":2,"minorrel":7,"product":1,"revision":20201026,"transportrev":2}
 *  "type":"zStack3x0"},
 *  "log_level":"info",
 *  "network":{"channel":15,"extendedPanID":"0xdddddddddddddddd","panID":6754},
 *  "permit_join":false,
 *  "version":"1.16.1"}'
 */ 
let deviceConfigs = {
    'test_sonoff_snzb-02': {
        namespace: 'zigbee2mqtt', // VirtualDevice.Factory->Namespace
        common: { role: 'sensor', }, // Ziel-Ordner der Objekt-Kopie (Root-Ordner ist ioAdapterJS + namespaceJS)
        native: { type: 'weather sensor', },
        states: {
            'temperature': {
                common: {type: 'number', read: true, write: false, role: 'value.temperature', unit: '°C'},
                enableHistory: true,
                enableLovelace: true,
            },
            'humidity': {
                common: {type: 'number', read: true, write: false, role: 'value.humidity', unit: '%'},
                modifyValue: function (val) { return (val+10); },
                enableHistory: true,
                enableLovelace: true,
            },
            'linkquality': {
                common: {type: 'number', read: true, write: false, role: 'indicator', unit: ''},
                enableLovelace: true,
            },
            'battery': {
                common: {type: 'number', read: true, write: false, role: 'value.battery', unit: '%'},
                enableLovelace: true,
            },
            'voltage': {
                common: {type: 'number', read: true, write: false, role: 'value.voltage', unit: 'V'},
            },
            'last_seen': {
                common: {type: 'string', read: true, write: false, role: 'date', unit: ''},
            },
        },
    },
    'test_sonoff_snzb-01': {
        namespace: 'zigbee2mqtt', // VirtualDevice.Factory->Namespace
        common: { role: 'button', },
        native: { type: 'button', },
        states: {
            'action': {
                common: {type: 'string', read: true, write: false, role: 'button', unit: 'pressed'},
            },
            'linkquality': {
                common: {type: 'number', read: true, write: false, role: 'indicator', unit: ''},
            },
            'battery': {
                common: {type: 'number', read: true, write: false, role: 'value.battery', unit: '%'},
            },
            'voltage': {
                common: {type: 'number', read: true, write: false, role: 'value.voltage', unit: 'V'},
            },
            'last_seen': {
                common: {type: 'string', read: true, write: false, role: 'date', unit: ''},
            },
        },
    },
    'test_sonoff_basiczbr3': {
        namespace: 'zigbee2mqtt', // VirtualDevice.Factory->Namespace
        common: { role: 'switch', },
        native: { type: 'switch', },
        states: {
            'state': {
                common: {type: 'string', read: true, write: true, role: 'switch.power', unit: ''},
                enableLovelace: true,
            },
            'linkquality': {
                common: {type: 'number', read: true, write: false, role: 'indicator', unit: ''},
                enableLovelace: true,
            },
            'last_seen': {
                common: {type: 'string', read: true, write: false, role: 'date', unit: ''},
            },
        },
    },
    'test_gledopto_gl-c-006': {
        namespace: 'zigbee2mqtt', // VirtualDevice.Factory->Namespace
        common: { role: 'switch.light', },
        native: { type: 'LED controller', },
        states: {
            'state': {
                common: {type: 'string', read: true, write: true, role: 'switch.light', unit: ''},
                enableLovelace: true,
            },
            'brightness': {
                common: {type: 'number', read: true, write: true, role: 'level.dimmer', unit: '', min: 0, max: 254},
                enableLovelace: true,
            },
            /*
            Mired color temperature:
            - 153 (blue, 6500K)
            - 500 (yellow, 2000K)
            https://de.wikipedia.org/wiki/Mired
            */
            'color_temp': {
                common: {type: 'number', read: true, write: true, role: 'level.color.temperature', unit: 'mired', min: 153, max: 500},
                enableLovelace: true,
            },
            /*
            Trigger effect on a device (e.g. bulb blinks)
            Zigbee2MQTT Supported: blink, breathe, okay, channel_change, finish_effect and stop_effect
            */
            'effect': {
                common: {type: 'string', read: true, write: true, role: 'state', unit: ''},
                enableLovelace: true,
            },
            'linkquality': {
                common: {type: 'number', read: true, write: false, role: 'indicator', unit: ''},
                enableLovelace: true,
            },
            'last_seen': {
                common: {type: 'string', read: true, write: false, role: 'date', unit: ''},
            },
        },
    },
    /*
    Gledopto GL-C-007-2ID
    {"brightness":0,"brightness_white":254,"last_seen":"2021-03-06T11:45:21+01:00","linkquality":42,"state_rgb":"OFF","state_white":"OFF"}
    */
    
    /*
    zigbee_cc2531_r001
    {"last_seen":"2021-02-14T16:42:53+01:00","led":false,"linkquality":48}
    */
}

//////////////////// Main Script ////////////////////
let objIDs = [];
let objWriteIDs = []; // TODO

var pathVirtualDevices = ioAdapterJS + (namespaceVirtualDevices.valueOf() !== '' ? '.' + namespaceVirtualDevices : '');

/*
 * Concept: Virtual Device structure at ioBroker
 *
 * # Aktueller Strukturbaum:
 * adapter.adapterInstance.deviceType.device.state
 * 
 * # ioBroker Strukturbaum (gem. https://www.iobroker.net/#de/documentation/dev/objectsschema.md):
 * adapter.adapterInstance.device.channel.state
 * - Jeder Datenpunkt muss durch ein Objekt vom Typ "state" dargestellt werden, das Metadaten für den Datenpunkt enthält.
 * - state - Datenpunkt - parent should be of type channel, device, instance or host
 * - channel - object to group one or more states. Parent should be device.
 * - device - object to group one or more channels or state. Should have no parent except adapter instance namespace.
 * 
 * # ioBroker JS-Controller (gem. https://github.com/ioBroker/ioBroker.js-controller#state-and-objects-databases-and-files)
 * - Objekte (objects) beinhalten Metadaten, Beschreibungen und Konfigurationswerte für alle Objekte und Datenpunkte. Objekte ändern sich kaum.
 * - Datenpunkte (states) speichern die echten Daten von Sensoren, Geräte und Objekte. Diese ändern sich laufend.
 * 
 * # Lovelace Adapter
 * - entities known by HASS: https://github.com/ioBroker/ioBroker.lovelace/blob/a7dff7ec1a79132ae0fb9aa55b277f3bf68d2b68/lib/server.js#L66
 * 
 * 
 * # SONOFF Adapter
 * Umsetzung:
 * - Objekte / Datenpunkte erstellen - https://github.com/ioBroker/ioBroker.sonoff/blob/80e551bff5d6eebafd21ffbe3d60ff616c8c6e8d/lib/server.js#L756
 * - Objekte / Datenpunkte detektieren - https://github.com/ioBroker/ioBroker.sonoff/blob/80e551bff5d6eebafd21ffbe3d60ff616c8c6e8d/lib/server.js#L1204
*/

/* Re-factoring part 1 - the virtual device factoring:
 * - old: get all ioBroker objects and find corresponding DeviceConfig
 * + new: get all DeviceConfig within current Namespace and find corresponding ioBroker objects
 * 
 * Discussion:
 * + Performance: selecting only ioBroker objects, which needs to be selected
 * + Performance: iterating once through DeviceConfig array instead number of ioBroker objects times
*/

/*
 * Part 1: The virtual device factoring
 */
// ====== Step 1: Iterate through MQTT namespaces
namespaces.forEach(function(_namespace) {

// ====== Step 2: select all well-known device-configs within MQTT namespace




// ====== Step 3: get all ioBroker objects within MQTT namespace based on well-known device-configs

  // https://github.com/ioBroker/ioBroker.javascript/blob/master/docs/en/javascript.md#---selector
  $("[id=" + ioAdapterMQTT + '.' + _namespace + ".*]").each(function (objID) {
    // eg. objID: mqtt.0.zigbee2mqtt.sonoff_snzb-02_s001
    // objDeviceType: everythin between the last dot and the last underscore
    // https://stackoverflow.com/questions/31262539/how-can-i-extract-text-from-the-middle-of-a-string-with-javascript
    var objDeviceType = objID.match(/([a-z0-9-_]+)_[a-z0-9]{4,7}$/i);
        
    if(objDeviceType && Object.keys(deviceConfigs).indexOf(objDeviceType[1]) >= 0){

		
// ====== Step 4: create/update the structure of corresponding Virtual Devices

        // Make a copy of device template
        let deviceCfg = deviceConfigs[objDeviceType[1]];

        if(deviceCfg.namespace !== _namespace) {
            log('Namespace of object do not match for device type: ' + objID, 'info');
            return;
        }

        if(!deviceCfg.hasOwnProperty('common')) deviceCfg.common = {};
        if(!deviceCfg.hasOwnProperty('native')) deviceCfg.native = {};

        // Define device-specific parameters
        deviceCfg.common.name = getObject(objID).common.name.replace(zigbeeBaseTopic + '/', '');

        // Create new virtual device (folder)
        var deviceID = pathVirtualDevices +
            (deviceCfg.namespace && deviceCfg.namespace !== '' ? '.' + deviceCfg.namespace : '') +
            '.' + deviceCfg.common.name;
        
        log('Creating object for virtual device ' + deviceID, 'debug');
        
        extendObject(deviceID, {
                type: "device",
                common: deviceCfg.common,
                native: deviceCfg.native
            },
            function (err) {
                if (err) {
                    log('Could not create object for virtual device: ' + deviceID, 'warn');
                    return;
                }
                log('Object has been created: ' + deviceID, 'debug');
            });
        
        // Create states of the new virtual device (state)
        // Iterate through any Device-Type-defined States
        for (let deviceState in deviceCfg.states) {
            var deviceStateID = deviceID + '.' + deviceState;

            if (!existsState(deviceStateID)){
                log('Creating device state: ' + deviceStateID, 'debug');

                // { type: 'state', } -> gesetzt durch createState()
                var deviceStateObj = { common: {}, native: {} };
                deviceStateObj.common.name = deviceCfg.common.name + '.' + deviceState;
                if (typeof deviceCfg.states[deviceState].common === 'object') {
                    deviceStateObj.common = Object.assign(deviceStateObj.common, deviceCfg.states[deviceState].common);
                }
                if (typeof deviceCfg.states[deviceState].native === 'object') {
                    deviceStateObj.native = Object.assign(deviceStateObj.native, deviceCfg.states[deviceState].native);
                }

                // Reset custom integrations
                deviceStateObj.common.custom = {};

                /*
                 * Activate lovelace integration for device state
                 * see: https://github.com/ioBroker/ioBroker.lovelace
                 * 
                 * Manuel mode:
                 * The type of entity must be provided and optionally the name of object.
                 * With this method only simple entities, like input_number, input_text or input_boolean could be created. It may not have more than one state or attribute.
                 * 
                 * Configurable in the GUI are:
                 * - editable/writable: input_number, input_text, input_boolean, input_select (list)
                 * - readable: sensor, switch, light, automation
                 */
                if(deviceCfg.states[deviceState].enableLovelace) {
                    deviceStateObj.common.custom[ioAdapterLovelace] = {
                        enabled: true,
                        entity: deviceCfg.common.role, // Set to device role for alle device states
/* BUG: entity: common.role doesn't work, because "input_number", "input_text" or "input_boolean" respectively are allowed. */
                        name: (deviceCfg.common.name + '_' + deviceState).replace('-', '_'), // Lovelace don't work with dashes '-'
                    }
                }

                /*
                 * Activate history integration for device state
                 * see https://github.com/ioBroker/ioBroker.history/blob/master/docs/en/README.md
                 */
                if(deviceCfg.states[deviceState].enableHistory) {
                    deviceStateObj.common.custom[ioAdapterHistory] = {
                        enabled: true,
                        changesOnly: true,
                        debounce: 1000, // Entprellzeit in ms (= 1 sec)
                        changesRelogInterval: 0, // without a change, don't log again (x>0 = every x sec a new log entry creation will be forced)
                        changesMinDelta: 0, // any size of change will be logged (0 = no delta until new log entry)
                        retention: 31536000, // 1 year
                        maxLength: 3, // number of entries in RAM
                        aliasId: '',
                    }
                }
                
                createState(deviceStateID, deviceStateObj.common, deviceStateObj.native,
                    function (err) {
                        if (err) {
                            log('Creation of device state skipped:' + deviceStateID, 'warn');
                            return;
                        }
                        log('Device state has been created: ' + deviceStateID, 'debug');
                        
                        /*
                         * FEATURE: Writable states will be subscribed, to send MQTT message
                        if(deviceSateWritable)
                         objWriteIDs.push(deviceStateID); // OR
                         objWriteIDs.push(deviceID) (but only once, if multiple writable states exists !!!)

                        */

                    });
            } else {
                log('Device state already exists: ' + deviceStateID, 'debug');
            }
        }
        // Add MQTT object to subscription list for updating states of the new device
        objIDs.push(objID);
    } else {
        log('Undefined device type found for object: ' + objID, 'info');
    }
  })
});


/*
 * Part 2: Subscribe to MQTT messages for updating read states of the virtual devices (MQTT -> JavaScript)
 */
on({id: objIDs, change: "any"}, function (obj) {
    /*
     * Find matching virtual device of the MQTT object
     */
    var deviceID = '';
    let deviceCfg = {};

    var objDeviceType = obj.id.match(/([a-z0-9-_]+)_[a-z0-9]{4,7}$/i);
    
    if(objDeviceType && Object.keys(deviceConfigs).indexOf(objDeviceType[1]) >= 0){
        // Make a copy of device template
        deviceCfg = deviceConfigs[objDeviceType[1]];
        
        deviceID = pathVirtualDevices +
            (deviceCfg.namespace && deviceCfg.namespace !== '' ? '.' + deviceCfg.namespace : '') +
            '.' + obj.common.name.replace(zigbeeBaseTopic + '/', '');
    } else {
        log('Fatal error: Object subscribed, without matching device type', 'error');
        return;
    }

    /*
     * Parse JSON value of MQTT object
     */
    let objStateValueParsed = JSON.parse(obj.state.val);

    /*
     * Change states of the matching virtual device
     */
    Object.keys(objStateValueParsed).forEach(function(stateName){
        if (getState(deviceID + '.' + stateName).notExist){
            log('State is unknown by virtual device, please check your device configuration: ' + deviceID + '.' + stateName, 'info');
        }else{
            if(typeof deviceCfg.states[stateName].modifyValue === 'function') {
                objStateValueParsed[stateName] = deviceCfg.states[stateName].modifyValue(objStateValueParsed[stateName]);
            }
            setState(deviceID + '.' + stateName, objStateValueParsed[stateName]);
        };
    })
})

/*
 * Part 3: Subscribe to write states of the virtual devices for sending MQTT messages (JavaScript -> MQTT)
 *
 * inspired by:
 * - https://forum.iobroker.net/topic/28951/mqtt-publish-mit-js-an-mqtt-mosquitto-broker/2 
 * - https://forum.iobroker.net/topic/12829/vorlage-wechselseitige-aktualisierung-und-bedienung-von-datenpunkten (!!!)
 */
// Subscribe to all virtual devices, but react only on changes from Lovelace
on({id: objWriteIDs, change: 'ne', from: 'system.adapter.'+ioAdapterLovelace}, function (obj) {
  
  var value = obj.state.val;
  var oldValue = obj.oldState.val;

  try{
    sendTo(ioAdapterMQTT, 'send', {
     'iobroker/test': 'Test1234'});
  }
  catch(Exception){
    console.log(ioAdapterJS + '/ERROR: Sending MQTT message failed');
  }
})