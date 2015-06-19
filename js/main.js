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

/*global $, tizen, App, console */

var app = null;

(function strict() {
    'use strict';

    ({
        /**
        * Loads the App constructor.
        */
        init: function init() {
            var self = this;
            $.getScript('js/app.js')
                .done(function onGetAppScriptDone() {
                    app = new App();
                    self.loadLibs();
                })
                .fail(this.onGetScriptError);
        },

        /**
        * Loads dependencies.
        */
        loadLibs: function loadLibs() {
            var loadedLibs = 0,
                i = 0,
                filename = null;

            function onGetScriptDone() {
                loadedLibs += 1;
                if (loadedLibs >= app.requires.length) {
                    app.init();
                }
            }

            if ($.isArray(app.requires)) {
                for (i = 0; i < app.requires.length; i += 1) {
                    filename = app.requires[i];
                    $.getScript(filename)
                        .done(onGetScriptDone)
                        .fail(this.onGetScriptError);
                }
            }
        },

        /**
        * Handles ajax errors.
        */
        onGetScriptError: function onGetScriptError(e) {
            console.error('An error occurred: ' + e.message);
        }

    }).init();

}());
