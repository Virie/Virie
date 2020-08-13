// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function () {
    'use strict';
    var module = angular.module('app.dashboard', []);

    module.controller('dashboardController', ['backend', '$scope', '$uibModal', '$rootScope', 'market', '$filter', '$timeout',
        function (backend, $scope, $uibModal, $rootScope, market, $filter, $timeout) {

            $scope.dashboardLoaded = false;

            $timeout(function () {
                $scope.dashboardLoaded = true;
            }, 300);

            $rootScope.refreshFavoriteOffers();
            $rootScope.recountOffers();

            $rootScope.$on('draggable:move', function () {
                if ($('.dragging').length && $('.drag-enter:not(.dragging)').length) {
                    var i, firstBlock, firstIndex;
                    for (i = 0; i < $rootScope.settings.widgets.length; i++) {
                        if ($rootScope.settings.widgets[i].id === $('.dragging').data('index')) {
                            firstBlock = $rootScope.settings.widgets[i];
                            firstIndex = i;
                            break;
                        }
                    }

                    var secondBlock, secondIndex;
                    for (i = 0; i < $rootScope.settings.widgets.length; i++) {
                        if ($rootScope.settings.widgets[i].id === $('.drag-enter:not(.dragging)').data('index')) {
                            secondBlock = $rootScope.settings.widgets[i];
                            secondIndex = i;
                            break;
                        }
                    }

                    if ((firstBlock.extra_width === false && secondBlock.extra_width === false) || (firstBlock.extra_width === true && secondBlock.extra_width === true)) {
                        $('.dragging').removeClass('drag-not-possible');
                    } else {
                        var totalMinWidget = 0;
                        if (firstBlock.extra_width === true && secondBlock.extra_width === false) {
                            for (i = 0; i < secondIndex; i++) {
                                if ($rootScope.settings.widgets[i].extra_width === false || angular.isUndefined($rootScope.settings.widgets[i].extra_width)) {
                                    totalMinWidget++;
                                }
                            }
                            if ((totalMinWidget % 2 === 0 && secondIndex !== $rootScope.settings.widgets.length - 1) || (totalMinWidget % 2 === 1 && secondIndex !== 0)) {
                                $('.dragging').removeClass('drag-not-possible');
                            } else {
                                $('.dragging').addClass('drag-not-possible');
                            }
                        } else {
                            for (i = 0; i < firstIndex; i++) {
                                if ($rootScope.settings.widgets[i].extra_width === false || angular.isUndefined($rootScope.settings.widgets[i].extra_width)) {
                                    totalMinWidget++;
                                }
                            }
                            if ((totalMinWidget % 2 === 0 && firstIndex !== $rootScope.settings.widgets.length - 1) || (totalMinWidget % 2 === 1 && firstIndex !== 0)) {
                                $('.dragging').removeClass('drag-not-possible');
                            } else {
                                $('.dragging').addClass('drag-not-possible');
                            }
                        }
                    }
                } else {
                    $('.dragging').removeClass('drag-not-possible');
                }
            });

            $rootScope.$on('draggable:end', function () {
                $('.dragBlock').removeClass('drag-not-possible');
            });


            $scope.onDropComplete = function (index, obj) {
                if (angular.isUndefined(obj) || obj === null) return;

                var i;
                var firstBlock = $rootScope.settings.widgets[index];
                var secondBlock = obj;

                if (angular.isUndefined(firstBlock) || $rootScope.settings.widgets.indexOf(obj) === -1) return;

                var firstIndex = index;
                var secondIndex = $rootScope.settings.widgets.indexOf(obj);

                if ((firstBlock.extra_width === false && secondBlock.extra_width === false) || (firstBlock.extra_width === true && secondBlock.extra_width === true)) {
                    $rootScope.settings.widgets[firstIndex] = secondBlock;
                    $rootScope.settings.widgets[secondIndex] = firstBlock;
                } else {
                    var totalMinWidget = 0;
                    var arrCopy = [];
                    if (firstBlock.extra_width === false && secondBlock.extra_width === true) {
                        for (i = 0; i < firstIndex; i++) {
                            if ($rootScope.settings.widgets[i].extra_width === false || angular.isUndefined($rootScope.settings.widgets[i].extra_width)) {
                                totalMinWidget++;
                            }
                        }
                        if (totalMinWidget % 2 === 0 && firstIndex !== $rootScope.settings.widgets.length - 1) {
                            if (firstIndex > secondIndex) {
                                // replace a big widget with a small one bottom left
                                arrCopy = $rootScope.settings.widgets.splice(firstIndex, 2);
                                $rootScope.settings.widgets.splice(secondIndex, 1);

                                $rootScope.settings.widgets.splice(secondIndex, 0, arrCopy[0], arrCopy[1]);
                                $rootScope.settings.widgets.splice(firstIndex + 1, 0, obj);
                            } else {
                                // replace a big widget with a small one top left
                                $rootScope.settings.widgets.splice(secondIndex, 1);
                                arrCopy = $rootScope.settings.widgets.splice(firstIndex, 2);

                                $rootScope.settings.widgets.splice(firstIndex, 0, obj);
                                $rootScope.settings.widgets.splice(secondIndex - 1, 0, arrCopy[0], arrCopy[1]);
                            }
                        }
                        if (totalMinWidget % 2 === 1 && firstIndex !== 0) {
                            if (firstIndex > secondIndex) {
                                // replace a big widget with a small one bottom right
                                arrCopy = $rootScope.settings.widgets.splice(firstIndex - 1, 2);
                                $rootScope.settings.widgets.splice(secondIndex, 1);

                                $rootScope.settings.widgets.splice(secondIndex, 0, arrCopy[0], arrCopy[1]);
                                $rootScope.settings.widgets.splice(firstIndex, 0, obj);
                            } else {
                                // replace a big widget with a small one top right
                                $rootScope.settings.widgets.splice(secondIndex, 1);
                                arrCopy = $rootScope.settings.widgets.splice(firstIndex - 1, 2);

                                $rootScope.settings.widgets.splice(firstIndex - 1, 0, obj);
                                $rootScope.settings.widgets.splice(secondIndex - 1, 0, arrCopy[0], arrCopy[1]);
                            }
                        }
                    } else {
                        for (i = 0; i < secondIndex; i++) {
                            if ($rootScope.settings.widgets[i].extra_width === false || angular.isUndefined($rootScope.settings.widgets[i].extra_width)) {
                                totalMinWidget++;
                            }
                        }
                        if (totalMinWidget % 2 === 0 && secondIndex !== $rootScope.settings.widgets.length - 1) {
                            if (secondIndex > firstIndex) {
                                // replace a small widget from left with a big one bottom
                                arrCopy = $rootScope.settings.widgets.splice(secondIndex, 2);
                                $rootScope.settings.widgets.splice(firstIndex, 1);

                                $rootScope.settings.widgets.splice(firstIndex, 0, arrCopy[0], arrCopy[1]);
                                $rootScope.settings.widgets.splice(secondIndex + 1, 0, firstBlock);
                            } else {
                                // replace a small widget from left with a big one top
                                $rootScope.settings.widgets.splice(firstIndex, 1);
                                arrCopy = $rootScope.settings.widgets.splice(secondIndex, 2);

                                $rootScope.settings.widgets.splice(secondIndex, 0, firstBlock);
                                $rootScope.settings.widgets.splice(firstIndex - 1, 0, arrCopy[0], arrCopy[1]);
                            }
                        }
                        if (totalMinWidget % 2 === 1 && secondIndex !== 0) {
                            if (secondIndex > firstIndex) {
                                // replace a small widget from right with a big one bottom
                                arrCopy = $rootScope.settings.widgets.splice(secondIndex - 1, 2);
                                $rootScope.settings.widgets.splice(firstIndex, 1);

                                $rootScope.settings.widgets.splice(firstIndex, 0, arrCopy[0], arrCopy[1]);
                                $rootScope.settings.widgets.splice(secondIndex, 0, firstBlock);
                            } else {
                                // replacea  small widget from right with a big one top
                                $rootScope.settings.widgets.splice(firstIndex, 1);
                                arrCopy = $rootScope.settings.widgets.splice(secondIndex - 1, 2);

                                $rootScope.settings.widgets.splice(secondIndex - 1, 0, firstBlock);
                                $rootScope.settings.widgets.splice(firstIndex - 1, 0, arrCopy[0], arrCopy[1]);
                            }
                        }
                    }
                }
            };

            if (angular.isUndefined($rootScope.settings.widgets)) $rootScope.settings.widgets = [];

            var widgetReOrder = function () {
                var i = 0;
                while (i < $rootScope.settings.widgets.length) {
                    if (!$rootScope.settings.widgets[i].extra_width && i + 1 < $rootScope.settings.widgets.length) {
                        if (!$rootScope.settings.widgets[i + 1].extra_width) {
                            i = i + 2
                        } else {
                            var obj = $rootScope.settings.widgets[i];
                            $rootScope.settings.widgets.splice(i, 1);
                            $rootScope.settings.widgets.splice(i + 1, 0, obj);
                            i++;
                        }
                    } else {
                        i++;
                    }
                }
            };

            var getRandomInt = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            };

            $scope.addWidget = function (type) {
                var widgetNumber = $rootScope.settings.widgets.length + '_' + getRandomInt(0, 1000000);
                var widget = {
                    id: widgetNumber,
                    type: type,
                    name: $scope.widgets[type].name,
                    extra_width: $scope.widgets[type].extra_width
                };
                $scope.widgets[type].exists = true;
                $rootScope.settings.widgets.push(widget);
                $rootScope.storeAppData();
                widgetReOrder();
            };

            $scope.removeWidget = function (id) {
                for (var i = 0; i < $rootScope.settings.widgets.length; i++) {
                    if ($rootScope.settings.widgets[i].id === id) {
                        $scope.widgets[$rootScope.settings.widgets[i].type].exists = false;
                        $rootScope.settings.widgets.splice(i, 1);
                        $rootScope.storeAppData();
                        break;
                    }
                }
                widgetReOrder();
            };

            $scope.changeWidget = function (id, type) {
                for (var i = 0; i < $rootScope.settings.widgets.length; i++) {
                    if ($rootScope.settings.widgets[i].id === id) {
                        $scope.widgets[$rootScope.settings.widgets[i].type].exists = false;
                        $scope.widgets[type].exists = true;
                        $rootScope.settings.widgets[i] = {
                            id: id,
                            type: type,
                            name: $scope.widgets[type].name,
                            extra_width: $scope.widgets[type].extra_width
                        };
                        $rootScope.storeAppData();
                        break;
                    }
                }
                widgetReOrder();
            };

            $scope.widgets = {
                'ingoingPayments': {
                    name: 'WIDGETS.INCOME',
                    extra_width: false,
                    exists: false
                },
                'outgoingPayments': {
                    name: 'WIDGETS.OUTGOING',
                    extra_width: false,
                    exists: false
                },
                'activeMining': {
                    name: 'WIDGETS.ACTIVE_MINING',
                    extra_width: true,
                    exists: false
                },
                'currencyOut': {
                    name: 'WIDGETS.DEMAND_CURRENCY',
                    extra_width: true,
                    exists: false
                },
                'currencyIn': {
                    name: 'WIDGETS.PROPOSAL_CURRENCY',
                    extra_width: true,
                    exists: false
                },
                'goodsOut': {
                    name: 'WIDGETS.DEMAND_GOODS',
                    extra_width: true,
                    exists: false
                },
                'goodsIn': {
                    name: 'WIDGETS.PROPOSAL_GOODS',
                    extra_width: true,
                    exists: false
                },
                'currencyFavorite': {
                    name: 'WIDGETS.FAVORITE.CURRENCY',
                    extra_width: true,
                    exists: false
                },
                'goodsFavorite': {
                    name: 'WIDGETS.FAVORITE.GOODS',
                    extra_width: true,
                    exists: false
                },
                'lastContacts': {
                    name: 'WIDGETS.RECENT_CONTACTS',
                    extra_width: false,
                    exists: false
                },
                'backendInfo': {
                    name: 'WIDGETS.NET_INFO',
                    extra_width: false,
                    exists: false
                }
            };

            for (var j = $rootScope.settings.widgets.length - 1; j >= 0; j--) {
                if (angular.isUndefined($scope.widgets[$rootScope.settings.widgets[j].type])) {
                    $rootScope.settings.widgets.splice(j, 1);
                }
            }

            for (var i = 0; i < $rootScope.settings.widgets.length; i++) {
                if (angular.isDefined($scope.widgets[$rootScope.settings.widgets[i].type])) {
                    $rootScope.settings.widgets[i].name = $scope.widgets[$rootScope.settings.widgets[i].type].name;
                    $scope.widgets[$rootScope.settings.widgets[i].type].exists = true;
                }
            }

            $scope.isFavorite = function (hash) {
                return $rootScope.settings.system.fav_offers_hash.indexOf(hash) > -1;
            };

            var deleteFavoriteOpened = false;

            function deleteFavorite(index, table) {
                if (deleteFavoriteOpened) return;
                deleteFavoriteOpened = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-disable-safe base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/marketDeleteFavorite.html',
                    controller: function ($scope, $rootScope, $uibModalInstance) {
                        $scope.delete = function () {
                            $rootScope.settings.system.fav_offers_hash.splice(index, 1);
                            $rootScope.storeAppData();
                            if (table === 'goods') {
                                $rootScope.$broadcast('fav_goods_changed');
                            }
                            if (table === 'currency') {
                                $rootScope.$broadcast('fav_currency_changed');
                            }
                            $scope.close();
                        };

                        $scope.close = function () {
                            $uibModalInstance.close();
                        };
                    }
                }).result.then(function () {
                    deleteFavoriteOpened = false;
                }, function () {
                    deleteFavoriteOpened = false;
                });
            }

            $scope.toggleFavorite = function (hash, table) {
                var index = $rootScope.settings.system.fav_offers_hash.indexOf(hash);
                if (index > -1) {
                    deleteFavorite(index, table);
                } else {
                    $rootScope.settings.system.fav_offers_hash.push(hash);
                    $rootScope.storeAppData();
                    if (table === 'goods') {
                        $rootScope.$broadcast('fav_goods_changed');
                    }
                    if (table === 'currency') {
                        $rootScope.$broadcast('fav_currency_changed');
                    }
                }
            };

            $scope.returnOffers = function (params, callback) {
                backend.getOffers(params, function (status, data) {
                    if (typeof callback === 'function') callback((status && 'offers' in data) ? data.offers : []);
                });
            };

            $scope.paymentTypes = market.paymentTypes;
            $scope.deliveryWays = market.deliveryWays;
            $scope.dealDetails = market.dealDetails;
            $scope.currencies = market.currencies;
            $scope.currenciesGoods = angular.copy(market.currencies);
            $scope.currenciesGoods.push({
                code: $rootScope.currencySymbol,
                title: $filter('translate')('CURRENCY.MONEY')
            });
            $scope.contacts = market.contacts;
        }
    ]);

    module.controller('outgoingPaymentsController', ['$scope', '$rootScope', '$filter', 'txHistory', 'sortingParamsLists', '$timeout',
        function ($scope, $rootScope, $filter, txHistory, sortingParamsLists, $timeout) {

            var timerInit;
            var history = [];
            $scope.filter = sortingParamsLists.index;

            $scope.orderChange = function (orderBy) {
                if ($scope.filter.historyOutSortBy === orderBy) {
                    $scope.filter.historyOutSortDir = !$scope.filter.historyOutSortDir;
                } else {
                    $scope.filter.historyOutSortBy = orderBy;
                    $scope.filter.historyOutSortDir = true;
                }
                historyFilter();
            };

            function historyFilter() {
                if (angular.isDefined(history) && history.length) {
                    var historyOut = angular.copy(history);
                    for (var i = 0; i < historyOut.length; i++) {
                        if (historyOut[i]['tx_type'] === 4) {
                            historyOut[i].amount = 0;
                        }
                    }
                    historyOut = $filter('orderBy')(historyOut, $scope.filter.historyOutSortBy, $scope.filter.historyOutSortDir);
                    $scope.historyOut = $filter('limitTo')(historyOut, 15);
                    commentFilter();
                } else {
                    $scope.historyOut = [];
                }
            }

            var init = function () {
                if (timerInit) $timeout.cancel(timerInit);
                timerInit = $timeout(function () {
                    history = txHistory.reloadHistory();
                    history = $filter('filter')(history, {is_income: false});
                    historyFilter();
                });
            };

            init();

            var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                init();
            });

            $scope.showCommentFieldOut = true;
            var commentFilter = function () {
                $scope.showCommentFieldOut = true;
                for (var i = 0; i < $scope.historyOut.length; i++) {
                    if ($scope.historyOut[i].comment && $scope.historyOut[i].comment !== ' ') {
                        $scope.showCommentFieldOut = false;
                        break;
                    }
                }
            };

            $scope.$on('$destroy', function () {
                if (timerInit) $timeout.cancel(timerInit);
                removeBroadHistory();
            });

        }
    ]);

    module.controller('ingoingPaymentsController', ['$scope', '$rootScope', '$filter', 'txHistory', 'sortingParamsLists', '$timeout',
        function ($scope, $rootScope, $filter, txHistory, sortingParamsLists, $timeout) {

            var timerInit;
            var history = [];
            $scope.filter = sortingParamsLists.index;

            $scope.orderChange = function (orderBy) {
                if ($scope.filter.historyInSortBy === orderBy) {
                    $scope.filter.historyInSortDir = !$scope.filter.historyInSortDir;
                } else {
                    $scope.filter.historyInSortBy = orderBy;
                    $scope.filter.historyInSortDir = true;
                }
                historyFilter();
            };

            function historyFilter() {
                if (angular.isDefined(history) && history.length) {
                    var historyIn = $filter('orderBy')(history, $scope.filter.historyInSortBy, $scope.filter.historyInSortDir);
                    $scope.historyIn = $filter('limitTo')(historyIn, 15);
                    commentFilter();
                } else {
                    $scope.historyIn = [];
                }
            }

            var init = function () {
                if (timerInit) $timeout.cancel(timerInit);
                timerInit = $timeout(function () {
                    history = txHistory.reloadHistory();
                    history = $filter('filter')(history, {is_income: true});
                    historyFilter();
                });
            };

            init();

            var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                init();
            });

            $scope.showCommentFieldIn = true;
            var commentFilter = function () {
                $scope.showCommentFieldIn = true;
                for (var i = 0; i < $scope.historyIn.length; i++) {
                    if ($scope.historyIn[i].comment && $scope.historyIn[i].comment !== ' ') {
                        $scope.showCommentFieldIn = false;
                        break;
                    }
                }
            };

            $scope.$on('$destroy', function () {
                if (timerInit) $timeout.cancel(timerInit);
                removeBroadHistory();
            });

        }
    ]);

    module.controller('goodsOutController', ['$scope', 'sortingParamsLists', '$timeout', '$filter',
        function ($scope, sortingParamsLists, $timeout, $filter) {

            $scope.filter = sortingParamsLists.index;
            $scope.orderChange = function (orderBy) {
                if ($scope.filter.goodsOutSortBy === orderBy) {
                    $scope.filter.goodsOutSortDir = !$scope.filter.goodsOutSortDir;
                } else {
                    $scope.filter.goodsOutSortBy = orderBy;
                    $scope.filter.goodsOutSortDir = true;
                }
                params.order_by = $scope.filter.goodsOutSortBy;
                params.reverse = $scope.filter.goodsOutSortDir;
                $scope.returnOffers(params, function (offers) {
                    loadOffers(offers);
                });
            };
            $scope.offers = [];
            $scope.loadingMarket = true;
            var params = {
                order_by: 0,
                reverse: true,
                offset: 0,
                limit: 15,
                offer_type_mask: 1
            };

            function loadOffers(offers) {
                $scope.offers = offers;
                angular.forEach($scope.offers, function (offer) {
                    var newContacts = [];
                    var oldContacts;
                    try {
                        oldContacts = angular.fromJson(offer.cnt);
                    } catch (err) {
                        oldContacts = [];
                    }
                    angular.forEach(oldContacts, function (contact) {
                        for (var type in contact) {
                            if (!contact.hasOwnProperty(type)) continue;
                            if (type.toLowerCase() === 'phone') {
                                newContacts.push({
                                    type: $filter('translate')('MARKET.PHONE.TEXT') + ': ',
                                    text: contact[type]
                                });
                            } else if (type.toLowerCase() === 'email') {
                                newContacts.push({
                                    type: $filter('translate')('MARKET.EMAIL.TEXT') + ': ',
                                    text: contact[type]
                                });
                            } else {
                                newContacts.push({type: type + ': ', text: contact[type]});
                            }
                        }
                    });
                    offer.normal_contacts = newContacts;
                });
                $scope.loadingMarket = false;
                $scope.$digest();
            }

            var watchTimer;

            $scope.returnOffers(params, function (offers) {
                loadOffers(offers);
            });
            $scope.$on('CORE_EVENT_ADD_OFFER', function (event, data) {
                if (data.ot === 0) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });
            $scope.$on('CORE_EVENT_UPDATE_OFFER', function (event, data) {
                if (data.of.ot === 0) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });
            $scope.$on('CORE_EVENT_REMOVE_OFFER', function (event, data) {
                if (data.ot === 0) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });

            $scope.$on('$destroy', function () {
                if (watchTimer) $timeout.cancel(watchTimer);
            });

        }
    ]);

    module.controller('goodsInController', ['$scope', 'sortingParamsLists', '$timeout', '$filter',
        function ($scope, sortingParamsLists, $timeout, $filter) {

            $scope.filter = sortingParamsLists.index;
            $scope.orderChange = function (orderBy) {
                if ($scope.filter.goodsInSortBy === orderBy) {
                    $scope.filter.goodsInSortDir = !$scope.filter.goodsInSortDir;
                } else {
                    $scope.filter.goodsInSortBy = orderBy;
                    $scope.filter.goodsInSortDir = true;
                }
                params.order_by = $scope.filter.goodsInSortBy;
                params.reverse = $scope.filter.goodsInSortDir;
                $scope.returnOffers(params, function (offers) {
                    loadOffers(offers);
                });
            };

            $scope.offers = [];
            $scope.loadingMarket = true;
            var params = {
                order_by: 0,
                reverse: true,
                offset: 0,
                limit: 15,
                offer_type_mask: 2
            };

            function loadOffers(offers) {
                $scope.offers = offers;
                angular.forEach($scope.offers, function (offer) {
                    var newContacts = [];
                    var oldContacts;
                    try {
                        oldContacts = angular.fromJson(offer.cnt);
                    } catch (err) {
                        oldContacts = [];
                    }
                    angular.forEach(oldContacts, function (contact) {
                        for (var type in contact) {
                            if (!contact.hasOwnProperty(type)) continue;
                            if (type.toLowerCase() === 'phone') {
                                newContacts.push({
                                    type: $filter('translate')('MARKET.PHONE.TEXT') + ': ',
                                    text: contact[type]
                                });
                            } else if (type.toLowerCase() === 'email') {
                                newContacts.push({
                                    type: $filter('translate')('MARKET.EMAIL.TEXT') + ': ',
                                    text: contact[type]
                                });
                            } else {
                                newContacts.push({type: type + ': ', text: contact[type]});
                            }
                        }
                    });
                    offer.normal_contacts = newContacts;
                });
                $scope.loadingMarket = false;
                $scope.$digest();
            }

            var watchTimer;

            $scope.returnOffers(params, function (offers) {
                loadOffers(offers);
            });
            $scope.$on('CORE_EVENT_ADD_OFFER', function (event, data) {
                if (data.ot === 1) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });
            $scope.$on('CORE_EVENT_UPDATE_OFFER', function (event, data) {
                if (data.of.ot === 1) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });
            $scope.$on('CORE_EVENT_REMOVE_OFFER', function (event, data) {
                if (data.ot === 1) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });

            $scope.$on('$destroy', function () {
                if (watchTimer) $timeout.cancel(watchTimer);
            });

        }
    ]);

    module.controller('currencyOutController', ['$scope', 'sortingParamsLists', '$timeout', '$filter',
        function ($scope, sortingParamsLists, $timeout, $filter) {

            $scope.filter = sortingParamsLists.index;
            $scope.orderChange = function (orderBy) {
                if ($scope.filter.currencyOutSortBy === orderBy) {
                    $scope.filter.currencyOutSortDir = !$scope.filter.currencyOutSortDir;
                } else {
                    $scope.filter.currencyOutSortBy = orderBy;
                    $scope.filter.currencyOutSortDir = true;
                }
                params.order_by = $scope.filter.currencyOutSortBy;
                params.reverse = $scope.filter.currencyOutSortDir;
                $scope.returnOffers(params, function (offers) {
                    loadOffers(offers);
                });
            };
            $scope.offers = [];
            $scope.loadingMarket = true;
            var params = {
                order_by: 0,
                reverse: true,
                offset: 0,
                limit: 15,
                offer_type_mask: 4
            };

            function loadOffers(offers) {
                $scope.offers = offers;
                angular.forEach($scope.offers, function (offer) {
                    var newContacts = [];
                    var oldContacts;
                    try {
                        oldContacts = angular.fromJson(offer.cnt);
                    } catch (err) {
                        oldContacts = [];
                    }
                    angular.forEach(oldContacts, function (contact) {
                        for (var type in contact) {
                            if (!contact.hasOwnProperty(type)) continue;
                            if (type.toLowerCase() === 'phone') {
                                newContacts.push({
                                    type: $filter('translate')('MARKET.PHONE.TEXT') + ': ',
                                    text: contact[type]
                                });
                            } else if (type.toLowerCase() === 'email') {
                                newContacts.push({
                                    type: $filter('translate')('MARKET.EMAIL.TEXT') + ': ',
                                    text: contact[type]
                                });
                            } else {
                                newContacts.push({type: type + ': ', text: contact[type]});
                            }
                        }
                    });
                    offer.normal_contacts = newContacts;
                });
                $scope.loadingMarket = false;
                $scope.$digest();
            }

            var watchTimer;

            $scope.returnOffers(params, function (offers) {
                loadOffers(offers);
            });
            $scope.$on('CORE_EVENT_ADD_OFFER', function (event, data) {
                if (data.ot === 2) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });
            $scope.$on('CORE_EVENT_UPDATE_OFFER', function (event, data) {
                if (data.of.ot === 2) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });
            $scope.$on('CORE_EVENT_REMOVE_OFFER', function (event, data) {
                if (data.ot === 2) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });

            $scope.$on('$destroy', function () {
                if (watchTimer) $timeout.cancel(watchTimer);
            });

        }
    ]);

    module.controller('currencyInController', ['$scope', 'sortingParamsLists', '$timeout', '$filter',
        function ($scope, sortingParamsLists, $timeout, $filter) {

            $scope.filter = sortingParamsLists.index;
            $scope.orderChange = function (orderBy) {
                if ($scope.filter.currencyInSortBy === orderBy) {
                    $scope.filter.currencyInSortDir = !$scope.filter.currencyInSortDir;
                } else {
                    $scope.filter.currencyInSortBy = orderBy;
                    $scope.filter.currencyInSortDir = true;
                }
                params.order_by = $scope.filter.currencyInSortBy;
                params.reverse = $scope.filter.currencyInSortDir;
                $scope.returnOffers(params, function (offers) {
                    loadOffers(offers);
                });
            };
            $scope.offers = [];
            $scope.loadingMarket = true;
            var params = {
                order_by: 0,
                reverse: true,
                offset: 0,
                limit: 15,
                offer_type_mask: 8
            };

            function loadOffers(offers) {
                $scope.offers = offers;
                angular.forEach($scope.offers, function (offer) {
                    var newContacts = [];
                    var oldContacts;
                    try {
                        oldContacts = angular.fromJson(offer.cnt);
                    } catch (err) {
                        oldContacts = [];
                    }
                    angular.forEach(oldContacts, function (contact) {
                        for (var type in contact) {
                            if (!contact.hasOwnProperty(type)) continue;
                            if (type.toLowerCase() === 'phone') {
                                newContacts.push({
                                    type: $filter('translate')('MARKET.PHONE.TEXT') + ': ',
                                    text: contact[type]
                                });
                            } else if (type.toLowerCase() === 'email') {
                                newContacts.push({
                                    type: $filter('translate')('MARKET.EMAIL.TEXT') + ': ',
                                    text: contact[type]
                                });
                            } else {
                                newContacts.push({type: type + ': ', text: contact[type]});
                            }
                        }
                    });
                    offer.normal_contacts = newContacts;
                });
                $scope.loadingMarket = false;
                $scope.$digest();
            }

            var watchTimer;

            $scope.returnOffers(params, function (offers) {
                loadOffers(offers);
            });
            $scope.$on('CORE_EVENT_ADD_OFFER', function (event, data) {
                if (data.ot === 3) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });
            $scope.$on('CORE_EVENT_UPDATE_OFFER', function (event, data) {
                if (data.of.ot === 3) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });
            $scope.$on('CORE_EVENT_REMOVE_OFFER', function (event, data) {
                if (data.ot === 3) {
                    if (watchTimer) $timeout.cancel(watchTimer);
                    watchTimer = $timeout(function () {
                        $scope.returnOffers(params, function (offers) {
                            loadOffers(offers);
                        });
                    }, 100);
                }
            });

            $scope.$on('$destroy', function () {
                if (watchTimer) $timeout.cancel(watchTimer);
            });

        }
    ]);

    module.controller('goodsFavoriteController', ['$scope', '$rootScope', 'backend', '$filter', 'sortingParamsLists',
        function ($scope, $rootScope, backend, $filter, sortingParamsLists) {

            $scope.filter = sortingParamsLists.index;
            $scope.orderChange = function (orderBy) {
                if ($scope.filter.goodsFavSortBy == orderBy) {
                    $scope.filter.goodsFavSortDir = !$scope.filter.goodsFavSortDir;
                } else {
                    $scope.filter.goodsFavSortBy = orderBy;
                    $scope.filter.goodsFavSortDir = true;
                }
                getFavorites();
            };

            function getFavorites() {
                var ids = [];
                $scope.loadingMarket = true;
                var favOffersHash = angular.isDefined($rootScope.settings.system.fav_offers_hash) ? $rootScope.settings.system.fav_offers_hash : [];
                angular.forEach(favOffersHash, function (fav) {
                    ids.push({tx_id: fav, index: 0});
                });
                var filter = {
                    order_by: $scope.filter.goodsFavSortBy,
                    reverse: $scope.filter.goodsFavSortDir,
                    offset: 0,
                    limit: 15,
                    offer_type_mask: 3
                };
                var params = {ids: ids, filter: filter};
                backend.getFavOffers(params, function (status, data) {
                    $scope.offers = [];
                    $scope.offers = ('offers' in data) ? data.offers : [];
                    angular.forEach($scope.offers, function (offer) {
                        var newContacts = [];
                        var oldContacts;
                        try {
                            oldContacts = angular.fromJson(offer.cnt);
                        } catch (err) {
                            oldContacts = [];
                        }
                        angular.forEach(oldContacts, function (contact) {
                            for (var type in contact) {
                                if (!contact.hasOwnProperty(type)) continue;
                                if (type.toLowerCase() === 'phone') {
                                    newContacts.push({
                                        type: $filter('translate')('MARKET.PHONE.TEXT') + ': ',
                                        text: contact[type]
                                    });
                                } else if (type.toLowerCase() === 'email') {
                                    newContacts.push({
                                        type: $filter('translate')('MARKET.EMAIL.TEXT') + ': ',
                                        text: contact[type]
                                    });
                                } else {
                                    newContacts.push({type: type + ': ', text: contact[type]});
                                }
                            }
                        });
                        offer.normal_contacts = newContacts;
                    });
                    $scope.loadingMarket = false;
                    $scope.$digest();
                });
            }

            getFavorites();

            $rootScope.$on('fav_goods_changed', function () {
                getFavorites();
            });

        }
    ]);

    module.controller('currencyFavoriteController', ['$scope', '$rootScope', 'backend', '$filter', 'sortingParamsLists',
        function ($scope, $rootScope, backend, $filter, sortingParamsLists) {

            $scope.filter = sortingParamsLists.index;
            $scope.orderChange = function (orderBy) {
                if ($scope.filter.currencyFavSortBy === orderBy) {
                    $scope.filter.currencyFavSortDir = !$scope.filter.currencyFavSortDir;
                } else {
                    $scope.filter.currencyFavSortBy = orderBy;
                    $scope.filter.currencyFavSortDir = true;
                }
                getFavorites();
            };

            function getFavorites() {
                var ids = [];
                $scope.loadingMarket = true;
                var favOffersHash = angular.isDefined($rootScope.settings.system.fav_offers_hash) ? $rootScope.settings.system.fav_offers_hash : [];
                angular.forEach(favOffersHash, function (fav) {
                    ids.push({tx_id: fav, index: 0});
                });
                var filter = {
                    order_by: $scope.filter.currencyFavSortBy,
                    reverse: $scope.filter.currencyFavSortDir,
                    offset: 0,
                    limit: 15,
                    offer_type_mask: 12
                };
                var params = {ids: ids, filter: filter};
                backend.getFavOffers(params, function (status, data) {
                    $scope.offers = [];
                    $scope.offers = ('offers' in data) ? data.offers : [];
                    angular.forEach($scope.offers, function (offer) {
                        var newContacts = [];
                        var oldContacts;
                        try {
                            oldContacts = angular.fromJson(offer.cnt);
                        } catch (err) {
                            oldContacts = [];
                        }
                        angular.forEach(oldContacts, function (contact) {
                            for (var type in contact) {
                                if (!contact.hasOwnProperty(type)) continue;
                                if (type.toLowerCase() === 'phone') {
                                    newContacts.push({
                                        type: $filter('translate')('MARKET.PHONE.TEXT') + ': ',
                                        text: contact[type]
                                    });
                                } else if (type.toLowerCase() === 'email') {
                                    newContacts.push({
                                        type: $filter('translate')('MARKET.EMAIL.TEXT') + ': ',
                                        text: contact[type]
                                    });
                                } else {
                                    newContacts.push({type: type + ': ', text: contact[type]});
                                }
                            }
                        });
                        offer.normal_contacts = newContacts;
                    });
                    $scope.loadingMarket = false;
                    $scope.$digest();
                });
            }

            getFavorites();

            $rootScope.$on('fav_currency_changed', function () {
                getFavorites();
            });

        }
    ]);

    module.controller('lastContactsController', ['$scope', '$rootScope', '$filter', 'sortingParamsLists',
        function ($scope, $rootScope, $filter, sortingParamsLists) {

            $scope.lastContacts = $rootScope.settings.contacts;
            angular.forEach($scope.lastContacts, function (contact) {
                if (contact.connections instanceof Array) {
                    var newConnections = [];
                    angular.forEach(contact.connections, function (connection) {
                        if (connection.type === 'PHONE') {
                            newConnections.push({
                                type: $filter('translate')('MARKET.PHONE.TEXT') + ': ',
                                text: connection.name
                            });
                        } else if (connection.type === 'EMAIL') {
                            newConnections.push({
                                type: $filter('translate')('MARKET.EMAIL.TEXT') + ': ',
                                text: connection.name
                            });
                        } else if (connection.type === 'IMS') {
                            newConnections.push({type: connection.name + ': ', text: connection.username});
                        }
                    });
                    contact.normal_connections = newConnections;
                }
            });

            $scope.filter = sortingParamsLists.index;

            $scope.orderChange = function (orderBy) {
                if ($scope.filter.contactSortBy === orderBy) {
                    $scope.filter.contactSortDir = !$scope.filter.contactSortDir;
                } else {
                    $scope.filter.contactSortBy = orderBy;
                    $scope.filter.contactSortDir = true;
                }
                $scope.lastContacts = $filter('orderBy')($scope.lastContacts, $scope.filter.contactSortBy, $scope.filter.contactSortDir);
            };

            $scope.getContactGroups = function (contact) {
                var groups = [];
                angular.forEach(contact.group_ids, function (groupId) {
                    var group = $rootScope.getGroup(groupId);
                    if (group) {
                        groups.push(group);
                    }
                });
                return groups;
            };

        }
    ]);

    module.controller('backendInfoController', ['$scope', '$rootScope', '$filter', '$timeout',
        function ($scope, $rootScope, $filter, $timeout) {

            var watchTimer;

            var init = function () {
                if (watchTimer) $timeout.cancel(watchTimer);
                watchTimer = $timeout(function () {
                    var systemState = [];
                    for (var state in $rootScope.daemonState) {
                        if (!$rootScope.daemonState.hasOwnProperty(state)) continue;
                        if (['hashrate', 'max_net_seen_height', 'net_time_delta_median'].indexOf(state) === -1) {
                            if (state !== 'last_blocks') {
                                systemState.push({
                                    stateName: state,
                                    stateValue: $rootScope.daemonState[state],
                                    stateText: [state + ': ' + $rootScope.daemonState[state]]
                                });
                            } else {
                                var dates = $filter('limitTo')(angular.fromJson($rootScope.daemonState[state]), 5);
                                var text = [];
                                angular.forEach(dates, function (date) {
                                    text.push(state + ': ' + $filter('date')($filter('intToDate')(date.date), 'medium'));
                                });
                                systemState.push({
                                    stateName: state,
                                    stateValue: $filter('date')($filter('intToDate')(dates[0].date), 'medium'),
                                    stateText: text
                                });
                            }
                        }
                    }
                    $scope.systemState = systemState;
                }, 100);
            };

            init();

            $rootScope.$on('NEED_REFRESH_WIDGET_BACKEND_INFO', function () {
                init();
            });

            $scope.$on('$destroy', function () {
                if (watchTimer) $timeout.cancel(watchTimer);
            });

        }
    ]);

    module.controller('activeMiningController', ['backend', '$rootScope', '$scope', '$timeout',
        function (backend, $rootScope, $scope, $timeout) {

            $scope.diagramOptions = {
                color: '#378ed4',
                colors: {
                    fillColor: '#b7cad8',
                    gridColor: 'rgba(165, 173, 181, 0.75)',
                    labelColor: '#1f415d',
                    maskFill: 'rgba(68, 150, 214, 0.4)',
                    outlineColor: 'rgba(165, 173, 181, 0.75)',
                    handlesBorderColor: '#a5adb5',
                    axisLabelColor: '#1f415d',
                    axisLineColor: '#a5adb5',
                    tooltipBgColor: 'rgba(255, 255, 255, 0.8)',
                    tooltipBorderColor: '#a5adb5',
                    scrollBarColor: '#a5adb5'
                },
                selected: 2,
                dataGrouping: 'day',
                type: 'chartWidget'
            };

            $scope.safesPeriod = '1month';
            $scope.safesGroup = 'day';

            $scope.setPeriod = function (strPeriod) {
                if (strPeriod === 'all') {
                    $scope.diagramOptions.selected = 6;
                } else if (strPeriod === '1year') {
                    $scope.diagramOptions.selected = 5;
                } else if (strPeriod === '6month') {
                    $scope.diagramOptions.selected = 4;
                } else if (strPeriod === '3month') {
                    $scope.diagramOptions.selected = 3;
                } else if (strPeriod === '1month') {
                    $scope.diagramOptions.selected = 2;
                } else if (strPeriod === '2week') {
                    $scope.diagramOptions.selected = 1;
                } else if (strPeriod === '1week') {
                    $scope.diagramOptions.selected = 0;
                }
                $scope.safesPeriod = strPeriod;
            };

            $scope.setGroup = function (strGroup) {
                if (strGroup === 'day') {
                    $scope.diagramOptions.dataGrouping = strGroup;
                } else if (strGroup === 'week') {
                    $scope.diagramOptions.dataGrouping = strGroup;
                } else if (strGroup === 'month') {
                    $scope.diagramOptions.dataGrouping = strGroup;
                }
                $scope.safesGroup = strGroup;
            };

            $scope.safesDiagram = [];

            var timeoutChangeSelect;

            $scope.reloadTable = function () {
                if (timeoutChangeSelect) {
                    $timeout.cancel(timeoutChangeSelect);
                }
                timeoutChangeSelect = $timeout(function () {
                    angular.forEach($rootScope.safes, function (safe) {
                        if (safe.wallet_id === $rootScope.dashboardActiveMining && safe.loaded) {
                            if (safe.mined_total > 0) {
                                backend.getMiningHistory(safe.wallet_id, function (status, data) {
                                    var diagram = [];
                                    if (angular.isDefined(data['mined_entries'])) {
                                        angular.forEach(data['mined_entries'], function (item, key) {
                                            if (item.t.toString().length === 10) {
                                                data['mined_entries'][key].t = (new Date(item.t * 1000)).setUTCHours(0, 0, 0, 1);
                                            }
                                            diagram.push([parseInt(item.t), parseFloat($rootScope.moneyParse(item.a, false))]);
                                        });
                                        diagram = diagram.sort(function (a, b) {
                                            return a[0] - b[0];
                                        });
                                    }
                                    $scope.safesDiagram = diagram;
                                    $scope.$digest();
                                });
                            } else {
                                $scope.safesDiagram = [];
                            }
                        }
                    });
                }, 500);
            };

            if ($rootScope.safes.length) {
                if (($rootScope.getSafeById($rootScope.dashboardActiveMining)) === false) {
                    $rootScope.dashboardActiveMining = $rootScope.safes[0].wallet_id;
                }
                $scope.reloadTable();
            }

            var watchActiveMining = $scope.$watch(
                function () {
                    return $rootScope.dashboardActiveMining;
                },
                function () {
                    $scope.reloadTable();
                }
            );

            var watchTimer;
            var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                if (watchTimer) $timeout.cancel(watchTimer);
                watchTimer = $timeout(function () {
                    if ($rootScope.safes.length) $scope.reloadTable();
                }, 1000);
            });

            $scope.$on('$destroy', function () {
                if (watchTimer) $timeout.cancel(watchTimer);
                removeBroadHistory();
                watchActiveMining();
                if (timeoutChangeSelect) $timeout.cancel(timeoutChangeSelect);
            });

        }
    ]);

})();