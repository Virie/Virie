// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function () {
    'use strict';
    var module = angular.module('app.safes', []);

    module.controller('createAliasCtrl', ['CONFIG', '$scope', '$uibModalInstance', 'backend', 'safe', '$rootScope', '$filter', 'informer',
        function (CONFIG, $scope, $uibModalInstance, backend, safe, $rootScope, $filter, informer) {

            $scope.alias = {
                name: '',
                fee: CONFIG.standardFee,
                price: 0,
                reward: '0',
                rewardOriginal: '0',
                comment: '',
                exists: false
            };
            $scope.notEnoughMoney = false;
            $scope.canRegister = false;

            $scope.appPass = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.aliasChange = function () {
                $scope.canRegister = false;
                var newAliasName = $scope.alias.name.toLowerCase().replace(/[^a-z0-9\.\-]/g, '');
                if (newAliasName.length >= 6) {
                    backend.getAliasByName(newAliasName, function (status) {
                        $scope.alias.exists = status;
                        if (!$scope.alias.exists) {
                            $scope.alias.price = 0;
                            backend.getAliasCost(newAliasName, function (statusCost, dataCost) {
                                if (statusCost) {
                                    $scope.alias.price = dataCost['cost'] + $rootScope.moneyToCoins(CONFIG.standardFee);
                                }
                                $scope.notEnoughMoney = $scope.alias.price > safe.unlocked_balance;
                                $scope.alias.reward = $rootScope.moneyParse($scope.alias.price, false);
                                $scope.alias.rewardOriginal = $rootScope.moneyParse(dataCost['cost'], false);
                                $scope.canRegister = !$scope.notEnoughMoney;
                                $scope.$digest();
                            });
                        } else {
                            $scope.notEnoughMoney = false;
                            $scope.alias.reward = '0';
                            $scope.alias.rewardOriginal = '0';
                            $scope.$digest();
                        }
                    });
                } else {
                    $scope.notEnoughMoney = false;
                    $scope.alias.reward = '0';
                    $scope.alias.rewardOriginal = '0';
                }
                $scope.alias.name = newAliasName;
            };

            $scope.confirm = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.appPass, register);
            };

            var register = function () {
                var alias = $rootScope.getSafeAlias(safe.address);
                if (alias.hasOwnProperty('name')) {
                    informer.warning('INFORMER.ONE_ALIAS');
                } else {
                    backend.registerAlias(safe.wallet_id, $scope.alias.name, safe.address, $scope.alias.fee, $scope.alias.comment, $scope.alias.rewardOriginal, function (status, data) {
                        if (status) {
                            $rootScope.unconfirmedAliases.push({tx_hash: data['tx_hash'], name: $scope.alias.name});
                            safe.wakeAlias = true;
                            informer.success('INFORMER.REQUEST_ADD_REG');
                        }
                        $uibModalInstance.close();
                    });
                }
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

        }
    ]);

    module.controller('safeChangePassCtrl', ['$scope', '$uibModalInstance', 'backend', 'safe', '$rootScope', 'informer',
        function ($scope, $uibModalInstance, backend, safe, $rootScope, informer) {

            var safeId = safe.wallet_id;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.oldPass = safe.pass;

            if (angular.isUndefined($scope.oldPass)) $scope.oldPass = '';

            $scope.safe = {
                oldPass: '',
                newPass: '',
                newPassRepeat: ''
            };

            $scope.save = function (oldPass, newPass) {
                if ((oldPass !== $scope.oldPass) || !safe.loaded || $rootScope.daemonState.daemon_network_state !== 2) return;

                backend.resetWalletPass(safe.wallet_id, newPass, function (status, result) {
                    if (angular.isDefined(result['error_code']) && result['error_code'] === 'OK') {
                        informer.success('ACCEPT.PASSWORD');

                        angular.forEach($rootScope.safes, function (item, index) {
                            if (item.wallet_id === safeId) {
                                $rootScope.safes[index].pass = newPass;
                            }
                        });
                        $uibModalInstance.close();
                        $rootScope.saveSecureData();
                    }
                });
            };

        }
    ]);

    module.controller('safeAddEditComment', ['$scope', '$uibModalInstance', 'backend', '$rootScope', 'informer', 'alias', 'CONFIG',
        function ($scope, $uibModalInstance, backend, $rootScope, informer, alias, CONFIG) {

            $scope.comment = alias.comment;
            $scope.originalComment = angular.copy($scope.comment);
            $scope.changeCommentCost = CONFIG.standardFee;

            var wallet = $rootScope.getSafeBy('address', alias.address);
            $scope.notEnoughMoney = wallet.unlocked_balance < $rootScope.moneyToCoins(CONFIG.standardFee);

            $scope.appPass = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.confirm = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.appPass, changeAliasComment);
            };

            var changeAliasComment = function () {
                var newAlias = angular.copy(alias);
                var wallet = $rootScope.getSafeBy('address', newAlias.address);

                if (wallet) {
                    newAlias.comment = $scope.comment;
                    backend.updateAlias(wallet.wallet_id, newAlias, $scope.changeCommentCost, function (status, data) {
                        if ('success' in data && data.success && status) {
                            alias.comment = newAlias.comment;
                            informer.success();
                        }
                    });
                } else {
                    informer.error();
                }

                $scope.close();
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

        }]);

    module.controller('transferAlias', ['$scope', '$uibModalInstance', '$filter', 'backend', '$rootScope', 'informer', 'alias', 'CONFIG', '$timeout',
        function ($scope, $uibModalInstance, $filter, backend, $rootScope, informer, alias, CONFIG, $timeout) {

            $scope.alias = alias;
            $scope.commission = CONFIG.standardFee;
            $scope.transferTo = '';
            $scope.transferToValid = false;
            $scope.permissionSend = false;
            $scope.transferAliasSubmitted = false;

            $scope.appPass = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            var wallet = $rootScope.getSafeBy('address', alias.address);
            $scope.notEnoughMoney = wallet.unlocked_balance >= $rootScope.moneyToCoins($scope.commission);
            $rootScope.showOnSync = true;

            $scope.changeTransfer = function () {
                backend.validateAddress($scope.transferTo, function (status) {
                    $scope.transferToValid = status;
                    $scope.$digest();
                    if (status) {
                        backend.getPoolInfo(function (statusPool, dataPool) {
                            if ('aliases_que' in dataPool && dataPool['aliases_que'].length) {
                                setStatus(!~dataPool['aliases_que'].searchBy('address', $scope.transferTo));
                            } else {
                                setStatus(status);
                            }
                        });
                    } else {
                        setStatus(false);
                    }
                });
            };

            function setStatus(statusSet) {
                $scope.permissionSend = statusSet;
                if (statusSet) {
                    backend.getAliasByAddress($scope.transferTo, function (status, data) {
                        if (status) {
                            $scope.existsAlias = {
                                name: '@' + data.alias,
                                address: data.address,
                                comment: data.comment
                            };
                            statusSet = false;
                            $scope.permissionSend = false;
                        } else {
                            $scope.existsAlias = false;
                        }
                        $scope.$digest();
                    });
                } else {
                    $scope.existsAlias = false;
                }
            }

            $scope.clearInput = function () {
                $scope.transferTo = '';
                $scope.changeTransfer();
            };

            var timer;

            $scope.confirm = function () {
                $scope.transferAliasSubmitted = true;
                $scope.timerError = false;
                timer = $timeout(function () {
                    $scope.timerError = true;
                }, 2000);
                $rootScope.checkMasterPassword($scope.needPass, $scope.appPass, sendAlias);
            };

            var sendAlias = function () {
                if (!$scope.permissionSend || $scope.transferToValid === false || $scope.notEnoughMoney === false) {
                    return;
                }
                var newAlias = angular.copy(alias);
                newAlias.address = $scope.transferTo;
                backend.updateAlias(wallet.wallet_id, newAlias, $scope.commission, function (status, data) {
                    if (status && 'success' in data && data.success) {
                        informer.info($filter('translate')('INFORMER.REQUEST_SEND_REG'));
                    }
                });
                $scope.close();
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.$on('$destroy', function () {
                if (timer) $timeout.cancel(timer);
            });

        }]);

    module.controller('safeListCtrl', ['backend', '$scope', '$rootScope', '$filter', 'sortingParamsLists', 'showHideTabs', 'payments', '$timeout',
        function (backend, $scope, $rootScope, $filter, sortingParamsLists, showHideTabs, payments, $timeout) {

            $scope.safesShowHideTabs = showHideTabs.safes;

            $scope.filter = payments.safes;

            $scope.safeSortBy = sortingParamsLists.safeList.safeSortBy;
            $scope.safeSortDir = sortingParamsLists.safeList.safeSortDir;

            $scope.order = function (row) {
                if (sortingParamsLists.safeList.safeSortBy !== row) {
                    sortingParamsLists.safeList.safeSortBy = row;
                    sortingParamsLists.safeList.safeSortDir = true;
                } else {
                    sortingParamsLists.safeList.safeSortDir = !sortingParamsLists.safeList.safeSortDir;
                }
                $scope.safeSortBy = sortingParamsLists.safeList.safeSortBy;
                $scope.safeSortDir = sortingParamsLists.safeList.safeSortDir;
                $scope.filterChange(true);
            };

            $scope.safeView = $rootScope.settings.app_interface.general.safeView || 'list';

            $scope.changeSafeView = function (view) {
                $rootScope.settings.app_interface.general.safeView = $scope.safeView = view;
                $scope.filterChange(true);
            };

            $scope.filteredSafes = [];
            var listSafes = [];

            $scope.paginator = {
                currentPage: 1,
                inPage: (angular.isDefined($scope.safesShowHideTabs.paginatorLimit) && parseInt($scope.safesShowHideTabs.paginatorLimit) > 0) ? $scope.safesShowHideTabs.paginatorLimit : 20,
                showAll: false,
                changeLimit: function (limit) {
                    $scope.safesShowHideTabs.paginatorLimit = limit;
                    $scope.paginator.inPage = limit;
                    $scope.paginator.setPage(1, true);
                }
            };

            $scope.$on('pageChanged', function () {
                $scope.filteredSafes = $scope.paginator.Limit(listSafes);
            });

            $scope.filterChange = function (goToFirstPage) {
                if (angular.isDefined($rootScope.safes)) {
                    listSafes = $rootScope.safes;

                    if ($scope.filter.name) {
                        var matchesCriteria = function (criteria) {
                            return function (item) {
                                var rez = false;
                                if (
                                    item.name.toLowerCase().indexOf(criteria.toLowerCase()) > -1 ||
                                    item.address.toLowerCase().indexOf(criteria.toLowerCase()) > -1 ||
                                    $rootScope.moneyParse(item.balance).toString().indexOf(criteria) > -1 ||
                                    $rootScope.moneyParse(item.unlocked_balance).toString().indexOf(criteria) > -1 ||
                                    (item.alias && item.alias.name && item.alias.name.indexOf(criteria) > -1)
                                ) {
                                    rez = true;
                                }
                                return rez;
                            };
                        };
                        listSafes = $filter('filter')(listSafes, matchesCriteria($scope.filter.name));
                    }

                    if ($scope.safeView === 'list') {
                        listSafes = $filter('orderBy')(listSafes, sortingParamsLists.safeList.safeSortBy, sortingParamsLists.safeList.safeSortDir);
                    }

                    if (angular.isDefined(goToFirstPage) && goToFirstPage === true) {
                        $scope.paginator.currentPage = 1;
                    }

                    if (angular.isDefined($scope.paginator.Limit)) {
                        $scope.filteredSafes = $scope.paginator.Limit(listSafes, true);
                    } else {
                        $scope.filteredSafes = $filter('limitTo')(listSafes, $scope.paginator.inPage);
                    }
                }
            };

            var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                $scope.filterChange();
            });

            var timerLoaded;
            timerLoaded = $timeout(function () {
                $scope.filterChange(true);
            }, 0);

            $scope.$on('$destroy', function () {
                removeBroadHistory();
                if (timerLoaded) $timeout.cancel(timerLoaded);
            });

        }
    ]);

    module.controller('safeDetailsCtrl', ['$routeParams', 'backend', '$scope', '$filter', '$location', 'informer', 'payments', '$uibModal', '$rootScope', 'sortingParamsLists', 'showHideTabs', 'CONFIG', '$timeout', 'txHistory',
        function ($routeParams, backend, $scope, $filter, $location, informer, payments, $uibModal, $rootScope, sortingParamsLists, showHideTabs, CONFIG, $timeout, txHistory) {

            var walletId = parseInt($routeParams['wallet_id']);

            var timeout1, timeout2;
            var futureDirection = '';

            $scope.prevSafeShow = function () {
                if (futureDirection === 'prev' || futureDirection === 'wait') return;
                if (futureDirection === 'next') {
                    futureDirection = 'wait';
                    if (timeout1) $timeout.cancel(timeout1);
                    if (timeout2) $timeout.cancel(timeout2);
                    angular.element('.safeItem').css('margin-left', '0');
                    timeout1 = $timeout(function () {
                        futureDirection = '';
                    }, 900);
                    return;
                }
                angular.element('.safeItem').css('margin-left', '103%');
                var slide = walletId;
                for (var i = 0, length = $rootScope.safes.length; i < length; i++) {
                    if (i in $rootScope.safes && $rootScope.safes[i].wallet_id === walletId) {
                        slide = (i === 0) ? $rootScope.safes[length - 1].wallet_id : $rootScope.safes[i - 1].wallet_id
                    }
                }
                futureDirection = 'prev';
                timeout2 = $timeout(function () {
                    $rootScope.goToPage('/safe/' + slide + '/prev/' + (parseInt($routeParams['slideCount']) - 1));
                }, 900);
            };

            $scope.nextSafeShow = function () {
                if (futureDirection === 'next' || futureDirection === 'wait') return;
                if (futureDirection === 'prev') {
                    futureDirection = 'wait';
                    if (timeout1) $timeout.cancel(timeout1);
                    if (timeout2) $timeout.cancel(timeout2);
                    angular.element('.safeItem').css('margin-left', '0');
                    timeout1 = $timeout(function () {
                        futureDirection = '';
                    }, 900);
                    return;
                }
                angular.element('.safeItem').css('margin-left', '-103%');
                var slide = walletId;
                for (var i = 0, length = $rootScope.safes.length; i < length; i++) {
                    if (i in $rootScope.safes && $rootScope.safes[i].wallet_id === walletId) {
                        slide = (i === length - 1) ? $rootScope.safes[0].wallet_id : $rootScope.safes[i + 1].wallet_id
                    }
                }
                futureDirection = 'next';
                timeout2 = $timeout(function () {
                    $rootScope.goToPage('/safe/' + slide + '/next/' + (parseInt($routeParams['slideCount']) - 1));
                }, 900);
            };

            $scope.goBackInSafe = function () {
                window.history.go($routeParams['slideCount']);
            };

            if ($routeParams['slide'] === 'prev') {
                futureDirection = 'wait';
                angular.element('.safeItem').css('margin-left', '-103%');
                angular.element('.safeItem').css('transition', '0s');
                $timeout(function () {
                    angular.element('.safeItem').css('transition', '1s');
                    angular.element('.safeItem').css('margin-left', '0');
                });
                $timeout(function () {
                    futureDirection = '';
                }, 1000);
            }

            if ($routeParams['slide'] === 'next') {
                futureDirection = 'wait';
                angular.element('.safeItem').css('margin-left', '103%');
                angular.element('.safeItem').css('transition', '0s');
                $timeout(function () {
                    angular.element('.safeItem').css('transition', '1s');
                    angular.element('.safeItem').css('margin-left', '0');
                });
                $timeout(function () {
                    futureDirection = '';
                }, 1000);
            }

            var originalName = '';
            $scope.$on('$routeChangeStart', function () {
                if ($scope.safe.name === '') {
                    $scope.safe.name = originalName;
                } else {
                    for (var i = 0; i < $rootScope.safes.length; i++) {
                        if ($scope.safe.name === $rootScope.safes[i].name && $scope.safe.wallet_id !== $rootScope.safes[i].wallet_id) {
                            $scope.safe.name = originalName;
                            break;
                        }
                    }
                }
                $rootScope.storeAppData();
            });

            var aliasEditCommentOpened = false;

            $scope.changeAliasComment = function (alias) {
                if (aliasEditCommentOpened) return;
                aliasEditCommentOpened = true;
                $uibModal.open({
                    animation: true,
                    backdrop: false,
                    controller: 'safeAddEditComment',
                    templateUrl: 'views/aliasEditComment.html',
                    windowClass: 'modal-main-wrapper modal-edit-alias-comment base-scroll light-scroll',
                    resolve: {
                        alias: function () {
                            return alias;
                        }
                    }
                }).result.then(function () {
                    aliasEditCommentOpened = false;
                }, function () {
                    aliasEditCommentOpened = false;
                });
            };

            var aliasTransferOpened = false;

            $scope.transferAlias = function (alias) {
                if (aliasTransferOpened) return;
                aliasTransferOpened = true;
                $uibModal.open({
                    animation: true,
                    backdrop: false,
                    controller: 'transferAlias',
                    templateUrl: 'views/aliasTransfer.html',
                    windowClass: 'modal-main-wrapper modal-transfer-alias base-scroll light-scroll',
                    resolve: {
                        alias: function () {
                            return alias;
                        }
                    }
                }).result.then(function () {
                    aliasTransferOpened = false;
                }, function () {
                    aliasTransferOpened = false;
                });
            };

            var safe = false;
            for (var i = 0, length = $rootScope.safes.length; i < length; i++) {
                if (i in $rootScope.safes && $rootScope.safes[i].wallet_id === walletId) safe = $rootScope.safes[i];
                originalName = safe.name;
            }

            $scope.safeAlias = safe.alias;
            if ($scope.safeAlias.hasOwnProperty('name')) {
                safe.wakeAlias = false;
            }

            $scope.$on('alias_changed', function () {
                $scope.safeAlias = $rootScope.getSafeAlias(safe.address);
                if ($scope.safeAlias.hasOwnProperty('name')) {
                    safe.wakeAlias = false;
                }
            });

            var refreshCharts = function () {
                if (safe) {
                    safe.chart_pending = 0;
                    safe.chart_sending = 0;
                    safe.percent_pending = 0;
                    safe.percent_sending = 0;
                    safe.percent_balance = 0;
                    safe.mined = 0;

                    if (safe.balance > 0) {
                        safe.percent_balance = safe.unlocked_balance * 100 / safe.balance;
                    }

                    safe.percent_balance = (safe.percent_balance > 99.99 && safe.percent_balance !== 100) ? 99.99 : safe.percent_balance;
                    safe.percent_balance = safe.percent_balance.toFixed(2);
                    safe.per_bal_text = '' + safe.percent_balance;

                    angular.forEach(safe.history, function (item) {
                        if (item.is_income && ($rootScope.appHeight - item.height < 10 || item.height === 0) && !(item.height === 0 && item.is_mining)) {
                            safe.chart_pending += item.amount;
                            safe.percent_pending = (item.height === 0) ? 0 : ($rootScope.appHeight - item.height) * 10;
                        }
                        if (!item.is_income && ($rootScope.appHeight - item.height < 10 || item.height === 0)) {
                            safe.chart_sending += item.amount + item.fee;
                            safe.percent_sending = (item.height === 0) ? 0 : ($rootScope.appHeight - item.height) * 10;
                        }
                        if (item.is_mining && item.height !== 0) {
                            safe.mined += item.amount;
                        }
                    });
                } else {
                    informer.error('SAFE.ERROR.NOT_FOUND');
                    $location.path('/safes');
                    return;
                }
                $scope.safe = safe;
                $scope.filterChange();
            };

            var watchUnlocked = $scope.$watch(
                function () {
                    return safe.unlocked_balance
                },
                function () {
                    refreshCharts();
                }
            );

            var watchBalance = $scope.$watch(
                function () {
                    return safe.balance
                },
                function () {
                    refreshCharts();
                }
            );

            var watchHeight = $scope.$watch(
                function () {
                    return $rootScope.appHeight
                },
                function () {
                    refreshCharts();
                }
            );

            var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                refreshCharts();
                $scope.filterChange();
            });

            $scope.historySortBy = sortingParamsLists.safeDetails.historySortBy;
            $scope.historySortDir = sortingParamsLists.safeDetails.historySortDir;

            $scope.order = function (row) {
                if (sortingParamsLists.safeDetails.historySortBy !== row) {
                    sortingParamsLists.safeDetails.historySortBy = row;
                    sortingParamsLists.safeDetails.safeSortDir = true;
                } else {
                    sortingParamsLists.safeDetails.historySortDir = !sortingParamsLists.safeDetails.historySortDir;
                }
                $scope.historySortBy = sortingParamsLists.safeDetails.historySortBy;
                $scope.historySortDir = sortingParamsLists.safeDetails.historySortDir;
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

            if (angular.isDefined(payments.safeHistoryFilterArr[safe.address])) {
                $scope.filter = payments.safeHistoryFilterArr[safe.address];
            } else {
                payments.safeHistoryFilterArr[safe.address] = angular.copy(payments.safeHistoryFilter);
                $scope.filter = payments.safeHistoryFilterArr[safe.address];
            }

            if (angular.isDefined(showHideTabs.safe_arr[safe.address])) {
                $scope.safeShowHideTabs = showHideTabs.safe_arr[safe.address];
            } else {
                showHideTabs.safe_arr[safe.address] = angular.copy(showHideTabs.safe);
                $scope.safeShowHideTabs = showHideTabs.safe_arr[safe.address];
            }

            $scope.filter.walletId = safe.wallet_id;

            var showedList = [];

            $scope.paginator = {
                currentPage: 1,
                inPage: 20,
                showAll: false,
                changeLimit: function (limit) {
                    $scope.paginator.inPage = limit;
                    $scope.paginator.setPage(1, true);
                }
            };

            $scope.$on('pageChanged', function () {
                $scope.filteredHistory = $scope.paginator.Limit(showedList);
            });

            $scope.filterClear = function () {
                $scope.filter = {
                    clear: false,
                    trType: 'all',
                    walletId: safe.wallet_id,
                    keywords: '',
                    interval: -1,
                    isHideMining: false,
                    dateStart: false,
                    dateEnd: false
                };
                payments.safeHistoryFilterArr[safe.address] = $scope.filter;
                $scope.filterChange(true);
            };

            $scope.historyEmpty = true;

            $scope.filterChange = function (goToFirstPage) {
                $scope.filter.clear = ($scope.filter.trType !== 'all' || $scope.filter.keywords !== '' || $scope.filter.interval !== -1 || $scope.filter.isHideMining !== false);
                var filter = $scope.filter;
                var prefilteredHistory = txHistory.safeHistory($scope.safe);

                $scope.historyEmpty = !(prefilteredHistory.length);

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
                    prefilteredHistory = $filter('filter')(prefilteredHistory, function (item) {return item.timestamp > (now - filter.interval);});
                }
                if (filter.trType !== 'all') {
                    var isIncome = (filter.trType === 'in');
                    prefilteredHistory = $filter('filter')(prefilteredHistory, {is_income: isIncome});
                }
                if (filter.keywords !== '') {
                    var criteriaMatch = function (criteria) {
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
                    prefilteredHistory = $filter('filter')(prefilteredHistory, criteriaMatch(filter.keywords));
                }
                if (filter.isHideMining !== false) {
                    if (filter.isHideMining === 'show_mining') {
                        prefilteredHistory = $filter('filter')(prefilteredHistory, {is_mining: false});
                    } else if (filter.isHideMining === 'show_only_mining') {
                        prefilteredHistory = $filter('filter')(prefilteredHistory, {is_mining: true});
                    }
                }

                if (sortingParamsLists.safeDetails.historySortBy.indexOf(',') > -1) {
                    var localArr = sortingParamsLists.safeDetails.historySortBy.split(',');
                    prefilteredHistory = $filter('orderBy')(prefilteredHistory, localArr, sortingParamsLists.safeDetails.historySortDir);
                } else {
                    prefilteredHistory = $filter('orderBy')(prefilteredHistory, sortingParamsLists.safeDetails.historySortBy, sortingParamsLists.safeDetails.historySortDir);
                }

                showedList = prefilteredHistory;

                if (angular.isDefined(goToFirstPage) && goToFirstPage === true) {
                    $scope.paginator.currentPage = 1;
                }
                $scope.filteredHistory = $scope.paginator.Limit(showedList);
            };

            $scope.createSafeBackupLocal = function () {
                var caption = $filter('translate')('SAFES.CHOOSE_FILE');
                backend.saveFileDialog(caption, CONFIG.filemask, function (status, result) {
                    if (result['error_code'] === 'OK') {
                        if (result['path'] === safe.path) {
                            informer.error($filter('translate')('SAFES.FILE_IS_EXIST'));
                        } else {
                            backend.backupWalletKeys(safe.wallet_id, result['path'], function (backupStatus) {
                                if (backupStatus) {
                                    informer.success($filter('translate')('SAFES.COPY_CREATED'));
                                }
                            });
                        }
                    }
                });
            };

            $scope.$on('$destroy', function () {
                watchUnlocked();
                watchBalance();
                watchHeight();
                removeBroadHistory();
                if (timeout1) $timeout.cancel(timeout1);
                if (timeout2) $timeout.cancel(timeout2);
                showedList = null;
            });

        }
    ]);

    module.controller('trDetailsModalCtrl', ['$scope', '$uibModalInstance', 'item', 'safeAddress',
        function ($scope, $uibModalInstance, item, safeAddress) {
            $scope.item = item;
            $scope.sender = (item.is_income) ? (item['remote_addresses'] ? item['remote_addresses'][0] : '') : safeAddress;
            $scope.recipient = (item.is_income) ? safeAddress : (item['remote_addresses'] ? item['remote_addresses'][0] : '');
            $scope.isSender = !!($scope.sender);
            $scope.isRecipient = !!($scope.recipient);
            $scope.close = function () {
                $uibModalInstance.close();
            };
        }
    ]);

    module.controller('safeModals', ['CONFIG', '$scope', 'backend', '$uibModal', '$filter',
        function (CONFIG, $scope, backend, $uibModal, $filter) {

            var safeOpenFileOpened = false;

            $scope.openFileDialog = function () {
                var caption = $filter('translate')('SAFES.CHOOSE_PATH');
                backend.openFileDialog(caption, CONFIG.filemask, function (status, result) {
                    if (status) {
                        if (typeof result !== 'undefined' && typeof result.path !== 'undefined' && result.path !== '') {
                            if (safeOpenFileOpened) return;
                            safeOpenFileOpened = true;
                            $uibModal.open({
                                backdrop: false,
                                windowClass: 'modal-main-wrapper modal-open-safe base-scroll light-scroll',
                                animation: true,
                                templateUrl: 'views/safeOpenFile.html',
                                controller: 'safeRestoreCtrl',
                                resolve: {
                                    path: function () {
                                        return result.path;
                                    }
                                }
                            }).result.then(function () {
                                safeOpenFileOpened = false;
                            }, function () {
                                safeOpenFileOpened = false;
                            });
                        }
                    }
                });
            };

            $scope.secondSection = false;

            var safeCreateNewOpened = false;

            $scope.openSafeForm = function () {
                if (safeCreateNewOpened) return;
                safeCreateNewOpened = true;
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-create-safe base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/safeCreateNew.html',
                    controller: 'safeAddCtrl'
                }).result.then(function () {
                    safeCreateNewOpened = false;
                }, function () {
                    safeCreateNewOpened = false;
                });
            };

        }
    ]);

    module.controller('safeAddCtrl', ['CONFIG', '$scope', 'backend', '$uibModalInstance', '$uibModal', '$rootScope', 'informer', '$filter',
        function (CONFIG, $scope, backend, $uibModalInstance, $uibModal, $rootScope, informer, $filter) {

            $scope.confirmedPassword = true;
            $scope.currentPage = 1;
            $scope.changePage = function (page) {
                if (page === 3) {
                    if ($scope.safe.password) {
                        $scope.confirmedPassword = false;
                    }
                }
                $scope.currentPage = page;
            };

            $scope.nameAlreadyExist = false;
            $rootScope.smartSafeAlreadySaved = false;

            $scope.checkDuplicate = function () {
                var duplicate = false;
                for (var i = 0, length = $rootScope.safes.length; i < length; i++) {
                    if (i in $rootScope.safes && $scope.safe.name === $rootScope.safes[i].name) {
                        duplicate = true;
                        break;
                    }
                }
                $scope.nameAlreadyExist = duplicate;
            };

            $scope.confirmChange = function () {
                $scope.confirmedPassword = ($scope.safe.password === $scope.safe.confirm_password);
            };

            $scope.safe = {
                name: '',
                password: '',
                repeat: '',
                confirm_password: ''
            };

            $scope.closeSafeForm = function () {
                $uibModalInstance.close();
            };

            $scope.saveSafeFile = function (safe) {
                var caption = $filter('translate')('SAFES.CHOOSE_FILE');
                backend.saveFileDialog(caption, CONFIG.filemask, function (status, result) {
                    if (status) {
                        backend.generateWallet(result.path, safe.password, function (status, data, errorCode) {
                            if (status) {
                                var walletId = data['wallet_id'];
                                var newSafe = data['wi'];
                                newSafe.wallet_id = walletId;
                                newSafe.name = safe.name;
                                newSafe.pass = safe.password;
                                newSafe.path = result['path'];
                                newSafe.confirm_password = safe.password;
                                newSafe.history = [];
                                newSafe.excluded_history = [];
                                newSafe.alias = $rootScope.getSafeAlias(newSafe.address);

                                $scope.safe.fileSaved = true;
                                $scope.generateDataWallet = data;
                                $scope.newSafe = newSafe;
                                $scope.errorExist = false;
                            } else {
                                if (errorCode && errorCode === 'ALREADY_EXISTS') {
                                    $scope.errorExist = $filter('translate')('SAFES.FILE_ALREADY_EXIST');
                                } else {
                                    $scope.errorExist = $filter('translate')('SAFES.FILE_NOT_SAVED_IN_SYSTEM');
                                }
                            }
                            $scope.$digest();
                        });
                    }
                });
            };

            $scope.safeBackup = function (safe) {
                var caption = $filter('translate')('SAFES.CHOOSE_FILE');
                backend.saveFileDialog(caption, CONFIG.filemask, function (status, result) {
                    if (result['error_code'] === 'OK') {
                        if (result['path'] === safe.path) {
                            informer.error($filter('translate')('SAFES.FILE_IS_EXIST'));
                        } else {
                            backend.backupWalletKeys(safe.wallet_id, result['path'], function (status) {
                                if (status) {
                                    informer.success($filter('translate')('SAFES.COPY_CREATED'));
                                    $scope.fileSaved = true;
                                    $scope.$digest();
                                }
                            });
                        }
                    }
                });
            };

            var startUseSafeSend = false;

            $scope.startUseSafe = function () {
                if (startUseSafeSend) return;
                startUseSafeSend = true;
                $scope.safe = $scope.newSafe;
                $rootScope.safes.unshift($scope.newSafe);
                $rootScope.getContractsOpen($scope.generateDataWallet.wallet_id);
                backend.runWallet($scope.generateDataWallet.wallet_id, function () {
                    $rootScope.reloadCounters();
                    $rootScope.recountOffers();
                    $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                    $uibModalInstance.close();
                    $rootScope.saveSecureData();
                });
            };

        }
    ]);

    module.controller('safeSmartRestoreCtrl', ['CONFIG', '$scope', 'backend', '$uibModalInstance', '$uibModal', 'path', 'safes', '$rootScope', 'informer', '$filter',
        function (CONFIG, $scope, backend, $uibModalInstance, $uibModal, path, safes, $rootScope, informer, $filter) {

            $scope.currentPage = 1;
            $scope.confirmedPassword = true;
            $scope.changePage = function (page) {
                if (page === 3 && !$scope.safe.restore_key_valid) {
                    informer.error($filter('translate')('SAFES.PHRASE_IS_FAILED'));
                    return;
                }
                if (page === 4 && $scope.safe.pass) {
                    $scope.confirmedPassword = false;
                }
                $scope.currentPage = page;
            };

            $scope.confirmChange = function () {
                if (angular.isUndefined($scope.safe.pass) && $scope.safe.pass2 === '') {
                    $scope.confirmedPassword = true;
                } else {
                    $scope.confirmedPassword = ($scope.safe.pass === $scope.safe.pass2);
                }
            };

            $scope.safe = {
                restore_key: '',
                restore_key_valid: false,
                fileSaved: false,
                path: '',
                name: ''
            };

            $scope.nameAlreadyExist = false;
            $scope.backupAlreadySaved = false;
            $rootScope.smartSafeAlreadySaved = false;

            function checkDuplicateSafeName() {
                for (var i = 0, length = $rootScope.safes.length; i < length; i++) {
                    if (i in $rootScope.safes && $scope.safe.name === $rootScope.safes[i].name) return true;
                }
                return false;
            }

            var watchSafeName = $scope.$watch(
                function () {
                    return $scope.safe.name;
                },
                function () {
                    $scope.nameAlreadyExist = checkDuplicateSafeName();
                }
            );

            var watchSafeKey = $scope.$watch(
                function () {
                    return $scope.safe.restore_key;
                },
                function () {
                    $scope.checkRestoreKey($scope.safe.restore_key);
                }
            );

            $scope.checkRestoreKey = function (key) {
                backend.isValidRestoreWalletText(key, function (status, data) {
                    $scope.safe.restore_key_valid = (data !== 'FALSE');
                    $scope.$digest();
                });
            };

            var futureSafe = false;

            $scope.saveWalletFile = function () {
                futureSafe = false;
                var caption = $filter('translate')('SAFES.CHOOSE_FILE');
                backend.saveFileDialog(caption, CONFIG.filemask, function (status, result) {
                    if (status) {
                        $scope.safe.path = result.path;
                        backend.restoreWallet($scope.safe.path, $scope.safe.pass, $scope.safe.restore_key, function (restoreStatus, restoreResult) {
                            if (restoreStatus) {
                                $scope.safe.fileSaved = true;
                                $scope.safe.wallet_id = restoreResult['wallet_id'];
                                futureSafe = restoreResult;
                                $scope.$digest();
                            } else {
                                informer.warning($filter('translate')('SAFES.NOT_CORRECT_FILE_OR_PASSWORD'));
                            }
                        });
                    }
                });
            };

            $scope.safeBackup = function () {
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

            $scope.close = function () {
                $uibModalInstance.close();
            };

            var restoreSmartSafeSend = false;

            $scope.restoreSmartSafe = function () {
                if (restoreSmartSafeSend) return;
                restoreSmartSafeSend = true;
                if (futureSafe) {
                    var exists = $rootScope.getSafeBy('address', futureSafe['wi'].address);
                    if (exists) {
                        informer.warning($filter('translate')('SAFES.WITH_ADDRESS_ALREADY_OPEN'));
                        backend.closeWallet(futureSafe['wallet_id']);
                    } else {
                        var newSafe = futureSafe['wi'];
                        newSafe.wallet_id = futureSafe['wallet_id'];
                        newSafe.name = $scope.safe.name;
                        newSafe.pass = $scope.safe.pass;
                        newSafe.history = [];
                        newSafe.excluded_history = [];
                        if (angular.isDefined(futureSafe['recent_history']) && angular.isDefined(futureSafe['recent_history'].history)) {
                            newSafe.history = $filter('filter')(futureSafe['recent_history'].history, historySplitter());
                            newSafe.excluded_history = $filter('filter')(futureSafe['recent_history'].history, historySplitter(true));
                        }
                        newSafe.alias = $rootScope.getSafeAlias(newSafe.address);
                        $rootScope.safes.unshift(newSafe);
                        $rootScope.getContractsOpen(futureSafe['wallet_id']);
                        backend.runWallet(futureSafe['wallet_id'], function () {
                            $rootScope.saveSecureData();
                            $rootScope.reloadCounters();
                            $rootScope.recountOffers();
                            $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                        });
                    }
                } else {
                    informer.warning($filter('translate')('SAFES.NOT_CORRECT_FILE_OR_PASSWORD'));
                }
                $scope.close();
            };

            $scope.$on('$destroy', function () {
                watchSafeName();
                watchSafeKey();
            });

        }
    ]);

    module.controller('safeRestoreCtrl', ['$scope', 'backend', '$uibModalInstance', '$uibModal', 'path', '$rootScope', '$filter', 'informer',
        function ($scope, backend, $uibModalInstance, $uibModal, path, $rootScope, $filter, informer) {

            $scope.currentPage = 1;

            $scope.changePage = function (page) {
                $scope.currentPage = page;
            };

            var filename;
            if (path.lastIndexOf('.') === -1) {
                filename = path.substr(path.lastIndexOf('/') + 1);
            } else {
                filename = path.substr(path.lastIndexOf('/') + 1, path.lastIndexOf('.') - 1 - path.lastIndexOf('/'));
            }
            if (filename.length > 25) {
                filename = filename.slice(0, 25);
            }

            $rootScope.settings.system.default_user_path = path.substr(0, path.lastIndexOf('/'));

            $scope.safe = {
                path: path,
                name: filename
            };

            $scope.passEmpty = false;
            backend.openWallet(path, '', true, function (status, data) {
                if (status) {
                    $scope.safe.pass = '';
                    $scope.passEmpty = true;
                    $scope.$digest();
                    backend.closeWallet(data['wallet_id']);
                }
            });

            $scope.nameAlreadyExist = checkDuplicateSafeName();

            function checkDuplicateSafeName() {
                for (var i = 0, length = $rootScope.safes.length; i < length; i++) {
                    if (i in $rootScope.safes && $scope.safe.name === $rootScope.safes[i].name) return true;
                }
                return false;
            }

            var watchSafeName = $scope.$watch(
                function () {
                    return $scope.safe.name;
                },
                function () {
                    $scope.nameAlreadyExist = checkDuplicateSafeName();
                }
            );

            $scope.$on('$destroy', function () {
                watchSafeName();
            });

            $scope.closeSafeForm = function () {
                $uibModalInstance.close();
            };

            $scope.openSafe = function (safe) {
                backend.openWallet(safe.path, safe.pass, false, function (status, data, error) {
                    if (error && error === 'FILE_NOT_FOUND') {
                        var errorTranslate = $filter('translate')('INFORMER.SAFE_FILE_NOT_FOUND1');
                        errorTranslate += ':<br>' + $scope.safe.path;
                        errorTranslate += $filter('translate')('INFORMER.SAFE_FILE_NOT_FOUND2');
                        informer.fileNotFound(errorTranslate);
                    } else {
                        if (status || error === 'FILE_RESTORED') {
                            var exists = $rootScope.getSafeBy('address', data['wi'].address);
                            if (exists) {
                                informer.error($filter('translate')('SAFES.WITH_ADDRESS_ALREADY_OPEN'));
                                backend.closeWallet(data['wallet_id']);
                            } else {
                                var newSafe = data['wi'];
                                newSafe.wallet_id = data['wallet_id'];
                                newSafe.name = safe.name;
                                newSafe.pass = safe.pass;
                                newSafe.history = [];
                                newSafe.excluded_history = [];
                                if (angular.isDefined(data['recent_history']) && angular.isDefined(data['recent_history'].history)) {
                                    newSafe.history = $filter('filter')(data['recent_history'].history, historySplitter());
                                    newSafe.excluded_history = $filter('filter')(data['recent_history'].history, historySplitter(true));
                                }
                                newSafe.alias = $rootScope.getSafeAlias(newSafe.address);
                                $uibModalInstance.close();
                                if (!(error && error === 'FILE_RESTORED')) {
                                    informer.success();
                                }
                                $rootScope.safes.unshift(newSafe);
                                if ($rootScope.safes.length === 1) {
                                    $rootScope.dashboardActiveMining = newSafe.wallet_id;
                                }
                                $rootScope.getContractsOpen(data['wallet_id']);
                                backend.runWallet(data['wallet_id'], function () {
                                    $rootScope.saveSecureData();
                                    $rootScope.reloadCounters();
                                    $rootScope.recountOffers();
                                    $rootScope.$broadcast('NEED_REFRESH_HISTORY');
                                });
                            }
                        }
                    }
                });
            };

        }
    ]);

    module.controller('smartSafeAddCtrl', ['$scope', 'backend', '$uibModalInstance', 'safe', 'informer', '$filter', '$rootScope',
        function ($scope, backend, $uibModalInstance, safe, informer, $filter, $rootScope) {

            $scope.copied = false;
            $scope.copyPhrase = function (phrase) {
                backend.setClipboard(phrase);
                $scope.copied = true;
                setTimeout(function () {
                    $scope.copied = false;
                    $scope.$digest();
                }, 1000);
            };

            $scope.printPhrase = function (phrase) {
                var html = '<!DOCTYPE html><html>';
                html += '<head><title translate>SAFE.SMART.PRINT.PHRASE</title></head>';
                html += '<body><h1>' + phrase + '</h1></body>';
                html += '</html>';
                backend.printText(html);
            };

            $scope.saveKey = function (phrase) {
                var caption = $filter('translate')('SAFES.CHOOSE_PATH');
                backend.saveFileDialog(caption, '*.txt', function (status, result) {
                    if (angular.isDefined(result) && result['path']) {
                        backend.storeFile(result['path'], phrase, function (storeStatus) {
                            if (storeStatus) {
                                informer.success($filter('translate')('COMMON.SAVE_FILE'));
                            }
                        });
                    }
                });
            };

            backend.getSmartSafeInfo(safe.wallet_id, function (status, data) {
                $scope.restoreKey = data['restore_key'].trim();
                $scope.$digest();
            });

            $scope.closeSmartSafeForm = function () {
                $uibModalInstance.close();
            };

            $scope.closeSmartSafeFormOK = function () {
                $rootScope.smartSafeAlreadySaved = true;
                $uibModalInstance.close();
            }
        }
    ]);

})();
