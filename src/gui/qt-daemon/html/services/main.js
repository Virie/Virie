// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function() {
    'use strict';
    var module = angular.module('app.services', []);

    module.factory('sortingParamsLists', function () {
        return {
            safeList: {
                safeSortBy: 'name',
                safeSortDir: false
            },
            safeDetails: {
                historySortBy: 'timestamp',
                historySortDir: true
            },
            contacts: {
                contactsSortBy: 'name',
                contactsSortDir: true
            },
            contactDetails: {
                historySortBy: 'timestamp',
                historySortDir: true
            },
            trHistory: {
                historySortBy: 'timestamp',
                historySortDir: true
            },
            miningHistory: {
                miningSortBy: 't',
                miningSortDir: true
            },
            index: {
                historyOutSortBy: 'timestamp',
                historyOutSortDir: true,
                historyInSortBy: 'timestamp',
                historyInSortDir: true,
                currencyOutSortBy: 0,
                currencyOutSortDir: true,
                currencyInSortBy: 0,
                currencyInSortDir: true,
                goodsOutSortBy: 0,
                goodsOutSortDir: true,
                goodsInSortBy: 0,
                goodsInSortDir: true,
                currencyFavSortBy: 0,
                currencyFavSortDir: true,
                goodsFavSortBy: 0,
                goodsFavSortDir: true,
                contactSortBy: 'name',
                contactSortDir: true
            }
        }
    });

    module.factory('messengerList', function () {
        return [
            {name: 'Jabber (XMPP)'},
            {name: 'KakaoTalk'},
            {name: 'Line'},
            {name: 'Signal'},
            {name: 'Skype'},
            {name: 'Telegram'},
            {name: 'Viber'},
            {name: 'WeChat'},
            {name: 'WhatsApp'}
        ]
    });

    module.factory('showHideTabs', function () {
        return {
            safes: {
                paginatorLimit: 20
            },
            safe: {
                info: true,
                copy: true,
                history: true,
                historyFilter: false
            },
            safe_arr: {},
            market: {
                currencyFilter: false,
                goodsFilter: false,
                paginatorLimit: 20
            },
            contacts: {
                paginatorLimit: 20
            },
            contact: {
                info: true,
                history: true
            },
            history: {
                historyFilter: false,
                paginatorLimit: 20
            },
            mining: {
                calc: true,
                activeTab: 'graph',
                paginatorLimit: 20
            },
            contracts: {
                paginatorLimit: 20
            }
        }
    });

    module.factory('marketAge', ['$filter', function ($filter) {
        var service = {};

        service.settings = {
            fullDateAfterSeconds: null,
            strings: {}
        };

        service.initLang = function () {
            service.settings.strings = {
                seconds: $filter('translate')('TIME.AGE.JUST_NOW'),
                minutes: '%d' + $filter('translate')('TIME.AGE.MINUTES'),
                hours: '%d' + $filter('translate')('TIME.AGE.HOURS'),
                days: '%d' + $filter('translate')('TIME.AGE.DAYS')
            };
        };

        service.initLang();

        service.inWords = function (distanceMillis, fromTime, format, timezone) {
            var fullDateAfterSeconds = parseInt(service.settings.fullDateAfterSeconds, 10);
            if (!isNaN(fullDateAfterSeconds)) {
                var fullDateAfterMillis = fullDateAfterSeconds * 1000;
                if ((distanceMillis >= 0 && fullDateAfterMillis <= distanceMillis) ||
                    (distanceMillis < 0 && fullDateAfterMillis >= distanceMillis)) {
                    if (format) {
                        return $filter('date')(fromTime, format, timezone);
                    }
                    return fromTime;
                }
            }

            var $l = service.settings.strings;

            distanceMillis = distanceMillis < 0 ? 0 : distanceMillis;
            var seconds = Math.abs(distanceMillis) / 1000;
            var minutes = Math.floor((seconds / 60) % 60);
            var hours = Math.floor((seconds / (60 * 60)) % 24);
            var days = Math.floor(seconds / (60 * 60 * 24));

            function substitute(stringOrFunction, number) {
                var string = angular.isFunction(stringOrFunction) ?
                    stringOrFunction(number, distanceMillis) : stringOrFunction;
                var value = ($l.numbers && $l.numbers[number]) || number;
                return string.replace(/%d/i, value);
            }

            var words;
            if (seconds < 60) {
                words = substitute($l.seconds, Math.round(seconds));
            } else if (minutes !== 0 && hours === 0 && days === 0) {
                words = substitute($l.minutes, minutes);
            } else if (hours !== 0 && days === 0) {
                words = substitute($l.hours, hours) + ' ' + substitute($l.minutes, minutes);
            } else {
                words = substitute($l.days, days) + ' ' + substitute($l.hours, hours) + ' ' + substitute($l.minutes, minutes);
            }

            return words;
        };

        service.parse = function (input) {
            if (input instanceof Date) {
                return input;
            } else if (angular.isNumber(input)) {
                return new Date(input);
            } else if (/^\d+$/.test(input)) {
                return new Date(parseInt(input, 10));
            } else {
                var s = (input || '').trim();
                s = s.replace(/\.\d+/, ''); // remove milliseconds
                s = s.replace(/-/, '/').replace(/-/, '/');
                s = s.replace(/T/, ' ').replace(/Z/, ' UTC');
                s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
                return new Date(s);
            }
        };

        return service;
    }]);

    module.factory('informer', ['$filter', function ($filter) {
        return {
            success: function (title, description) {
                if (angular.isDefined(title) && angular.isUndefined(description)) {
                    description = title;
                    title = 'MESSAGE.SUCCESS';
                } else if (angular.isUndefined(title)) {
                    title = 'MESSAGE.SUCCESS';
                }
                this.create('t', 'success', 2500, title, description);
            },
            error: function (title, description) {
                if (angular.isDefined(title) && angular.isUndefined(description)) {
                    description = title;
                    title = 'MESSAGE.ERROR';
                } else if (angular.isUndefined(title)) {
                    title = 'MESSAGE.ERROR';
                }
                this.create(':', 'error', false, title, description);
            },
            warning: function (title, description) {
                if (angular.isDefined(title) && angular.isUndefined(description)) {
                    description = title;
                    title = 'MESSAGE.WARNING';
                } else if (angular.isUndefined(title)) {
                    title = 'MESSAGE.WARNING';
                }
                this.create('@', 'warning', false, title, description);
            },
            info: function (title, description) {
                if (angular.isDefined(title) && angular.isUndefined(description)) {
                    description = title;
                    title = 'MESSAGE.INFORMATION';
                } else if (angular.isUndefined(title)) {
                    title = 'MESSAGE.INFORMATION';
                }
                this.create('@', 'info', false, title, description);
            },
            fileNotFound: function (title, description) {
                if (angular.isDefined(title) && angular.isUndefined(description)) {
                    description = title;
                    title = 'MESSAGE.ERROR';
                } else if (angular.isUndefined(title)) {
                    title = 'MESSAGE.ERROR';
                }
                this.create(':', 'file-not-found', false, title, description);
            },
            create: function (icon, classes, autoClose, title, description) {
                if (angular.element('.informer-window-wrapper').length) {
                    angular.element('.informer-window-wrapper').click();
                }
                var block = document.createElement('div');
                angular.element(block).addClass('informer-window-wrapper');
                angular.element(block).append('<div class="informer-window"><i data-icon="" class="base-icon"></i><div class="informer-message"></div><div class="informer-details"></div></div>');
                if (classes) angular.element(block).find('.informer-window').addClass(classes);
                if (icon) angular.element(block).find('.base-icon').attr('data-icon', icon);
                if (title) angular.element(block).find('.informer-message').html($filter('translate')(title));
                if (description) angular.element(block).find('.informer-details').html($filter('translate')(description));
                var timerAutoClose;
                if (autoClose) {
                    timerAutoClose = setTimeout(function () {
                        angular.element(block).remove();
                    }, autoClose);
                }
                block.addEventListener('click', function () {
                    angular.element(block).remove();
                    if (timerAutoClose) clearTimeout(timerAutoClose);
                });
                block.addEventListener('keydown', function (e) {
                    if (e.keyCode === 13 || e.keyCode === 27) {
                        angular.element(block).remove();
                        if (timerAutoClose) clearTimeout(timerAutoClose);
                    }
                });
                document.body.appendChild(block);
                block.tabIndex = -1;
                block.focus();
            }
        }
    }]);

    module.factory('txHistory', ['$rootScope', '$filter', function ($rootScope, $filter) {

        var getCounterpartyTranslate = function (type) {
            switch (type) {
                case 0: return $filter('translate')('GUI_TX_TYPE_NORMAL');
                case 1: return $filter('translate')('GUI_TX_TYPE_PUSH_OFFER');
                case 2: return $filter('translate')('GUI_TX_TYPE_UPDATE_OFFER');
                case 3: return $filter('translate')('GUI_TX_TYPE_CANCEL_OFFER');
                case 4: return $filter('translate')('GUI_TX_TYPE_NEW_ALIAS');
                case 5: return $filter('translate')('GUI_TX_TYPE_UPDATE_ALIAS');
                case 6: return $filter('translate')('GUI_TX_TYPE_COIN_BASE');
                case 7: return $filter('translate')('GUI_TX_TYPE_ESCROW_PROPOSAL');
                case 8: return $filter('translate')('GUI_TX_TYPE_ESCROW_TRANSFER');
                // case 9: return $filter('translate')('GUI_TX_TYPE_ESCROW_RELEASE_NORMAL');
                case 10: return $filter('translate')('GUI_TX_TYPE_ESCROW_RELEASE_BURN');
                case 11: return $filter('translate')('GUI_TX_TYPE_ESCROW_CANCEL_PROPOSAL');
                case 12: return $filter('translate')('GUI_TX_TYPE_ESCROW_RELEASE_CANCEL');
            }
        };

        var addMoreFields = function (arr) {
            var temp = [];
            angular.forEach(arr, function (item) {
                if (item['tx_type'] === 0 && item['remote_addresses'] && angular.isDefined($rootScope.aliases)) {
                    item.alias = $rootScope.getSafeAlias(item['remote_addresses'][0]);
                    item.contact = $rootScope.getContactByAddress(item['remote_addresses'][0]);
                }
                if (item['tx_type'] === 0) {
                    if (item['remote_addresses'] && item['remote_addresses'][0]) {
                        item.counterparty_translated = item['remote_addresses'][0];
                    } else {
                        if (item.is_income) {
                            item.counterparty_translated = $filter('translate')('COMMON.HIDDEN');
                        } else {
                            item.counterparty_translated = $filter('translate')('COMMON.NOT_DEFINED');
                        }
                    }
                } else if (item['tx_type'] === 6 && item.height === 0) {
                    item.counterparty_translated = $filter('translate')('TRANSACTION.TYPE.UNKNOWN');
                } else if (item['tx_type'] === 9) {
                    if (item.hasOwnProperty('contract') && item.contract[0].is_a) {
                        item.counterparty_translated = $filter('translate')('GUI_TX_TYPE_ESCROW_RELEASE_NORMAL');
                    } else {
                        item.counterparty_translated = $filter('translate')('GUI_TX_TYPE_ESCROW_RELEASE_NORMAL_SELLER');
                    }
                } else {
                    item.counterparty_translated = getCounterpartyTranslate(item.tx_type);
                }
                if (item['tx_type'] === 4) {
                    item.sortFee = -(item.amount + item.fee);
                    item.sortAmount = 0;
                } else if (item['tx_type'] === 3) {
                    item.sortFee = 0;
                } else if ((item.hasOwnProperty('contract') && (item.contract[0].state === 3 || item.contract[0].state === 6 || item.contract[0].state === 601) && !item.contract[0].is_a)) {
                    item.sortFee = -item.fee;
                    item.sortAmount = item.amount;
                } else {
                    if (!item.is_income) {
                        item.sortFee = -item.fee;
                        item.sortAmount = -item.amount;
                    } else {
                        item.sortAmount = item.amount;
                    }
                }
                temp.push(item);
            });
            return temp;
        };

        return {
            reloadHistory: function () {
                var temp = [];
                angular.forEach($rootScope.safes, function (safe) {
                    if (angular.isDefined(safe.history)) {
                        angular.forEach(safe.history, function (item) {
                            item.wallet_id = angular.copy(safe.wallet_id);
                            item.safeName = safe.name;
                            item.safeAddress = safe.address;
                            temp.push(item);
                        });
                    }
                }, true);
                temp = addMoreFields(temp);
                return temp;
            },
            contactHistory: function (contact) {
                var temp = [];
                angular.forEach($rootScope.safes, function (safe) {
                    if (angular.isDefined(safe.history)) {
                        angular.forEach(safe.history, function (item) {
                            if (angular.isDefined(contact.addresses) && item['remote_addresses'] && contact.addresses.indexOf(item['remote_addresses'][0]) > -1) {
                                item.wallet_id = angular.copy(safe.wallet_id);
                                item.safeName = safe.name;
                                item.safeAddress = safe.address;
                                temp.push(item);
                            }
                        });
                    }
                }, true);
                temp = addMoreFields(temp);
                return temp;
            },
            safeHistory: function (safe) {
                var temp = [];
                if (angular.isDefined(safe.history)) {
                    angular.forEach(safe.history, function (item) {
                        item.wallet_id = angular.copy(safe.wallet_id);
                        item.safeName = safe.name;
                        item.safeAddress = safe.address;
                        temp.push(item);
                    });
                }
                temp = addMoreFields(temp);
                return temp;
            },
            contractHistory: function (contractId, isA, txType) {
                var temp = [];
                angular.forEach($rootScope.safes, function (safe) {
                    if (angular.isDefined(safe.history)) {
                        for (var i = 0; i < safe.history.length; i++) {
                            var item = safe.history[i];
                            if (item['tx_type'] === txType && item.contract.length && item.contract[0].contract_id === contractId && item.contract[0].is_a === isA) {
                                item.wallet_id = angular.copy(safe.wallet_id);
                                item.safeName = safe.name;
                                item.safeAddress = safe.address;
                                temp.push(item);
                                break;
                            }
                        }
                    }
                }, true);
                temp = addMoreFields(temp);
                return (temp.length) ? temp[0] : {};
            }
        };

    }]);

    module.service('cancelingCreate', [function () {
        this.savedOffer = null;
    }]);

    module.factory('market', ['CONFIG', '$rootScope', '$filter', 'uuid', 'informer', function (CONFIG, $rootScope, $filter, uuid, informer) {

        var instance = {};

        instance.offerPrepareForForm = function (offer) {
            var o = angular.copy(offer);

            o.offer_type = o.ot;
            o.amount_p = $rootScope.coinsParse(o.ap, false);
            o.amount_etc = $rootScope.coinsParse(o.at, false);
            o.target = o.t;
            o.location_city = o.lci;
            o.location_country = o.lco;
            o.contacts = o.cnt;
            o.comment = o.com;
            o.payment_types = o.pt;
            o.expiration_time = o.et;
            o.bonus = o.b;
            o.deal_option = o.do;
            o.category = o.cat;
            o.currency = o.p;

            if (o.expiration_time === 0) o.expiration_time = 14;

            if (o.location_country === '000All' || o.location_country === '') {
                o.initial_country = '';
            } else {
                var country = $filter('filter')($rootScope.countryList, {alpha2Code: o.location_country});
                if (country.length) {
                    country = country[0];
                    o.initial_country = country.name;
                }
            }

            var safe = $filter('filter')($rootScope.safes, o.tx_hash);
            if (safe.length) {
                o.wallet_id = safe[0].wallet_id;
            } else {
                informer.error('INFORMER.NOT_FIND_SAFE');
            }

            o.fee_premium = CONFIG.premiumFee;
            o.fee_standard = CONFIG.standardFee;

            if (o.fee === CONFIG.premiumFee * Math.pow(10, CONFIG.CDDP)) {
                o.is_premium = true;
                o.is_standard = false;
            } else {
                o.is_premium = false;
                o.is_standard = true;
                o.fee_standard = $rootScope.moneyParse(o.fee, false);
            }

            o.categories = o.category.split(',');

            var tmp;

            if (o.contacts.length) {
                tmp = [];
                if (Array.isArray(o.contacts) === false) {
                    try {
                        o.contacts = JSON.parse(o.contacts);
                    } catch (error) {
                        o.contacts = [];
                    }

                }
                angular.forEach(o.contacts, function (item) {
                    angular.forEach(item, function (value, key) {
                        var id = uuid.generate();
                        if (Object.keys(instance.contacts).indexOf(key) === -1) {
                            tmp.push({
                                id: id,
                                type: 'IMS',
                                new_type: 'IMS',
                                is_edit: false,
                                name: key,
                                username: value
                            });
                        } else {
                            tmp.push({
                                id: id,
                                type: key,
                                new_type: key,
                                is_edit: false,
                                name: value,
                                username: ''
                            });
                        }
                    });
                });
                o.contacts = tmp;
            }

            try {
                o.deal_details = JSON.parse(o.payment_types);
            } catch (e) {
                o.deal_details = [];
            }

            angular.forEach(o.deal_details, function (item, index) {
                if (item === 'DELIVERY') {
                    delete o.deal_details[index];
                }
            });

            if (o.deal_details !== undefined && o.deal_details.length) {
                tmp = [];
                if (Array.isArray(o.deal_details) === false) {
                    try {
                        o.deal_details = JSON.parse(o.deal_details);
                    } catch (error) {
                        o.deal_details = [];
                    }

                }
                angular.forEach(o.deal_details, function (item) {
                    var type = item;
                    if (Object.keys(instance.deliveryWays).indexOf(item) === -1) {
                        type = 'DELIVERY';
                    }

                    var id = uuid.generate();
                    var deliveryWay = {
                        id: id,
                        type: type,
                        new_type: type,
                        is_edit: (type === 'DELIVERY' && item === ''),
                        name: type === 'DELIVERY' ? item : ''
                    };

                    tmp.push(deliveryWay);
                });
                o.deal_details = tmp;
            }

            return o;
        };

        instance.gOfferPrepareForForm = function (offer) {
            var o = angular.copy(offer);

            o.offer_type = o.ot;
            o.amount_p = $rootScope.coinsParse(o.ap, false);
            o.amount_etc = $rootScope.coinsParse(o.at, false);
            o.target = o.t;
            o.location_city = o.lci;
            o.location_country = o.lco;
            o.contacts = o.cnt;
            o.comment = o.com;
            o.payment_types = o.pt;
            o.expiration_time = o.et;
            o.bonus = o.b;
            o.deal_option = o.do;
            o.category = o.cat;
            o.currency = o.p;

            if (o.expiration_time === 0) o.expiration_time = 14;

            if (o.location_country === '000All' || o.location_country === '') {
                o.initial_country = '';
            } else {
                var country = $filter('filter')($rootScope.countryList, {alpha2Code: o.location_country});
                if (country.length) {
                    country = country[0];
                    o.initial_country = country.name;
                }
            }

            var safe = $filter('filter')($rootScope.safes, o.tx_hash);
            if (safe.length) {
                o.wallet_id = safe[0].wallet_id;
            } else {
                informer.error('INFORMER.NOT_FIND_SAFE');
            }

            o.fee_premium = CONFIG.premiumFee;
            o.fee_standard = CONFIG.standardFee;

            if (o.fee === CONFIG.premiumFee * Math.pow(10, CONFIG.CDDP)) {
                o.is_premium = true;
                o.is_standard = false;
            } else {
                o.is_premium = false;
                o.is_standard = true;
                o.fee_standard = $rootScope.moneyParse(o.fee, false);
            }

            var tmp;

            if (o.payment_types.length) {
                tmp = [];
                if (Array.isArray(o.payment_types) === false) {
                    try {
                        o.payment_types = JSON.parse(o.payment_types);
                    } catch (error) {
                        o.payment_types = []
                    }

                }
                angular.forEach(o.payment_types, function (item, index) {
                    if (item === 'EPS') {
                        delete o.payment_types[index];
                    }
                });
                angular.forEach(o.payment_types, function (item) {
                    var type = item;
                    if (Object.keys(instance.paymentTypes).indexOf(item) === -1) {
                        type = 'EPS';
                    }
                    var id = uuid.generate();
                    var payment_type = {
                        id: id,
                        type: type,
                        new_type: type,
                        is_edit: false,
                        name: type === 'EPS' ? item : ''
                    };
                    tmp.push(payment_type);
                });
                o.payment_types = tmp;
            }

            if (o.contacts.length) {
                tmp = [];
                if (Array.isArray(o.contacts) === false) {
                    try {
                        o.contacts = JSON.parse(o.contacts);
                    } catch (error) {
                        o.contacts = [];
                    }

                }
                angular.forEach(o.contacts, function (item) {
                    angular.forEach(item, function (value, key) {
                        var id = uuid.generate();
                        if (Object.keys(instance.contacts).indexOf(key) === -1) {
                            tmp.push({
                                id: id,
                                type: 'IMS',
                                new_type: 'IMS',
                                is_edit: false,
                                name: key,
                                username: value
                            });
                        } else {
                            tmp.push({
                                id: id,
                                type: key,
                                new_type: key,
                                is_edit: false,
                                name: value,
                                username: ''
                            });
                        }
                    });
                });
                o.contacts = tmp;
            }

            o.currency = o.target;

            if (o.deal_details !== undefined && o.deal_details.length) {
                try {
                    o.deal_details = JSON.parse(o.deal_details);
                } catch (error) {
                    o.deal_details = [];
                }

            } else if (o.deal_option.length) {
                o.deal_details = o.deal_option.split(',');
            }

            return o;
        };

        instance.gOfferPrepareForSave = function (offer) {
            var o = angular.copy(offer);

            var temp = [];
            angular.forEach(o.contacts, function (item) {
                var contact = {};
                if (item.type !== 'IMS') {
                    contact[item.type] = item.name;
                } else {
                    contact[item.name] = item.username;
                }
                temp.push(contact);
            });
            o.contacts = JSON.stringify(temp);

            temp = [];
            var tmp = false;

            angular.forEach(o.payment_types, function (item) {
                if (item.type !== 'EPS') {
                    temp.push(item.type);
                } else {
                    temp.push(item.name);
                    tmp = true;
                }
            });

            if (tmp) {
                temp.push('EPS');
            }

            var temp2 = [];
            if (temp.indexOf('BTX') > -1) {
                temp.splice(temp.indexOf('BTX'), 1);
                temp2.push('BTX');
            }
            if (temp.indexOf('BCX') > -1) {
                temp.splice(temp.indexOf('BCX'), 1);
                temp2.push('BCX');
            }
            if (temp.indexOf('CSH') > -1) {
                temp.splice(temp.indexOf('CSH'), 1);
                temp2.push('CSH');
            }
            if (temp.indexOf('EPS') > -1) {
                temp.splice(temp.indexOf('EPS'), 1);
                temp2.push('EPS');
            }
            temp = temp2.concat(temp);

            o.payment_types = JSON.stringify(temp);

            if (o.deal_details !== undefined) {
                if (Array.isArray(o.deal_details) === true) {
                    o.deal_details = o.deal_details.join(',');
                }
                o.deal_option = o.deal_details;
            }
            o.target = o.currency;
            return o;
        };

        instance.offerPrepareForSave = function (offer) {
            var o = angular.copy(offer);

            var temp = [];
            angular.forEach(o.contacts, function (item) {
                var contact = {};
                if (item.type !== 'IMS') {
                    contact[item.type] = item.name;
                } else {
                    contact[item.name] = item.username;
                }
                temp.push(contact);
            });
            o.contacts = JSON.stringify(temp);

            o.category = o.categories.join(',');

            temp = [];
            var hasOtherDelivery = false;
            angular.forEach(o.deal_details, function (item) {
                if (item.type !== 'DELIVERY') {
                    temp.push(item.type);
                } else {
                    temp.push(item.name);
                    hasOtherDelivery = true;
                }
            });
            if (hasOtherDelivery) {
                temp.push('DELIVERY');
            }
            o.deal_details = '';
            o.payment_types = JSON.stringify(temp);

            o.fee = o.is_premium ? o.fee_premium : o.fee_standard;
            return o;
        };

        instance.paymentTypes = {
            EPS: {title: 'PAYMENT_TYPES.ELECTRONIC', classname: 'W'},
            BCX: {title: 'PAYMENT_TYPES.CARD', classname: 'X'},
            BTX: {title: 'PAYMENT_TYPES.SEND', classname: 'Y'},
            CSH: {title: 'PAYMENT_TYPES.CASH', classname: 'Z'}
        };

        instance.contacts = {
            EMAIL: {title: 'CONTACTS.EMAIL', classname: '', placeholder: 'CONTACTS.EMAIL.PLACEHOLDER'},
            PHONE: {title: 'CONTACTS.PHONE', classname: '', placeholder: 'CONTACTS.PHONE.PLACEHOLDER'},
            IMS: {title: 'CONTACTS.MESSENGER', classname: '', placeholder: ''}
        };

        instance.deliveryWays = {
            HANDS: {title: 'DELIVERY_WAYS.HANDS', classname: 'delivery-1'},
            STORAGE: {title: 'DELIVERY_WAYS.WAREHOUSE', classname: 'delivery-2'},
            DELIVERY: {title: 'DELIVERY_WAYS.DELIVERY', classname: 'delivery-3'}
        };

        instance.dealDetails = [
            {key: 'ALL', value: 'DEAL.ALL_AMOUNT'},
            {key: 'PARTS', value: 'DEAL.MAY_SEPARATE'},
            {key: 'CANMEET', value: 'DEAL.MAY_MEET'},
            {key: 'CANNOTMEET', value: 'DEAL.CANT_MEET'}
        ];

        var currenciesOriginal = [
            {rank: 1, code: 'USD', title: 'CURRENCY.USD'},
            {rank: 2, code: 'EUR', title: 'CURRENCY.EUR'},
            {rank: 3, code: 'CNY', title: 'CURRENCY.CNY'},
            {rank: 4, code: 'GBP', title: 'CURRENCY.GBP'},
            {rank: 5, code: 'CHF', title: 'CURRENCY.CHF'},
            {rank: 6, code: 'KRW', title: 'CURRENCY.KRW'},
            {rank: 7, code: 'JPY', title: 'CURRENCY.JPY'},
            {rank: 8, code: 'BTC', title: 'CURRENCY.BTC'},
            {rank: 9, code: 'EOS', title: 'CURRENCY.EOS'},
            {rank: 10, code: 'ETH', title: 'CURRENCY.ETH'},
            {rank: 11, code: 'LTC', title: 'CURRENCY.LTC'},
            {rank: 12, code: 'XMR', title: 'CURRENCY.XMR'},
            {rank: 13, code: 'USDT', title: 'CURRENCY.USDT'},
            {rank: 14, code: 'USDC', title: 'CURRENCY.USDC'},
            {rank: 15, code: 'PAX', title: 'CURRENCY.PAX'},

            {rank: 100, code: 'INR', title: 'CURRENCY.INR'},
            {rank: 100, code: 'BRR', title: 'CURRENCY.BRR'},
            {rank: 100, code: 'RUR', title: 'CURRENCY.RUR'},
            {rank: 100, code: 'AUD', title: 'CURRENCY.AUD'},
            {rank: 100, code: 'CAD', title: 'CURRENCY.CAD'},
            {rank: 100, code: 'SGD', title: 'CURRENCY.SGD'},
            {rank: 100, code: 'MYR', title: 'CURRENCY.MYR'},
            {rank: 100, code: 'AZN', title: 'CURRENCY.AZN'},
            {rank: 100, code: 'ALL', title: 'CURRENCY.ALL'},
            {rank: 100, code: 'DZD', title: 'CURRENCY.DZD'},
            {rank: 100, code: 'AOA', title: 'CURRENCY.AOA'},
            {rank: 100, code: 'ARS', title: 'CURRENCY.ARS'},
            {rank: 100, code: 'AMD', title: 'CURRENCY.AMD'},
            {rank: 100, code: 'AWG', title: 'CURRENCY.AWG'},
            {rank: 100, code: 'AFN', title: 'CURRENCY.AFA'},
            {rank: 100, code: 'BSD', title: 'CURRENCY.BSD'},
            {rank: 100, code: 'BDT', title: 'CURRENCY.BDT'},
            {rank: 100, code: 'BBD', title: 'CURRENCY.BBD'},
            {rank: 100, code: 'BHD', title: 'CURRENCY.BHD'},
            {rank: 100, code: 'BZD', title: 'CURRENCY.BZD'},
            {rank: 100, code: 'BYB', title: 'CURRENCY.BYB'},
            {rank: 100, code: 'BGL', title: 'CURRENCY.BGL'},
            {rank: 100, code: 'BOB', title: 'CURRENCY.BOB'},
            {rank: 100, code: 'BWP', title: 'CURRENCY.BWP'},
            {rank: 100, code: 'BND', title: 'CURRENCY.BND'},
            {rank: 100, code: 'BMD', title: 'CURRENCY.BMD'},
            {rank: 100, code: 'BIF', title: 'CURRENCY.BIF'},
            {rank: 100, code: 'VUV', title: 'CURRENCY.VUV'},
            {rank: 100, code: 'HUF', title: 'CURRENCY.HUF'},
            {rank: 100, code: 'VEB', title: 'CURRENCY.VEB'},
            {rank: 100, code: 'XCD', title: 'CURRENCY.XCD'},
            {rank: 100, code: 'VND', title: 'CURRENCY.VND'},
            {rank: 100, code: 'HTG', title: 'CURRENCY.HTG'},
            {rank: 100, code: 'GMD', title: 'CURRENCY.GMD'},
            {rank: 100, code: 'GHC', title: 'CURRENCY.GHC'},
            {rank: 100, code: 'GTQ', title: 'CURRENCY.GTQ'},
            {rank: 100, code: 'GNF', title: 'CURRENCY.GNF'},
            {rank: 100, code: 'GIP', title: 'CURRENCY.GIP'},
            {rank: 100, code: 'HNL', title: 'CURRENCY.HML'},
            {rank: 100, code: 'GEL', title: 'CURRENCY.GEL'},
            {rank: 100, code: 'ANG', title: 'CURRENCY.ANG'},
            {rank: 100, code: 'DKK', title: 'CURRENCY.DKK'},
            {rank: 100, code: 'RSD', title: 'CURRENCY.RSD'},
            {rank: 100, code: 'AED', title: 'CURRENCY.AED'},
            {rank: 100, code: 'STD', title: 'CURRENCY.STD'},
            {rank: 100, code: 'ZWD', title: 'CURRENCY.ZWD'},
            {rank: 100, code: 'KYD', title: 'CURRENCY.KYD'},
            {rank: 100, code: 'SBD', title: 'CURRENCY.SBD'},
            {rank: 100, code: 'TTD', title: 'CURRENCY.TTD'},
            {rank: 100, code: 'FJD', title: 'CURRENCY.FJD'},
            {rank: 100, code: 'DOP', title: 'CURRENCY.DOP'},
            {rank: 100, code: 'EGP', title: 'CURRENCY.EGP'},
            {rank: 100, code: 'ZMK', title: 'CURRENCY.ZMK'},
            {rank: 100, code: 'NIO', title: 'CURRENCY.NIO'},
            {rank: 100, code: 'ILS', title: 'CURRENCY.ILS'},
            {rank: 100, code: 'IDR', title: 'CURRENCY.IDR'},
            {rank: 100, code: 'JOD', title: 'CURRENCY.JOD'},
            {rank: 100, code: 'IQD', title: 'CURRENCY.IQD'},
            {rank: 100, code: 'IRR', title: 'CURRENCY.IRR'},
            {rank: 100, code: 'IEP', title: 'CURRENCY.IEP'},
            {rank: 100, code: 'ISK', title: 'CURRENCY.ISK'},
            {rank: 100, code: 'YER', title: 'CURRENCY.YER'},
            {rank: 100, code: 'KHR', title: 'CURRENCY.KHR'},
            {rank: 100, code: 'QAR', title: 'CURRENCY.QAR'},
            {rank: 100, code: 'KES', title: 'CURRENCY.KES'},
            {rank: 100, code: 'PGK', title: 'CURRENCY.PGK'},
            {rank: 100, code: 'CTP', title: 'CURRENCY.CYP'},
            {rank: 100, code: 'COP', title: 'CURRENCY.COP'},
            {rank: 100, code: 'KMF', title: 'CURRENCY.KMF'},
            {rank: 100, code: 'BAM', title: 'CURRENCY.BAM'},
            {rank: 100, code: 'CRC', title: 'CURRENCY.CRC'},
            {rank: 100, code: 'CUP', title: 'CURRENCY.CUP'},
            {rank: 100, code: 'KWD', title: 'CURRENCY.KWD'},
            {rank: 100, code: 'HRK', title: 'CURRENCY.HRK'},
            {rank: 100, code: 'KGS', title: 'CURRENCY.KGS'},
            {rank: 100, code: 'MMK', title: 'CURRENCY.MMK'},
            {rank: 100, code: 'LAK', title: 'CURRENCY.LAK'},
            {rank: 100, code: 'LVL', title: 'CURRENCY.LVL'},
            {rank: 100, code: 'SLL', title: 'CURRENCY.SLL'},
            {rank: 100, code: 'LRD', title: 'CURRENCY.LRD'},
            {rank: 100, code: 'LBP', title: 'CURRENCY.LBP'},
            {rank: 100, code: 'LYD', title: 'CURRENCY.LYD'},
            {rank: 100, code: 'LTL', title: 'CURRENCY.LTL'},
            {rank: 100, code: 'LSL', title: 'CURRENCY.LSL'},
            {rank: 100, code: 'MUR', title: 'CURRENCY.MUR'},
            {rank: 100, code: 'MRO', title: 'CURRENCY.MRO'},
            {rank: 100, code: 'MKD', title: 'CURRENCY.MKD'},
            {rank: 100, code: 'MWK', title: 'CURRENCY.MWK'},
            {rank: 100, code: 'MGF', title: 'CURRENCY.MGF'},
            {rank: 100, code: 'MVR', title: 'CURRENCY.MVR'},
            {rank: 100, code: 'MTL', title: 'CURRENCY.MTL'},
            {rank: 100, code: 'MAD', title: 'CURRENCY.MAD'},
            {rank: 100, code: 'MXN', title: 'CURRENCY.MXN'},
            {rank: 100, code: 'MZM', title: 'CURRENCY.MZM'},
            {rank: 100, code: 'MDL', title: 'CURRENCY.MDL'},
            {rank: 100, code: 'MNT', title: 'CURRENCY.MNT'},
            {rank: 100, code: 'ERN', title: 'CURRENCY.ERN'},
            {rank: 100, code: 'BTN', title: 'CURRENCY.BTN'},
            {rank: 100, code: 'NPR', title: 'CURRENCY.NPR'},
            {rank: 100, code: 'NGN', title: 'CURRENCY.NGN'},
            {rank: 100, code: 'NZD', title: 'CURRENCY.NZD'},
            {rank: 100, code: 'PEN', title: 'CURRENCY.PEN'},
            {rank: 100, code: 'TWD', title: 'CURRENCY.TWD'},
            {rank: 100, code: 'NOK', title: 'CURRENCY.NOK'},
            {rank: 100, code: 'OMR', title: 'CURRENCY.OMR'},
            {rank: 100, code: 'TOP', title: 'CURRENCY.TOP'},
            {rank: 100, code: 'PKR', title: 'CURRENCY.PKR'},
            {rank: 100, code: 'PYG', title: 'CURRENCY.PYG'},
            {rank: 100, code: 'PLN', title: 'CURRENCY.PLZ'},
            {rank: 100, code: 'ROL', title: 'CURRENCY.ROL'},
            {rank: 100, code: 'SVC', title: 'CURRENCY.SVC'},
            {rank: 100, code: 'WST', title: 'CURRENCY.WST'},
            {rank: 100, code: 'SAR', title: 'CURRENCY.SAR'},
            {rank: 100, code: 'SZL', title: 'CURRENCY.SZL'},
            {rank: 100, code: 'KPW', title: 'CURRENCY.KPW'},
            {rank: 100, code: 'SCR', title: 'CURRENCY.SCR'},
            {rank: 100, code: 'SYP', title: 'CURRENCY.SYP'},
            {rank: 100, code: 'SOS', title: 'CURRENCY.SOS'},
            {rank: 100, code: 'SDD', title: 'CURRENCY.SDD'},
            {rank: 100, code: 'SRG', title: 'CURRENCY.SRG'},
            {rank: 100, code: 'THB', title: 'CURRENCY.THB'},
            {rank: 100, code: 'TZS', title: 'CURRENCY.TZS'},
            {rank: 100, code: 'KZT', title: 'CURRENCY.KZT'},
            {rank: 100, code: 'SIT', title: 'CURRENCY.SIT'},
            {rank: 100, code: 'TND', title: 'CURRENCY.TND'},
            {rank: 100, code: 'TRY', title: 'CURRENCY.TRY'},
            {rank: 100, code: 'TMM', title: 'CURRENCY.TMM'},
            {rank: 100, code: 'UGX', title: 'CURRENCY.UGS'},
            {rank: 100, code: 'UZS', title: 'CURRENCY.UZS'},
            {rank: 100, code: 'UAH', title: 'CURRENCY.UAH'},
            {rank: 100, code: 'UYU', title: 'CURRENCY.UYP'},
            {rank: 100, code: 'PHP', title: 'CURRENCY.PHP'},
            {rank: 100, code: 'DJF', title: 'CURRENCY.DJF'},
            {rank: 100, code: 'XOF', title: 'CURRENCY.XOF'},
            {rank: 100, code: 'XAF', title: 'CURRENCY.XAF'},
            {rank: 100, code: 'XOP', title: 'CURRENCY.XOP'},
            {rank: 100, code: 'XPF', title: 'CURRENCY.XPF'},
            {rank: 100, code: 'RWF', title: 'CURRENCY.RWF'},
            {rank: 100, code: 'FKP', title: 'CURRENCY.FKP'},
            {rank: 100, code: 'CZK', title: 'CURRENCY.CZK'},
            {rank: 100, code: 'CLP', title: 'CURRENCY.CLP'},
            {rank: 100, code: 'SEK', title: 'CURRENCY.SEK'},
            {rank: 100, code: 'LKR', title: 'CURRENCY.LKR'},
            {rank: 100, code: 'ESC', title: 'CURRENCY.ESC'},
            {rank: 100, code: 'CVE', title: 'CURRENCY.CVE'},
            {rank: 100, code: 'EEK', title: 'CURRENCY.EEK'},
            {rank: 100, code: 'ETB', title: 'CURRENCY.ETB'},
            {rank: 100, code: 'ZAR', title: 'CURRENCY.ZAR'},
            {rank: 100, code: 'JMD', title: 'CURRENCY.JMD'}
        ];

        instance.refreshCurrencies = function () {
            instance.currencies = angular.copy(currenciesOriginal);
            angular.forEach(instance.currencies, function (currency) {
                currency.title = $filter('translate')(currency.title);
            });
            instance.currencies = $filter('orderBy')(instance.currencies, ['rank', 'title']);
        };

        instance.refreshCurrencies();

        var categoriesOriginal = [
            // CRYPTOCURRENCY
            {
                id: 'AAA',
                parent: 'ROO',
                title: 'CATEGORIES.CRYPTOCURRENCY',
                subcategories: [
                    {
                        id: 'AAB',
                        parent: 'AAA',
                        title: 'CATEGORIES.PURCHASE_SALE_CRYPTOCURRENCY'
                    },
                    {
                        id: 'AAC',
                        parent: 'AAA',
                        title: 'CATEGORIES.EQUIPMENT_FOR_MINING'
                    },
                    {
                        id: 'AAD',
                        parent: 'AAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- CRYPTOCURRENCY

            {
                id: 'BAA',
                parent: 'ROO',
                title: 'CATEGORIES.INFO_AND_DATABASE'
            },
            {
                id: 'CAA',
                parent: 'ROO',
                title: 'CATEGORIES.SOFTWARE'
            },
            {
                id: 'DAA',
                parent: 'ROO',
                title: 'CATEGORIES.BOOKS_AND_MAGAZINES'
            },
            {
                id: 'EAA',
                parent: 'ROO',
                title: 'CATEGORIES.GIFT_CERTIFICATES'
            },
            {
                id: 'FAA',
                parent: 'ROO',
                title: 'CATEGORIES.PRECIOUS_METALS_PRECIOUS_STONES'
            },
            {
                id: 'GAA',
                parent: 'ROO',
                title: 'CATEGORIES.RECORDS'
            },
            {
                id: 'HAA',
                parent: 'ROO',
                title: 'CATEGORIES.VIDEO_AND_AUDIO'
            },

            // ELECTRONICS
            {
                id: 'IAA',
                parent: 'ROO',
                title: 'CATEGORIES.ELECTRONICS',
                subcategories: [
                    {
                        id: 'IAB',
                        parent: 'IAA',
                        title: 'CATEGORIES.AUDIO_AND_VIDEO'
                    },
                    {
                        id: 'IAC',
                        parent: 'IAA',
                        title: 'CATEGORIES.GAMES_CONSOLES'
                    },
                    {
                        id: 'IAD',
                        parent: 'IAA',
                        title: 'CATEGORIES.DESKTOPS'
                    },
                    {
                        id: 'IAE',
                        parent: 'IAA',
                        title: 'CATEGORIES.NOTEBOOKS'
                    },
                    {
                        id: 'IAF',
                        parent: 'IAA',
                        title: 'CATEGORIES.OFFICE_EQUIPMENT_AND_CONSUMABLES'
                    },
                    {
                        id: 'IAG',
                        parent: 'IAA',
                        title: 'CATEGORIES.TABLETS_AND_E_BOOKS'
                    },
                    {
                        id: 'IAH',
                        parent: 'IAA',
                        title: 'CATEGORIES.PHONES'
                    },
                    {
                        id: 'IAI',
                        parent: 'IJA',
                        title: 'CATEGORIES.COMMUNICATION_AND_TRANSMISSION_OF_INFORMATION'
                    },
                    {
                        id: 'IAK',
                        parent: 'IAA',
                        title: 'CATEGORIES.PHOTOGRAPHIC'
                    },
                    {
                        id: 'IAL',
                        parent: 'IAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- ELECTRONICS

            // HOBBIES_AND_LEISURE
            {
                id: 'JAA',
                parent: 'ROO',
                title: 'CATEGORIES.HOBBIES_AND_LEISURE',
                subcategories: [
                    {
                        id: 'JAB',
                        parent: 'JAA',
                        title: 'CATEGORIES.TICKETS_&_TRAVEL'
                    },
                    {
                        id: 'JAC',
                        parent: 'JAA',
                        title: 'CATEGORIES.COLLECTING'
                    },
                    {
                        id: 'JAD',
                        parent: 'JAA',
                        title: 'CATEGORIES.MUSICAL_INSTRUMENTS'
                    },
                    {
                        id: 'JAE',
                        parent: 'JAA',
                        title: 'CATEGORIES.HUNTING_AND_FISHING'
                    },
                    {
                        id: 'JAF',
                        parent: 'JAA',
                        title: 'CATEGORIES.SPORTS_AND_RECREATION'
                    },
                    {
                        id: 'JAG',
                        parent: 'JAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- HOBBIES_AND_LEISURE

            {
                id: 'KAA',
                parent: 'ROO',
                title: 'CATEGORIES.SECURITY'
            },
            {
                id: 'LAA',
                parent: 'ROO',
                title: 'CATEGORIES.PLANTS_AND_ANIMALS'
            },
            {
                id: 'MAA',
                parent: 'ROO',
                title: 'CATEGORIES.HEALTH_CARE_JOBS'
            },

            // CHEMISTRY
            {
                id: 'NAA',
                parent: 'ROO',
                title: 'CATEGORIES.CHEMISTRY',
                subcategories: [
                    {
                        id: 'NAB',
                        parent: 'NAA',
                        title: 'CATEGORIES.REAGENTS'
                    },
                    {
                        id: 'NAC',
                        parent: 'NAA',
                        title: 'CATEGORIES.EQUIPMENT'
                    },
                    {
                        id: 'NAD',
                        parent: 'NAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- CHEMISTRY

            // FOR_BUSINESS
            {
                id: 'OAA',
                parent: 'ROO',
                title: 'CATEGORIES.FOR_BUSINESS',
                subcategories: [
                    {
                        id: 'OAB',
                        parent: 'OAA',
                        title: 'CATEGORIES.READY_BUSINESS'
                    },
                    {
                        id: 'OAC',
                        parent: 'OAA',
                        title: 'CATEGORIES.EQUIPMENT_FOR_BUSINESS'
                    },
                    {
                        id: 'OAD',
                        parent: 'OAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- FOR_BUSINESS

            // FOR_HOME
            {
                id: 'PAA',
                parent: 'ROO',
                title: 'CATEGORIES.FOR_HOME',
                subcategories: [
                    {
                        id: 'PAB',
                        parent: 'PAA',
                        title: 'CATEGORIES.ANTIQUES'
                    },
                    {
                        id: 'PAC',
                        parent: 'PAA',
                        title: 'CATEGORIES.WHITE_GOODS'
                    },
                    {
                        id: 'PAD',
                        parent: 'PAA',
                        title: 'CATEGORIES.FURNITURE_AND_INTERIOR'
                    },
                    {
                        id: 'PAE',
                        parent: 'PAA',
                        title: 'CATEGORIES.DISHES_AND_PRODUCTS_FOR_THE_KITCHEN'
                    },
                    {
                        id: 'PAF',
                        parent: 'PAA',
                        title: 'CATEGORIES.REPAIR_AND_CONSTRUCTION'
                    },
                    {
                        id: 'PAG',
                        parent: 'PAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- FOR_HOME

            {
                id: 'QAA',
                parent: 'ROO',
                title: 'CATEGORIES.FOOD_ITEMS'
            },

            // PERSONAL_THINGS
            {
                id: 'RAA',
                parent: 'ROO',
                title: 'CATEGORIES.PERSONAL_THINGS',
                subcategories: [
                    {
                        id: 'RAB',
                        parent: 'RAA',
                        title: 'CATEGORIES.CLOTHING_&_ACCESSORIES'
                    },
                    {
                        id: 'RAC',
                        parent: 'RAA',
                        title: 'CATEGORIES.BEAUTY_COSMETICS_PERFUMERY'
                    },
                    {
                        id: 'RAD',
                        parent: 'RAA',
                        title: 'CATEGORIES.DEVICES_AND_ACCESSORIES'
                    },
                    {
                        id: 'RAE',
                        parent: 'RAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- PERSONAL_THINGS

            // REAL_ESTATE
            {
                id: 'SAA',
                parent: 'ROO',
                title: 'CATEGORIES.REAL_ESTATE',
                subcategories: [
                    {
                        id: 'SAB',
                        parent: 'SAA',
                        title: 'CATEGORIES.APARTMENTS'
                    },
                    {
                        id: 'SAC',
                        parent: 'SAA',
                        title: 'CATEGORIES.HOUSES_COTTAGES_VILLAS'
                    },
                    {
                        id: 'SAD',
                        parent: 'SAA',
                        title: 'CATEGORIES.LAND'
                    },
                    {
                        id: 'SAF',
                        parent: 'SAA',
                        title: 'CATEGORIES.COMMERCIAL_PROPERTY'
                    },
                    {
                        id: 'SAG',
                        parent: 'SAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- REAL_ESTATE

            // TRANSPORT
            {
                id: 'TAA',
                parent: 'ROO',
                title: 'CATEGORIES.TRANSPORT',
                subcategories: [
                    {
                        id: 'TAB',
                        parent: 'TAA',
                        title: 'CATEGORIES.CARS'
                    },
                    {
                        id: 'TAC',
                        parent: 'TAA',
                        title: 'CATEGORIES.TRUCKS'
                    },
                    {
                        id: 'TAD',
                        parent: 'TAA',
                        title: 'CATEGORIES.SPECIAL_EQUIPMENT'
                    },
                    {
                        id: 'TAE',
                        parent: 'TAA',
                        title: 'CATEGORIES.MOTORCYCLES_AND_MOTORBIKES'
                    },
                    {
                        id: 'TAF',
                        parent: 'TAA',
                        title: 'CATEGORIES.BUSES_MINIBUSES'
                    },
                    {
                        id: 'TAG',
                        parent: 'TAA',
                        title: 'CATEGORIES.AIR_TRANSPORTATION'
                    },
                    {
                        id: 'TAH',
                        parent: 'TAA',
                        title: 'CATEGORIES.WATER_TRANSPORTATION'
                    },
                    {
                        id: 'TAI',
                        parent: 'TAA',
                        title: 'CATEGORIES.PARTS_AND_ACCESSORIES'
                    },
                    {
                        id: 'TAJ',
                        parent: 'TAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            //-- TRANSPORT

            // SERVICES
            {
                id: 'UAA',
                parent: 'ROO',
                title: 'CATEGORIES.SERVICES',
                subcategories: [
                    // IT_INTERNET
                    {
                        id: 'UAB',
                        parent: 'UAA',
                        title: 'CATEGORIES.IT_INTERNET',
                        subcategories: [
                            {
                                id: 'UBL',
                                parent: 'UAB',
                                title: 'CATEGORIES.RENT'
                            },
                            {
                                id: 'UBM',
                                parent: 'UAB',
                                title: 'CATEGORIES.SEARCH_FOR_INFORMATION'
                            },
                            {
                                id: 'UBN',
                                parent: 'UAB',
                                title: 'CATEGORIES.INSTALLATION_AND_SOFTWARE_SETTING'
                            },
                            {
                                id: 'UBO',
                                parent: 'UAB',
                                title: 'CATEGORIES.SOFTWARE_DEVELOPMENT'
                            },
                            {
                                id: 'UBP',
                                parent: 'UAB',
                                title: 'CATEGORIES.SOFTWARE_TESTING'
                            },
                            {
                                id: 'UBQ',
                                parent: 'UAB',
                                title: 'CATEGORIES.CREATING_SITES'
                            },
                            {
                                id: 'UBR',
                                parent: 'UAB',
                                title: 'CATEGORIES.MARKETING_ADVERTISING_PR'
                            },
                            {
                                id: 'UBS',
                                parent: 'UAB',
                                title: 'CATEGORIES.DESIGN'
                            },
                            {
                                id: 'UBT',
                                parent: 'UAB',
                                title: 'CATEGORIES.NEWSLETTER'
                            },
                            {
                                id: 'UBU',
                                parent: 'UAB',
                                title: 'CATEGORIES.OTHER'
                            }
                        ]
                    },
                    // -- IT_INTERNET

                    // FINANCIAL_SERVICES
                    {
                        id: 'UAC',
                        parent: 'UAA',
                        title: 'CATEGORIES.FINANCIAL_SERVICES',
                        subcategories: [
                            {
                                id: 'UBV',
                                parent: 'UAC',
                                title: 'CATEGORIES.GUARANTORS'
                            },
                            {
                                id: 'UBW',
                                parent: 'UAC',
                                title: 'CATEGORIES.AGGREGATORS_PAYMENT_PROCESSORS'
                            },
                            {
                                id: 'UBX',
                                parent: 'UAC',
                                title: 'CATEGORIES.OPERATIONS_WITH_CASH_AND_NON'
                            },
                            {
                                id: 'UBY',
                                parent: 'UAC',
                                title: 'CATEGORIES.CURRENCY_EXCHANGE'
                            },
                            {
                                id: 'UBZ',
                                parent: 'UAC',
                                title: 'CATEGORIES.BORROWS_LOANS'
                            },
                            {
                                id: 'UCA',
                                parent: 'UAC',
                                title: 'CATEGORIES.INVESTMENTS'
                            },
                            {
                                id: 'UCB',
                                parent: 'UAC',
                                title: 'CATEGORIES.MARKETPLACES_AUCTIONS'
                            },
                            {
                                id: 'UCC',
                                parent: 'UAC',
                                title: 'CATEGORIES.OTHER'
                            }
                        ]
                    },
                    // -- FINANCIAL_SERVICES

                    // SERVICES_CRYPTOCURRENCY
                    {
                        id: 'UAD',
                        parent: 'UAA',
                        title: 'CATEGORIES.CRYPTOCURRENCY2',
                        subcategories: [
                            {
                                id: 'UCD',
                                parent: 'UAD',
                                title: 'CATEGORIES.EXCHANGE_EXCHANGERS'
                            },
                            {
                                id: 'UCE',
                                parent: 'UAD',
                                title: 'CATEGORIES.AGGREGATORS_PAYMENT_PROCESSORS'
                            },
                            {
                                id: 'UCF',
                                parent: 'UAD',
                                title: 'CATEGORIES.POOLS'
                            },
                            {
                                id: 'UCG',
                                parent: 'UAD',
                                title: 'CATEGORIES.OTHER'
                            }
                        ]
                    },
                    // -- SERVICES_CRYPTOCURRENCY

                    {
                        id: 'UVE',
                        parent: 'UAA',
                        title: 'CATEGORIES.TRANSPORTER'
                    },
                    {
                        id: 'UAF',
                        parent: 'UAA',
                        title: 'CATEGORIES.TASK_COMPLETION'
                    },
                    {
                        id: 'UAG',
                        parent: 'UAA',
                        title: 'CATEGORIES.SPORT'
                    },
                    {
                        id: 'UAH',
                        parent: 'UAA',
                        title: 'CATEGORIES.CAR'
                    },
                    {
                        id: 'UAI',
                        parent: 'UAA',
                        title: 'CATEGORIES.MOTOR_RENT'
                    },
                    {
                        id: 'UAJ',
                        parent: 'UAA',
                        title: 'CATEGORIES.DOMESTIC_SERVICES'
                    },
                    {
                        id: 'UAK',
                        parent: 'UAA',
                        title: 'CATEGORIES.BUSINESS_SERVICES'
                    },
                    {
                        id: 'UAL',
                        parent: 'UAA',
                        title: 'CATEGORIES.ART'
                    },
                    {
                        id: 'UAM',
                        parent: 'UAA',
                        title: 'CATEGORIES.BEAUTY_HEALTH'
                    },
                    {
                        id: 'UAN',
                        parent: 'UAA',
                        title: 'CATEGORIES.EXPRESS_ORDERS'
                    },
                    {
                        id: 'UAO',
                        parent: 'UAA',
                        title: 'CATEGORIES.COUNSELING'
                    },
                    {
                        id: 'UAP',
                        parent: 'UAA',
                        title: 'CATEGORIES.WRITING_AND_PROOFREADING'
                    },
                    {
                        id: 'UAQ',
                        parent: 'UAA',
                        title: 'CATEGORIES.MEDICAL_SERVICES'
                    },
                    {
                        id: 'UAR',
                        parent: 'UAA',
                        title: 'CATEGORIES.EQUIPMENT_MANUFACTURING'
                    },
                    {
                        id: 'UAS',
                        parent: 'UAA',
                        title: 'CATEGORIES.TRAINING_COURSES'
                    },
                    {
                        id: 'UAT',
                        parent: 'UAA',
                        title: 'CATEGORIES.PROTECTION_SECURITY'
                    },
                    {
                        id: 'UAU',
                        parent: 'UAA',
                        title: 'CATEGORIES.HOTELS_ACCOMMODATION'
                    },
                    {
                        id: 'UAV',
                        parent: 'UAA',
                        title: 'CATEGORIES.SEARCH_FOR_INFORMATION'
                    },
                    {
                        id: 'UAW',
                        parent: 'UAA',
                        title: 'CATEGORIES.MEALS_CATERING'
                    },
                    {
                        id: 'UAX',
                        parent: 'UAA',
                        title: 'CATEGORIES.HOLIDAYS_EVENTS'
                    },
                    {
                        id: 'UAY',
                        parent: 'UAA',
                        title: 'CATEGORIES.TRANSLATIONS'
                    },
                    {
                        id: 'UAZ',
                        parent: 'UAA',
                        title: 'CATEGORIES.ENTERTAINMENT_ACTIVITIES_ART'
                    },
                    {
                        id: 'UBA',
                        parent: 'UAA',
                        title: 'CATEGORIES.PRINTING'
                    },
                    {
                        id: 'UBB',
                        parent: 'UAA',
                        title: 'CATEGORIES.REPAIR_OF_EQUIPMENT'
                    },
                    {
                        id: 'UBC',
                        parent: 'UAA',
                        title: 'CATEGORIES.CONSTRUCTION'
                    },
                    {
                        id: 'UBD',
                        parent: 'UAA',
                        title: 'CATEGORIES.GARDEN'
                    },
                    {
                        id: 'UBE',
                        parent: 'UAA',
                        title: 'CATEGORIES.INSURANCE'
                    },
                    {
                        id: 'UBF',
                        parent: 'UAA',
                        title: 'CATEGORIES.TOURISM'
                    },
                    {
                        id: 'UBG',
                        parent: 'UAA',
                        title: 'CATEGORIES.CLEANING'
                    },
                    {
                        id: 'UBH',
                        parent: 'UAA',
                        title: 'CATEGORIES.INSTALLATION_TECHNOLOGY'
                    },
                    {
                        id: 'UBI',
                        parent: 'UAA',
                        title: 'CATEGORIES.PHOTO_AND_VIDEO'
                    },
                    {
                        id: 'UBJ',
                        parent: 'UAA',
                        title: 'CATEGORIES.LEGAL_SERVICES'
                    },
                    {
                        id: 'UBK',
                        parent: 'UAA',
                        title: 'CATEGORIES.OTHER'
                    }
                ]
            },
            // -- SERVICES
            {
                id: 'VAA',
                parent: 'ROO',
                title: 'CATEGORIES.OTHER'
            },
            // -- DONATIONS
            {
                id: 'WAA',
                parent: 'ROO',
                title: 'CATEGORIES.DONATIONS'
            }
        ];

        instance.refreshCategories = function () {
            instance.categories = angular.copy(categoriesOriginal);

            angular.forEach(instance.categories, function (category) {
                category.title = $filter('translate')(category.title);
                if (angular.isDefined(category.subcategories)) {
                    angular.forEach(category.subcategories, function (subcategories) {
                        subcategories.title = $filter('translate')(subcategories.title);
                        if (angular.isDefined(subcategories.subcategories)) {
                            angular.forEach(subcategories.subcategories, function (subsubcategories) {
                                subsubcategories.title = $filter('translate')(subsubcategories.title);
                            });
                        }
                    });
                }
            });

            var otherLang = $filter('translate')('CATEGORIES.OTHER');

            function sortCategories(a, b) {
                if (a.title === otherLang) {
                    return 1;
                } else if (b.title === otherLang) {
                    return -1;
                }
                if (a.title > b.title) {
                    return 1;
                }
                if (a.title < b.title) {
                    return -1;
                }
                return 0;
            }

            instance.categories.sort(sortCategories);

            angular.forEach(instance.categories, function (category) {
                if (angular.isDefined(category.subcategories)) {
                    category.subcategories.sort(sortCategories);
                    angular.forEach(category.subcategories, function (subcategories) {
                        if (angular.isDefined(subcategories.subcategories)) {
                            subcategories.subcategories.sort(sortCategories);
                        }
                    });
                }
            });
        };

        instance.refreshCategories();

        instance.currencyFilter = {
            open: false,
            search: false,
            clear: false,
            order_by: 0,
            order_reverse: true,
            offset: 0,
            limit: 10,
            offer_type_mask: 12,
            currency: 'all_cur',
            location_country: '',
            location_city: '',
            payment_types: [],
            date_from: '',
            date_to: '',
            amount_from: '',
            amount_to: '',
            rate_from: '',
            rate_to: '',
            keywords: '',
            country_name: '',
            countryAll: false,
            interval: -1
        };

        instance.goodsFilter = {
            open: false,
            search: false,
            clear: false,
            order_by: 0,
            order_reverse: true,
            offset: 0,
            limit: 10,
            offer_type_mask: 3,
            currency: 'all_cur',
            category: 'ALL',
            location_country: '',
            location_city: '',
            date_from: '',
            date_to: '',
            price_from: '',
            price_to: '',
            keywords: '',
            find_in_names: false,
            delivery: '',
            country_name: '',
            countryAll: false,
            interval: -1
        };

        instance.myOffersFilter = {
            open: false,
            search: false,
            clear: false,
            order_by: 0,
            order_reverse: true,
            offset: 0,
            limit: 10,
            offer_type: 'ALL',
            view: 'CURRENCY',
            keywords: '',
            first_redirect: false
        };

        instance.favOffersFilter = {
            open: false,
            search: false,
            clear: false,
            order_by: 0,
            order_reverse: true,
            offset: 0,
            limit: 10,
            offer_type: 'ALL',
            view: 'CURRENCY',
            keywords: ''
        };

        return instance;

    }]);

    module.factory('payments', [function () {
        var instance = {};
        instance.safes = {
            name: ''
        };
        instance.safeHistoryFilter = {
            clear: false,
            trType: 'all',
            walletId: -1,
            keywords: '',
            interval: -1,
            isHideServiceTx: -1,
            isHideMining: false,
            dateStart: false,
            dateEnd: false
        };
        instance.safeHistoryFilterArr = {};
        instance.historyHilter = {
            clear: false,
            trType: 'all', //all, in, out
            walletId: -1,
            keywords: '',
            interval: -1,
            isHideServiceTx: false,
            isHideMining: false,
            dateStart: false,
            dateEnd: false
        };
        return instance;
    }]);

    module.factory('uuid', [function () {
        this.generate = function () {
            var s4 = function () {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            };
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };
        return this;
    }]);

})();