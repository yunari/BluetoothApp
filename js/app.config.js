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
/*global $, tizen, app */

/**
* @class Config
*/
function Config() {
    'use strict';
    return;
}

(function strict() {
    'use strict';
    Config.prototype = {

        properties: {
            'templateDir': 'templates',
            'templateExtension': '.tpl'
        },

        /**
        * Returns config value.
        */
        get: function Config_get(value, defaultValue) {
            if (this.properties.hasOwnProperty(value)) {
                return this.properties[value];
            }
            return defaultValue;
        }

    };

}());
