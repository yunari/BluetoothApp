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

/*global $, tizen, app, Config, Helpers, Model, Ui, Server, Client, window*/

var App = null;

(function strict() {
    'use strict';

    /**
    * Creates a new application object
    *
    * @class Application
    */
    App = function App() {
        return;
    };

    App.prototype = {
        /**
        * @type Array
        */
        requires: ['js/app.config.js',
            'js/app.helpers.js',
            'js/app.model.js',
            'js/app.ui.js',
            'js/app.ui.templateManager.js',
            'js/app.ui.templateManager.modifiers.js',
            'js/app.ui.events.js',
            'js/app.client.js',
            'js/app.client.model.js',
            'js/app.server.js',
            'js/app.server.model.js'
        ],

        /**
        * @type Model
        */
        model: null,

        /**
        * @type Ui
        */
        ui: null,

        /**
        * @type Config
        */
        config: null,

        /**
        * @type Helpers
        */
        helpers: null,

        /**
        * @type Client
        */
        client: null,

        /**
        * @type Server
        */
        server: null,

        /**
        * @type String
        */
        currentName: '',

        /**
        * @type Boolean
        */
        doNotSendBye: false,

        /**
        * @type Boolean
        */
        connection: false,

        /**
        * Initializes application.
        */
        init: function App_init() {
            this.config = new Config();
            this.helpers = new Helpers();
            this.model = new Model();
            this.ui = new Ui(this.initModel.bind(this));
        },

        /**
         * Initializes model object.
         */
        initModel: function App_initModel() {
            this.model.init(this.checkPowerState.bind(this));
        },

        /**
        * Closes application.
        */
        exit: function App_exit() {
            tizen.application.getCurrentApplication().exit();
        },

        /**
         * Checks whether connection between two devices is established.
         * @return {Boolean}
         */
        isConnection: function App_isConnection() {
            return this.connection;
        },

        /**
         * Sets flag which indicates whether connection between two devices
         * is established.
         * @param {boolean} bool
         */
        setConnection: function App_setConnection(bool) {
            this.connection = bool;
        },

        /**
         * Returns flag which indicates whether special popup
         * should be displayed on second device in case of
         * sudden application termination on first device.
         * @return {Boolean}
         */
        getDoNotSendBye: function App_getDoNotSendBye() {
            return this.doNotSendBye;
        },

        /**
         * Sets flag which indicates whether special popup
         * should be displayed on second device in case of
         * sudden application termination on first device.
         * @param {boolean} bool
         */
        setDoNotSendBye: function App_setDoNotSendBye(bool) {
            this.doNotSendBye = bool;
        },

        /**
         * Returns the client name or the server name
         * which was set during application start.
         * @return {string}
         */
        getCurrentName: function App_getCurrentName() {
            return this.ui.escape(this.currentName);
        },

        /**
         * Returns application mode.
         * @return {String}
         */
        getApplicationMode: function App_getApplicationMode() {
            var mode = 'start';
            if (this.client !== null) {
                mode = 'client';
            } else if (this.server !== null) {
                mode = 'server';
            }
            return mode;
        },

        /**
         * Resets application mode.
         */
        resetApplicationMode: function App_resetApplicationMode() {
            this.client = null;
            this.server = null;
        },

        /**
         * Checks bluetooth device power state.
         * Depending on the state, shows proper buttons
         * on application start page.
         *
         * Calls 'setContentStartAttributes' app.ui.js function, which takes
         * 'checkPowerState' app.model.js function as parameter.
         */
        checkPowerState: function App_checkPowerState() {
            this.ui.setContentStartAttributes(
                this.model.checkPowerState.bind(
                    this.model,
                    this.ui.showPowerOnButton,
                    this.ui.showStartButtons
                )
            );
        },

        /**
         * Turns on the power of the bluetooth device.
         *
         * Calls 'powerOn' app.model.js function, which takes
         * 'showStartButtons' app.ui.js function as parameter.
         */
        powerOn: function App_powerOn() {
            this.model.powerOn(this.ui.showStartButtons);
        },

        /**
         * Turns off the power of the bluetooth device.
         *
         * Calls 'powerOff' app.model.js function,
         * which takes 'exit' app.js function as parameter.
         */
        powerOff: function App_powerOff() {
            this.model.powerOff(this.exit);
        },

        /**
         * Restarts bluetooth device.
         *
         * Calls 'restartBluetooth' app.model.js function,
         * which takes 'powerOn' app.js function as parameter.
         */
        restartBluetooth: function App_restartBluetooth() {
            this.model.restartBluetooth(this.powerOn.bind(this));
        },

        /**
         * Initiates new server object
         * and calls 'showKeyboardPage' app.js function.
         */
        startServer: function App_startServer() {
            this.server = new Server(
                this.model.adapter,
                this.model.serviceUUID
            );
            this.showKeyboardPage();
        },

        /**
         * Initiates new client object
         * and calls 'showKeyboardPage' app.js function.
         */
        startClient: function App_startClient() {
            this.client = new Client(
                this.model.adapter,
                this.model.serviceUUID
            );
            this.showKeyboardPage();
        },

        /**
         * Shows popup message on client device
         * informing about lost connection to server device.
         *
         * Calls 'popup' app.ui.js function.
         */
        serverDisconnected: function App_serverDisconnected() {
            app.ui.popup('Lost connection to Server.',
                function onSeverDisconnectedPopupClose() {
                    window.history.back();
                }
            );
        },

        /**
         * Shows popup message on server device
         * informing about lost connection with client device.
         *
         * Calls 'popup' app.ui.js function.
         */
        clientDisconnected: function App_clientDisconnected() {
            app.ui.popup('Lost connection with Client.',
                function onClientDisconnectedPopupClose() {
                    app.ui.setHeaderType('server');
                }
            );
        },

        /**
         * Shows keyboard page.
         *
         * Calls 'showKeyboardPage' app.ui.js function.
         */
        showKeyboardPage: function App_showKeyboardPage() {
            this.ui.showKeyboardPage();
        },

        /**
         * Sets the client name or the server name given as a parameter.
         * @param {string} value
         */
        setUserName: function App_setUserName(value) {
            this.currentName = value;
        },

        /**
         * Sets bluetooth device name.
         *
         * The name is identical to the client name or the server name
         * which was set during application start.
         */
        setAdapterName: function App_setAdapterName() {
            var changeName = false, mode = this.getApplicationMode();
            if (this.model.adapter.name !== this.currentName) {
                changeName = true;
            }
            if (mode === 'server') {
                this.model.setAdapterName(
                    changeName,
                    this.server.registerServer.bind(this.server)
                );
            } else if (mode === 'client') {
                this.model.setAdapterName(
                    changeName,
                    this.client.searchServer.bind(this.client)
                );
            }
        },

        /**
         * Checks and returns bluetooth device visibility state.
         * @return {boolean}
         */
        isBluetoothVisible: function App_isBluetoothVisible() {
            return this.model.adapter.visible;
        },

        /**
         * Removes all of the bluetooth devices from list
         * displayed on choose page.
         *
         * Calls 'clearListOfServers' app.ui.js function.
         */
        clearListOfServers: function App_clearListOfServers() {
            this.ui.clearListOfServers();
        },

        /**
         * Adds new text fragment given as message parameter
         * to current chat conversation displayed on chat page.
         * @param {string} message
         */
        displaySentMessage: function App_displaySentMessage(message) {
            this.ui.displaySentMessage(message);
        },

        /**
         * Sends new message given as message parameter
         * (server to client or client to server).
         * @param {string} message
         */
        sendMessage: function App_sendMessage(message) {
            var mode = this.getApplicationMode();
            if (mode === 'server') {
                this.server.sendMessage(
                    message,
                    this.displaySentMessage.bind(this)
                );
            } else if (mode === 'client') {
                this.client.sendMessage(
                    message,
                    this.displaySentMessage.bind(this)
                );
            }
        },

        /**
         * Sends special message to second device in case of
         * sudden application termination on first device.
         */
        sendBye: function App_sendBye() {
            var mode = this.getApplicationMode();
            if (mode === 'server') {
                this.server.sendBye();
            } else if (mode === 'client') {
                this.client.sendBye();
            }
        },

        /**
         * Shows popup message on client or server device
         * informing about lost connection
         * due to power off of the bluetooth device.
         *
         * Calls 'popup' app.ui.js function.
         */
        connectionLost: function App_connectionLost() {
            this.connection = false;
            this.ui.popup(
                'To continue please turn on bluetooth.',
                function onConnectionLostPopupClose() {
                    this.checkPowerState();
                    $.mobile.changePage('#start');
                }.bind(this)
            );
        }

    };

}());
