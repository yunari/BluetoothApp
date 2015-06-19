/*
 * Copyright (c) 2012 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint plusplus: true, sloppy: true, todo: true, vars: true, browser: true,
devel: true */
/*global $, tizen, app */

/**
* @class Model
*/
function ClientModel(parent) {
    'use strict';
    this.client = parent;
    this.init();
}

(function strict() {
    'use strict';
    ClientModel.prototype = {

        /**
        * Initializes ClientModel object.
        */
        init: function ClientModel_init() {
            return;
        },

        /**
         * Starts server searching.
         */
        searchServer: function ClientModel_searchServer() {
            var discoverDevicesSuccessCallback = {
                onstarted: function onDevicesDiscoverStarted() {
                    this.client.setDiscovering(true);
                }.bind(this),
                ondevicefound: function onDeviceFound(device) {
                    this.client.addDeviceToList(device);
                }.bind(this),
                ondevicedisappeared: function onDeviceDisappeared() {
                    return;
                },
                onfinished: function onDevicesDiscoverFinished() {
                    this.client.setDiscovering(false);
                }.bind(this)
            };
            this.client.adapter.discoverDevices(
                discoverDevicesSuccessCallback,
                function onDiscoverDevicesError() {
                    this.client.setDiscovering(false);
                }
            );
        },

        /**
         * Stops server searching.
         * @param {function} callback
         */
        stopServerSearching: function ClientModel_stopServerSearching(
            callback
        ) {
            if (this.client.getDiscovering()) {
                this.client.adapter.stopDiscovery(function onStopDiscovery() {
                    this.client.setDiscovering(false);
                    if (typeof callback === 'function') {
                        callback();
                    }
                }.bind(this), function onStopDiscoveryError(e) {
                    console.error('Error while stopDiscovery:' + e.message);
                });
            } else if (typeof callback === 'function') {
                callback();
            }
        },

        /**
         * Creates bonding.
         * @param {string} address
         * @param {function} callback
         */
        startBonding: function ClientModel_startBonding(address, callback) {
            this.client.adapter.createBonding(
                address,
                function onCreateBondingSuccess(device) {
                    callback(device);
                },
                function onCreateBondingError(error) {
                    console.error('bondError: ' + error.message);
                }
            );
        },

        /**
         * Connects to a specified service identified by UUID on this device.
         * @param {BluetoothDevice} device
         * @param {string} serviceUUID
         * @param {function} successCallback
         * @param {function} errorCallback
         */
        connectToService: function ClientModel_connectToService(
            device,
            serviceUUID,
            successCallback,
            errorCallback
        ) {
            this.client.chatServerDevice = device;
            try {
                device.connectToServiceByUUID(
                    serviceUUID,
                    successCallback,
                    errorCallback
                );
            } catch (error) {
                console.error('connectToServiceByUUID ERROR: ' + error.message);
            }
        },

        /**
         * Sends to server special handshake message, which contain client name.
         * @param {string} name
         * @param {BluetoothSocket} socket
         */
        sendPing: function ClientModel_sendPing(name, socket) {
            var sendTextMsg, messageObj, messageObjToString, i, len;
            sendTextMsg = [];
            messageObj = {
                name: encodeURIComponent(name),
                text: '',
                ping: true,
                bye: false
            };
            messageObjToString = JSON.stringify(messageObj);
            len = messageObjToString.length;

            for (i = 0; i < len; i += 1) {
                sendTextMsg[i] = messageObjToString.charCodeAt(i);
            }
            try {
                if (socket !== null && socket.state === 'OPEN') {
                    socket.writeData(sendTextMsg);
                }
            } catch (error) {
                console.error('sendPing: ' + error.message);
            }
        },

        /**
         * Sends message to server.
         * @param {string} name
         * @param {BluetoothSocket} socket
         * @param {string} message
         * @param {function} callback
         */
        sendMessage: function ClientModel_sendMessage(
            name,
            socket,
            message,
            callback
        ) {
            var sendTextMsg = [], messageObj, messageObjToString, i, len;
            name = encodeURIComponent(name);
            message = encodeURIComponent(message);
            messageObj = {name: name, text: message, ping: false, bye: false};
            messageObjToString = JSON.stringify(messageObj);
            len = messageObjToString.length;
            for (i = 0; i < len; i += 1) {
                sendTextMsg[i] = messageObjToString.charCodeAt(i);
            }
            try {
                if (socket !== null && socket.state === 'OPEN') {
                    socket.writeData(sendTextMsg);
                    callback(message);
                }
            } catch (error) {
                console.error('sendMessage: ' + error.message);
            }
        },

        /**
         * Sends special message to second device in case of
         * sudden application termination on first device.
         * @param {string} name
         * @param {BluetoothSocket} socket
         */
        sendBye: function ClientModel_sendBye(name, socket) {
            var sendTextMsg = [], messageObj, messageObjToString, i, len;
            name = encodeURIComponent(name);
            messageObj = {name: name, text: '', ping: false, bye: true};
            messageObjToString = JSON.stringify(messageObj);
            len = messageObjToString.length;
            for (i = 0; i < len; i += 1) {
                sendTextMsg[i] = messageObjToString.charCodeAt(i);
            }
            try {
                if (socket !== null && socket.state === 'OPEN') {
                    socket.writeData(sendTextMsg);
                }
            } catch (error) {
                console.error('sendBye: ' + error.message);
            }
        },

        /**
         * Destroys the bond with a remote device.
         * Method initiates the process of removing the specified address
         * from the list of bonded devices.
         * @param {BluetoothDevice} device
         * @param {function} restartCallback
         * @param {function} showStartButtonsCallback
         */
        destroyBonding: function ClientModel_destroyBonding(
            device,
            restartCallback,
            showStartButtonsCallback
        ) {
            if (device !== null) {
                if (device.isBonded) {
                    this.client.adapter.destroyBonding(
                        device.address,
                        function onDestroyBondingSuccess() {
                            device = null;
                            restartCallback();
                        },
                        function onDestroyBondingError(error) {
                            console.error(
                                'ClientModel_destroyBonding: ' + error
                            );
                        }
                    );
                } else {
                    device = null;
                    restartCallback();
                }
            } else {
                this.stopServerSearching();
                showStartButtonsCallback();
            }
        }

    };

}());
