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

/*global window, $, tizen, app */

/**
* @class UiEvents
*/
function UiEvents(parent) {
    'use strict';
    this.ui = parent;
}

(function strict() {
    'use strict';
    UiEvents.prototype = {

        /**
        * Initializes UiEvents object.
        */
        init: function UiEvents_init() {
            this.addPageEvents();
        },

        /**
        * Binds events to pages.
        */
        addPageEvents: function UiEvents_addPageEvents() {
            var self = this;

            $('#start-header .ui-btn-back').on('click',
                function onStartHeaderBackButtonClick(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    app.powerOff();
                }
            );

            $('#choose-footer').on('click', '.ui-btn-back',
                function onChooseFooterBackButtonClick(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    app.setDoNotSendBye(true);
                    $.mobile.changePage('#start');
                }
            );

            $('#chat-header').on('click', '.ui-btn-back',
                function onChatHeaderBackButtonClick(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!app.isConnection()) {
                        app.setDoNotSendBye(true);
                    }
                    $.mobile.changePage('#start');
                }
            );

            $('#start').on('pagebeforeshow', function onStartPageBeforeShow() {
                self.ui.hideStartButtons();
                self.ui.clearChatDialog();
                if (!app.getDoNotSendBye()) {
                    app.sendBye();
                } else {
                    app.setDoNotSendBye(false);
                }
                if (app.getApplicationMode() === 'server') {
                    app.server.unregisterChatServer();
                } else if (app.getApplicationMode() === 'client') {
                    app.client.destroyBonding();
                }
            });

            $('#turnOnButton').on('click', function onTurnOnButtonClick() {
                self.ui.hideStartButtons();
                app.powerOn();
            });

            $('#serverButton').on('click', function onServerButtonClick() {
                app.resetApplicationMode();
                app.startServer();
            });

            $('#clientButton').on('click', function onClientButtonClick() {
                app.resetApplicationMode();
                app.startClient();
            });

            $('#keyboard').on('pagebeforeshow',
                function onKeyboardPageBeforeShow() {
                    $('#keyboard-text').val('').attr(
                        'placeholder',
                        'Type ' + app.getApplicationMode() + ' name'
                    );
                    $('#keyboard-ok-button').addClass('ui-disabled');
                    $('#keyboard-header > h1').html(
                        'Type ' + app.getApplicationMode() + ' name'
                    );
                }
            );

            $('#keyboard').on('pageshow', function onKeyboardPageShow() {
                window.setTimeout(
                    function keyboardPageShowActionTimeout() {
                        $('#keyboard-text').focus();
                    },
                    500
                );
            });

            $('#keyboard-ok-button').on('click',
                function onKeyboardOkButtonClick(event) {
                    event.preventDefault();
                    var value = $('#keyboard-text').val(), mode;
                    if (value.length !== 0) {
                        app.setUserName(value);
                        mode = app.getApplicationMode();
                        if (mode === 'server') {
                            app.setAdapterName();
                        } else if (mode === 'client') {
                            $.mobile.changePage('#choose');
                        }
                    }
                }
            );

            $('#keyboard-text').on('input focus',
                function onKeyboardTextChanged() {
                    var btn = $('#keyboard-ok-button');

                    if ($(this).val().length > 0) {
                        if (btn.hasClass('ui-disabled')) {
                            btn.removeClass('ui-disabled');
                        }
                    } else {
                        btn.addClass('ui-disabled');
                    }
                }
            );

            $('#choose').on('pagebeforeshow',
                function onChoosePageBeforeShow() {
                    app.setAdapterName();
                }
            );

            $('#choose').on('pagehide', function onChoosePageHide() {
                app.clearListOfServers();
                app.client.stopServerSearching();
            });

            $('#choose-content').on('click', 'ul.ui-listview li',
                function onChooseContentListElementClick() {
                    app.client.stopServerSearching($(this).attr('address'));
                }
            );

            $('#chat').on('pagebeforeshow', function onChatPageBeforeShow() {
                $('#chat-header-type').html(app.getApplicationMode());
                $('#chat-header-name').html(app.getCurrentName());
                if ($(this).data('serverName') !== undefined) {
                    $('#chat-header-type').append(
                        ' - connected to ' + $(this).data('serverName')
                    );
                    $(this).removeData('serverName');
                }
                self.ui.checkSendButtonState();
            });

            $('#chat').on('pageshow', function onChatPageShow() {
                if (
                    app.getApplicationMode() === 'server' &&
                        !app.isBluetoothVisible()
                ) {
                    window.setTimeout(
                        function chatPageShowActionTimeout() {
                            app.ui.showMessagePopup(
                                'Please make your Bluetooth ' +
                                    'visible in Settings.'
                            );
                        },
                        500
                    );
                }
            });

            $('#chat').on('pagehide', function onChatPageHide() {
                $('#text').val('');
                app.setConnection(false);
            });

            $('#text').on('input', function onTextInput() {
                self.ui.checkSendButtonState();
            });

            $('#text').on('focus', function onTextFocus() {
                var content = $('#chat-content');
                if (self.ui.scrolltimeout !== null) {
                    window.clearTimeout(self.ui.scrolltimeout);
                }
                self.ui.scrolltimeout = window.setTimeout(
                    function focusActionScrollTimeout() {
                        self.ui.scrolltimeout = null;
                        self.ui.scrollToBottom(content);
                    },
                    1000
                );
            });

            $('#text').on('blur', function onTextBlur() {
                var content = $('#chat-content');
                if (self.ui.scrolltimeout !== null) {
                    window.clearTimeout(self.ui.scrolltimeout);
                }
                self.ui.scrolltimeout = window.setTimeout(
                    function blurActionsScrollTimeout() {
                        self.ui.scrolltimeout = null;
                        self.ui.scrollToBottom(content);
                    },
                    700
                );
            });

            $('#ui-mySend').on('click', function onMySendClick(event) {
                event.stopPropagation();
                var message = $('#text').val();
                if (message.length === 0) {
                    return;
                }
                $('#text').val('');
                self.ui.disableSendButton();
                app.sendMessage(message);
            });

            $('body').on('click', '#byeOK', function onByeOkClick() {
                self.ui.hideByePopup();
                $('#keyboard-back-button').trigger('click');
            });

            $('body').on('touchstart', '#byePopup-screen',
                function onByePopupScreenTouchStart() {
                    $('#byeOK').trigger('click');
                }
            );

            $('body').on('click', '#messageOK',
                function onMessageOkClick() {
                    self.ui.hideMessagePopup();
                }
            );

            $('body').on('touchstart', '#messagePopup-screen',
                function onMessagePopupScreenTouchStart() {
                    $('#messageOK').trigger('click');
                }
            );

            $('#chat-content').on('touchstart',
                function onChatContentTouchStart() {
                    if (self.ui.scrolltimeout !== null) {
                        window.clearTimeout(self.ui.scrolltimeout);
                        self.ui.scrolltimeout = null;
                    }
                }
            );

            window.addEventListener('tizenhwkey',
                function onTizenHardwareKey(e) {
                    if (e.keyName === 'back') {
                        e.preventDefault();
                        app.setDoNotSendBye(true);
                        if ($.mobile.activePage.attr('id') === 'start') {
                            tizen.application.getCurrentApplication().exit();
                        } else if ($.mobile.activePage.attr('id') === 'chat') {
                            $.mobile.changePage('#start');
                        } else {
                            window.history.back();
                        }
                    }
                }
            );

        }

    };

}());
