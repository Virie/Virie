// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function() {
    'use strict';
    var module = angular.module('app.money',[]);

    module.controller('appPassOnTransferCtrl', ['$scope', 'backend', '$uibModalInstance', 'informer', '$rootScope', 'tr', 'parentModal',
        function ($scope, backend, $uibModalInstance, informer, $rootScope, tr, parentModal) {

            $scope.tr = tr;
            $scope.tr.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.confirm = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.tr.sPassword, confirmSend);
            };

            var confirmSend = function () {
                if (!tr.is_send) {
                    tr.is_send = true;
                    backend.makeTransfer(tr, function (status) {
                        if (status) {
                            informer.success('SEND_MONEY.SUCCESS_SENT');
                        } else {
                            tr.is_send = false;
                        }
                        $scope.cancel();
                    });
                }
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                $uibModalInstance.close();
                parentModal.close();
            }

        }
    ]);

    module.controller('contactSafesCtrl', ['$scope', 'backend', '$uibModalInstance', '$rootScope', 'tr', 'parentModal', 'contact',
        function ($scope, backend, $uibModalInstance, $rootScope, tr, parentModal, contact) {

            $scope.selectedAddress = false;
            $scope.contact = contact;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.select = function () {
                if (!tr) {
                    var address = $scope.selectedAddress ? $scope.selectedAddress : false;
                    $rootScope.openSendMoneyModal(false, address);
                    $uibModalInstance.close();
                } else {
                    tr.to2 = $scope.selectedAddress;
                    $uibModalInstance.close();
                    parentModal.close();
                }
            };

            $scope.chooseAddress = function (address) {
                $scope.selectedAddress = address;
            }

        }
    ]);

    module.controller('selectContactCtrl', ['$scope', 'backend', '$uibModalInstance', 'tr', '$uibModal', '$rootScope', '$filter',
        function ($scope, backend, $uibModalInstance, tr, $uibModal, $rootScope, $filter) {

            var selectContactAddressOpened = false;

            $scope.save = function (contact) {
                if (contact.addresses.length === 1) {
                    tr.to2 = contact.addresses[0];
                    $uibModalInstance.close();
                } else {
                    if (selectContactAddressOpened) return;
                    selectContactAddressOpened = true;
                    $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-select-contact-address base-scroll light-scroll',
                        animation: true,
                        templateUrl: 'views/sendMoneySelectContactAddress.html',
                        controller: 'contactSafesCtrl',
                        resolve: {
                            parentModal: function () {
                                return $uibModalInstance;
                            },
                            tr: function () {
                                return tr;
                            },
                            contact: function () {
                                return contact;
                            }
                        }
                    }).result.then(function () {
                        selectContactAddressOpened = false;
                    }, function () {
                        selectContactAddressOpened = false;
                    });
                }
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.selectedContact = false;
            $scope.chooseContact = function (contact) {
                if (angular.equals(contact, $scope.selectedContact)) {
                    $scope.selectedContact = false;
                } else {
                    $scope.selectedContact = contact;
                }
            };

            $scope.localContactGroups = angular.copy($rootScope.settings.contact_groups);
            $scope.localContactGroups.unshift({id: 0, name: $filter('translate')('COMMON.ALL_GROUPS')});
            $scope.selectedGroup = $scope.localContactGroups[0];

            $scope.localContacts = $rootScope.settings.contacts;

            $scope.filterChange = function () {
                $scope.localContacts = $rootScope.settings.contacts;
                $scope.localContacts = $filter('filter')($scope.localContacts, function () {
                    return function (item) {
                        return (item.group_ids.indexOf($scope.selectedGroup.id) > -1 || $scope.selectedGroup.id === 0);
                    };
                }());
                $scope.localContacts = $filter('filter')($scope.localContacts, {name: $scope.keywords});
            };

        }
    ]);

    module.controller('addToExistCtrl', ['$scope', 'backend', '$uibModalInstance', 'informer', 'tr', '$rootScope', '$filter',
        function ($scope, backend, $uibModalInstance, informer, tr, $rootScope, $filter) {

            $scope.selectedContact = {};

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.save = function (contact) {
                if (contact.addresses.indexOf(tr.to) > -1) {
                    informer.warning('INFORMER.COUNT');
                } else {
                    backend.validateAddress(tr.to, function (data) {
                        if (data === true) {
                            contact.addresses.push(tr.to);
                            $uibModalInstance.close();
                        } else {
                            informer.warning('INFORMER.SAME_SAFE_WRONG_ADR');
                            $uibModalInstance.close();
                        }
                    });
                }
            };

            $scope.chooseContact = function (contact) {
                if (angular.equals(contact, $scope.selectedContact)) {
                    $scope.selectedContact = {};
                } else {
                    $scope.selectedContact = contact;
                }
            };

            $scope.localContactGroups = angular.copy($rootScope.settings.contact_groups);
            $scope.localContactGroups.unshift({id: 0, name: $filter('translate')('COMMON.ALL_GROUPS')});
            $scope.selectedGroup = $scope.localContactGroups[0];

            $scope.localContacts = $rootScope.settings.contacts;

            $scope.filterChange = function () {
                $scope.localContacts = $rootScope.settings.contacts;
                $scope.localContacts = $filter('filter')($scope.localContacts, function () {
                    return function (item) {
                        return (item.group_ids.indexOf($scope.selectedGroup.id) > -1 || $scope.selectedGroup.id === 0);
                    };
                }());
                $scope.localContacts = $filter('filter')($scope.localContacts, {name: $scope.keywords});
            };

        }
    ]);

    module.controller('sendMoneyCtrl', ['CONFIG', 'backend', '$rootScope', '$scope', '$filter', '$uibModal', 'txHistory', '$uibModalInstance', 'address', 'walletId', '$timeout',
        function (CONFIG, backend, $rootScope, $scope, $filter, $uibModal, txHistory, $uibModalInstance, address, walletId, $timeout) {

            $scope.sendMoneyForm = {};
            $scope.safesSource = 1;
            $scope.errorRecipient = true;

            var timeout;

            $scope.clearTrTo = function () {
                $scope.transaction.to = '';
                $scope.transaction.to1 = '';
                $scope.transaction.to3 = '';
                $scope.$broadcast('angucomplete-alt:clearInput', 'addressInput');
            };

            $scope.validateAddress = function (address, callback) {
                backend.validateAddress(address, function (status, data) {
                    if (status === true) {
                        $scope.transaction.payment_id_integrated = (data['payment_id']) ? data['payment_id'] : '';
                        $scope.errorRecipient = false;
                        $scope.$digest();
                        if (callback !== undefined) {
                            callback(true);
                        }
                    } else {
                        $scope.transaction.payment_id_integrated = '';
                        $scope.errorRecipient = true;
                        $scope.$digest();
                        if (callback !== undefined) {
                            callback(false);
                        }
                    }
                });
            };

            var refreshSafesList = function () {
                $scope.safesList = [];
                angular.forEach($rootScope.safes, function (safe) {
                    $scope.safesList.push({
                        name: safe.name,
                        wallet_id: safe.wallet_id,
                        unlocked_balance: safe.unlocked_balance,
                        balance: safe.balance,
                        address: safe.address
                    });
                }, true);
                $scope.safesList = $filter('orderBy')($scope.safesList, 'name');
            };

            refreshSafesList();

            $scope.transaction = {
                from: $rootScope.safes.length ? $rootScope.safes[0].wallet_id : '',
                to: (address) ? address : '',
                push_payer: true,
                is_delay: false,
                lock_time: new Date(),
                fee: CONFIG.standardFee,
                is_valid_address: false,
                is_send: false,
                to1: '',
                to3: (address) ? address : '',
                payment_id_integrated: ''
            };

            if (address) {
                $rootScope.$broadcast('angucomplete-alt:changeInput', 'addressInput', address);
                $scope.validateAddress($scope.transaction.to, function (status) {
                    if (status) {
                        $scope.alias = $rootScope.getSafeAlias($scope.transaction.to);
                    }
                });
            }

            if (angular.isDefined(walletId) && (walletId || walletId === 0)) {
                $scope.transaction.from = walletId;
            }

            $scope.txHistory = txHistory.reloadHistory();

            var selectContactOpened = false;

            $scope.selectContact = function () {
                $scope.transaction.to2 = '';
                if (selectContactOpened) return;
                selectContactOpened = true;
                $uibModal.open({
                    animation: true,
                    backdrop: false,
                    controller: 'selectContactCtrl',
                    templateUrl: 'views/sendMoneySelectContact.html',
                    windowClass: 'modal-main-wrapper modal-select-contact base-scroll light-scroll',
                    resolve: {
                        tr: function () {
                            $scope.changeSafeItems(1);
                            return $scope.transaction;
                        }
                    }
                }).result.then(function () {
                    selectContactOpened = false;
                }, function () {
                    selectContactOpened = false;
                });
            };

            var addToExistContactOpened = false;

            $scope.addToExist = function () {
                if (addToExistContactOpened) return;
                addToExistContactOpened = true;
                $uibModal.open({
                    animation: true,
                    backdrop: false,
                    controller: 'addToExistCtrl',
                    templateUrl: 'views/safeAddToExistContact.html',
                    windowClass: 'modal-main-wrapper modal-select-contact base-scroll light-scroll',
                    resolve: {
                        tr: function () {
                            return $scope.transaction;
                        }
                    }
                }).result.then(function () {
                    addToExistContactOpened = false;
                }, function () {
                    addToExistContactOpened = false;
                });
            };

            var watchTr = $scope.$watch(
                function () {
                    return $scope.transaction.to2;
                },
                function () {
                    if ($scope.transaction.to2) {
                        $scope.transaction.to3 = $scope.transaction.to2;
                        $rootScope.$broadcast('angucomplete-alt:changeInput', 'addressInput', $scope.transaction.to3);
                        $scope.setTo($scope.transaction.to2);
                    }
                }
            );

            var contactCreateNewOpened = false;

            $scope.addNewContact = function () {
                if (contactCreateNewOpened) return;
                contactCreateNewOpened = true;
                $uibModal.open({
                    animation: true,
                    backdrop: false,
                    controller: 'addEditContactCtrl',
                    templateUrl: 'views/contactCreateNew.html',
                    windowClass: 'modal-main-wrapper modal-new-contact base-scroll light-scroll',
                    resolve: {
                        address: function () {
                            return $scope.transaction.to;
                        }
                    }
                }).result.then(function () {
                    contactCreateNewOpened = false;
                }, function () {
                    contactCreateNewOpened = false;
                });
            };

            $scope.selectAlias = function (obj) {
                if (angular.isDefined(obj)) {
                    var alias = obj.originalObject;
                    $scope.transaction.to3 = alias.address;
                    $scope.setTo($scope.transaction.to3);
                    $scope.transaction.is_valid_address = true;
                    return alias.address;
                }
            };

            $scope.inputChanged = function (str) {
                if (str.slice(0, 1) === '@') {
                    backend.getAliasByName(str.replace('@', ''), function (status, data) {
                        if (status) {
                            $scope.transaction.to3 = data['address'];
                            $scope.transaction.is_valid_address = true;
                        } else {
                            $scope.transaction.to3 = str;
                        }
                        $scope.setTo($scope.transaction.to3);
                    });
                } else {
                    $scope.transaction.to3 = str;
                    $scope.setTo($scope.transaction.to3);
                }
            };

            $scope.calcMoneyAmount = function () {
                var safeFrom = $rootScope.getSafeById($scope.transaction.from);
                var trPrice = $rootScope.moneyToCoins(parseFloat($scope.transaction.amount)) + $rootScope.moneyToCoins(parseFloat($scope.transaction.fee));
                $scope.errorEmptySafe = (safeFrom.unlocked_balance === 0 || ($scope.transaction.amount && $scope.transaction.fee && safeFrom.unlocked_balance < trPrice));
            };

            $scope.calcMoneyFrom = function () {
                $scope.calcMoneyAmount();
                checkEqualSafes();
            };

            var checkEqualSafes = function () {
                var safeFrom = $rootScope.getSafeById($scope.transaction.from);
                $scope.equalSafesError = (safeFrom && safeFrom.address === $scope.transaction.to);
            };

            if (address || (angular.isDefined(walletId) && (walletId || walletId === 0))) {
                checkEqualSafes();
            }

            var sendMoneyConfirmOpened = false;

            $scope.send = function (tr) {
                tr.push_payer = $rootScope.settings.security.is_hide_sender;
                var safeFrom = $rootScope.getSafeById(tr.from);
                var trPrice = $rootScope.moneyToCoins(parseFloat(tr.amount)) + $rootScope.moneyToCoins(parseFloat(tr.fee));
                $scope.balanceErrorSync = false;
                if (!safeFrom.loaded) {
                    $scope.balanceErrorSync = true;
                    return;
                }
                if (safeFrom.unlocked_balance === 0 || (safeFrom.unlocked_balance < trPrice)) {
                    $scope.errorEmptySafe = true;
                    return;
                }
                if (!$scope.sendMoneyForm.$valid || parseFloat(tr.amount) === 0 || parseFloat(tr.fee) < parseFloat(CONFIG.standardFee)) {
                    return;
                }
                $scope.equalSafesError = (safeFrom && safeFrom.address === $scope.transaction.to);

                $scope.validateAddress(tr.to, function (status) {
                    if (status) {
                        angular.element('.modal-send-money').addClass('modalTopClassBackground');
                        if (sendMoneyConfirmOpened) return;
                        sendMoneyConfirmOpened = true;
                        $uibModal.open({
                            animation: true,
                            backdrop: false,
                            controller: 'appPassOnTransferCtrl',
                            templateUrl: 'views/sendMoneyConfirm.html',
                            windowClass: 'modal-main-wrapper modal-confirm-transaction base-scroll light-scroll',
                            resolve: {
                                tr: function () {
                                    return tr;
                                },
                                parentModal: function () {
                                    return $uibModalInstance;
                                }
                            }
                        }).result.then(function () {
                            angular.element('.modal-send-money').removeClass('modalTopClassBackground');
                            sendMoneyConfirmOpened = false;
                        }, function () {
                            angular.element('.modal-send-money').removeClass('modalTopClassBackground');
                            sendMoneyConfirmOpened = false;
                        });
                    }
                });
            };

            $scope.changeSafeItems = function (status) {
                if (status === 0) {
                    if ($scope.safesList.length) {
                        $scope.transaction.to1 = $scope.safesList[0]['address'];
                        angular.element('#selectRecipient').selectpicker('toggle');
                    } else {
                        $scope.transaction.to1 = '';
                    }
                    $scope.setTo($scope.transaction.to1);
                } else if (status === 1) {
                    $scope.setTo($scope.transaction.to3);
                }
                if (timeout) $timeout.cancel(timeout);
                timeout = $timeout(function () {
                    $scope.safesSource = status;
                });
            };

            $scope.setTo = function (newTo) {
                $scope.validateAddress(newTo, function (status) {
                    if (status) {
                        $scope.transaction.to = newTo;
                        $scope.alias = $rootScope.getSafeAlias($scope.transaction.to);
                        checkEqualSafes();
                    } else {
                        $scope.transaction.to = '';
                        $scope.alias = false;
                        $scope.equalSafesError = false;
                    }
                    $scope.$digest();
                });
            };

            var removeBroadAlias = $scope.$on('alias_changed', function () {
                $scope.alias = $scope.transaction.to ? $rootScope.getSafeAlias($scope.transaction.to) : false;
            });

            var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                refreshSafesList();
            });

            var removeBroadSafes = $rootScope.$on('NEED_REFRESH_SAFES', function () {
                refreshSafesList();
            });

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.$on('$destroy', function () {
                removeBroadAlias();
                removeBroadHistory();
                removeBroadSafes();
                watchTr();
                if (timeout) $timeout.cancel(timeout);
            });

        }
    ]);

    module.controller('trHistoryCtrl', ['backend', '$rootScope', '$scope', '$routeParams', '$filter', 'txHistory', 'payments', '$timeout', 'sortingParamsLists', 'showHideTabs',
        function (backend, $rootScope, $scope, $routeParams, $filter, txHistory, payments, $timeout, sortingParamsLists, showHideTabs) {

            $scope.historyShowHideTabs = showHideTabs.history;

            $scope.mySafes = [];
            $scope.mySafes.push({name: $filter('translate')('SAFES.ALL'), walletId: -1});
            angular.forEach($rootScope.safes, function (safe) {
                $scope.mySafes.push({name: safe.name, walletId: safe.wallet_id});
            }, true);

            $scope.contact = false;
            $scope.loadingHistory = true;
            $scope.txHistory = [];

            var timeout;

            var init = function () {
                if (timeout) $timeout.cancel(timeout);
                timeout = $timeout(function () {
                    if ($routeParams['contact_id']) {
                        var contact = $rootScope.getContactById($routeParams['contact_id']);
                        if (contact) {
                            $scope.contact = contact;
                            $scope.txHistory = txHistory.contactHistory($scope.contact);
                        }
                    } else {
                        $scope.txHistory = txHistory.reloadHistory();
                    }
                    $scope.filterChange();
                });
            };

            init();

            var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                init();
            });

            $scope.historySortBy = sortingParamsLists.trHistory.historySortBy;
            $scope.historySortDir = sortingParamsLists.trHistory.historySortDir;

            $scope.order = function (row) {
                if (sortingParamsLists.trHistory.historySortBy !== row) {
                    sortingParamsLists.trHistory.historySortBy = row;
                    sortingParamsLists.trHistory.historySortDir = true;
                } else {
                    sortingParamsLists.trHistory.historySortDir = !sortingParamsLists.trHistory.historySortDir;
                }
                $scope.historySortBy = sortingParamsLists.trHistory.historySortBy;
                $scope.historySortDir = sortingParamsLists.trHistory.historySortDir;
                $scope.filterChange(true);
            };

            $scope.transProdValues = [
                {key: false, value: $filter('translate')('COMMON.ACTIONS.SHOW_A')},
                {key: 'show_mining', value: $filter('translate')('COMMON.ACTIONS.NOT_SHOW_A')},
                {key: 'show_only_mining', value: $filter('translate')('COMMON.ACTIONS.SHOW_ONLY_MINING')}
            ];

            $scope.intervalValues = [
                {key: -1, value: $filter('translate')('COMMON.ALL_PERIOD_LONG')},
                {key: 86400, value: $filter('translate')('COMMON.DAY')},
                {key: 604800, value: $filter('translate')('COMMON.WEEK')},
                {key: 2592000, value: $filter('translate')('COMMON.MONTH')},
                {key: 5184000, value: $filter('translate')('COMMON.TWO_MONTHS')},
                {key: -2, value: $filter('translate')('COMMON.ANOTHER_PERIOD')}
            ];

            $scope.hideCalendar = true;

            $scope.filter = payments.historyHilter;

            $scope.paginator = {
                currentPage: 1,
                inPage: (angular.isDefined($scope.historyShowHideTabs.paginatorLimit) && parseInt($scope.historyShowHideTabs.paginatorLimit) > 0) ? $scope.historyShowHideTabs.paginatorLimit : 20,
                showAll: false,
                changeLimit: function (limit) {
                    $scope.historyShowHideTabs.paginatorLimit = limit;
                    $scope.paginator.inPage = limit;
                    $scope.paginator.setPage(1, true);
                }
            };

            var showedList = [];

            $scope.$on('pageChanged', function () {
                $scope.filteredHistory = $scope.paginator.Limit(showedList);
            });

            $scope.filterClear = function () {
                $scope.filter = {
                    clear: false,
                    trType: 'all',
                    walletId: -1,
                    keywords: '',
                    interval: -1,
                    isHideServiceTx: false,
                    isHideMining: false,
                    dateStart: false,
                    dateEnd: false
                };
                payments.historyFilter = $scope.filter;
                $scope.filterChange(true);
            };

            $scope.filterChange = function (goToFirstPage) {
                $scope.loadingHistory = true;

                $scope.filter.clear = ($scope.filter.trType !== 'all' || $scope.filter.walletId !== -1 || $scope.filter.keywords !== '' || $scope.filter.interval !== -1 || $scope.filter.isHideServiceTx !== false || $scope.filter.isHideMining !== false);

                var filter = $scope.filter;
                var prefilteredHistory = $scope.txHistory;

                if (filter.walletId !== -1) {
                    prefilteredHistory = $filter('filter')(prefilteredHistory, {wallet_id: parseInt(filter.walletId)});
                }
                if (filter.interval === -2) {
                    $scope.hideCalendar = false;
                    if (filter.dateStart) {
                        var startDate = filter.dateStart.split('/');
                        var start = parseInt(new Date(parseInt(startDate[2]), parseInt(startDate[1]) - 1, parseInt(startDate[0]), 0, 0, 0).getTime() / 1000);
                        prefilteredHistory = $filter('filter')(prefilteredHistory, function (item) {return (start < item.timestamp);});
                    }
                    if (filter.dateEnd) {
                        var endDate = filter.dateEnd.split('/');
                        var end = parseInt(new Date(parseInt(endDate[2]), parseInt(endDate[1]) - 1, parseInt(endDate[0]), 23, 59, 59).getTime() / 1000);
                        prefilteredHistory = $filter('filter')(prefilteredHistory, function (item) {return (item.timestamp < end);});
                    }
                } else {
                    $scope.hideCalendar = true;
                }
                if (filter.interval > 0) {
                    var now = parseInt(new Date().getTime() / 1000);
                    prefilteredHistory = $filter('filter')(prefilteredHistory, function (item) {return (item.timestamp > (now - filter.interval));});
                }
                if (filter.isHideServiceTx === true) {
                    prefilteredHistory = $filter('filter')(prefilteredHistory, {is_service: false});
                }
                if (filter.isHideMining === 'show_mining') {
                    prefilteredHistory = $filter('filter')(prefilteredHistory, {is_mining: false});
                } else if (filter.isHideMining === 'show_only_mining') {
                    prefilteredHistory = $filter('filter')(prefilteredHistory, {is_mining: true});
                }
                if (filter.trType !== 'all') {
                    var isIncome = (filter.trType === 'in');
                    prefilteredHistory = $filter('filter')(prefilteredHistory, {is_income: isIncome});
                }
                if (filter.keywords !== '') {
                    var matchesCriteria = function (criteria) {
                        return function (item) {
                            var rez = false;
                            var sortAmount = $rootScope.moneyParse(item.sortAmount);
                            sortAmount = ((item.is_income) ? '+' : '') + sortAmount;
                            if (
                                item.comment.indexOf(criteria) > -1 ||
                                item.height.toString().indexOf(criteria) > -1 ||
                                (item['remote_addresses'] && item['remote_addresses'].join().indexOf(criteria) > -1) ||
                                item.safeAddress.indexOf(criteria) > -1 ||
                                item.safeName.indexOf(criteria) > -1 ||
                                item['tx_blob_size'].toString().indexOf(criteria) > -1 ||
                                sortAmount.indexOf(criteria) > -1 ||
                                $rootScope.moneyParse(item.sortFee).toString().indexOf(criteria) > -1 ||
                                (item.alias && item.alias.name && item.alias.name.indexOf(criteria) > -1) ||
                                item.counterparty_translated.indexOf(criteria) > -1 ||
                                item.tx_hash.indexOf(criteria) > -1
                            ) {
                                rez = true;
                            }
                            return rez;
                        };
                    };
                    prefilteredHistory = $filter('filter')(prefilteredHistory, matchesCriteria(filter.keywords));
                }

                if (sortingParamsLists.trHistory.historySortBy.indexOf(',') > -1) {
                    var localArr = sortingParamsLists.trHistory.historySortBy.split(',');
                    prefilteredHistory = $filter('orderBy')(prefilteredHistory, localArr, sortingParamsLists.trHistory.historySortDir);
                } else {
                    prefilteredHistory = $filter('orderBy')(prefilteredHistory, sortingParamsLists.trHistory.historySortBy, sortingParamsLists.trHistory.historySortDir);
                }

                showedList = prefilteredHistory;

                if (angular.isDefined(goToFirstPage) && goToFirstPage === true) {
                    $scope.paginator.currentPage = 1;
                }
                $scope.filteredHistory = $scope.paginator.Limit(showedList);

                if ($scope.loadingHistory) $scope.loadingHistory = false;
            };

            $scope.$on('$destroy', function () {
                removeBroadHistory();
                if (timeout) $timeout.cancel(timeout);
                showedList = null;
                $scope.txHistory = null;
            })

        }
    ]);

})();


