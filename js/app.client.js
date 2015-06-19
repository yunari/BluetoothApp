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

/*jslint plusplus: true, sloppy: true, todo: true, vars: true,
 browser: true, devel: true */
/*global $, tizen, app, ClientModel */

/**
* @class Client
*/
function Client(adapter, serviceUUID) {
    'use strict';
    this.adapter = adapter;
    this.serviceUUID = serviceUUID;
    this.globalSocket = null;
    this.init();
    this.discovering = false;
    this.chatServerDevice = null;
}

(function strict() {
    'use strict';

    Client.prototype = {
        /**
        * @type clientModel
        */
        model: null,

        /**
        * Initializes Client object.
        */
        init: function Client_init() {
            this.model = new ClientModel(this);
            return this;
        },

        /**
         * Sets discovering flag.
         * @param {boolean} boolean
         */
        setDiscovering: function Client_setDiscovering(boolean) {
            this.discovering = boolean;
            app.ui.setDiscoveringProgress(boolean);
        },

        /**
         * Returns discovering flag.
         * @return {boolean}
         */
        getDiscovering: function Client_getDiscovering() {
            return this.discovering;
        },

        /**
         * Starts server searching.
         */
        searchServer: function Client_searchServer() {
            this.model.searchServer();
        },

        /**
         * Adds device to device list.
         * @param {BluetoothDevice} device
         */
        addDeviceToList: function Client_addDeviceToList(device) {
            app.ui.addDeviceToList(device);
        },

        /**
         * Stops server searching.
         * @param {string} address
         */
        stopServerSearching: function Client_stopServerSearching(address) {
            if (address !== undefined) {
                this.model.stopServerSearching(
                    this.startBonding.bind(
                        this,
                        address,
                        this.connectToService.bind(this)
                    )
                );
            } else {
                this.model.stopServerSearching();
            }
        },

        /**
         * Creates bonding.
         * @param {string} address
         * @param {function} callback
         */
        startBonding: function Client_startBonding(address, callback) {
            this.model.startBonding(address, callback);
        },

        /**
         * Connects to a specified service identified by UUID on this device.
         * @param {BluetoothDevice} device
         */
        connectToService: function Client_connectToService(device) {
            this.model.connectToService(
                device,
                this.serviceUUID,
                this.connectToServiceSuccess.bind(this, device),
                this.connectToServiceError.bind(this)
            );
        },

        /**
         * Performs action on connect to service success.
         * @param {BluetoothDevice} device
         * @param {BluetoothSocket} socket
         */
        connectToServiceSuccess:
            function Client_connectToServiceSuccess(device, socket) {
            this.globalSocket = socket;
            socket.onmessage = function onSocketMessage() {
                var data, recvmsg = '', i, len, messageObj;
                data = socket.readData();
                len = data.length;
                for (i = 0; i < len; i += 1) {
                    recvmsg += String.fromCharCode(data[i]);
                }
                messageObj = JSON.parse(recvmsg);
                app.ui.displayReceivedMessage(
                    messageObj.name,
                    messageObj.text,
                    messageObj.ping,
                    messageObj.bye
                );
            };
            socket.onerror = function onSocketError() {
                console.error('Client onerror');
                socket.close();
            };
            socket.onclose = function onSocketClose() {
                this.globalSocket = null;
                app.setConnection(false);
                app.serverDisconnected();
            };
            app.setConnection(true);
            app.ui.showChatPage(device.name);
            this.sendPing();
        },

        /**
         * Performs action on connect to service error.
         * @param {object} error
         */
        connectToServiceError: function Client_connectToServiceError(error) {
            console.error('Client_connectToServiceError: ' + error.message);
        },

        /**
         * Sends to server special handshake message, which contain client name.
         */
        sendPing: function Client_sendPing() {
            this.model.sendPing(this.adapter.name, this.globalSocket);
        },

        /**
         * Sends message to server.
         * @param {string} message
         * @param {function} callback
         */
        sendMessage: function Client_sendMessage(message, callback) {
            this.model.sendMessage(
                this.adapter.name,
                this.globalSocket,
                message,
                callback
            );
        },

        /**
         * Sends special message to second device in case of
         * sudden application termination on first device.
         */
        sendBye: function Client_sendBye() {
            this.model.sendBye(this.adapter.name, this.globalSocket);
        },

        /**
         * Destroys the bond with a remote device.
         * Method initiates the process of removing the specified address
         * from the list of bonded devices.
         */
        destroyBonding: function Client_destroyBonding() {
            this.model.destroyBonding(
                this.chatServerDevice,
                app.restartBluetooth.bind(app),
                app.ui.showStartButtons
            );
        }

    };

}());
