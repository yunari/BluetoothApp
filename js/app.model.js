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
 devel: true, maxerr: 999 */
/*global $, tizen, app */

/**
* @class Model
*/
function Model() {
    'use strict';
    this.adapter = null;
    this.serviceUUID = '5BCE9431-6C75-32AB-AFE0-2EC108A30860';
}

(function strict() {
    'use strict';
    Model.prototype = {

        /**
         * Flag indicating if there is an ongoing bluetooth operation initiated
         * by application (start, stop, restart).
         * @type {boolean}
         */
        operationInProgress: false,

        /**
        * Initializes model object.
        */
        init: function Model_init(callback) {
            try {
                if (tizen.bluetooth === undefined) {
                    throw new ReferenceError(
                        'tizen.bluetooth is not available'
                    );
                }
                this.adapter = tizen.bluetooth.getDefaultAdapter();

                this.adapter.setChangeListener({
                    onstatechanged: function onAdapterStateChanged(powered) {
                        if (!powered && !this.operationInProgress) {
                            app.connectionLost();
                        }
                    }.bind(this)
                });

                callback();
            } catch (error) {
                var message = '';
                if (error instanceof ReferenceError) {
                    message = 'This application can only run on a device ' +
                        'supporting bluetooth';
                } else {
                    message = 'Problem with bluetooth. ' +
                    'Application can\'t work properly: ' + error.message;
                }
                window.alert(message);
                tizen.application.getCurrentApplication().exit();
            }
        },

        /**
         * Checks bluetooth device power state.
         * Depending on the state, calls one from given callbacks.
         * @param {function} showPowerOnButtonCallback
         * @param {function} showStartButtonsCallback
         */
        checkPowerState: function Model_checkPowerState(
            showPowerOnButtonCallback,
            showStartButtonsCallback
        ) {
            if (!this.adapter.powered) {
                showPowerOnButtonCallback();
            } else {
                showStartButtonsCallback();
            }
        },

        /**
         * Turns on the power of the bluetooth device.
         * Calls the callback function only when the power is on.
         * @param {function} callback
         */
        powerOn: function Model_powerOn(callback) {
            if (!this.adapter.powered) {
                try {
                    this.operationInProgress = true;
                    this.adapter.setPowered(true,
                        function onAdapterPowerOnSuccess() {
                            this.operationInProgress = false;
                            setTimeout(
                                function adapterPowerOnSuccessTimeout() {
                                    callback();
                                },
                                500
                            );
                        }.bind(this),
                        function onAdapterPowerOnError() {
                            this.operationInProgress = false;
                        }.bind(this)
                    );
                } catch (error) {
                    this.operationInProgress = false;
                    app.ui.showMessagePopup(error.message);
                    app.ui.showPowerOnButton();
                }
            } else {
                callback();
            }
        },

        /**
         * Turns off the power of the bluetooth device.
         * Calls the callback function only when the power is off.
         * @param {function} callback
         */
        powerOff: function Model_powerOff(callback) {
            if (this.adapter.powered) {
                this.operationInProgress = true;
                this.adapter.setPowered(
                    false,
                    function onAdapterPowerOffSuccess() {
                        this.operationInProgress = false;
                        callback();
                    }.bind(this),
                    function onAdapterPowerOffError() {
                        this.operationInProgress = false;
                        callback();
                    }.bind(this)
                );
            } else {
                callback();
            }
        },

        /**
         * Restarts bluetooth device.
         * @param {function} callback
         */
        restartBluetooth: function Model_restartBluetooth(callback) {
            if (this.adapter.powered) {
                this.operationInProgress = true;
                this.adapter.setPowered(
                    false,
                    function onAdapterPowerOffSuccess() {
                        this.operationInProgress = false;
                        setTimeout(
                            function restartBluetoothSuccessTimeout() {
                                callback();
                            },
                            500
                        );
                    }.bind(this),
                    function onAdapterPowerOffError() {
                        this.operationInProgress = false;
                    }.bind(this)
                );
            } else {
                callback();
            }
        },

        /**
         * Sets bluetooth device name.
         * The name is set only when the changeName parameter is equal to true.
         * @param {boolean} changeName
         * @param {function} callback
         */
        setAdapterName: function Model_setAdapterName(changeName, callback) {
            if (changeName) {
                this.adapter.setName(
                    app.currentName,
                    function onAdapterSetNameSuccess() {
                        callback();
                    },
                    function onAdapterSetNameError() {
                        return;
                    }
                );
            } else {
                callback();
            }
        }

    };

}());
