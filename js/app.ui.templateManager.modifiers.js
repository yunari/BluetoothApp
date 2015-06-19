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

/*global $*/

/**
 * @class ModifierManager
 */
function ModifierManager() {
    'use strict';
    this.init();
}

(function strict() {
    'use strict';
    ModifierManager.prototype = {

        /**
         * Initializes ModifierManager object.
         */
        init: function ModifierManager_init() {
            return;
        },

        /**
         * Returns modifiers object.
         * @return {object}
         */
        getAll: function ModifierManager_getAll() {
            return this.modifiers;
        },

        /**
         * Modifiers definitions.
         */
        modifiers: {
            escape: function escape(str) {
                return $('<span>').text(str).html();
            },
            escapeEncies: function escapeEncies(str) {
                var tagsToReplace = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                };
                return str.replace(/[&<>\"]/g, function replaceEntity(tag) {
                    return tagsToReplace[tag] || tag;
                });
            },
            nl2br: function escape(str) {
                return str.replace(/\n/g, '<br/>');
            }
        }
    };
}());
