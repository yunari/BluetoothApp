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

/*global $, tizen, app, UiEvents, TemplateManager, document, window, setTimeout,
screen */

/**
* @class Ui
*/
function Ui(callback) {
    'use strict';
    this.init(callback);
}

(function strict() {
    'use strict';
    Ui.prototype = {

        /**
         * Template manager object.
         */
        templateManager: null,

        /**
        * Object for UI events.
        */
        uiEvents: null,

        /**
        * Timeout for chat scroll.
        */
        scrolltimeout: null,

        /**
         * Initializes Ui object.
         * @param {function} callback
         */
        init: function Ui_init(callback) {
            this.templateManager = new TemplateManager();
            this.uiEvents = new UiEvents(this);
            $.mobile.tizen.disableSelection(document);

            $(document).ready(this.domInit.bind(this, callback));
        },

        /**
         * Performs additional initialization operations,
         * which are dependent on whether the DOM is ready.
         * @param {function} callback
         */
        domInit: function Ui_domInit(callback) {
            var templates = [
                'keyboard_page',
                'chat_page',
                'choose_page',
                'server_row',
                'left_bubble',
                'right_bubble',
                'bye_popup',
                'message_popup'
            ];

            this.templateManager.loadToCache(
                templates,
                this.initPages.bind(this, callback)
            );
        },

        /**
         * Initializes application pages stored in templates.
         * @param {function} callback
         */
        initPages: function Ui_initPages(callback) {
            var pages = [], body = $('body');

            body.append(this.templateManager.get('bye_popup'))
                .append(this.templateManager.get('message_popup'))
                .trigger('create');

            pages.push(this.templateManager.get('keyboard_page'));
            pages.push(this.templateManager.get('chat_page'));
            pages.push(this.templateManager.get('choose_page'));
            body.append(pages.join(''));

            this.uiEvents.init();
            callback();
        },

        /**
         * Calculates css parameters for content of the start page.
         * @param {function} callback
         */
        setContentStartAttributes: function Ui_setContentStartAttributes(
            callback
        ) {
            var contentStart, contentStartHeight;
            contentStart = $('#start-content');
            if (contentStart.height() > $(window).height()) {
                contentStartHeight =
                    $(window).height() -
                    $('#start-header').height() -
                    parseInt(contentStart.css('padding-top'), 10) -
                    parseInt(contentStart.css('padding-bottom'), 10);
            } else {
                contentStartHeight = contentStart.height();
            }
            setTimeout(function startPageAttributesSetTimeout() {
                contentStart
                    .css('height', contentStartHeight  + 'px')
                    .css('min-height', 'auto')
                    .css('width', contentStart.width() + 'px');
                $('#start').css('min-height', 'auto');
                callback();
            }, 0);
        },

        /**
         * Shows chat page.
         * @param {string} serverName
         */
        showChatPage: function Ui_showChatPage(serverName) {
            if (serverName !== undefined) {
                serverName = this.escape(serverName);
                $('#chat').data('serverName', serverName);
            }
            $.mobile.changePage('#chat');
        },

        /**
         * Shows keyboard page.
         */
        showKeyboardPage: function Ui_showKeyboardPage() {
            $.mobile.changePage('#keyboard');
        },

        /**
         * Removes all content from chat content list.
         */
        clearChatDialog: function Ui_clearChatDialog() {
            $('#chat-content .ui-listview').empty();
        },

        /**
         * Shows power on button.
         */
        showPowerOnButton: function Ui_showPowerOnButton() {
            $('#start-monit').hide();
            $('#serverButton').hide();
            $('#clientButton').hide();
            $('#turnOnButton').show();
        },

        /**
         * Shows start buttons.
         */
        showStartButtons: function Ui_showStartButtons() {
            $('#start-monit').hide();
            $('#turnOnButton').hide();
            $('#serverButton').show();
            $('#clientButton').show();
        },

        /**
         * Hides start buttons.
         */
        hideStartButtons: function Ui_hideStartButtons() {
            $('#serverButton').hide();
            $('#clientButton').hide();
            $('#turnOnButton').hide();
            $('#start-monit').show();
        },

        /**
         * Adds new device to devices list on choose page.
         * @param {BluetoothDevice} device
         */
        addDeviceToList: function Ui_addDeviceToList(device) {
            var listElement,
                ul = $('#choose-content ul.ui-listview');

            listElement = this.templateManager.get('server_row', {
                'deviceAddress': device.address,
                'deviceName': device.name
            });

            ul.append(listElement);
            ul.listview('refresh');
        },

        /**
         * Removes all devices from devices list on choose page.
         */
        clearListOfServers: function Ui_clearListOfServers() {
            $('#choose-content ul.ui-listview').empty();
        },

        /**
         * Shows bye popup.
         * @param {string} name
         */
        showByePopup: function Ui_showByePopup(name) {
            var mode = app.getApplicationMode(), message = $('#byeMessage');
            if (mode === 'server') {
                message.html(
                    'Client name "' +
                        this.escape(name) +
                        '" is unavailable.\n' +
                        'Your bluetooth device will be automatically restarted.'
                );
            } else if (mode === 'client') {
                message.html(
                    'Server name "' +
                        this.escape(name) +
                        '" is unavailable.\n' +
                        'Your bluetooth device will be automatically restarted.'
                );
            }
            $('#byePopup').popup('open', {'positionTo': 'window'});
        },

        /**
         * Hides bye popup.
         */
        hideByePopup: function Ui_hideByePopup() {
            $('#byePopup').popup('close');
        },

        /**
         * Shows popup message with text given by message parameter.
         * @param {string} message
         * @param {function?} onClose
         */
        showMessagePopup: function Ui_showMessagePopup(message, onClose) {
            var messagePopup = $('#messagePopup');
            messagePopup.find('.ui-popup-text').text(message);
            messagePopup.popup('open', {'positionTo': 'window'});
            if (typeof onClose === 'function') {
                messagePopup.on('popupafterclose', onClose);
            }
        },

        /**
         * Hides popup message.
         */
        hideMessagePopup: function Ui_hideMessagePopup() {
            $('#messagePopup').popup('close');
        },

        /**
         * Performs action when new message has been received.
         * @param {string} name
         * @param {string} text
         * @param {boolean} ping
         * @param {boolean} bye
         */
        displayReceivedMessage: function Ui_displayReceivedMessage(
            name,
            text,
            ping,
            bye
        ) {
            var listElement, ul;
            text = decodeURIComponent(text);
            name = decodeURIComponent(name);
            name = this.escape(name);
            if (bye) {
                this.showByePopup(name);
            } else if (ping) {
                app.setConnection(true);
                this.setHeaderType('server - connected with ' + name);
                this.checkSendButtonState();
            } else {
                listElement = this.templateManager.get('left_bubble', {
                    'text': text
                });
                ul = $('#chat-content > .ui-scrollview-view > ul');
                ul.append(listElement);
                ul.listview('refresh');
            }
        },

        /**
         * Updates header text on chat page.
         * @param {string} value
         */
        setHeaderType: function Ui_setHeaderType(value) {
            $('#chat-header-type').html(value);
        },

        /**
         * Enables send button.
         */
        enableSendButton: function Ui_enableSendButton() {
            $('#ui-mySend')
                .css({'pointer-events': 'auto'})
                .removeClass('ui-disabled');
        },

        /**
         * Disables send button.
         */
        disableSendButton: function Ui_disableSendButton() {
            $('#ui-mySend')
                .css({'pointer-events': 'none'})
                .addClass('ui-disabled');
        },

        /**
         * Updates send button state.
         */
        checkSendButtonState: function Ui_checkSendButtonState() {
            if (
                app.helpers.checkStringLength($('#text').val().trim()) &&
                    app.isConnection()
            ) {
                this.enableSendButton();
            } else {
                this.disableSendButton();
            }
        },

        /**
         * Scrolls to bottom scrollview of element given as parameter.
         * @param {jQueryElement} element
         */
        scrollToBottom: function Ui_scrollToBottom(element) {
            var bottom =
                element.children().first().outerHeight(true) - element.height();
            element.scrollview('scrollTo', 0, -Math.max(0, bottom), 0);
        },

        /**
         * Performs action when new message has been sent.
         * @param {string} message
         */
        displaySentMessage: function Ui_displaySentMessage(message) {
            var listElement, ul, content, self = this;
            message = decodeURIComponent(message);
            listElement = this.templateManager.get('right_bubble', {
                'text': message
            });
            content = $('#chat-content');
            ul = content.find('ul');
            ul.append(listElement);
            ul.listview('refresh');
            this.checkSendButtonState();
            this.scrolltimeout = setTimeout(
                function displaySentMessageScrollBottomTimeout() {
                    self.scrolltimeout = null;
                    self.scrollToBottom(content);
                },
                700
            );
        },

        /**
         * Shows/hides discovering progress.
         * @param {boolean} boolean
         */
        setDiscoveringProgress: function Ui_setDiscoveringProgress(boolean) {
            $('#discovering')
                .progress('hide', !boolean)
                .progress('running', boolean);
        },

        /**
         * Shows popup.
         * @param {string} text
         * @param {function} callback
         * @param {object} buttons
         */
        popup: function Ui_popup(text, callback, buttons) {
            var i, popup = $('#popup');

            if (!popup.hasClass('ui-popup')) {
                popup.popup();
            }

            if (!buttons) {
                buttons = {
                    'OK': function onOkButtonClick() {
                        $('#popup').popup('close');
                    }
                };
            }

            $('.ui-popup-button-bg', popup).empty();

            /*jslint regexp: true*/
            popup[0].className =
                popup[0].className.replace(/\bcenter_basic.*?\b/g, '');
            /*jslint regexp: false*/
            popup.addClass(
                'center_basic_' + Object.keys(buttons).length + 'btn'
            );

            for (i in buttons) {
                if (buttons.hasOwnProperty(i)) {
                    if (buttons[i]) {
                        $('<a/>')
                            .text(i)
                            .attr({
                                'data-role': 'button',
                                'data-inline': 'true'
                            })
                            .bind('click', buttons[i])
                            .appendTo($('.ui-popup-button-bg', popup));
                    }
                }
            }
            $('.ui-popup-text p', popup).text(text);

            if (callback instanceof Function) {
                popup.one('popupafterclose', callback);
            }
            popup.trigger('create');
            $.mobile.changePage('#popup_page', {transition: 'none'});
            popup.popup('open', {positionTo: 'window'});
        },

        /**
         * Returns string where all special characters are converted
         * to HTML entities.
         * @param {string} str
         * @return {string}
         */
        escape: function Ui_escape(str) {
            return $('<span>').text(str).html();
        }
    };

}());
