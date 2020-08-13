// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function () {
    'use strict';
    var module = angular.module('app.backendServices', []);

    module.factory('backend', ['$q', '$rootScope', 'informer', '$filter', 'CONFIG', function ($q, $rootScope, informer, $filter, CONFIG) {

        var deferred = null;

        function informerRun(error, params, command) {
            var errorTranslate = '';

            switch (error) {
                case 'NOT_ENOUGH_MONEY':
                    errorTranslate = 'ERROR.NOT_ENOUGH_MONEY';
                    break;
                case 'CORE_BUSY':
                    if (command !== 'get_all_aliases') {
                        errorTranslate = 'INFORMER.CORE_BUSY';
                    }
                    break;
                case 'OVERFLOW':
                    if (command !== 'get_all_aliases') {
                        errorTranslate = '';
                    }
                    break;
                case 'INTERNAL_ERROR:daemon is busy':
                    errorTranslate = 'INFORMER.DAEMON_BUSY';
                    break;
                case 'INTERNAL_ERROR:not enough money':
                case 'INTERNAL_ERROR:NOT_ENOUGH_MONEY':
                    if (command === 'cancel_offer') {
                        errorTranslate = $filter('translate')('INFORMER.NO_MONEY_REMOVE_OFFER', {fee: CONFIG.standardFee, currency: CONFIG.currencySymbol});
                    } else {
                        errorTranslate = 'INFORMER.NO_MONEY';
                    }
                    break;
                case 'INTERNAL_ERROR:not enough outputs to mix':
                    errorTranslate = 'MESSAGE.NOT_ENOUGH_OUTPUTS_TO_MIX';
                    break;
                case 'INTERNAL_ERROR:transaction is too big':
                    errorTranslate = 'MESSAGE.TRANSACTION_IS_TO_BIG';
                    break;
                case 'INTERNAL_ERROR:Transfer attempt while daemon offline':
                    errorTranslate = 'MESSAGE.TRANSFER_ATTEMPT';
                    break;
                case 'ACCESS_DENIED':
                    errorTranslate = 'INFORMER.ACCESS_DENIED';
                    break;
                case 'INTERNAL_ERROR:transaction was rejected by daemon':
                    if (command === 'request_alias_registration') {
                        errorTranslate = 'INFORMER.ALIAS_IN_REGISTER';
                    } else {
                        errorTranslate = 'INFORMER.TRANSACTION_ERROR';
                    }
                    break;
                case 'INTERNAL_ERROR':
                    errorTranslate = 'INFORMER.TRANSACTION_ERROR';
                    break;
                case 'BAD_ARG':
                    errorTranslate = 'INFORMER.BAD_ARG';
                    break;
                case 'WALLET_WRONG_ID':
                    errorTranslate = 'INFORMER.WALLET_WRONG_ID';
                    break;
                case 'WRONG_PASSWORD':
                case 'WRONG_PASSWORD:invalid password':
                    params = JSON.parse(params);
                    if (!params.testEmpty) {
                        errorTranslate = 'INFORMER.WRONG_PASSWORD';
                    }
                    break;
                case 'WALLET_WATCH_ONLY_NOT_SUPPORTED':
                    errorTranslate = 'INFORMER.WALLET_NOT_SUPPORTED';
                    break;
                case 'FILE_RESTORED':
                    if (command === 'open_wallet') {
                        errorTranslate = $filter('translate')('INFORMER.FILE_RESTORED');
                    }
                    break;
                case 'FILE_NOT_FOUND':
                    if (command !== 'open_wallet' && command !== 'get_alias_info_by_name' && command !== 'get_alias_info_by_address') {
                        errorTranslate = $filter('translate')('INFORMER.FILE_NOT_FOUND');
                        params = JSON.parse(params);
                        if (params.path) {
                            errorTranslate += ': ' + params.path;
                        }
                    }
                    break;
                case 'CANCELED':
                case '':
                    break;
                case 'FAIL':
                    if (command === 'create_proposal' || command === 'accept_proposal' || command === 'release_contract' || command === 'request_cancel_contract' || command === 'accept_cancel_contract') {
                        errorTranslate = ' ';
                    }
                    break;
                case 'ALREADY_EXISTS':
                    errorTranslate = 'INFORMER.FILE_EXIST';
                    break;
                default:
                    errorTranslate = error;
            }
            if (error.indexOf('FAIL:failed to save file') > -1) {
                errorTranslate = 'INFORMER.FILE_NOT_SAVED';
            }
            if (error.indexOf('FAIL:failed to save file when close') > -1) {
                errorTranslate = 'INFORMER.FILE_NOT_SAVED_WITHOUT_CHOOSE';
            }
            if (error.indexOf('WRONG_PASSWORD:UNRECOVERABLE ERROR') > -1) {
                errorTranslate = 'INFORMER.WALLET_NOT_SUPPORTED';
            }
            if (errorTranslate !== '') {
                informer.error(errorTranslate);
            }
        }

        function commandDebug(command, params, result) {
            Debug(2, '----------------- ' + command + ' -----------------');
            var debug = {
                _send_params: params,
                _result: result
            };
            Debug(2, debug);

            try {
                Debug(2, JSON.parse(result));
            } catch (e) {
                Debug(2, {response_data: result, error_code: 'OK'});
            }
        }

        function backendCallback(resultStr, params, callback, command) {
            var result = resultStr;
            if (command !== 'get_clipboard') {
                if (!resultStr || resultStr === '') {
                    result = {};
                } else {
                    try {
                        result = JSON.parse(resultStr);
                    } catch (e) {
                        result = {response_data: resultStr, error_code: 'OK'};
                    }
                }
            } else {
                result = {
                    error_code: 'OK',
                    response_data: result
                }
            }

            var status = (result.error_code === 'OK' || result.error_code === 'TRUE');

            if (!status && status !== undefined && result.error_code !== undefined) {
                Debug(1, 'API error for command: "' + command + '". Error code: ' + result.error_code);
            }
            var data = ((typeof result === 'object') && 'response_data' in result) ? result.response_data : result;

            var resultErrorCode = false;
            if (typeof result === 'object' && 'error_code' in result && result.error_code !== 'OK' && result.error_code !== 'TRUE' && result.error_code !== 'FALSE') {
                informerRun(result.error_code, params, command);
                resultErrorCode = result.error_code;
            }

            if (command === 'get_offers_ex') {
                Service.printLog('get_offers_ex offers count ' + ((data.offers) ? data.offers.length : 0));
            }

            if (typeof callback === 'function') {
                callback(status, data, resultErrorCode)
            } else {
                return data;
            }
        }

        function asVal(data) {
            return {v: data};
        }

        var Service = {
            backendObject: undefined,
            backendLoaded: false,
            initService: function () {
                if (deferred === null) {
                    deferred = $q.defer();
                }
                if (!Service.backendLoaded) {
                    Service.backendLoaded = true;
                    new QWebChannel(qt.webChannelTransport, function (channel) {
                        Service.backendObject = channel.objects.mediator_object;
                        deferred.resolve(false);
                    });
                } else {
                    if (Service.backendObject !== undefined) {
                        deferred.resolve(false);
                    }
                }
                return deferred.promise;
            },

            runCommand: function (command, params, callback) {
                if (angular.isDefined(this.backendObject)) {
                    var Action = this.backendObject[command];
                    if (!angular.isDefined(Action)) {
                        Debug(0, 'Run Command Error! Command "' + command + '" don\'t found in backendObject');
                    } else {
                        params = (typeof params === 'string') ? params : JSON.stringify(params);
                        if (params === undefined || params === '{}') {
                            Action(function (resultStr) {
                                commandDebug(command, params, resultStr);
                                return backendCallback(resultStr, params, callback, command);
                            });
                        } else {
                            Action(params, function (resultStr) {
                                commandDebug(command, params, resultStr);
                                return backendCallback(resultStr, params, callback, command);
                            });
                        }
                    }
                }
            },

            callbackStrToObj: function (str) {
                var obj = JSON.parse(str);
                this.callback(obj);
            },

            subscribe: function (command, callback) {
                if (command === 'on_core_event') {
                    Service.backendObject[command].connect(callback);
                } else {
                    Service.backendObject[command].connect(Service.callbackStrToObj.bind({callback: callback}));
                }
            },

            /*  API  */

            openFileDialog: function (caption, filemask, callback) {
                var dir = ($rootScope.settings.system.default_user_path) ? $rootScope.settings.system.default_user_path : '/';
                var params = {
                    caption: caption,
                    filemask: filemask,
                    default_dir: dir
                };
                this.runCommand('show_openfile_dialog', params, callback);
            },

            webkitLaunchedScript: function () {
                return this.runCommand('webkit_launched_script');
            },

            toggleAutoStart: function (value) {
                return this.runCommand('toggle_autostart', asVal(value));
            },

            quitRequest: function () {
                return this.runCommand('on_request_quit');
            },

            getDefaultFee: function (callback) {
                return this.runCommand('get_default_fee', {}, callback);
            },

            getOptions: function (callback) {
                return this.runCommand('get_options', {}, callback);
            },

            isFileExist: function (path, callback) {
                return this.runCommand('is_file_exist', path, callback);
            },

            setClipboard: function (str, callback) {
                return this.runCommand('set_clipboard', str, callback);
            },

            getClipboard: function (callback) {
                return Service.runCommand('get_clipboard', {}, callback);
            },

            isAutoStartEnabled: function (callback) {
                this.runCommand('is_autostart_enabled', {}, function (status, data) {
                    if (angular.isFunction(callback)) {
                        callback('error_code' in data && data.error_code !== 'FALSE')
                    }
                });
            },

            saveFileDialog: function (caption, filemask, callback) {
                var dir = ($rootScope.settings.system.default_user_path) ? $rootScope.settings.system.default_user_path : '/';
                var params = {
                    caption: caption,
                    filemask: filemask,
                    default_dir: dir
                };
                this.runCommand('show_savefile_dialog', params, callback);
            },

            setLogLevel: function (level) {
                return this.runCommand('set_log_level', asVal(level))
            },

            resetWalletPass: function (wallet_id, pass, callback) {
                this.runCommand('reset_wallet_password', {wallet_id: wallet_id, pass: pass}, callback);
            },

            getVersion: function (callback) {
                this.runCommand('get_version', {}, function (status, version) {
                    callback(version)
                })
            },

            getOsVersion: function (callback) {
                this.runCommand('get_os_version', {}, function (status, version) {
                    callback(version)
                })
            },

            getLogFile: function (callback) {
                this.runCommand('get_log_file', {}, function (status, version) {
                    callback(version)
                })
            },

            getSmartSafeInfo: function (wallet_id, callback) {
                this.runCommand('get_smart_safe_info', {wallet_id: wallet_id}, callback);
            },

            restoreWallet: function (path, pass, restore_key, callback) {
                var params = {
                    restore_key: restore_key,
                    path: path,
                    pass: pass
                };
                this.runCommand('restore_wallet', params, callback);
            },

            startPosMining: function (wallet_id, callback) {
                this.runCommand('start_pos_mining', {wallet_id: wallet_id}, callback);
            },

            stopPosMining: function (wallet_id, callback) {
                this.runCommand('stop_pos_mining', {wallet_id: wallet_id}, callback);
            },

            resyncWallet: function (wallet_id, callback) {
                this.runCommand('resync_wallet', {wallet_id: wallet_id}, callback);
            },

            haveSecureAppData: function (callback) {
                this.runCommand('have_secure_app_data', {}, callback);
            },

            isValidRestoreWalletText: function (text, callback) {
                this.runCommand('is_valid_restore_wallet_text', text, callback)
            },

            registerAlias: function (wallet_id, alias, address, fee, comment, reward, callback) {
                var params = {
                    wallet_id: wallet_id,
                    alias: {
                        alias: alias,
                        address: address,
                        tracking_key: '',
                        comment: comment
                    },
                    fee: $filter('moneyToInt')(fee),
                    reward: $filter('moneyToInt')(reward)
                };
                this.runCommand('request_alias_registration', params, callback);
            },

            updateAlias: function (wallet_id, alias, fee, callback) {
                var params = {
                    wallet_id: wallet_id,
                    alias: {
                        alias: alias.name.replace('@', ''),
                        address: alias.address,
                        tracking_key: '',
                        comment: alias.comment
                    },
                    fee: $filter('moneyToInt')(fee)
                };
                this.runCommand('request_alias_update', params, callback);
            },

            getAllAliases: function (callback) {
                this.runCommand('get_all_aliases', {}, callback);
            },

            getAliasByName: function (value, callback) {
                return this.runCommand('get_alias_info_by_name', value, callback);
            },

            getAliasByAddress: function (value, callback) {
                return this.runCommand('get_alias_info_by_address', value, callback);
            },

            getPoolInfo: function (callback) {
                this.runCommand('get_tx_pool_info', {}, callback);
            },

            localization: function (stringsArray, title, callback) {
                var data = {
                    strings: stringsArray,
                    language_title: title
                };
                this.runCommand('set_localization_strings', data, callback);
            },

            getSecureAppData: function (pass, callback) {
                this.runCommand('get_secure_app_data', pass, callback);
            },

            storeSecureAppData: function (data, pass, callback) {
                this.backendObject['store_secure_app_data'](JSON.stringify(data), pass, function (data) {
                    backendCallback(data, {}, callback, 'store_secure_app_data');
                });
            },

            storeFile: function (path, buff, callback) {
                this.backendObject['store_to_file'](path, (typeof buff === 'string' ? buff : JSON.stringify(buff)), function (data) {
                    backendCallback(data, {}, callback, 'store_to_file');
                });
            },

            getAppData: function (callback) {
                this.runCommand('get_app_data', {}, callback);
            },

            storeAppData: function (data, callback) {
                this.runCommand('store_app_data', data, callback);
            },

            getMiningEstimate: function (amount_coins, time, callback) {
                var params = {
                    amount_coins: $filter('moneyToInt')(amount_coins),
                    time: parseInt(time)
                };
                this.runCommand('get_mining_estimate', params, callback);
            },

            backupWalletKeys: function (wallet_id, path, callback) {
                var params = {
                    wallet_id: wallet_id,
                    path: path
                };
                this.runCommand('backup_wallet_keys', params, callback);
            },

            pushOffer: function (wallet_id, offer_type, amount_p, target, location_city, location_country, contacts, comment, expiration_time, fee, amount_etc, payment_types, bonus, deal_option, category, currency, callback) {
                var params = {
                    wallet_id: wallet_id,
                    od: {
                        ot: offer_type,
                        ap: $rootScope.convertFloatSToIntS(amount_p),
                        at: $rootScope.convertFloatSToIntS(amount_etc),
                        t: target.trim(),
                        lci: location_city,
                        lco: location_country,
                        cnt: contacts,
                        com: comment,
                        pt: payment_types,
                        et: expiration_time,
                        fee: $filter('moneyToInt')(fee),
                        b: bonus,
                        do: deal_option,
                        cat: category,
                        p: currency
                    }
                };
                this.runCommand('push_offer', params, callback);
            },

            pushUpdateOffer: function (wallet_id, tx_hash, offer_type, amount_p, target, location_city, location_country, contacts, comment, expiration_time, fee, amount_etc, payment_types, bonus, deal_option, category, currency, callback) {
                var params = {
                    wallet_id: wallet_id,
                    sig: wallet_id,
                    id: tx_hash,
                    oi: 0,
                    of: {
                        ot: offer_type,
                        ap: $rootScope.convertFloatSToIntS(amount_p),
                        at: $rootScope.convertFloatSToIntS(amount_etc),
                        t: target.trim(),
                        lci: location_city,
                        lco: location_country,
                        cnt: contacts,
                        com: comment,
                        pt: payment_types,
                        et: expiration_time,
                        fee: $filter('moneyToInt')(fee),
                        b: bonus,
                        do: deal_option,
                        cat: category,
                        p: currency
                    }
                };
                Debug(1, params);
                this.runCommand('push_update_offer', params, callback);
            },

            createProposal: function (wallet_id, t, c, a_addr, b_addr, to_pay, a_pledge, b_pledge, time, payment_id, callback) {
                var params = {
                    wallet_id: wallet_id,
                    details: {
                        t: t,
                        c: c,
                        a_addr: a_addr,
                        b_addr: b_addr,
                        to_pay: $filter('moneyToInt')(to_pay),
                        a_pledge: $filter('moneyToInt')(a_pledge) - $filter('moneyToInt')(to_pay),
                        b_pledge: $filter('moneyToInt')(b_pledge)
                    },
                    payment_id: payment_id,
                    expiration_period: parseInt(time) * 60 * 60,
                    fee: $filter('moneyToInt')(CONFIG.standardFee),
                    b_fee: $filter('moneyToInt')(CONFIG.standardFee)
                };
                Debug(1, params);
                this.runCommand('create_proposal', params, callback);
            },

            checkAvailableSources: function (wallet_id, a_pledge, callback) {
                var params = {
                    wallet_id: wallet_id,
                    req_data: [
                        $filter('moneyToInt')(CONFIG.standardFee),
                        $filter('moneyToInt')(a_pledge) + $filter('moneyToInt')(CONFIG.standardFee)
                    ]
                };
                this.runCommand('check_available_sources', params, callback);
            },

            getContracts: function (wallet_id, callback) {
                var params = {
                    wallet_id: wallet_id
                };
                Debug(1, params);
                this.runCommand('get_contracts', params, callback);
            },

            acceptProposal: function (wallet_id, contract_id, callback) {
                var params = {
                    wallet_id: wallet_id,
                    contract_id: contract_id
                };
                Debug(1, params);
                this.runCommand('accept_proposal', params, callback);
            },

            releaseProposal: function (wallet_id, contract_id, release_type, callback) {
                var params = {
                    wallet_id: wallet_id,
                    contract_id: contract_id,
                    release_type: release_type // "normal" or "burn"
                };
                Debug(1, params);
                this.runCommand('release_contract', params, callback);
            },

            requestCancelContract: function (wallet_id, contract_id, time, callback) {
                var params = {
                    wallet_id: wallet_id,
                    contract_id: contract_id,
                    fee: $filter('moneyToInt')(CONFIG.standardFee),
                    expiration_period: parseInt(time) * 60 * 60
                };
                Debug(1, params);
                this.runCommand('request_cancel_contract', params, callback);
            },

            acceptCancelContract: function (wallet_id, contract_id, callback) {
                var params = {
                    wallet_id: wallet_id,
                    contract_id: contract_id
                };
                Debug(1, params);
                this.runCommand('accept_cancel_contract', params, callback);
            },

            getAliasCost: function (alias, callback) {
                this.runCommand('get_alias_cost', asVal(alias), callback);
            },

            cancelOffer: function (wallet_id, tx_hash, callback) {
                var params = {
                    wallet_id: wallet_id,
                    sig: wallet_id,
                    id: tx_hash,
                    oi: 0
                };
                this.runCommand('cancel_offer', params, callback);
            },

            getMiningHistory: function (wallet_id, callback) {
                Service.runCommand('get_mining_history', {wallet_id: wallet_id}, callback);
            },

            setBlockedIcon: function (enabled, callback) {
                var mode = (enabled) ? 'blocked' : 'normal';
                Service.runCommand('bool_toggle_icon', mode, callback);
            },

            validateAddress: function (address, callback) {
                this.runCommand('validate_address', address, callback);
            },

            getOffers: function (params, callback) {
                this.printLog('get_offers_ex params ' + JSON.stringify(params));
                Service.runCommand('get_offers_ex', params, callback);
            },

            getMyOffers: function (params, callback) {
                Service.runCommand('get_my_offers', params, callback);
            },

            getFavOffers: function (params, callback) {
                Service.runCommand('get_fav_offers', params, callback);
            },

            openWallet: function (file, pass, testEmpty, callback) {
                var params = {
                    path: file,
                    pass: pass
                };
                params['testEmpty'] = !!(testEmpty);
                this.runCommand('open_wallet', params, callback);
            },

            closeWallet: function (wallet_id, callback) {
                this.runCommand('close_wallet', {wallet_id: wallet_id}, callback);
            },

            runWallet: function (wallet_id, callback) {
                this.runCommand('run_wallet', {wallet_id: wallet_id}, callback);
            },

            getWalletInfo: function (wallet_id, callback) {
                this.runCommand('get_wallet_info', {wallet_id: wallet_id}, callback);
            },

            generateWallet: function (path, pass, callback) {
                var params = {
                    path: path,
                    pass: pass
                };
                this.runCommand('generate_wallet', params, callback);
            },

            printText: function (content) {
                return this.runCommand('print_text', {html_text: content});
            },

            printLog: function (msg, log_level) {
                return this.runCommand('print_log', {msg: msg, log_level: log_level});
            },

            openUrlInBrowser: function (url, callback) {
                return this.runCommand('open_url_in_browser', url, callback);
            },

            makeTransfer: function (tr, callback) {
                var seconds = 0;
                var milliseconds = 0;
                if (tr.is_delay) {
                    milliseconds = tr.lock_time.getTime(); // milliseconds timestamp
                    seconds = Math.floor(milliseconds / 1000); // seconds timestamp
                }
                var params = {
                    wallet_id: tr.from,
                    destinations: [
                        {
                            address: tr.to,
                            amount: tr.amount
                        }
                    ],
                    mixin_count: 0,
                    lock_time: seconds,
                    fee: $filter('moneyToInt')(tr.fee),
                    comment: tr.comment,
                    push_payer: tr.push_payer
                };
                if (tr.payment_id_integrated.length === 0) {
                    params.payment_id = tr.payment_id;
                }
                this.runCommand('transfer', params, callback);
            }

            /*  API END  */

        };

        return Service;

    }]);

})();