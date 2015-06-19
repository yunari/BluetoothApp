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

/*global $, tizen, app, ServerModel, console*/

/**
* @class Server
*/
function Server(adapter, serviceUUID) {
    'use strict';
    this.adapter = adapter;
    this.serviceUUID = serviceUUID;
    this.numberOfClients = 0;
    this.globalRecordHandler = null;
    this.globalSocket = null;
    this.init();
}

(function strict() {
    'use strict';

    Server.prototype = {
        /**
        * @type clientModel
        */
        model: null,

        /**
        * Initializes Server object.
        */
        init: function Server_init() {
            this.model = new ServerModel(this);
            return this;
        },

        /**
         * Returns number of connected clients.
         * @return {number}
         */
        getNumberOfClients: function Server_getNumberOfClients() {
            return this.numberOfClients;
        },

        /**
         * Registers server.
         */
        registerServer: function Server_registerServer() {
            this.model.registerServer(
                this.adapter,
                this.serviceUUID,
                this.registerServerSuccess.bind(this)
            );
        },

        /**
         * Performs action on server's registration success.
         * @param {BluetoothServiceHandler} recordHandler
         */
        registerServerSuccess: function Server_registerServerSuccess(
            recordHandler
        ) {
            this.globalRecordHandler = recordHandler;
            recordHandler.onconnect = function onServerSocketConnect(socket) {
                this.numberOfClients += 1;
                this.globalSocket = socket;
                socket.onmessage = function onServerSocketMessage() {
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
                socket.onerror = function onServerSocketError() {
                    console.error('Server onerror');
                    socket.close();
                };
                socket.onclose = function onServerSocketClose() {
                    this.globalSocket = null;
                    app.setConnection(false);
                    app.clientDisconnected();
                };
                app.setConnection(true);
            }.bind(this);
            app.ui.showChatPage();
        },

        /**
         * Unregisters server.
         */
        unregisterChatServer: function Server_unregisterChatServer() {
            this.model.unregisterChatServer(
                this.globalRecordHandler,
                this.unregisterChatServerSuccess.bind(this),
                this.unregisterChatServerError.bind(this),
                app.ui.showStartButtons
            );
        },

        /**
         * Performs action on server's unregistration success.
         */
        unregisterChatServerSuccess:
            function Server_unregisterChatServerSuccess() {
            this.globalRecordHandler = null;
            this.numberOfClients = 0;
            app.restartBluetooth();
        },

        /**
         * Performs action on server's unregistration error.
         */
        unregisterChatServerError: function Server_unregisterChatServerError() {
            console.error('Server_unregisterChatServerError');
            this.numberOfClients = 0;
            app.restartBluetooth();
        },

        /**
         * Sends message to client.
         * @param {string} message
         * @param {function} callback
         */
        sendMessage: function Server_sendMessage(message, callback) {
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
        sendBye: function Server_sendBye() {
            this.model.sendBye(
                this.adapter.name,
                this.globalSocket
            );
        }

    };

}());
