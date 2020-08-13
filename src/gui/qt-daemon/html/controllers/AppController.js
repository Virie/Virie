// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function() {
    'use strict';
    var module = angular.module('app.app', []);

    module.factory('PassDialogs', ['$uibModal', '$rootScope', 'backend',
        function ($uibModal, $rootScope, backend) {

            var dialog = function (template, windowClass, onCancel, onSuccess, canReset) {
                $uibModal.open({
                    templateUrl: template,
                    controller: 'appPassCtrl',

                    backdrop: false,
                    windowClass: 'modal-main-wrapper ' + windowClass + ' base-scroll light-scroll',
                    animation: true,

                    keyboard: false,
                    resolve: {
                        onCancel: function () {
                            return onCancel;
                        },
                        onSuccess: function () {
                            return onSuccess;
                        },
                        canReset: function () {
                            return canReset;
                        }
                    }
                });
            };

            this.generateMPDialog = function (onCancel, onSuccess) {
                dialog('views/masterPassSet.html', 'modal-use-master-password', onCancel, onSuccess, false);
            };

            this.cancelMPDialog = function (onSuccess) {
                dialog('views/masterPassCancel.html', 'modal-cancel-master-password', false, onSuccess, false);
            };

            this.generateMPLock = function () {
                dialog('views/masterPassBlockedButton.html', 'modal-unlock-app', false, false, false);
            };

            this.requestMPDialog = function (onCancel, onSuccess, canReset) {
                if (angular.isUndefined(canReset)) {
                    canReset = true;
                }
                dialog('views/masterPassBlocked.html', 'modal-app-blocked', onCancel, onSuccess, canReset);
                $rootScope.settings.security.app_block = true;
                $rootScope.isProgramBlocked = true;
                backend.setBlockedIcon($rootScope.isProgramBlocked);
            };

            this.changeMasPass = function (onCancel, onSuccess) {
                dialog('views/masterPassChange.html', 'modal-change-master-password', onCancel, onSuccess, false);
            };

            this.storeSecureAppData = function () {
                var safePaths = [];
                var arrPathSafes = [];
                angular.forEach($rootScope.safes, function (item) {
                    var safe = {
                        pass: item.pass,
                        path: item.path,
                        name: item.name
                    };
                    safePaths.push(safe);
                    arrPathSafes.push({name: item.name, path: item.path});
                });
                var result;
                if (angular.isUndefined($rootScope.arrPathSafesEnabled) || $rootScope.arrPathSafesEnabled === true) {
                    $rootScope.settings.arrPathSafes = arrPathSafes;
                }
                if ($rootScope.appPass) {
                    backend.storeSecureAppData(safePaths, $rootScope.appPass, function (status, data) {
                        result = data;
                    });
                }
            };

            return this;
        }
    ]);

    module.controller('appPassCtrl', ['$scope', 'backend', '$uibModalInstance', 'informer', '$rootScope', 'PassDialogs', 'onCancel', 'onSuccess', 'canReset', '$uibModal',
        function ($scope, backend, $uibModalInstance, informer, $rootScope, PassDialogs, onCancel, onSuccess, canReset, $uibModal) {

            $scope.cancel = function () {
                $rootScope.isProgramBlocked = false;
                backend.setBlockedIcon($rootScope.isProgramBlocked);
                if (angular.isFunction(onCancel)) {
                    $uibModalInstance.close();
                    onCancel();
                }
            };

            // On request password cancel when app open:
            // -use master password: false
            // -use master password on money transfer: false

            // On request password cancel when try to remove tick "request password on money transfer"
            // -use master password: true
            // -use master password on money transfer: true

            // On generate password cancel when app open:
            // -use master password: false
            // -use master password on money transfer: false

            // On generate password cancel when try to put tick "use master password":
            // -use master password: false
            // -use master password on money transfer: false

            $scope.canReset = canReset;

            $scope.lockPass = function () {
                PassDialogs.requestMPDialog(false);
                $uibModalInstance.close();
                angular.element('.modal-dialog').removeClass('cer');
            };

            $scope.newPass = '';
            $scope.newPassRepeat = '';

            $scope.canCancel = !!angular.isFunction(onCancel);

            var getSecureAppDataSend = false;

            $scope.submit = function (appPass) {
                if (getSecureAppDataSend) return;
                getSecureAppDataSend = true;
                backend.getSecureAppData({pass: appPass}, function (status, data) {
                    var appData = data;
                    if (angular.isDefined(appData.error_code) && appData.error_code === 'WRONG_PASSWORD') {
                        informer.error('MESSAGE.INCORRECT_PASSWORD');
                    } else {
                        $rootScope.settings.security.app_block = false;
                        $rootScope.isProgramBlocked = false;
                        backend.setBlockedIcon($rootScope.isProgramBlocked);
                        $rootScope.appPass = appPass;
                        $uibModalInstance.close();

                        if (angular.isFunction(onSuccess)) {
                            onSuccess(appData);
                        }
                    }
                    getSecureAppDataSend = false;
                });
            };

            $scope.changeMasterPass = function (appPass, newAppPass) {
                backend.getSecureAppData({pass: appPass}, function (status, data) {
                    var appData = data;

                    if (angular.isDefined(appData.error_code) && appData.error_code === 'WRONG_PASSWORD') {
                        informer.error('ACCEPT.MASTER_PASSWORD_CHANGED_ERROR');
                    } else {
                        $rootScope.settings.security.app_block = false;
                        $rootScope.isProgramBlocked = false;
                        backend.setBlockedIcon($rootScope.isProgramBlocked);
                        $rootScope.appPass = newAppPass;
                        PassDialogs.storeSecureAppData(function () {});
                        informer.success('ACCEPT.MASTER_PASSWORD_CHANGED');
                        $uibModalInstance.close();

                        if (angular.isFunction(onSuccess)) {
                            onSuccess(appData);
                        }
                    }
                });
            };

            $scope.cancelOffCloseSafes = function() {
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-disable-safe base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/masterPassCloseSafes.html',
                    controller: function ($scope, cancelOff, $uibModalInstance, Idle) {
                        $scope.cancel = function () {
                            $uibModalInstance.close();
                        };
                        $scope.close = function () {
                            if ($rootScope.safes.length > 0) {
                                for (var i = 0; i < $rootScope.safes.length; i++) {
                                    $rootScope.closeWallet($rootScope.safes[i].wallet_id);
                                }
                            }
                            Idle.watch();
                            cancelOff();
                            $uibModalInstance.close();
                        };
                    },
                    resolve: {
                        cancelOff: function () {
                            return $scope.cancelOff;
                        }
                    }
                });
            };

            $scope.cancelOff = function () {
                $rootScope.safeLoadedEnd = true;
                $rootScope.isProgramBlocked = false;
                backend.setBlockedIcon($rootScope.isProgramBlocked);
                if (angular.isFunction(onCancel)) {
                    onCancel();
                }
                $uibModalInstance.close();
            };

            $scope.reset = function (isFromSettings) {
                $rootScope.changeFromSettings = !!(isFromSettings);
                $uibModalInstance.close();
                PassDialogs.changeMasPass(function () {});
            };

            $scope.setPass = function (appPass) {
                $rootScope.appPass = appPass;
                PassDialogs.storeSecureAppData();
                $rootScope.isProgramBlocked = false;
                backend.setBlockedIcon($rootScope.isProgramBlocked);
                $rootScope.settings.security.is_pass_required_on_transfer = true;

                if (angular.isFunction(onSuccess)) {
                    onSuccess();
                }

                $uibModalInstance.close();
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.cancelMPass = function () {
                if ($rootScope.appPass === $scope.password) {
                    if (angular.isFunction(onSuccess)) {
                        onSuccess();
                    }
                    $uibModalInstance.close();
                } else {
                    $scope.passError = true;
                }
            };
        }
    ]);

    module.controller('AppController', ['CONFIG', 'backend', '$scope', '$timeout', '$rootScope', '$location', '$translate', '$filter', '$uibModal', 'informer', 'PassDialogs', 'Idle', 'DefaultLanguage', '$window', '$http',
        function(CONFIG, backend, $scope, $timeout, $rootScope, $location, $translate, $filter, $uibModal, informer, PassDialogs, Idle, DefaultLanguage, $window, $http) {

            $rootScope.changeFromSettings = false;

            $rootScope.currencySymbol = CONFIG.currencySymbol;

            $rootScope.config = CONFIG;

            $rootScope.passPattern = '^[a-zA-Z0-9_.\\\]\*\|\~\!\?\@\#\$\%\^\&\+\{\}\(\)\<\>\:\;\"\'\-\=\/\,\[\\\\]*$';

            $rootScope.passRequiredIntervals = [
                0,   // never
                60,  // 1 minute
                120, // 5 minutes
                900, // 15 minutes
                1800 // 30 minutes
            ];

            $rootScope.settings = {
                security: {
                    mixin_count: 0,
                    is_hide_sender: true,
                    is_pass_required_on_transfer: false,
                    is_use_app_pass: true,
                    password_required_interval: $rootScope.passRequiredIntervals[4]
                },
                mining: {
                    auto_mining: false
                },
                app_interface: {
                    general: {
                        language: DefaultLanguage,
                        font_size: 4,
                        safeView: 'list',
                        smallSidebar: false
                    },
                    on_transfer: {
                        show_recipient_tx_history: false
                    }
                },
                system: {
                    app_autoload: false,
                    default_user_path: '/',
                    log_level: 0,
                    fav_offers_hash: []
                },
                contacts: [],
                arrPathSafes: [],
                viewedContracts: [],
                notViewedContracts: [],
                miningSelectedSafeAddress: ''
            };

            $rootScope.onQuitRequest = false;

            $rootScope.updateLocalization = function () {
                var strings = [
                    $translate.instant('BACKEND.QUIT'),
                    $translate.instant('BACKEND.IS.RECEIVED'),
                    $translate.instant('BACKEND.IS.CONFIRMED'),
                    $translate.instant('BACKEND.INCOME.TRANSFER.UNCONFIRMED'),
                    $translate.instant('BACKEND.INCOME.TRANSFER.CONFIRMED'),
                    $translate.instant('BACKEND.MINED'),
                    $translate.instant('BACKEND.LOCKED'),
                    $translate.instant('BACKEND.IS.MINIMIZE'),
                    $translate.instant('BACKEND.RESTORE'),
                    $translate.instant('BACKEND.TRAY.MENU.SHOW'),
                    $translate.instant('BACKEND.TRAY.MENU.MINIMIZE')
                ];
                backend.localization(strings, DefaultLanguage);
            };

            $rootScope.calculateMoneyFontSize = function (length) {
                if ( length <= 26 ) return {'font-size': '7.5rem'};
                else if ( length > 26 && length <= 30 ) return {'font-size': '6.5rem'};
                else if ( length > 30 && length <= 36 ) return {'font-size': '5.5rem'};
                else if ( length > 36 ) return {'font-size': '4.5rem'};
            };

            $rootScope.convertFloatSToIntS = function (num) {
                if (angular.isUndefined(num)) return '0';
                var arr = [];
                if (num.toString().indexOf('.') > -1) {
                    arr = num.split('.');
                } else {
                    arr = [num, '00000000'];
                }
                var zeros = '';
                if (arr[1].length > 8) {
                    arr[1] = arr[1].substr(0, 8)
                } else {
                    for (var i = arr[1].length; i < 8; i++) zeros += '0';
                }
                num = arr[0] + arr[1] + zeros;
                while (num.length && num[0] === '0') {
                    num = num.substr(1);
                }
                return num.length ? num : '0';
            };

            $rootScope.convertIntSToFloatS = function (num) {
                if (angular.isUndefined(num)) return '0';
                if (num.length <= 8) {
                    var zeros = '';
                    for (var i = num.length; i <= 8; i++) zeros += '0';
                    num = zeros + num;
                }
                num = num.substr(0, num.length - 8) + '.' + num.slice(-8);
                return num;
            };

            $rootScope.moneyParse = function (money, needCurrency) {
                if (needCurrency === undefined) needCurrency = true;
                var currencySymbol = (needCurrency) ? ' ' + $rootScope.currencySymbol : '';
                if (money === 0 || money === undefined) return '0' + currencySymbol;
                var power = Math.pow(10, CONFIG.CDDP);
                var str = (money / power).toFixed(8);
                for (var i = str.length - 1; i >= 0; i--) {
                    if (str[i] !== '0') {
                        str = str.substr(0, i + 1);
                        break;
                    }
                }
                if (str[str.length - 1] === '.') str = str.substr(0, str.length - 1);
                return str + currencySymbol;
            };

            $rootScope.coinsParse = function (money, currency) {
                var currencySymbol = '';
                if (currency === undefined) {
                    currencySymbol = ' ' + $rootScope.currencySymbol;
                } else if (currency && $filter('isCurrencyCorrect')(currency)) {
                    currencySymbol = ' ' + currency;
                }
                if (parseInt(money) === 0 || money === undefined) { return '0' + currencySymbol; }
                var moneyText = $rootScope.convertIntSToFloatS(money);
                var arr,i;
                if (Math.abs(parseFloat(moneyText)) < 0.00000001) {
                    if (parseFloat(moneyText) < 0) {
                        return '-0' + currencySymbol;
                    } else {
                        return '0' + currencySymbol;
                    }
                } else {
                    arr = moneyText.split('.');
                    for (i = arr[1].length - 1; i >= 0; i--) {
                        if (arr[1][i] !== '0') {
                            arr[1] = arr[1].substr(0, i + 1);
                            break;
                        }
                    }
                    if (parseInt(arr[1]) === 0) {
                        return arr[0] + currencySymbol;
                    }
                    return arr[0] + '.' + arr[1] + currencySymbol;
                }
            };

            $rootScope.moneyToCoins = function (money) {
                return parseInt(money * Math.pow(10, CONFIG.CDDP));
            };

            $rootScope.cutLastZeros = function (currentValue) {
                currentValue = String(currentValue);
                if (isNaN(currentValue)) return '0';
                if (angular.isUndefined(currentValue)) return '';
                if (parseFloat(currentValue) < 0.00000001) {
                    return '0';
                } else if (parseFloat(currentValue) > 99999999999) {
                    return '99999999999';
                } else {
                    var zeroFill = noExponents(currentValue);
                    zeroFill = zeroFill.split('.');
                    if (1 in zeroFill && zeroFill[1].length) {
                        zeroFill[1] = zeroFill[1].substr(0, 8);
                        currentValue = zeroFill.join('.');
                    }
                }
                if (currentValue.indexOf('.') > -1) {
                    for (var i = currentValue.length - 1; i >= 0; i--) {
                        if (currentValue[i] !== '0') {
                            currentValue = currentValue.substr(0, i + 1);
                            break;
                        }
                    }
                    if (currentValue[currentValue.length - 1] === '.') currentValue = currentValue.substr(0, currentValue.length - 1);
                }
                return currentValue;
            };

            var aliasChecked = {};

            $rootScope.getSafeAlias = function (address) {
                if (angular.isDefined(address)) {
                    if (angular.isUndefined(aliasChecked[address])) {
                        aliasChecked[address] = {};
                        if ($rootScope.aliases.length) {
                            for (var i = 0, length = $rootScope.aliases.length; i < length; i++) {
                                if (i in $rootScope.aliases && $rootScope.aliases[i]['address'] === address) {
                                    aliasChecked[address]['name'] = $rootScope.aliases[i].name;
                                    aliasChecked[address]['address'] = $rootScope.aliases[i].address;
                                    aliasChecked[address]['comment'] = $rootScope.aliases[i].comment;
                                    return aliasChecked[address];
                                }
                            }
                        }
                        backend.getAliasByAddress(address, function (s, d) {
                            if (s) {
                                aliasChecked[d.address]['name'] = '@' + d.alias;
                                aliasChecked[d.address]['address'] = d.address;
                                aliasChecked[d.address]['comment'] = d.comment;
                            }
                        });
                    }
                    return aliasChecked[address];
                }
                return {};
            };

            $rootScope.isExclamation = function(item){
                if (item && item.unlock_time !== 0 && $rootScope.appHeight !== 0) {
                    var timeCondition = (item.unlock_time > 500000000) && (item.unlock_time > new Date().getTime() / 1000);
                    var blockCondition = (item.unlock_time <= 500000000) && (item.unlock_time > $rootScope.appHeight);
                    return timeCondition || blockCondition;
                }
                return false;
            };

            $rootScope.getAvailableTime = function(item){
                if (!$scope.isExclamation(item)) return;
                var min = (item.unlock_time > 500000000) ? (item.unlock_time - new Date().getTime() / 1000 >> 0) / 60 >> 0 : item.unlock_time - $rootScope.appHeight;
                var days = min / 1440 >> 0;
                var ost =  min % 1440;
                var hours = ost / 60 >> 0;
                min = ost % 60;
                return '<span class="tr-blocked">' + $filter('translate')('TRANSACTION.DANGER.INFO') + '</span><span class="tr-date">' + days + ' ' + $filter('translate')('TRANSACTION.DANGER.DAYS') + ' ' + hours + ' ' + $filter('translate')('TRANSACTION.DANGER.HOURS') + ' ' + min + ' ' + $filter('translate')('TRANSACTION.DANGER.MINUTES') + '</span>';
            };

            $rootScope.getGroup = function (groupId) {
                if (angular.isDefined(groupId)) {
                    for (var i = 0, length = $rootScope.settings.contact_groups.length; i < length; i++) {
                        if (i in $rootScope.settings.contact_groups && $rootScope.settings.contact_groups[i]['id'] === groupId) return $rootScope.settings.contact_groups[i];
                    }
                }
                return false;
            };

            $rootScope.getSafeBy = function (id, data) {
                if (data !== false || data !== undefined) {
                    id = id || 'wallet_id';
                    for (var i = 0, length = $rootScope.safes.length; i < length; i++) {
                        if (i in $rootScope.safes && $rootScope.safes[i][id] === data) return $rootScope.safes[i];
                    }
                }
                return false;
            };

            $rootScope.getSafeById = function (walletId) {
                return $rootScope.getSafeBy('wallet_id', walletId);
            };

            $rootScope.getContactById = function (contactId) {
                if (angular.isDefined($rootScope.settings.contacts) && $rootScope.settings.contacts.length) {
                    for (var i = 0; i < $rootScope.settings.contacts.length; i++) {
                        if ($rootScope.settings.contacts[i].id === contactId) {
                            return $rootScope.settings.contacts[i];
                        }
                    }
                }
                return false;
            };

            $rootScope.getContactByAddress = function (address) {
                if (angular.isDefined($rootScope.settings.contacts) && $rootScope.settings.contacts.length) {
                    for (var i = 0; i < $rootScope.settings.contacts.length; i++) {
                        if ($rootScope.settings.contacts[i].addresses.indexOf(address) > -1) {
                            return $rootScope.settings.contacts[i];
                        }
                    }
                }
                return false;
            };

            $rootScope.checkMasterPassword = function (needPass, password, func) {
                if (needPass) {
                    backend.getSecureAppData({pass: password}, function (status, data) {
                        if (!(angular.isDefined(data.error_code) && data.error_code === 'WRONG_PASSWORD')) {
                            func();
                        }
                    });
                } else {
                    func();
                }
            };

            /* IDLE EVENTS */
            $scope.$on('IdleStart', function() {});

            $scope.$on('IdleWarn', function(e, countdown) {});

            $scope.$on('IdleTimeout', function() {
                PassDialogs.requestMPDialog(false, function(){Idle.watch();}, false);
            });

            $scope.$on('IdleEnd', function() {});

            $scope.$on('Keepalive', function() {});
            /* IDLE EVENTS END */

            if (angular.isUndefined($rootScope.aliases)) $rootScope.aliases = [];

            $rootScope.unconfirmedAliases = [];

            $rootScope.appPass = false;

            $rootScope.daemonState = {
                daemon_network_state: 3
            };

            $rootScope.getMenuTranslate = function () {
                $rootScope.mainMenu = angular.copy($rootScope.mainMenuTemp);
                for (var i = 0; i < $rootScope.mainMenu.length; i++) {
                    $rootScope.mainMenu[i].name = $filter('translate')($rootScope.mainMenu[i].name);
                }
                $rootScope.topMenu = {
                    statusSyncing: $filter('translate')('STATUS.SYNCING'),
                    statusOffline: $filter('translate')('STATUS.OFFLINE'),
                    statusOnline: $filter('translate')('STATUS.ONLINE'),
                    statusLoadCore: $filter('translate')('STATUS.LOAD_CORE'),
                    statusError: $filter('translate')('STATUS.ERROR'),
                    statusSyncNet: $filter('translate')('STATUS.SYNCING_WITH_NETWORK')
                };
            };

            var watchPass = $scope.$watch(
                function () {
                    return $rootScope.settings.security.is_use_app_pass
                },
                function () {
                    $rootScope.isProgramBlocked = $rootScope.settings.security.is_use_app_pass;
                    backend.setBlockedIcon($rootScope.isProgramBlocked);
                }
            );

            $rootScope.txCount = 0;
            $rootScope.totalBalance = 0;
            $rootScope.totalBalanceUnlocked = 0;

            $scope.lockApp = function () {
                $rootScope.isProgramBlocked = true;
                backend.setBlockedIcon($rootScope.isProgramBlocked);
                if ($rootScope.settings.security.is_use_app_pass) {
                    PassDialogs.generateMPLock();
                } else {
                    informer.error('MESSAGE.BLOCK');
                    $rootScope.isProgramBlocked = false;
                    backend.setBlockedIcon($rootScope.isProgramBlocked);
                }
            };

            // Modals
            var isModalOpened = {
                sendMoney: false,
                sendMoneyDetails: false,
                closeSafe: false,
                deleteContact: false,
                safeBackup: false,
                contactSafes: false,
                createAlias: false,
                createSmartSafe: false,
                openSmartSafe: false,
                changeSafePass: false,
                bugReport: false
            };

            $rootScope.openSendMoneyModal = function (walletId, address) {
                var localResult = $filter('filter')($rootScope.safes, {wallet_id: walletId});
                if (localResult.length && !localResult[0].loaded) {
                    return;
                }
                address = address ? address : false;
                if (!walletId && walletId !== 0) {
                    walletId = false;
                }

                if (isModalOpened.sendMoney) return;
                isModalOpened.sendMoney = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-send-money base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/sendMoney.html',
                    controller: 'sendMoneyCtrl',
                    resolve: {
                        address: function () {
                            return address;
                        },
                        walletId: function () {
                            return walletId;
                        }
                    }
                }).result.then(function () {
                    isModalOpened.sendMoney = false;
                }, function () {
                    isModalOpened.sendMoney = false;
                });
            };

            $scope.trDetails = function (item, safeAddress) {
                if (isModalOpened.sendMoneyDetails) return;
                isModalOpened.sendMoneyDetails = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-transaction-details base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/sendMoneyDetails.html',
                    controller: 'trDetailsModalCtrl',
                    resolve: {
                        item: function () {
                            return item;
                        },
                        safeAddress: function () {
                            return safeAddress;
                        }
                    }
                }).result.then(function () {
                    isModalOpened.sendMoneyDetails = false;
                }, function () {
                    isModalOpened.sendMoneyDetails = false;
                });
            };

            $rootScope.confirmOff = function (walletId, goToSafes) {
                if (isModalOpened.closeSafe) return;
                isModalOpened.closeSafe = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-disable-safe base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/safeClose.html',
                    controller: function ($scope, $rootScope, $uibModalInstance) {
                        $scope.success = function () {
                            $rootScope.closeWallet(walletId);
                            if (goToSafes) {
                                document.location.href = '#/safes';
                            }
                            informer.success('CONFIRM.OFF_SAFE.SUCCESS');
                            $scope.close();
                        };

                        $scope.close = function () {
                            $uibModalInstance.close();
                        };
                    }
                }).result.then(function () {
                    isModalOpened.closeSafe = false;
                }, function () {
                    isModalOpened.closeSafe = false;
                });
            };

            $rootScope.deleteContact = function (contact, goToContact) {
                if (isModalOpened.deleteContact) return;
                isModalOpened.deleteContact = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-disable-safe base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/contactDelete.html',
                    controller: function ($scope, $rootScope, $uibModalInstance) {
                        $scope.delete = function () {
                            angular.forEach($rootScope.settings.contacts, function (item, index) {
                                if (item.id === contact.id) {
                                    $rootScope.settings.contacts.splice(index, 1);
                                    $rootScope.storeAppData();
                                }
                            });
                            if (goToContact) {
                                document.location.href = '#/contacts';
                            }
                            informer.success('NEW_CONTACT.DELETED');
                            $scope.close();
                        };

                        $scope.close = function () {
                            $uibModalInstance.close();
                        };
                    }
                }).result.then(function () {
                    isModalOpened.deleteContact = false;
                }, function () {
                    isModalOpened.deleteContact = false;
                });
            };

            $scope.safeBackup = function (safe) {
                if (safe.loaded === false) return;

                if (isModalOpened.safeBackup) return;
                isModalOpened.safeBackup = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-safe-backup base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/safeBackup.html',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.safe = safe;
                        $scope.createSafeBackup = function () {
                            var caption = $filter('translate')('SAFES.CHOOSE_FILE');
                            backend.saveFileDialog(caption, CONFIG.filemask, function (status, result) {
                                if (result['error_code'] === 'OK') {
                                    if (result['path'] === $scope.safe.path) {
                                        informer.error($filter('translate')('SAFES.FILE_IS_EXIST'));
                                    } else {
                                        backend.backupWalletKeys($scope.safe.wallet_id, result.path, function (backupStatus) {
                                            if (backupStatus) {
                                                $scope.backupAlreadySaved = true;
                                                $scope.$digest();
                                                informer.success($filter('translate')('SAFES.COPY_CREATED'));
                                            }
                                        });
                                    }
                                }
                            });
                        };
                        $rootScope.smartSafeAlreadySaved = false;
                        $scope.close = function () {
                            $uibModalInstance.close();
                        };
                    }
                }).result.then(function () {
                    isModalOpened.safeBackup = false;
                }, function () {
                    isModalOpened.safeBackup = false;
                });
            };

            $rootScope.safeBackup = $scope.safeBackup;

            $rootScope.sendMoney = function (contact) {
                if ($rootScope.daemonState.daemon_network_state !== 2 || $rootScope.safes.length === 0) return;
                if (contact.addresses.length === 1) {
                    if (isModalOpened.sendMoney) return;
                    isModalOpened.sendMoney = true;

                    $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-send-money base-scroll light-scroll',
                        animation: true,
                        templateUrl: 'views/sendMoney.html',
                        controller: 'sendMoneyCtrl',
                        resolve: {
                            address: function () {
                                return contact.addresses[0];
                            },
                            walletId: function () {
                                return false;
                            }
                        }
                    }).result.then(function () {
                        isModalOpened.sendMoney = false;
                    }, function () {
                        isModalOpened.sendMoney = false;
                    });
                } else {
                    if (isModalOpened.contactSafes) return;
                    isModalOpened.contactSafes = true;

                    $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-select-contact-address base-scroll light-scroll',
                        animation: true,
                        templateUrl: 'views/sendMoneySelectContactAddress.html',
                        controller: 'contactSafesCtrl',
                        resolve: {
                            parentModal: function () {
                                return false;
                            },
                            tr: function () {
                                return false;
                            },
                            contact: function () {
                                return contact;
                            }
                        }
                    }).result.then(function () {
                        isModalOpened.contactSafes = false;
                    }, function () {
                        isModalOpened.contactSafes = false;
                    });
                }
            };

            $scope.registerAlias = function (safe) {
                if (safe.wakeAlias) {
                    informer.info($filter('translate')('INFORMER.REQUEST_ADD_REG'));
                    return;
                }
                if (!safe.loaded) return;

                if (isModalOpened.createAlias) return;
                isModalOpened.createAlias = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-create-alias base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/aliasCreate.html',
                    controller: 'createAliasCtrl',
                    resolve: {
                        safe: function () {
                            return safe;
                        }
                    }
                }).result.then(function () {
                    isModalOpened.createAlias = false;
                }, function () {
                    isModalOpened.createAlias = false;
                });
            };

            $rootScope.registerAlias = $scope.registerAlias;

            $rootScope.openSmartSafeForm = function (safe, ignoreLoaded) {
                if (safe.loaded === false && !ignoreLoaded) return;
                if (isModalOpened.createSmartSafe) return;
                isModalOpened.createSmartSafe = true;
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-create-smartsafe base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/safeCreateSmartsafe.html',
                    controller: 'smartSafeAddCtrl',
                    resolve: {
                        safe: function () {
                            return safe;
                        }
                    }
                }).result.then(function () {
                    isModalOpened.createSmartSafe = false;
                }, function () {
                    isModalOpened.createSmartSafe = false;
                });
            };

            $scope.openSmartSafeRestoreForm = function (path) {
                if (isModalOpened.openSmartSafe) return;
                isModalOpened.openSmartSafe = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-open-smartsafe base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/safeOpenSmartsafe.html',
                    controller: 'safeSmartRestoreCtrl',
                    resolve: {
                        path: function () {
                            return path;
                        },
                        safes: function () {
                            return $rootScope.safes;
                        }
                    }
                }).result.then(function () {
                    isModalOpened.openSmartSafe = false;
                }, function () {
                    isModalOpened.openSmartSafe = false;
                });
            };

            $rootScope.openSmartSafeRestoreForm = $scope.openSmartSafeRestoreForm;

            $scope.safeChangePass = function (safe) {
                if(isModalOpened.changeSafePass) return;
                isModalOpened.changeSafePass = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-change-safe-password base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/safeChangePassword.html',
                    controller: 'safeChangePassCtrl',
                    resolve: {
                        safe: function () {
                            return safe;
                        }
                    }
                }).result.then(function () {
                    isModalOpened.changeSafePass = false;
                }, function () {
                    isModalOpened.changeSafePass = false;
                });
            };

            $scope.showBugForm = function () {
                if (isModalOpened.bugReport) return;
                isModalOpened.bugReport = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-error-report base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/bugReport.html',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.bugReportResult = '';

                        $scope.operationVersion = '';
                        $scope.programVersion = '';
                        $scope.log = '';
                        $scope.describe = '';

                        backend.getVersion(function (version) {
                            $scope.programVersion = version;
                        });

                        backend.getOsVersion(function (version) {
                            $scope.operationVersion = version;
                        });

                        backend.getLogFile(function (log) {
                            $scope.log = log;
                        });

                        $scope.close = function () {
                            $uibModalInstance.close();
                        };

                        var sending = false;

                        $scope.sendBug = function () {
                            if (!$scope.bugReport.$valid) return;
                            if (sending) return;

                            sending = true;

                            $scope.bugReportResult = 'sending';
                            $.ajax({
                                type: 'POST',
                                url: 'http://88.198.50.112:8888/',
                                data: {
                                    operation_v: $scope.operationVersion,
                                    program_v: $scope.programVersion,
                                    log: $scope.log,
                                    describe: $scope.describe
                                },
                                success: function (data) {
                                    if(data === 'success') {
                                        $scope.bugReportResult = 'ok';
                                        $scope.$digest();
                                        setTimeout(function () {
                                            $uibModalInstance.close();
                                        }, 2000);
                                    } else {
                                        $scope.bugReportResult = 'error';
                                        sending = false;
                                        $scope.$digest();
                                    }
                                },
                                error: function () {
                                    $scope.bugReportResult = 'error';
                                    sending = false;
                                    $scope.$digest();
                                }
                            });
                        };
                    }
                }).result.then(function () {
                    isModalOpened.bugReport = false;
                }, function () {
                    isModalOpened.bugReport = false;
                });
            };
            // Modals End

            var isAliasSearchEnabled = false;

            function getAliases() {
                backend.getAllAliases(function (status, data, error) {
                    if (error === 'CORE_BUSY') {
                        $timeout(function () {
                            getAliases();
                        }, 10000);
                    } else if (error === 'OVERFLOW') {
                        isAliasSearchEnabled = false;
                        $rootScope.aliases = [];
                    } else {
                        isAliasSearchEnabled = true;
                        if (angular.isDefined(data.aliases) && data.aliases.length) {
                            $rootScope.aliases = [];
                            angular.forEach(data.aliases, function (alias) {
                                var newAlias = {
                                    name: '@' + alias.alias,
                                    address: alias.address,
                                    comment: alias.comment
                                };
                                $rootScope.aliases.push(newAlias);
                            });
                            angular.forEach($rootScope.safes, function (safe) {
                                safe.alias = $rootScope.getSafeAlias(safe.address);
                            });
                            $rootScope.aliases = $rootScope.aliases.sort(function(a, b) {
                                if (a.name.length > b.name.length) return 1;
                                if (a.name.length < b.name.length) return -1;
                                if (a.name > b.name) return 1;
                                if (a.name < b.name) return -1;
                                return 0;
                            });
                            $rootScope.$broadcast('alias_changed');
                            $scope.$digest();
                        }
                    }
                });
            }

            $rootScope.changeInterfaceSize = function (newScale) {
                angular.element('html').css('font-size', newScale + 'px');
            };

            $rootScope.getCountries = function (lang) {
                $http.get('assets/countries/' + lang + '.json').then(function (res) {
                    $rootScope.countryList = res.data;
                    var collator = new Intl.Collator(lang);
                    $rootScope.countryList.sort(function(a, b) {
                        return collator.compare(a.name, b.name);
                    });
                });
            };

            function nameSort(a, b) {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;
            }

            var updateTotalBalanceTimeout = false;

            $rootScope.reloadCounters = function () {
                if (updateTotalBalanceTimeout) $timeout.cancel(updateTotalBalanceTimeout);
                updateTotalBalanceTimeout = $timeout(function () {
                    var txCount = 0;
                    var localTotalBalance = 0;
                    var localTotalBalanceUnlocked = 0;
                    angular.forEach($rootScope.safes, function (safe) {
                        localTotalBalance += safe.balance;
                        localTotalBalanceUnlocked += safe.unlocked_balance;
                        if (safe.history.length) {
                            txCount += safe.history.length;
                        }
                    });
                    $rootScope.totalBalanceUnlocked = localTotalBalanceUnlocked;
                    $rootScope.totalBalance = localTotalBalance;
                    $rootScope.txCount = txCount;
                }, 500);
            };

            backend.initService().then(function () {
                backend.webkitLaunchedScript();

                $rootScope.setClipboard = function (str) {
                    backend.setClipboard(str);
                };

                $rootScope.storeAppData = function () {
                    backend.storeAppData($rootScope.settings);
                };

                backend.getAppData(function (status, data) {
                    if (data && Object.keys(data).length > 0) {
                        if (angular.isDefined(data.widgets) && data.widgets.length) {
                            for (var i = data.widgets.length-1; i >= 0 ; i--) {
                                for (var j = i-1; j >= 0 ; j--) {
                                    if (data.widgets[i].id === data.widgets[j].id) {
                                        data.widgets.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                        $rootScope.settings = data;
                        $rootScope.changeInterfaceSize($rootScope.settings.app_interface.general.font_size);
                        backend.setLogLevel(parseInt($rootScope.settings.system.log_level));
                        backend.isAutoStartEnabled(function (data) {
                            $rootScope.settings.system.app_autoload = data;
                        });
                        DefaultLanguage = data.app_interface.general.language;
                        $translate.use(data.app_interface.general.language).then(function() {
                            $rootScope.getMenuTranslate();
                            $rootScope.updateLocalization();
                        });
                        angular.element('html').attr('lang', data.app_interface.general.language);
                        $rootScope.getCountries(data.app_interface.general.language);
                    } else {
                        $translate.use(DefaultLanguage).then(function() {
                            $rootScope.getMenuTranslate();
                            $rootScope.updateLocalization();
                        });
                        angular.element('html').attr('lang', DefaultLanguage);
                        $rootScope.getCountries(DefaultLanguage);
                    }
                });

                var loaded = false;
                var loadedAliases = false;

                $rootScope.getClipboard = backend.getClipboard;

                var currentVersion;
                backend.getVersion(function (version) {
                    currentVersion = version;
                });

                var isUpdateModalOpened = false;
                var isWrongTimeModalOpened = false;

                $rootScope.menuPopupUpdate = function (activeItem) {
                    var displayMode = $rootScope.daemonState.last_build_displaymode;
                    if ((activeItem === 'settings' && (displayMode === 2 || displayMode === 3)) || displayMode === 4) {
                        $rootScope.showPopupUpdate();
                    }
                    if ($rootScope.daemonState.net_time_delta_median && $rootScope.daemonState.net_time_delta_median !== 0) {
                        $rootScope.showPopupWrongTime();
                    }
                };

                $rootScope.showPopupUpdate = function () {
                    var newVersionModalCtrl = function ($scope, $rootScope, $uibModalInstance, backend) {
                        $scope.close = function () {
                            $uibModalInstance.close();
                        };
                        $scope.openUrlInBrowser = function () {
                            backend.openUrlInBrowser('www.virieproject.com/#download', function () {
                                $scope.close();
                            });
                        };
                        $scope.isCollapsed = true;
                        switch ($rootScope.daemonState.last_build_displaymode) {
                            case 2:
                                $scope.type = 'update-green';
                                $scope.displaymode = 2;
                                break;
                            case 3:
                                $scope.type = 'update-yellow';
                                $scope.displaymode = 3;
                                break;
                            case 4:
                                $scope.type = 'update-red';
                                $scope.displaymode = 4;
                                break;
                            default:
                                $scope.type = 'update-green';
                                $scope.displaymode = 2;
                                break;
                        }
                    };

                    if(isUpdateModalOpened) return;
                    isUpdateModalOpened = true;

                    $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-update base-scroll light-scroll',
                        animation: true,
                        controller: newVersionModalCtrl,
                        templateUrl: 'views/update.html'
                    }).result.then(function () {
                        isUpdateModalOpened = false;
                    }, function () {
                        isUpdateModalOpened = false;
                    });
                };

                $rootScope.showPopupWrongTime = function () {
                    var wrongTimeModalCtrl = function ($scope, $rootScope, $uibModalInstance) {
                        $scope.close = function () {
                            $uibModalInstance.close();
                        };
                    };

                    if(isWrongTimeModalOpened) return;
                    isWrongTimeModalOpened = true;

                    $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-wrong-time base-scroll light-scroll',
                        animation: true,
                        controller: wrongTimeModalCtrl,
                        templateUrl: 'views/wrongTime.html'
                    }).result.then(function () {
                        isWrongTimeModalOpened = false;
                    }, function () {
                        isWrongTimeModalOpened = false;
                    });
                };

                $rootScope.updateModalFirstShow = false;
                $rootScope.wrongTimeModalFirstShow = false;
                $rootScope.freeSpaceFirstShow = false;

                $rootScope.safeLoadedEnd = false;

                var redirectToSafes;

                backend.subscribe('update_daemon_state', function (data) {
                    Debug(2, 'DAEMON: ' + data.daemon_network_state);
                    Debug(2, data);

                    if (data.hasOwnProperty('unavailable_disk_space') && data['unavailable_disk_space'] === 1) {
                        if (!$rootScope.freeSpaceFirstShow) {
                            $rootScope.freeSpaceFirstShow = true;
                            $uibModal.open({
                                backdrop: false,
                                windowClass: 'modal-main-wrapper modal-free-space base-scroll light-scroll',
                                animation: true,
                                templateUrl: 'views/unavailableDiskSpace.html'
                            }).result.then();
                            $timeout(function () {
                                $rootScope.quit();
                            }, 5000);
                        }
                    } else {
                        $rootScope.exp_med_ts = data['expiration_median_timestamp'] + 600 + 1;
                        $rootScope.appHeight = data.height;
                        $rootScope.$apply(function () {
                            $rootScope.daemonState = data;
                            $rootScope.daemonState.current_build = currentVersion;
                            $rootScope.$broadcast('NEED_REFRESH_WIDGET_BACKEND_INFO');
                        });

                        if (data.daemon_network_state === 0 || data.daemon_network_state === 1) {
                            if (!redirectToSafes && $rootScope.currentMenuItem === 'dashboard'){
                                redirectToSafes = $timeout(function () {
                                    if ($rootScope.currentMenuItem === 'dashboard') {
                                        document.location.href = '#/safes';
                                    }
                                }, 20000);
                            }
                        } else {
                            if (redirectToSafes) {
                                $timeout.cancel(redirectToSafes);
                                redirectToSafes = undefined;
                            }
                        }

                        if (data.daemon_network_state === 1) {
                            var maxValue = data['max_net_seen_height'] - data['synchronization_start_height'];
                            var currentValue = data.height - data['synchronization_start_height'];
                            var returnValue = Math.floor((currentValue * 100 / maxValue) * 100) / 100;
                            if (maxValue === 0 || returnValue < 0) {
                                $scope.progressValue = 0;
                                $scope.progressValueText = '0.00';
                            } else if (returnValue >= 100) {
                                $scope.progressValue = 100;
                                $scope.progressValueText = '99.99';
                            } else {
                                $scope.progressValue = returnValue;
                                $scope.progressValueText = returnValue.toFixed(2);
                            }
                            $scope.remaining = data['max_net_seen_height'] - data.height;
                            $scope.$digest();
                        }

                        if (!loadedAliases && data.daemon_network_state === 2) {
                            loadedAliases = true;
                            getAliases();
                            $rootScope.refreshFavoriteOffers();
                            backend.getDefaultFee(function (s, d) {
                                CONFIG.standardFee = noExponents(parseInt(d) / Math.pow(10, CONFIG.CDDP));
                                CONFIG.premiumFee = noExponents((parseInt(d) * 10) / Math.pow(10, CONFIG.CDDP));
                                CONFIG.standardFeeDecimal = CONFIG.CDDP - (d.toString().length-1);
                            });
                            backend.getOptions(function (s, d) {
                                $rootScope.devOptions = d;
                            });
                        }

                        if (data.daemon_network_state === 0 || data.daemon_network_state === 1 || data.daemon_network_state === 2) {
                            if (!loaded) {
                                loaded = true;

                                backend.haveSecureAppData(function (status) {
                                    $rootScope.contracts = [];

                                    if ($rootScope.settings.security.is_use_app_pass) {
                                        if (status) {
                                            PassDialogs.requestMPDialog(
                                                function () {
                                                    $rootScope.settings.security.is_use_app_pass = false;
                                                    $rootScope.settings.security.is_pass_required_on_transfer = false;
                                                },
                                                function (appData) {
                                                    if (angular.isDefined($rootScope.settings.security.password_required_interval) && $rootScope.settings.security.password_required_interval > 0) {
                                                        Idle.setIdle($rootScope.settings.security.password_required_interval);
                                                        Idle.watch();
                                                    }

                                                    appData = appData.sort(nameSort);

                                                    if (appData.length === 0) $rootScope.safeLoadedEnd = true;

                                                    var errorMessage = '';
                                                    $scope.walletCounter = 0;

                                                    var newAppData = [];
                                                    angular.forEach(appData, function (item) {
                                                        var localArr = $filter('filter')(newAppData, {path: item.path});
                                                        if (localArr.length === 0) {
                                                            newAppData.push(item);
                                                        }
                                                    });
                                                    appData = newAppData;

                                                    angular.forEach(appData, function (item) {
                                                        backend.openWallet(item.path, item.pass, false, function (status, data, error) {
                                                            $rootScope.totalBalance += data.wi.balance;
                                                            if (!error || error === 'INFORMER.FILE_RESTORED') {
                                                                var exists = $rootScope.getSafeBy('address', data.wi.address);
                                                                if (exists) {
                                                                    backend.closeWallet(data.wallet_id);
                                                                } else {
                                                                    var newSafe = data.wi;
                                                                    newSafe.wallet_id = data.wallet_id;
                                                                    newSafe.name = item.name;
                                                                    newSafe.pass = item.pass;
                                                                    newSafe.history = [];
                                                                    newSafe.excluded_history = [];
                                                                    if (angular.isDefined(data['recent_history']) && angular.isDefined(data['recent_history'].history)) {
                                                                        newSafe.history = $filter('filter')(data['recent_history'].history, historySplitter());
                                                                        newSafe.excluded_history = $filter('filter')(data['recent_history'].history, historySplitter(true));
                                                                    }

                                                                    $rootScope.txCount += newSafe.history.length;

                                                                    newSafe.alias = $rootScope.getSafeAlias(newSafe.address);
                                                                    $rootScope.safes.push(newSafe);
                                                                    $rootScope.getContractsOpen(data.wallet_id);
                                                                    backend.runWallet(data.wallet_id, function () {
                                                                        $rootScope.reloadCounters();
                                                                        $rootScope.recountOffers();
                                                                        $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                                                                    });
                                                                }
                                                            } else {
                                                                if (error === 'FILE_NOT_FOUND') {
                                                                    errorMessage += '<br>' + item.path;
                                                                }
                                                            }
                                                            $scope.walletCounter++;
                                                            if ($scope.walletCounter === appData.length) {
                                                                if (errorMessage !== '') {
                                                                    informer.fileNotFound($filter('translate')('INFORMER.SAFE_FILE_NOT_FOUND1') + ':' + errorMessage + $filter('translate')('INFORMER.SAFE_FILE_NOT_FOUND2'));
                                                                }
                                                            }
                                                        });
                                                    });

                                                    $timeout(function () {
                                                        $rootScope.safeLoadedEnd = true;
                                                    }, 1000);
                                                }
                                            );
                                        } else {
                                            $rootScope.safeLoadedEnd = true;
                                            PassDialogs.generateMPDialog(function () {
                                                $rootScope.settings.security.is_use_app_pass = false;
                                            });
                                        }
                                    } else {
                                        $rootScope.safeLoadedEnd = true;

                                        $rootScope.settings.security.is_use_app_pass = false;
                                        $rootScope.settings.security.is_pass_required_on_transfer = false;

                                        if (angular.isDefined($rootScope.settings.arrPathSafes) && $rootScope.settings.arrPathSafes.length) {

                                            $rootScope.arrPathSafesEnabled = false;

                                            var safeRestoreArrFromPathCtrl = function ($scope, $rootScope, $uibModalInstance) {

                                                var arrPathSafes = $rootScope.settings.arrPathSafes ? angular.copy($rootScope.settings.arrPathSafes) : [];
                                                arrPathSafes = arrPathSafes.sort(nameSort);

                                                $scope.closeAndNextSafe = function () {
                                                    if (arrPathSafes.length) {
                                                        var obj = {
                                                            name: arrPathSafes[0].name,
                                                            path: arrPathSafes[0].path,
                                                            pass: '',
                                                            emptyPass: false,
                                                            notFound: false
                                                        };
                                                        arrPathSafes.splice(0, 1);
                                                        $scope.oneSafe = obj;
                                                    } else {
                                                        $scope.oneSafe = false;
                                                    }
                                                    if (!$scope.oneSafe) {
                                                        $rootScope.arrPathSafesEnabled = true;
                                                        $rootScope.saveSecureData();
                                                        $uibModalInstance.close();
                                                    } else {
                                                        backend.openWallet($scope.oneSafe.path, '', true, function (status, data, error) {
                                                            if (error === 'FILE_NOT_FOUND') {
                                                                $scope.oneSafe.notFound = true;
                                                            }
                                                            if (status) {
                                                                $scope.oneSafe.pass = '';
                                                                $scope.oneSafe.emptyPass = true;
                                                                backend.closeWallet(data.wallet_id);
                                                                $scope.openAndNextSafe();
                                                            }
                                                        });
                                                    }
                                                };

                                                $scope.closeAndNextSafe(false);

                                                $scope.openAndNextSafe = function () {
                                                    backend.openWallet($scope.oneSafe.path, $scope.oneSafe.pass, false, function (status, data, error) {
                                                        if (error && error === 'FILE_NOT_FOUND') {
                                                            var errorTranslate = $filter('translate')('INFORMER.SAFE_FILE_NOT_FOUND1');
                                                            errorTranslate += ':<br>' + $scope.safe.path;
                                                            errorTranslate += $filter('translate')('INFORMER.SAFE_FILE_NOT_FOUND2');
                                                            informer.fileNotFound(errorTranslate);
                                                        } else {
                                                            if (status || error === 'FILE_RESTORED') {
                                                                var exists = $rootScope.getSafeBy('address', data.wi.address);
                                                                if (exists) {
                                                                    informer.error($filter('translate')('SAFES.WITH_ADDRESS_ALREADY_OPEN'));
                                                                    backend.closeWallet(data.wallet_id);
                                                                } else {
                                                                    var newSafe = data.wi;
                                                                    newSafe.wallet_id = data.wallet_id;
                                                                    newSafe.name = $scope.oneSafe.name;
                                                                    newSafe.pass = $scope.oneSafe.pass;
                                                                    newSafe.history = [];
                                                                    newSafe.excluded_history = [];
                                                                    if (angular.isDefined(data['recent_history']) && angular.isDefined(data['recent_history'].history)) {
                                                                        newSafe.history = $filter('filter')(data['recent_history'].history, historySplitter());
                                                                        newSafe.excluded_history = $filter('filter')(data['recent_history'].history, historySplitter(true));
                                                                    }
                                                                    if (!(error && error === 'FILE_RESTORED') && $scope.oneSafe.pass !== '') {
                                                                        informer.success();
                                                                    }
                                                                    newSafe.alias = $rootScope.getSafeAlias(newSafe.address);
                                                                    $rootScope.safes.unshift(newSafe);
                                                                    $rootScope.getContractsOpen(data.wallet_id);
                                                                    backend.runWallet(data.wallet_id, function () {
                                                                        $rootScope.reloadCounters();
                                                                        $rootScope.recountOffers();
                                                                        $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                                                                    });
                                                                    $scope.closeAndNextSafe();
                                                                }
                                                            }
                                                        }
                                                    });
                                                };
                                            };

                                            $uibModal.open({
                                                templateUrl: 'views/safeRestore.html',
                                                controller: safeRestoreArrFromPathCtrl,
                                                backdrop: false,
                                                windowClass: 'modal-main-wrapper modal-restore-safe base-scroll light-scroll',
                                                animation: true,
                                                keyboard: false
                                            });
                                        }
                                    }
                                });
                            }

                            { // Update Window
                                var availableVersion = onlyVersion(data['last_build_available']);
                                var programCanUpdate = (parseInt(availableVersion.replace(/\./g, '')) && onlyVersion(currentVersion) !== availableVersion);
                                var showAvailableVersion = programCanUpdate && (data['last_build_displaymode'] > 1);

                                if (showAvailableVersion) {
                                    $rootScope.updateShowed = true;
                                    if (!$rootScope.updateModalFirstShow) {
                                        $rootScope.showPopupUpdate();
                                        $rootScope.updateModalFirstShow = true;
                                    }
                                } else {
                                    $rootScope.updateShowed = false;
                                }
                            }

                            { // Wrong Time Window
                                var wrongTime = data['net_time_delta_median'] !== 0;

                                if (wrongTime) {
                                    $rootScope.wrongTimeShowed = true;
                                    if (!$rootScope.wrongTimeModalFirstShow) {
                                        $rootScope.showPopupWrongTime();
                                        $rootScope.wrongTimeModalFirstShow = true;
                                    }
                                } else {
                                    $rootScope.wrongTimeShowed = false;
                                }
                            }
                        } else if (data.daemon_network_state === 4) {
                            informer.error('INFORMER.SYSTEM_ERROR');
                        }
                    }
                });

                backend.subscribe('quit_requested', function () {
                    $rootScope.quit();
                });

                $rootScope.quit = function () {
                    if (!$rootScope.onQuitRequest) {
                        angular.element('.contextMenu').remove();
                        $scope.daemonState.daemon_network_state = 5;
                        $timeout(function () {
                            $rootScope.saveSecureData();
                            var currentIndex = 0;
                            var safesCount = $rootScope.safes.length;
                            if (safesCount > 0) {
                                for (var i = safesCount - 1; i >= 0; i--) {
                                    $rootScope.getContractsClose($rootScope.safes[i].wallet_id);
                                    backend.closeWallet($rootScope.safes[i].wallet_id, function () {
                                        currentIndex++;
                                        if (currentIndex === safesCount) {
                                            backend.quitRequest();
                                        }
                                    });
                                    $rootScope.safes.splice(i, 1);
                                }
                            } else {
                                backend.quitRequest();
                            }
                        });
                    }
                    $rootScope.onQuitRequest = true;
                };

                $rootScope.saveSecureData = function () {
                    PassDialogs.storeSecureAppData();
                    $rootScope.storeAppData();
                };

                backend.subscribe('update_wallet_status', function (data) {
                    Debug(2, '----------------- update_wallet_status -----------------');
                    Debug(2, data);

                    var walletId = data['wallet_id'];
                    var walletState = data['wallet_state'];
                    var isMining = data['is_mining'];
                    var safe = $rootScope.getSafeById(walletId);

                    // walletState: 1 - synchronize, 2 - ready, 3 - error
                    if (safe) {
                        $timeout(function () {
                            safe.alias_available = data['is_alias_operations_available'];
                            safe.loaded = false;
                            safe.error = false;
                            safe.is_mining = isMining;

                            if (walletState === 2) {
                                safe.loaded = true;
                                if ($rootScope.settings.mining.auto_mining && !safe.is_mining_set_manual) {
                                    $scope.startMining(safe.wallet_id);
                                }
                            }

                            if (walletState === 3) {
                                safe.error = true;
                            }

                            if (updateBalanceTimeout) $timeout.cancel(updateBalanceTimeout);

                            safe.balance = data['balance'];
                            safe.unlocked_balance = data['unlocked_balance'];
                            safe.mined_total = data['mined_total'];
                            $rootScope.reloadCounters();
                            $rootScope.$broadcast('NEED_REFRESH_SAFES');
                        });
                    }
                });

                var syncTimer = {};

                backend.subscribe('wallet_sync_progress', function (data) {
                    Debug(2, '----------------- wallet_sync_progress -----------------');
                    Debug(2, data);

                    if (angular.isUndefined(syncTimer[data['wallet_id']]) || !syncTimer[['data.wallet_id']] || data.progress === 100) {
                        var walletId = data['wallet_id'];
                        var progress = data['progress'];
                        if ($rootScope.safes.length) {
                            var safe = $rootScope.getSafeById(walletId);
                            if (safe) {
                                if (!safe.loaded) {
                                    syncTimer[data['wallet_id']] = $timeout(function () {
                                        safe.progress = progress;
                                        if (progress === 100) {
                                            safe.loaded = true;
                                            $rootScope.recountOffers();
                                            $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                                        }
                                        syncTimer[data['wallet_id']] = false;
                                    }, reloadTime);
                                }
                            }
                        }
                    }
                });

                var waitedAliases = [];
                var waitedAliasesFinished = true;

                var addWaitedAliases = function () {
                    if (!waitedAliasesFinished) return;
                    waitedAliasesFinished = false;

                    $timeout(function () {
                        $rootScope.aliases = $rootScope.aliases.concat(waitedAliases);
                        waitedAliases = [];
                        $rootScope.aliases = $rootScope.aliases.sort(function (a, b) {
                            if (a.name.length > b.name.length) return 1;
                            if (a.name.length < b.name.length) return -1;
                            if (a.name > b.name) return 1;
                            if (a.name < b.name) return -1;
                            return 0;
                        });
                        $rootScope.$broadcast('alias_changed');

                        waitedAliasesFinished = true;
                    }, 1000);
                };

                backend.subscribe('on_core_event', function (data) {
                    Debug(2, '----------------- on_core_event: -----------------');
                    Debug(2, data);

                    data = angular.fromJson(data);

                    if (angular.isDefined(data.events)) {
                        for (var i = 0; i < data.events.length; i++) {
                            switch (data.events[i].method) {
                                case 'CORE_EVENT_BLOCK_ADDED':
                                    break;
                                case 'CORE_EVENT_ADD_ALIAS':
                                    if (angular.isDefined(aliasChecked[data.events[i].details.address])) {
                                        aliasChecked[data.events[i].details.address]['name'] = '@' + data.events[i].details.alias;
                                        aliasChecked[data.events[i].details.address]['address'] = data.events[i].details.address;
                                        aliasChecked[data.events[i].details.address]['comment'] = data.events[i].details.comment;
                                    }
                                    if (isAliasSearchEnabled) {
                                        var newAlias = {
                                            name: '@' + data.events[i].details.alias,
                                            address: data.events[i].details.address,
                                            comment: data.events[i].details.comment
                                        };
                                        waitedAliases.push(newAlias);
                                        addWaitedAliases();
                                    }
                                    break;
                                case 'CORE_EVENT_UPDATE_ALIAS':

                                    for (var address in aliasChecked) {
                                        if (aliasChecked[address].name === '@' + data.events[i].details.alias) {
                                            if (aliasChecked[address].address !== data.events[i].details.details.address) {
                                                delete aliasChecked[address]['name'];
                                                delete aliasChecked[address]['address'];
                                                delete aliasChecked[address]['comment'];
                                            } else {
                                                aliasChecked[address].comment = data.events[i].details.details.comment;
                                            }
                                            break;
                                        }
                                    }

                                    if (angular.isDefined(aliasChecked[data.events[i].details.details.address])) {
                                        aliasChecked[data.events[i].details.details.address]['name'] = '@' + data.events[i].details.alias;
                                        aliasChecked[data.events[i].details.details.address]['address'] = data.events[i].details.details.address;
                                        aliasChecked[data.events[i].details.details.address]['comment'] = data.events[i].details.details.comment;
                                    }

                                    if (isAliasSearchEnabled) {
                                        var currentAlias = $rootScope.aliases.searchBy('name', '@' + data.events[i].details.alias);
                                        currentAlias = $rootScope.aliases[currentAlias];
                                        if (currentAlias) {
                                            currentAlias.address = data.events[i].details.details.address;
                                            currentAlias.comment = data.events[i].details.details.comment;
                                        }
                                    }

                                    $rootScope.$broadcast('alias_changed');
                                    break;
                                default:
                                    $scope.$broadcast(data.events[i].method, data.events[i].details);
                                    break;
                            }
                        }
                    }

                });

                var updateBalanceTimeout = false;

                backend.subscribe('money_transfer', function (data) {
                    Debug(2, '----------------- money_transfer -----------------');
                    Debug(2, data);

                    if (angular.isUndefined(data['ti'])) return;

                    var walletId = data['wallet_id'];
                    var trInfo = data['ti'];

                    if (typeof $rootScope.unconfirmedAliases !== 'undefined' && $rootScope.unconfirmedAliases.length) {
                        var alias = false;
                        for (var i = 0; i < $rootScope.unconfirmedAliases.length; i++) {
                            if ($rootScope.unconfirmedAliases[i].tx_hash === data['ti'].tx_hash) {
                                alias = $rootScope.unconfirmedAliases[i];
                                break;
                            }
                        }
                        if (alias) {
                            $rootScope.unconfirmedAliases.splice($rootScope.unconfirmedAliases.indexOf(alias), 1);
                        }
                    }

                    var safe = $rootScope.getSafeById(walletId);

                    if (safe) {
                        if (!safe.loaded) {
                            if (updateBalanceTimeout) $timeout.cancel(updateBalanceTimeout);
                            updateBalanceTimeout = $timeout(function () {
                                safe.balance = data['balance'];
                                safe.unlocked_balance = data['unlocked_balance'];
                            }, reloadTime);
                        } else {
                            if (updateBalanceTimeout) $timeout.cancel(updateBalanceTimeout);
                            safe.balance = data['balance'];
                            safe.unlocked_balance = data['unlocked_balance'];
                        }

                        if (trInfo['tx_type'] === 6) {
                            $rootScope.$broadcast('NEED_REFRESH_MINING_LIST', walletId);
                        }

                        var trExists = false;

                        if (!((trInfo['tx_type'] === 7 && trInfo['is_income']) || (trInfo['tx_type'] === 11 && trInfo['is_income']) || (trInfo['amount'] === 0 && trInfo.fee === 0))) {
                            for (i = 0; i < safe.history.length; i++) {
                                if (safe.history[i].tx_hash === trInfo['tx_hash']) {
                                    trExists = true;
                                    if (safe.history[i].height !== trInfo['height']) {
                                        safe.history[i] = trInfo;
                                        $rootScope.reloadCounters();
                                        $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                                    }
                                    break;
                                }
                            }
                            if (!trExists) {
                                safe.history.unshift(trInfo);
                                $rootScope.reloadCounters();
                                $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                            }
                        } else {
                            for (i = 0; i < safe.excluded_history.length; i++) {
                                if (safe.excluded_history[i].tx_hash === trInfo['tx_hash']) {
                                    trExists = true;
                                    if (safe.excluded_history[i].height !== trInfo['height']) {
                                        safe.excluded_history[i] = trInfo;
                                    }
                                    break;
                                }
                            }
                            if (!trExists) {
                                safe.excluded_history.push(trInfo);
                            }
                        }

                        if (trInfo.hasOwnProperty('contract')) {
                            var nowDate = $rootScope.exp_med_ts;
                            var contract = trInfo.contract[0];
                            var j;
                            contract.wallet_id = walletId;

                            if (trExists) {
                                for (j = 0; j < $rootScope.contracts.length; j++) {
                                    if ($rootScope.contracts[j].contract_id === contract.contract_id && $rootScope.contracts[j].is_a === contract.is_a) {
                                        $rootScope.contracts[j].cancel_expiration_time = contract.cancel_expiration_time;
                                        $rootScope.contracts[j].expiration_time = contract.expiration_time;
                                        $rootScope.contracts[j].height = contract.height;
                                        $rootScope.contracts[j].timestamp = contract.timestamp;
                                        break;
                                    }
                                }
                                $rootScope.getContractsRecount();
                                $scope.$digest();
                                return false;
                            }

                            if (contract.state === 1 && contract.expiration_time < nowDate) {
                                contract.state = 110;
                            } else if (contract.state === 5 && contract.cancel_expiration_time < nowDate) {
                                contract.state = 130;
                            } else if (contract.state === 1){
                                var arr1 = $filter('filter')($rootScope.settings.notViewedContracts, {state: 110, is_a: contract.is_a, contract_id: contract.contract_id}, true);
                                if (angular.isDefined(arr1) && arr1.length){
                                    if (arr1[0].time === contract.expiration_time) {
                                        contract.state = 110;
                                    } else {
                                        for (j = 0; j < $rootScope.settings.notViewedContracts.length; j++) {
                                            if ($rootScope.settings.notViewedContracts[j].contract_id === contract.contract_id && $rootScope.settings.notViewedContracts[j].is_a === contract.is_a) {
                                                $rootScope.settings.notViewedContracts.splice(j, 1);
                                                break;
                                            }
                                        }
                                        for (j = 0; j < $rootScope.settings.viewedContracts.length; j++) {
                                            if ($rootScope.settings.viewedContracts[j].contract_id === contract.contract_id && $rootScope.settings.viewedContracts[j].is_a === contract.is_a) {
                                                $rootScope.settings.viewedContracts.splice(j,1);
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else if (contract.state === 2 && (contract.height === 0 || ($rootScope.appHeight - contract.height) < 10)) {
                                contract.state = 201;
                            } else if (contract.state === 2) {
                                var arr2 = $filter('filter')($rootScope.settings.viewedContracts, {state: 120, is_a: contract.is_a, contract_id: contract.contract_id}, true);
                                if (angular.isDefined(arr2) && arr2.length){
                                    contract.state = 120;
                                }
                            } else if (contract.state === 5) {
                                var arr3 = $filter('filter')($rootScope.settings.notViewedContracts, {state: 130, is_a: contract.is_a, contract_id: contract.contract_id}, true);
                                if (angular.isDefined(arr3) && arr3.length) {
                                    if (arr3[0].time === contract.cancel_expiration_time) {
                                        contract.state = 130;
                                    } else {
                                        for (j = 0; j < $rootScope.settings.notViewedContracts.length; j++) {
                                            if ($rootScope.settings.notViewedContracts[j].contract_id === contract.contract_id && $rootScope.settings.notViewedContracts[j].is_a === contract.is_a) {
                                                $rootScope.settings.notViewedContracts.splice(j, 1);
                                                break;
                                            }
                                        }
                                        for (j = 0; j < $rootScope.settings.viewedContracts.length; j++) {
                                            if ($rootScope.settings.viewedContracts[j].contract_id === contract.contract_id && $rootScope.settings.viewedContracts[j].is_a === contract.is_a) {
                                                $rootScope.settings.viewedContracts.splice(j, 1);
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else if (contract.state === 6 && (contract.height === 0 || ($rootScope.appHeight - contract.height) < 10)) {
                                contract.state = 601;
                            }
                            var arr4 = $filter('filter')($rootScope.settings.viewedContracts, {state: contract.state, is_a: contract.is_a, contract_id: contract.contract_id}, true);
                            contract.isNew = !(angular.isDefined(arr4) && arr4.length);

                            contract.private_details.a_pledge += contract.private_details.to_pay;
                            contract.alias = (contract.is_a)? $rootScope.getSafeAlias(contract.private_details.b_addr) : $rootScope.getSafeAlias(contract.private_details.a_addr);

                            var findContract = false;
                            for (j = 0; j < $rootScope.contracts.length; j++) {
                                if ($rootScope.contracts[j].contract_id === contract.contract_id && $rootScope.contracts[j].is_a === contract.is_a) {
                                    for (var prop in contract) {
                                        if (contract.hasOwnProperty(prop)) {
                                            $rootScope.contracts[j][prop] = contract[prop];
                                        }
                                    }
                                    findContract = true;
                                    break;
                                }
                            }
                            if (!findContract) {
                                $rootScope.contracts.push(contract);
                            }
                            $rootScope.getContractsRecount();
                            $scope.$digest();
                        }
                    }
                });

                backend.subscribe('money_transfer_cancel', function (data) {
                    Debug(2, '----------------- money_transfer_cancel -----------------');
                    Debug(2, data);

                    if (angular.isUndefined(data['ti'])) return;

                    var walletId = data['wallet_id'];
                    var trInfo = data['ti'];
                    var safe = $rootScope.getSafeById(walletId);
                    if (safe) {
                        if ( trInfo.hasOwnProperty('contract')) {
                            for (var i = 0; i < $rootScope.contracts.length; i++) {
                                if ($rootScope.contracts[i].contract_id === trInfo.contract[0].contract_id && $rootScope.contracts[i].is_a === trInfo.contract[0].is_a) {
                                    if ($rootScope.contracts[i].state === 1 || $rootScope.contracts[i].state === 110) {
                                        $rootScope.contracts[i].isNew = true;
                                        $rootScope.contracts[i].state = 140;
                                        $rootScope.getContractsRecount();
                                    }
                                    break;
                                }
                            }
                        }
                        angular.forEach(safe.history, function (trItem, key) {
                            if (trItem.tx_hash === trInfo.tx_hash) {
                                safe.history.splice(key, 1);
                            }
                        });

                        var errorTranslate = '';
                        switch (trInfo.tx_type) {
                            case 0:
                                errorTranslate = $filter('translate')('ERROR_GUI_TX_TYPE_NORMAL') + '<br>' +
                                    trInfo.tx_hash + '<br>' + safe.name + '<br>' + safe.address + '<br>' +
                                    $filter('translate')('ERROR_GUI_TX_TYPE_NORMAL_TO') + ' ' + $rootScope.moneyParse(trInfo.amount) + ' ' +
                                    $filter('translate')('ERROR_GUI_TX_TYPE_NORMAL_END');
                                informer.error(errorTranslate);
                                break;
                            case 1:
                                informer.error('ERROR_GUI_TX_TYPE_PUSH_OFFER');
                                break;
                            case 2:
                                informer.error('ERROR_GUI_TX_TYPE_UPDATE_OFFER');
                                break;
                            case 3:
                                informer.error('ERROR_GUI_TX_TYPE_CANCEL_OFFER');
                                break;
                            case 4:
                                errorTranslate = $filter('translate')('ERROR_GUI_TX_TYPE_NEW_ALIAS') + '<br>' +
                                    trInfo.tx_hash + '<br>' + safe.name + '<br>' + safe.address + '<br>' +
                                    $filter('translate')('ERROR_GUI_TX_TYPE_NEW_ALIAS_END');
                                informer.error(errorTranslate);
                                break;
                            case 5:
                                errorTranslate = $filter('translate')('ERROR_GUI_TX_TYPE_UPDATE_ALIAS') + '<br>' +
                                    trInfo.tx_hash + '<br>' + safe.name + '<br>' + safe.address + '<br>' +
                                    $filter('translate')('ERROR_GUI_TX_TYPE_NEW_ALIAS_END');
                                informer.error(errorTranslate);
                                break;
                            case 6:
                                informer.error('ERROR_GUI_TX_TYPE_COIN_BASE');
                                break;
                        }
                    }
                });
            });

            $rootScope.closeWallet = function (walletId, callback) {
                $rootScope.getContractsClose(walletId);
                backend.closeWallet(walletId, function () {
                    for (var i = $rootScope.safes.length-1; i >= 0; i--) {
                        if ($rootScope.safes[i].wallet_id === walletId) {
                            $rootScope.safes.splice(i, 1);
                        }
                    }
                    if ($rootScope.dashboardActiveMining === walletId) {
                        $rootScope.dashboardActiveMining = $rootScope.safes.length ? $rootScope.safes[0].wallet_id : 0;
                    }
                    $rootScope.saveSecureData();
                    $rootScope.reloadCounters();
                    $rootScope.recountOffers();
                    $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                    var path = $location.path();

                    if (path.indexOf('/safe/') > -1) {
                        $location.path('/safes');
                    }

                    if (typeof callback === 'function') {
                        callback(true);
                    }
                });
            };

            $rootScope.checkAvailableMining = function (walletId) {
                if ($rootScope.daemonState.is_pos_allowed) {
                    var safe = $rootScope.getSafeById(walletId);
                    return (safe && safe.loaded && safe.unlocked_balance > 0);
                }
                return false;
            };

            $scope.startMining = function (walletId) {
                if ($rootScope.checkAvailableMining(walletId)) {
                    var safe = $rootScope.getSafeById(walletId);
                    if (!safe.loaded) return;
                    if (safe) {
                        backend.startPosMining(walletId, function () {
                            safe.is_mining_set_manual = true;
                        });
                    }
                }
            };

            $rootScope.startMining = $scope.startMining;

            $scope.stopMining = function (walletId) {
                var safe = $rootScope.getSafeById(walletId);
                if (!safe.loaded) return;
                if (safe) {
                    backend.stopPosMining(walletId, function () {
                        safe.is_mining_set_manual = true;
                    });
                }
            };

            $rootScope.stopMining = $scope.stopMining;

            $scope.syncWallet = function (walletId) {
                var safe = $rootScope.getSafeById(walletId);
                if (!safe.loaded) return;
                backend.resyncWallet(walletId, function () {
                    safe.progress = 0;
                    safe.loaded = false;
                });
            };

            $rootScope.syncWallet = $scope.syncWallet;

            function onlyVersion(str) {
                var hash = str.indexOf('(');
                if (hash !== -1) {
                    str = str.substr(0, hash);
                }
                return str.trim();
            }

            var reloadTime = 500;

            var watchMining = $rootScope.$watch(
                function () {
                    return $rootScope.settings.mining.auto_mining
                },
                function (status) {
                    if (status && $rootScope.safes && $rootScope.safes.length) {
                        for (var i = 0, len = $rootScope.safes.length; i < len; i++) {
                            if (i in $rootScope.safes) {
                                var walletId = $rootScope.safes[i].wallet_id;
                                $rootScope.startMining(walletId);
                            }
                        }
                    }
                }
            );

            var ResizeTimer;

            angular.element($window).on('resize', function () {
                if (ResizeTimer) { clearTimeout(ResizeTimer); }
                ResizeTimer = setTimeout(function () {
                    $scope.$broadcast('window_resize');
                    $scope.$apply();
                }, 250);
            });

            $rootScope.goToPage = function (url) {
                $location.path(url);
            };

            $rootScope.offersCount = 0;
            $rootScope.deletedOffers = [];
            $rootScope.editedOffers = [];

            $rootScope.isDeletedOffer = function (hash) {
                var deleted = $rootScope.deletedOffers.indexOf(hash);
                return deleted !== -1;
            };

            $rootScope.isEditedOffer = function (hash) {
                var edited = $rootScope.editedOffers.indexOf(hash);
                return edited !== -1;
            };

            $rootScope.recountOffers = function () {
                backend.getMyOffers({offset: 0, limit: 100000, offer_type_mask: 0}, function (status, data) {
                    var offers = (status && 'offers' in data) ? data.offers : [];
                    $rootScope.offersCount = offers.length;
                });
            };

            $scope.isPremiumFee = function (fee) {
                return (fee >= $filter('moneyToInt')(CONFIG.premiumFee));
            };

            $scope.isNewOffer = function (timestamp) {
                var date = new Date();
                return (date - $filter('intToDate')(timestamp) < 5 * 60 * 1000);
            };

            $scope.str2json = function (str) {
                try {
                    return angular.fromJson(str);
                } catch (error) {
                    return '';
                }
            };

            $rootScope.refreshFavoriteOffers = function() {
                var favOffersHash = angular.isDefined($rootScope.settings.system.fav_offers_hash) ? $rootScope.settings.system.fav_offers_hash : [];
                var ids = [];
                angular.forEach(favOffersHash, function(favorite){
                    ids.push({tx_id: favorite, index: 0});
                });
                var param = {
                    filter: {
                        offset: 0,
                        limit: 100000,
                        offer_type_mask: 0
                    },
                    ids: ids
                };
                backend.getFavOffers(param, function (status, data) {
                    var ids = [];
                    angular.forEach(data.offers, function (item) {
                        ids.push(item.tx_hash);
                    });
                    $rootScope.settings.system.fav_offers_hash = ids;
                });
            };

            $scope.$on('CORE_EVENT_ADD_OFFER', function (event, data) {
                var localResult = $filter('filter')($rootScope.safes, data.tx_hash);
                if (localResult.length) {
                    $rootScope.offersCount++;
                }
            });
            $scope.$on('CORE_EVENT_UPDATE_OFFER', function (event, data) {
                if ($rootScope.settings.system.fav_offers_hash.indexOf(data.id) > -1 || $rootScope.settings.system.fav_offers_hash.indexOf(data.of.tx_original_hash) > -1 || $rootScope.settings.system.fav_offers_hash.indexOf(data.of.tx_hash) > -1 ) {
                    $rootScope.refreshFavoriteOffers();
                }
            });
            $scope.$on('CORE_EVENT_REMOVE_OFFER', function (event, data) {
                var localResult = $filter('filter')($rootScope.safes, data.tx_hash);
                if (localResult.length) {
                    $rootScope.offersCount--;
                }
                if ($rootScope.settings.system.fav_offers_hash.indexOf(data.tx_original_hash) > -1 || $rootScope.settings.system.fav_offers_hash.indexOf(data.tx_hash) > -1 ) {
                    $rootScope.refreshFavoriteOffers();
                }
            });

            $rootScope.getContractsOpen = function (walletId) {
                backend.getContracts(walletId, function (status, data) {
                    if (status) {
                        if (data.hasOwnProperty('contracts')) {
                            var nowDate = $rootScope.exp_med_ts;
                            var j;
                            for (var i = 0; i < data.contracts.length; i++) {
                                data.contracts[i].wallet_id = walletId;
                                var safe = $rootScope.getSafeById(walletId);
                                var contactTransactionExist = false;
                                if (safe && angular.isDefined(safe.history)) {
                                    for (j = 0; j < safe.history.length; j++) {
                                        if (angular.isDefined(safe.history[j].contract) && safe.history[j].contract.length && safe.history[j].contract[0].contract_id === data.contracts[i].contract_id) {
                                            contactTransactionExist = true;
                                            break;
                                        }
                                    }
                                }
                                if (!contactTransactionExist && safe && angular.isDefined(safe.excluded_history)) {
                                    for (j = 0; j < safe.excluded_history.length; j++) {
                                        if (angular.isDefined(safe.excluded_history[j].contract) && safe.excluded_history[j].contract.length && safe.excluded_history[j].contract[0].contract_id === data.contracts[i].contract_id) {
                                            contactTransactionExist = true;
                                            break;
                                        }
                                    }
                                }
                                if (!contactTransactionExist) {
                                    data.contracts[i].state = 140;
                                } else if (data.contracts[i].state === 1 && data.contracts[i].expiration_time < nowDate) {
                                    data.contracts[i].state = 110;
                                } else if (data.contracts[i].state === 2 && data.contracts[i].cancel_expiration_time !== 0 && data.contracts[i].cancel_expiration_time < nowDate && data.contracts[i].height === 0) {
                                    var arr5 = $filter('filter')($rootScope.settings.viewedContracts, {state: 2, is_a: data.contracts[i].is_a, contract_id: data.contracts[i].contract_id}, true);
                                    if (!(angular.isDefined(arr5) && arr5.length)) {
                                        data.contracts[i].state = 130;
                                        data.contracts[i].isNew = true;
                                    }
                                } else if (data.contracts[i].state === 1) {
                                    var arr1 = $filter('filter')($rootScope.settings.notViewedContracts, {state: 110, is_a: data.contracts[i].is_a, contract_id: data.contracts[i].contract_id}, true);
                                    if (angular.isDefined(arr1) && arr1.length) {
                                        if (arr1[0].time === data.contracts[i].expiration_time) {
                                            data.contracts[i].state = 110;
                                        } else {
                                            for (j = 0; j < $rootScope.settings.notViewedContracts.length; j++) {
                                                if ($rootScope.settings.notViewedContracts[j].contract_id === data.contracts[i].contract_id && $rootScope.settings.notViewedContracts[j].is_a === data.contracts[i].is_a) {
                                                    $rootScope.settings.notViewedContracts.splice(j, 1);
                                                    break;
                                                }
                                            }
                                            for (j = 0; j < $rootScope.settings.viewedContracts.length; j++) {
                                                if ($rootScope.settings.viewedContracts[j].contract_id === data.contracts[i].contract_id && $rootScope.settings.viewedContracts[j].is_a === data.contracts[i].is_a) {
                                                    $rootScope.settings.viewedContracts.splice(j, 1);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                } else if (data.contracts[i].state === 2 && (data.contracts[i].height === 0 || ($rootScope.appHeight - data.contracts[i].height) < 10) ) {
                                    data.contracts[i].state = 201;
                                } else if (data.contracts[i].state === 2) {
                                    var arr2 = $filter('filter')($rootScope.settings.viewedContracts, {state: 120, is_a: data.contracts[i].is_a, contract_id: data.contracts[i].contract_id}, true);
                                    if (angular.isDefined(arr2) && arr2.length) {
                                        data.contracts[i].state = 120;
                                    }
                                } else if (data.contracts[i].state === 5) {
                                    var arr3 = $filter('filter')($rootScope.settings.notViewedContracts, {state: 130, is_a: data.contracts[i].is_a, contract_id: data.contracts[i].contract_id}, true);
                                    if (angular.isDefined(arr3) && arr3.length) {
                                        if (arr3[0].time === data.contracts[i].cancel_expiration_time) {
                                            data.contracts[i].state = 130;
                                        } else {
                                            for (j = 0; j < $rootScope.settings.notViewedContracts.length; j++) {
                                                if ($rootScope.settings.notViewedContracts[j].contract_id === data.contracts[i].contract_id && $rootScope.settings.notViewedContracts[j].is_a === data.contracts[i].is_a) {
                                                    $rootScope.settings.notViewedContracts.splice(j, 1);
                                                    break;
                                                }
                                            }
                                            for (j = 0; j < $rootScope.settings.viewedContracts.length; j++) {
                                                if ($rootScope.settings.viewedContracts[j].contract_id === data.contracts[i].contract_id && $rootScope.settings.viewedContracts[j].is_a === data.contracts[i].is_a) {
                                                    $rootScope.settings.viewedContracts.splice(j, 1);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                } else if (data.contracts[i].state === 6 && (data.contracts[i].height === 0 || ($rootScope.appHeight - data.contracts[i].height) < 10)) {
                                    data.contracts[i].state = 601;
                                }
                                var arr4 = $filter('filter')($rootScope.settings.viewedContracts, {state: data.contracts[i].state, is_a: data.contracts[i].is_a, contract_id: data.contracts[i].contract_id}, true);
                                data.contracts[i].isNew = !(angular.isDefined(arr4) && arr4.length);
                                data.contracts[i]['private_details'].a_pledge += data.contracts[i]['private_details'].to_pay;
                                data.contracts[i].alias = (data.contracts[i].is_a) ? $rootScope.getSafeAlias(data.contracts[i]['private_details'].b_addr) : $rootScope.getSafeAlias(data.contracts[i]['private_details'].a_addr);
                                $rootScope.contracts.push(data.contracts[i]);
                            }
                            $rootScope.getContractsRecount();
                        }
                    }
                });
            };

            $rootScope.viewContract = function (contract) {
                $rootScope.settings.viewedContracts = angular.isDefined($rootScope.settings.viewedContracts) ? $rootScope.settings.viewedContracts : [];
                var isContractFound = false;
                for (var j = 0; j < $rootScope.settings.viewedContracts.length; j++) {
                    if ($rootScope.settings.viewedContracts[j].contract_id === contract.contract_id && $rootScope.settings.viewedContracts[j].is_a === contract.is_a) {
                        $rootScope.settings.viewedContracts[j].state = contract.state;
                        isContractFound = true;
                        break;
                    }
                }
                if (!isContractFound) {
                    $rootScope.settings.viewedContracts.push({contract_id: contract.contract_id, is_a: contract.is_a, state: contract.state});
                }
                for (var i = 0; i < $rootScope.contracts.length; i++) {
                    if ($rootScope.contracts[i].contract_id === contract.contract_id && $rootScope.contracts[i].is_a === contract.is_a) {
                        $rootScope.contracts[i].isNew = false;
                        $rootScope.contracts[i].state = contract.state;
                        break;
                    }
                }
                $rootScope.getContractsRecount();
            };

            $rootScope.getContractsClose = function (walletId) {
                for (var i = 0; i < $rootScope.contracts.length; i++) {
                    if ($rootScope.contracts[i].wallet_id === walletId) {
                        $rootScope.contracts.splice(i, 1);
                        i--;
                    }
                }
                $rootScope.getContractsRecount();
            };

            $rootScope.getContractsRecount = function () {
                $rootScope.storeAppData();
                var newContracts = $filter('filter')($rootScope.contracts, {isNew: true}, true);
                $rootScope.newContractsCount = (newContracts.length <= 99) ? newContracts.length : 99;

                var newCustomerContracts = $filter('filter')(newContracts, {is_a: true}, true);
                var newSellerContracts = $filter('filter')(newContracts, {is_a: false}, true);
                $rootScope.newCustomerContractsCount = (newCustomerContracts.length <= 99) ? newCustomerContracts.length : 99;
                $rootScope.newSellerContractsCount = (newSellerContracts.length <= 99) ? newSellerContracts.length : 99;
            };

            var updateStateInterval = setInterval(function () {
                if (angular.isDefined($rootScope.contracts)) {
                    var haveUpdate = false;
                    for (var i = 0; i < $rootScope.contracts.length; i++) {
                        if ($rootScope.contracts[i].state === 201 && $rootScope.contracts[i].height !== 0 && ($rootScope.appHeight - $rootScope.contracts[i].height) >= 10 ) {
                            $rootScope.contracts[i].state = 2;
                            $rootScope.contracts[i].isNew = true;
                            haveUpdate = true;
                        } else if ($rootScope.contracts[i].state === 601 && $rootScope.contracts[i].height !== 0 && ($rootScope.appHeight - $rootScope.contracts[i].height) >= 10 ) {
                            $rootScope.contracts[i].state = 6;
                            $rootScope.contracts[i].isNew = true;
                            haveUpdate = true;
                        }
                    }
                    if (haveUpdate) {
                        $rootScope.getContractsRecount();
                        $scope.$digest();
                    }
                }}, 30000);

            $rootScope.$on('NEED_REFRESH_WIDGET_BACKEND_INFO', function () {
                if (angular.isDefined($rootScope.contracts)) {
                    var haveUpdate = false;
                    var nowDate = $rootScope.exp_med_ts;
                    for (var i = 0; i < $rootScope.contracts.length; i++) {
                        if ($rootScope.contracts[i].state === 1 && $rootScope.contracts[i].expiration_time <= nowDate) {
                            $rootScope.contracts[i].state = 110;
                            $rootScope.contracts[i].isNew = true;
                            haveUpdate = true;
                        } else if ($rootScope.contracts[i].state === 5 && $rootScope.contracts[i].cancel_expiration_time <= nowDate) {
                            $rootScope.contracts[i].state = 130;
                            $rootScope.contracts[i].isNew = true;
                            haveUpdate = true;
                        }
                    }
                    if (haveUpdate) {
                        $rootScope.getContractsRecount();
                    }
                }
            });

            $scope.$on('$destroy', function() {
                clearInterval(updateStateInterval);
                watchPass();
                watchMining();
            });

        }
    ]);
})();
