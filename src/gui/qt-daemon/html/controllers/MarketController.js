// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function () {
    'use strict';
    var module = angular.module('app.market', []);

    module.factory('RemoveConfirmModal', ['$uibModal', function ($uibModal) {

        this.$dialog = false;
        var removeItem;

        var marketRemoveOfferOpened = false;

        this.Show = function () {
            if (marketRemoveOfferOpened) return;
            marketRemoveOfferOpened = true;

            this.$dialog = $uibModal.open({
                animation: true,
                backdrop: false,
                controller: 'marketListCtrl',
                templateUrl: 'views/marketRemoveOffer.html',
                windowClass: 'modal-main-wrapper modal-disable-safe base-scroll light-scroll'
            });

            this.$dialog.result.then(function () {
                marketRemoveOfferOpened = false;
            }, function () {
                marketRemoveOfferOpened = false;
            });
        };

        this.Hide = function () {
            this.$dialog.dismiss();
        };

        this.setRemoveItem = function (item) {
            removeItem = item;
        };

        this.getRemoveItem = function () {
            return removeItem;
        };

        return this;
    }]);

    module.controller('marketListCtrl', ['CONFIG', 'backend', 'market', '$rootScope', '$scope', '$uibModal', '$routeParams', '$filter', '$timeout', 'informer', 'RemoveConfirmModal', '$q', 'showHideTabs',
        function (CONFIG, backend, market, $rootScope, $scope, $uibModal, $routeParams, $filter, $timeout, informer, RemoveConfirmModal, $q, showHideTabs) {

            $rootScope.refreshFavoriteOffers();
            $rootScope.recountOffers();

            $scope.marketShowHideTabs = showHideTabs.market;
            $scope.countryList = angular.copy($rootScope.countryList);
            $scope.countryList.push({alpha2Code: '000All', name: $filter('translate')('MARKET.FILTER.ALL_WORLD')});

            $scope.config = CONFIG;
            $scope.paymentTypes = market.paymentTypes;
            $scope.dealDetails = market.dealDetails;
            $scope.deliveryWays = market.deliveryWays;
            $scope.contacts = market.contacts;
            $scope.currencies = angular.copy(market.currencies);
            $scope.currenciesGoods = angular.copy(market.currencies);
            $scope.categories = angular.copy(market.categories);

            $scope.currencies.unshift(
                {code: 'all_cur', title: $filter('translate')('COMMON.ALL')}
            );

            $scope.currenciesGoods.unshift(
                {code: 'all_cur', title: $filter('translate')('COMMON.ALL')},
                {code: $rootScope.currencySymbol, title: $filter('translate')('CURRENCY.MONEY')}
            );

            $scope.timeIntervals = [
                {key: -1, value: $filter('translate')('COMMON.NOT_CARE')},
                {key: 3600, value: $filter('translate')('COMMON.HOUR')},
                {key: 10800, value: $filter('translate')('COMMON.THREE_HOURS')},
                {key: 86400, value: $filter('translate')('COMMON.DAY')},
                {key: 172800, value: $filter('translate')('COMMON.TWO_DAYS')},
                {key: 259200, value: $filter('translate')('COMMON.THREE_DAYS')},
                {key: 604800, value: $filter('translate')('COMMON.WEEK')},
                {key: -2, value: $filter('translate')('COMMON.ANOTHER_PERIOD')}
            ];

            $scope.currencyFilter = market.currencyFilter;
            $scope.goodsFilter = market.goodsFilter;
            $scope.myOffersFilter = market.myOffersFilter;
            $scope.favOffersFilter = market.favOffersFilter;

            var timeBlockNext = true;

            $scope.checkTimeBeforeDelete = function (timestamp, expiration) {
                return ((Date.now() / 1000 > timestamp + (expiration * 86400) - 3600));
            };

            $scope.paginator = {
                currentPage: 1,
                lastPage: 1,
                pagesCount: 1,
                inPage: (angular.isDefined($scope.marketShowHideTabs.paginatorLimit) && parseInt($scope.marketShowHideTabs.paginatorLimit) > 0) ? $scope.marketShowHideTabs.paginatorLimit : 20,
                blockNext: false,
                scrollDown: false,
                setNext: function () {
                    if (timeBlockNext) {
                        timeBlockNext = false;
                        $scope.paginator.setPage($scope.paginator.currentPage + 1, false, true);
                    }
                },
                setPrev: function () {
                    $scope.paginator.setPage($scope.paginator.currentPage - 1, false, true);
                },
                setPage: function (page, important, scroll) {
                    if (page && (page !== $scope.paginator.currentPage || page !== $scope.paginator.lastPage || important)) {
                        if (page - 1 >= 0) {
                            if (scroll) {
                                $scope.paginator.scrollDown = true;
                            }
                            $scope.paginator.currentPage = page;
                            $scope.paginator.lastPage = page;
                            $scope.$broadcast('pageChanged');
                        }
                    }
                },
                enter: function (isFocusOut, event) {
                    if ($scope.paginator.currentPage.length) {
                        var newPage = $scope.paginator.__noIntFix($scope.paginator.currentPage);
                        if (newPage < 1) {
                            newPage = 1
                        }
                        $scope.paginator.currentPage = newPage;
                    }
                    if (isFocusOut) {
                        $scope.paginator.setPage($scope.paginator.__noIntFix($scope.paginator.currentPage));
                    } else if (event.keyCode && event.keyCode === 13) {
                        $scope.paginator.setPage($scope.paginator.__noIntFix($scope.paginator.currentPage));
                    }
                },
                getOffset: function () {
                    return ($scope.paginator.currentPage - 1) * $scope.paginator.inPage;
                },
                __noIntFix: function (page) {
                    return parseInt(page, 0) || 1
                },
                changeLimit: function (limit) {
                    $scope.marketShowHideTabs.paginatorLimit = limit;
                    $scope.paginator.inPage = limit;
                    $scope.paginator.setPage(1, true, true);
                }
            };

            var marketOfferCreateEditOpened = false;

            $scope.openOfferCreateEdit = function (options) {
                if (marketOfferCreateEditOpened) return;
                marketOfferCreateEditOpened = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-create-offer base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/marketOfferCreateEdit.html',
                    controller: 'marketOfferCreateEditCtrl',
                    resolve: {
                        options: function () {
                            return options;
                        }
                    }
                }).result.then(function () {
                    marketOfferCreateEditOpened = false;
                }, function () {
                    marketOfferCreateEditOpened = false;
                });
            };

            function setOffset() {
                if ($scope.tabs.currencyTab) {
                    $scope.currencyFilter.offset = $scope.paginator.getOffset();
                }
                if ($scope.tabs.goodsTab) {
                    $scope.goodsFilter.offset = $scope.paginator.getOffset();
                }
                if ($scope.tabs.myOffersTab) {
                    $scope.myOffersFilter.offset = $scope.paginator.getOffset();
                }
                if ($scope.tabs.favoritesTab) {
                    $scope.favOffersFilter.offset = $scope.paginator.getOffset();
                }
            }

            $scope.$on('pageChanged', function () {
                setOffset();
                $scope.filterChange(true);
            });

            function formCurrencyFilter() {
                $scope.currencyFilter.clear = ($scope.currencyFilter.offer_type_mask !== 12 || $scope.currencyFilter.payment_types.length
                    || $scope.currencyFilter.location_country !== '' || $scope.currencyFilter.location_city !== ''
                    || $scope.currencyFilter.interval !== -1 || $scope.currencyFilter.currency !== 'all_cur'
                    || $scope.currencyFilter.amount_from !== '' || $scope.currencyFilter.amount_to !== ''
                    || $scope.currencyFilter.rate_from !== '' || $scope.currencyFilter.rate_to !== ''
                    || $scope.currencyFilter.keywords !== '' || $scope.currencyFilter.countryAll !== false);
                var params = {
                    order_by: $scope.currencyFilter.order_by,
                    reverse: !!$scope.currencyFilter.order_reverse,
                    offset: $scope.currencyFilter.offset,
                    limit: $scope.paginator.inPage + 1,
                    offer_type_mask: $scope.currencyFilter.offer_type_mask,
                    payment_types: $scope.currencyFilter.payment_types,
                    location_country: $scope.currencyFilter.location_country,
                    location_city: $scope.currencyFilter.location_city
                };
                if ($scope.currencyFilter.currency !== 'all_cur') {
                    params.target = $scope.currencyFilter.currency;
                }
                if ($scope.currencyFilter.interval === -2) {
                    var startDate = $scope.currencyFilter.date_from.split('/');
                    params.timestamp_start = parseInt(new Date(parseInt(startDate[2]), parseInt(startDate[1]) - 1, parseInt(startDate[0]), 0, 0, 0).getTime() / 1000);
                    var endDate = $scope.currencyFilter.date_to.split('/');
                    params.timestamp_stop = parseInt(new Date(parseInt(endDate[2]), parseInt(endDate[1]) - 1, parseInt(endDate[0]), 23, 59, 59).getTime() / 1000) + 3600;
                } else if ($scope.currencyFilter.interval !== -1) {
                    params.timestamp_start = parseInt(new Date().getTime() / 1000 - $scope.currencyFilter.interval);
                    params.timestamp_stop = parseInt(new Date().getTime() / 1000) + 3600;
                }
                if ($scope.currencyFilter.amount_from !== '') {
                    params.amount_low_limit = parseInt($filter('moneyToInt')($scope.currencyFilter.amount_from));
                }
                if ($scope.currencyFilter.amount_to !== '') {
                    params.amount_up_limit = parseInt($filter('moneyToInt')($scope.currencyFilter.amount_to));
                }
                if ($scope.currencyFilter.rate_from !== '') {
                    params.rate_low_limit = parseFloat($scope.currencyFilter.rate_from).toFixed(8);
                }
                if ($scope.currencyFilter.rate_to !== '') {
                    params.rate_up_limit = parseFloat($scope.currencyFilter.rate_to).toFixed(8);
                }
                if ($scope.currencyFilter.keywords !== '') {
                    params.keyword = $scope.currencyFilter.keywords;
                }
                return params;
            }

            function formGoodsFilter() {
                $scope.goodsFilter.clear = ($scope.goodsFilter.offer_type_mask !== 3 || $scope.goodsFilter.category !== 'ALL'
                    || $scope.goodsFilter.interval !== -1 || $scope.goodsFilter.location_country !== ''
                    || $scope.goodsFilter.location_city !== '' || $scope.goodsFilter.price_from !== ''
                    || $scope.goodsFilter.price_to !== '' || $scope.goodsFilter.keywords !== '' || $scope.goodsFilter.countryAll !== false
                    || $scope.goodsFilter.currency !== 'all_cur' || $scope.goodsFilter.delivery.length !== 0);
                var params = {
                    order_by: $scope.goodsFilter.order_by,
                    reverse: !!$scope.goodsFilter.order_reverse,
                    offset: $scope.goodsFilter.offset,
                    limit: $scope.paginator.inPage + 1,
                    offer_type_mask: $scope.goodsFilter.offer_type_mask,
                    location_country: $scope.goodsFilter.location_country,
                    location_city: $scope.goodsFilter.location_city
                };
                if ($scope.goodsFilter.currency !== 'all_cur') {
                    params.primary = $scope.goodsFilter.currency;
                }
                if ($scope.goodsFilter.delivery.length) {
                    params.payment_types = angular.copy($scope.goodsFilter.delivery);
                }
                if ($scope.goodsFilter.category !== 'ALL') {
                    params.category = $scope.goodsFilter.category;
                }
                if ($scope.goodsFilter.interval === -2) {
                    var startDate = $scope.goodsFilter.date_from.split('/');
                    params.timestamp_start = parseInt(new Date(parseInt(startDate[2]), parseInt(startDate[1]) - 1, parseInt(startDate[0]), 0, 0, 0).getTime() / 1000);
                    var endDate = $scope.goodsFilter.date_to.split('/');
                    params.timestamp_stop = parseInt(new Date(parseInt(endDate[2]), parseInt(endDate[1]) - 1, parseInt(endDate[0]), 23, 59, 59).getTime() / 1000) + 3600;
                } else if ($scope.goodsFilter.interval !== -1) {
                    params.timestamp_start = parseInt(new Date().getTime() / 1000 - $scope.goodsFilter.interval);
                    params.timestamp_stop = parseInt(new Date().getTime() / 1000) + 3600;
                }
                if ($scope.goodsFilter.price_from !== '') {
                    params.amount_low_limit = parseInt($filter('moneyToInt')($scope.goodsFilter.price_from));
                }
                if ($scope.goodsFilter.price_to !== '') {
                    params.amount_up_limit = parseInt($filter('moneyToInt')($scope.goodsFilter.price_to));
                }
                if ($scope.goodsFilter.keywords !== '' && !$scope.goodsFilter.find_in_names) {
                    params.keyword = $scope.goodsFilter.keywords;
                }
                if ($scope.goodsFilter.keywords !== '' && $scope.goodsFilter.find_in_names) {
                    params.target = $scope.goodsFilter.keywords;
                }
                return params;
            }

            function formMyOffersFilter() {
                if ($scope.myOffersFilter.view !== 'CURRENCY' || $scope.myOffersFilter.offer_type !== 'ALL') {
                    $scope.myOffersFilter.clear = true;
                }
                var offer_type_mask;
                if ($scope.myOffersFilter.view === 'CURRENCY') {
                    offer_type_mask = $scope.myOffersFilter.offer_type === 'BUY' ? 4 : $scope.myOffersFilter.offer_type === 'SELL' ? 8 : 12;
                } else if ($scope.myOffersFilter.view === 'BARTER') {
                    offer_type_mask = $scope.myOffersFilter.offer_type === 'BUY' ? 1 : $scope.myOffersFilter.offer_type === 'SELL' ? 2 : 3;
                }
                var params = {
                    order_by: $scope.myOffersFilter.order_by,
                    reverse: !!$scope.myOffersFilter.order_reverse,
                    offset: $scope.myOffersFilter.offset,
                    limit: $scope.paginator.inPage + 1,
                    offer_type_mask: offer_type_mask
                };
                if ($scope.myOffersFilter.keywords !== '') {
                    params.keyword = $scope.myOffersFilter.keywords;
                }
                return params;
            }

            function formFavoritesFilter() {
                if ($scope.favOffersFilter.view !== 'CURRENCY' || $scope.favOffersFilter.offer_type !== 'ALL') {
                    $scope.favOffersFilter.clear = true;
                }
                var offer_type_mask;
                if ($scope.favOffersFilter.view === 'CURRENCY') {
                    offer_type_mask = $scope.favOffersFilter.offer_type === 'BUY' ? 4 : $scope.favOffersFilter.offer_type === 'SELL' ? 8 : 12;
                } else if ($scope.favOffersFilter.view === 'BARTER') {
                    offer_type_mask = $scope.favOffersFilter.offer_type === 'BUY' ? 1 : $scope.favOffersFilter.offer_type === 'SELL' ? 2 : 3;
                }
                var ids = [];
                var fav_offers_hash = angular.isDefined($rootScope.settings.system.fav_offers_hash) ? $rootScope.settings.system.fav_offers_hash : [];
                angular.forEach(fav_offers_hash, function (fav) {
                    ids.push({tx_id: fav, index: 0});
                });
                var filter = {
                    order_by: $scope.favOffersFilter.order_by,
                    reverse: !!$scope.favOffersFilter.order_reverse,
                    offset: $scope.favOffersFilter.offset,
                    limit: $scope.paginator.inPage + 1,
                    offer_type_mask: offer_type_mask
                };
                if ($scope.favOffersFilter.keywords !== '') {
                    filter.keyword = $scope.favOffersFilter.keywords;
                }
                return {ids: ids, filter: filter};
            }

            function getData(status, data) {
                if (!status) return;
                var loadedOffers = ('offers' in data) ? data.offers : [];
                $scope.paginator.blockNext = !loadedOffers.length || loadedOffers.length <= $scope.paginator.inPage;
                timeBlockNext = true;
                if (loadedOffers.length === $scope.paginator.inPage + 1) {
                    loadedOffers.splice(-1, 1);
                }
                $scope.filteredOffers = [];
                $scope.filteredOffers = loadedOffers;
                angular.forEach($scope.filteredOffers, function (offer) {
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
                $scope.$digest();
                if ($scope.paginator.scrollDown) {
                    $scope.paginator.scrollDown = false;
                    document.querySelector('#scrolled-content').scrollTop = document.querySelector('#scrolled-content').scrollHeight;
                }
            }

            $scope.filterChange = function (isPage) {
                $(window).trigger('resize');
                $scope.loadingMarket = true;
                if (!isPage) {
                    $scope.paginator.currentPage = 1;
                    setOffset();
                }
                var params;
                if ($scope.tabs.currencyTab) {
                    params = formCurrencyFilter();
                    setOrder($scope.currencyFilter.order_by, $scope.currencyFilter.order_reverse);
                    backend.getOffers(params, function (status, data) {
                        getData(status, data);
                    });
                }
                if ($scope.tabs.goodsTab) {
                    params = formGoodsFilter();
                    setOrder($scope.goodsFilter.order_by, $scope.goodsFilter.order_reverse);
                    backend.getOffers(params, function (status, data) {
                        getData(status, data);
                    });
                }
                if ($scope.tabs.myOffersTab) {
                    params = formMyOffersFilter();
                    setOrder($scope.myOffersFilter.order_by, $scope.myOffersFilter.order_reverse);
                    backend.getMyOffers(params, function (status, data) {
                        var loadedOffers = ('offers' in data) ? data.offers : [];
                        if (loadedOffers.length === 0 && !$scope.myOffersFilter.first_redirect) {
                            if ($scope.myOffersFilter.view === 'CURRENCY') {
                                $scope.myOffersFilter.view = 'BARTER';
                                $scope.isCurrencyTable = false;
                                $scope.isGoodsTable = true;
                            } else {
                                $scope.myOffersFilter.view = 'CURRENCY';
                                $scope.isCurrencyTable = true;
                                $scope.isGoodsTable = false;
                            }
                            var newParams = formMyOffersFilter();
                            backend.getMyOffers(newParams, function (status, data) {
                                $scope.myOffersFilter.first_redirect = true;
                                var newLoadedOffers = ('offers' in data) ? data.offers : [];
                                if (newLoadedOffers.length === 0) {
                                    $scope.myOffersFilter.view = 'CURRENCY';
                                    $scope.filterChange(isPage);
                                } else {
                                    getData(status, data);
                                }
                            });
                        } else {
                            $scope.myOffersFilter.first_redirect = true;
                            getData(status, data);
                        }
                    });
                }
                if ($scope.tabs.favoritesTab) {
                    params = formFavoritesFilter();
                    setOrder($scope.favOffersFilter.order_by, $scope.favOffersFilter.order_reverse);
                    backend.getFavOffers(params, function (status, data) {
                        if (angular.isDefined($rootScope.settings.system.fav_offers_hash) && ('offers' in data)) {
                            var offers = [];
                            for (var i = 0; i < data.offers.length; i++) {
                                var index = $rootScope.settings.system.fav_offers_hash.indexOf(data.offers[i]['tx_original_hash']);
                                if (index > -1) {
                                    $rootScope.settings.system.fav_offers_hash[index] = data.offers[i]['tx_hash'];
                                }
                                if (offers.indexOf(data.offers[i]['tx_hash']) === -1) {
                                    offers[data.offers[i]['tx_hash']] = data.offers[i];
                                }
                            }
                            data.offers = [];
                            for (var val in offers) {
                                if (offers.hasOwnProperty(val)) {
                                    data.offers.push(offers[val]);
                                }
                            }
                        }
                        getData(status, data);
                    });
                }
                $scope.isCurrencyTable = $scope.tabs.currencyTab || ($scope.tabs.myOffersTab && $scope.myOffersFilter.view === 'CURRENCY') || ($scope.tabs.favoritesTab && $scope.favOffersFilter.view === 'CURRENCY');
                $scope.isGoodsTable = !$scope.isCurrencyTable;

                setTimeout(function () {
                    $scope.loadingMarket = false;
                    $scope.$digest();
                }, 500);
            };

            $scope.findChange = function () {
                if ($scope.goodsFilter.keywords !== '') {
                    $scope.filterChange();
                }
            };

            $scope.dateChange = function (interval) {
                if (interval !== -2) {
                    $scope.filterChange();
                }
            };

            function setOrder(orderBy, orderReverse) {
                $scope.currentOrder = orderBy;
                $scope.currentOrderReverse = orderReverse;
            }

            $scope.orderChange = function (orderBy) {
                if ($scope.tabs.currencyTab) {
                    if ($scope.currencyFilter.order_by === orderBy) {
                        $scope.currencyFilter.order_reverse = !$scope.currencyFilter.order_reverse;
                    } else {
                        $scope.currencyFilter.order_by = orderBy;
                        $scope.currencyFilter.order_reverse = true;
                    }
                    setOrder($scope.currencyFilter.order_by, $scope.currencyFilter.order_reverse);
                }
                if ($scope.tabs.goodsTab) {
                    if ($scope.goodsFilter.order_by === orderBy) {
                        $scope.goodsFilter.order_reverse = !$scope.goodsFilter.order_reverse;
                    } else {
                        $scope.goodsFilter.order_by = orderBy;
                        $scope.goodsFilter.order_reverse = true;
                    }
                    setOrder($scope.goodsFilter.order_by, $scope.goodsFilter.order_reverse);
                }
                if ($scope.tabs.myOffersTab) {
                    if ($scope.myOffersFilter.order_by === orderBy) {
                        $scope.myOffersFilter.order_reverse = !$scope.myOffersFilter.order_reverse;
                    } else {
                        $scope.myOffersFilter.order_by = orderBy;
                        $scope.myOffersFilter.order_reverse = true;
                    }
                    setOrder($scope.myOffersFilter.order_by, $scope.myOffersFilter.order_reverse);
                }
                if ($scope.tabs.favoritesTab) {
                    if ($scope.favOffersFilter.order_by === orderBy) {
                        $scope.favOffersFilter.order_reverse = !$scope.favOffersFilter.order_reverse;
                    } else {
                        $scope.favOffersFilter.order_by = orderBy;
                        $scope.favOffersFilter.order_reverse = true;
                    }
                    setOrder($scope.favOffersFilter.order_by, $scope.favOffersFilter.order_reverse);
                }
                $scope.filterChange();
            };

            function clearCurrencyFilter() {
                $scope.$broadcast('angucomplete-alt:clearInput');
                $scope.currencyFilter.clear = false;
                $scope.currencyFilter.order_by = 0;
                $scope.currencyFilter.order_reverse = true;
                $scope.currencyFilter.offset = 0;
                $scope.currencyFilter.limit = 10;
                $scope.currencyFilter.offer_type_mask = 12;
                $scope.currencyFilter.currency = 'all_cur';
                $scope.currencyFilter.location_country = '';
                $scope.currencyFilter.location_city = '';
                $scope.currencyFilter.payment_types = [];
                $scope.currencyFilter.date_from = '';
                $scope.currencyFilter.date_to = '';
                $scope.currencyFilter.amount_from = '';
                $scope.currencyFilter.amount_to = '';
                $scope.currencyFilter.rate_from = '';
                $scope.currencyFilter.rate_to = '';
                $scope.currencyFilter.keywords = '';
                $scope.currencyFilter.country_name = '';
                $scope.currencyFilter.countryAll = false;
                $scope.currencyFilter.interval = -1;
            }

            function clearGoodsFilter() {
                $scope.$broadcast('angucomplete-alt:clearInput');
                $scope.goodsFilter.clear = false;
                $scope.goodsFilter.order_by = 0;
                $scope.goodsFilter.order_reverse = true;
                $scope.goodsFilter.offset = 0;
                $scope.goodsFilter.limit = 10;
                $scope.goodsFilter.offer_type_mask = 3;
                $scope.goodsFilter.currency = 'all_cur';
                $scope.goodsFilter.category = 'ALL';
                $scope.goodsFilter.location_country = '';
                $scope.goodsFilter.location_city = '';
                $scope.goodsFilter.payment_types = [];
                $scope.goodsFilter.date_from = '';
                $scope.goodsFilter.date_to = '';
                $scope.goodsFilter.price_from = '';
                $scope.goodsFilter.price_to = '';
                $scope.goodsFilter.keywords = '';
                $scope.goodsFilter.find_in_names = false;
                $scope.goodsFilter.country_name = '';
                $scope.goodsFilter.countryAll = false;
                $scope.goodsFilter.interval = -1;
                $scope.goodsFilter.delivery = [];
            }

            function clearMyOffersFilter() {
                $scope.myOffersFilter.clear = false;
                $scope.myOffersFilter.order_by = 0;
                $scope.myOffersFilter.order_reverse = true;
                $scope.myOffersFilter.offset = 0;
                $scope.myOffersFilter.limit = 10;
                $scope.myOffersFilter.offer_type = 'ALL';
                $scope.myOffersFilter.view = 'CURRENCY';
                $scope.myOffersFilter.keywords = '';
            }

            function clearFavoritesFilter() {
                $scope.favOffersFilter.clear = false;
                $scope.favOffersFilter.order_by = 0;
                $scope.favOffersFilter.order_reverse = true;
                $scope.favOffersFilter.offset = 0;
                $scope.favOffersFilter.limit = 10;
                $scope.favOffersFilter.offer_type = 'ALL';
                $scope.favOffersFilter.view = 'CURRENCY';
                $scope.favOffersFilter.keywords = '';
            }

            $scope.filterClear = function () {
                if ($scope.tabs.currencyTab) {
                    clearCurrencyFilter();
                }
                if ($scope.tabs.goodsTab) {
                    clearGoodsFilter();
                }
                if ($scope.tabs.myOffersTab) {
                    clearMyOffersFilter();
                }
                if ($scope.tabs.favoritesTab) {
                    clearFavoritesFilter();
                }
                $scope.paginator.setPage(1, true);
            };

            $scope.changeSelectedTab = function (tabName) {
                $scope.tabs = {
                    'currencyTab': tabName === 'currency',
                    'goodsTab': tabName === 'goods',
                    'myOffersTab': tabName === 'myOffers',
                    'favoritesTab': tabName === 'favorites'
                };
                if ($scope.tabs.myOffersTab) {
                    $scope.myOffersFilter.first_redirect = false;
                }
                $scope.paginator.setPage(1);
                $scope.filteredOffers = [];
                $scope.filterChange();
            };

            function getMaskFromOfferType(offerType) {
                return {0: 1, 1: 2, 2: 4, 3: 8}[offerType];
            }

            function isOfferInTable(offerType) {
                var curOfferMask = getMaskFromOfferType(offerType);
                var ofTypes = {
                    currency: 12,
                    goods: 3,
                    currency_p: [4, 8],
                    goods_p: [1, 2]
                };
                if ($scope.tabs.currencyTab) {
                    return ($scope.currencyFilter.offer_type_mask !== ofTypes.currency) ? curOfferMask === $scope.currencyFilter.offer_type_mask : ofTypes.currency_p.indexOf(curOfferMask) !== -1;
                }
                if ($scope.tabs.goodsTab) {
                    return ($scope.goodsFilter.offer_type_mask !== ofTypes.goods) ? curOfferMask === $scope.goodsFilter.offer_type_mask : ofTypes.goods_p.indexOf(curOfferMask) !== -1;
                }
                if ($scope.tabs.myOffersTab) {
                    var myTab = ($scope.myOffersFilter.view === 'CURRENCY') ? ofTypes.currency_p : ofTypes.goods_p;
                    return myTab.indexOf(curOfferMask) !== -1;
                }
                return false;
            }

            $scope.focusOutCountry = function () {
                if ($scope.tabs.currencyTab) {
                    var currencyInput = $('#countryInputCurrency_value');
                    if (currencyInput.val() !== $scope.currencyFilter.country_name || currencyInput.val() === '') {
                        $scope.$broadcast('angucomplete-alt:clearInput', 'countryInputCurrency');
                        $scope.currencyFilter.location_country = '';
                        $scope.currencyFilter.country_name = '';
                        $scope.$broadcast('angucomplete-alt:clearInput', 'cityInputCurrency');
                        $scope.currencyFilter.location_city = '';
                        $scope.filterChange();
                    }
                }
                if ($scope.tabs.goodsTab) {
                    var goodsInput = $('#countryInputGoods_value');
                    if (goodsInput.val() !== $scope.goodsFilter.country_name || goodsInput.val() === '') {
                        $scope.$broadcast('angucomplete-alt:clearInput', 'countryInputGoods');
                        $scope.goodsFilter.location_country = '';
                        $scope.goodsFilter.country_name = '';
                        $scope.$broadcast('angucomplete-alt:clearInput', 'cityInputGoods');
                        $scope.goodsFilter.location_city = '';
                        $scope.filterChange();
                    }
                }
            };

            $scope.selectedCountry = function (obj) {
                if (angular.isDefined(obj)) {
                    var o = obj.originalObject;
                    if ($scope.tabs.currencyTab) {
                        $scope.currencyFilter.location_country = o.alpha2Code;
                        $scope.currencyFilter.country_name = o.name;
                        $scope.$broadcast('angucomplete-alt:clearInput', 'cityInputCurrency');
                        $scope.currencyFilter.location_city = '';
                    }
                    if ($scope.tabs.goodsTab) {
                        $scope.goodsFilter.location_country = o.alpha2Code;
                        $scope.goodsFilter.country_name = o.name;
                        $scope.$broadcast('angucomplete-alt:clearInput', 'cityInputGoods');
                        $scope.goodsFilter.location_city = '';
                    }
                    $scope.filterChange();
                }
            };

            $scope.changeCountryInput = function (str) {
                if (str === '') {
                    if ($scope.tabs.currencyTab) {
                        $scope.currencyFilter.location_country = '';
                        $scope.currencyFilter.country_name = '';
                    }
                    if ($scope.tabs.goodsTab) {
                        $scope.goodsFilter.location_country = '';
                        $scope.goodsFilter.country_name = '';
                    }
                    $scope.filterChange();
                }
            };

            var timerCoreEvent;

            $scope.$on('CORE_EVENT_ADD_OFFER', function (event, data) {
                if (isOfferInTable(data.ot)) {
                    if (timerCoreEvent) $timeout.cancel(timerCoreEvent);
                    timerCoreEvent = $timeout(function () {
                        $scope.filterChange(true);
                    }, 3000);
                }
            });
            $scope.$on('CORE_EVENT_UPDATE_OFFER', function (event, data) {
                if (isOfferInTable(data.of.ot)) {
                    if (timerCoreEvent) $timeout.cancel(timerCoreEvent);
                    timerCoreEvent = $timeout(function () {
                        $scope.filterChange(true);
                    }, 3000);
                }
            });
            $scope.$on('CORE_EVENT_REMOVE_OFFER', function (event, data) {
                if (isOfferInTable(data.ot)) {
                    if (timerCoreEvent) $timeout.cancel(timerCoreEvent);
                    timerCoreEvent = $timeout(function () {
                        $scope.filterChange(true);
                    }, 3000);
                }
            });

            $scope.cancelOffer = function (offer) {
                var safe = $filter('filter')($rootScope.safes, offer.tx_hash);
                if (safe.length) {
                    safe = safe[0];
                    backend.cancelOffer(safe.wallet_id, offer.tx_hash, function (status, data) {
                        if (status) {
                            if ('success' in data && data.success) {
                                RemoveConfirmModal.Hide();
                                informer.success('MARKET.SUCCESS_DELETING');
                                $rootScope.deletedOffers.push(offer.tx_hash);
                            }
                        }
                    });
                } else {
                    informer.error('MARKET.ERROR.SAFE_NOT_FOUND');
                }
            };

            $scope.appPass = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.cancelRemove = function () {
                RemoveConfirmModal.setRemoveItem(false);
                RemoveConfirmModal.Hide();
            };
            $scope.removeItem = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.appPass, function () {
                    $scope.cancelOffer(RemoveConfirmModal.getRemoveItem());
                });
            };
            $scope.removeConfirm = function (remove) {
                $scope.appPass = '';
                RemoveConfirmModal.setRemoveItem(remove);
                RemoveConfirmModal.Show();
            };
            $scope.isFavorite = function (hash) {
                return $rootScope.settings.system.fav_offers_hash.indexOf(hash) > -1;
            };

            var deleteFavoriteOpened = false;

            function deleteFavorite(index) {
                if (deleteFavoriteOpened) return;
                deleteFavoriteOpened = true;

                $uibModal.open({
                    animation: true,
                    backdrop: false,
                    templateUrl: 'views/marketDeleteFavorite.html',
                    windowClass: 'modal-main-wrapper modal-disable-safe base-scroll light-scroll',
                    resolve: {
                        favoriteTab: function () {
                            return $scope.tabs.favoritesTab;
                        },
                        filterChange: function () {
                            return $scope.filterChange;
                        }
                    },
                    controller: function ($scope, $rootScope, favoriteTab, filterChange, $uibModalInstance) {

                        $scope.delete = function () {
                            $rootScope.settings.system.fav_offers_hash.splice(index, 1);
                            $rootScope.storeAppData();
                            if (favoriteTab) {
                                filterChange();
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

            $scope.toggleFavorite = function (hash) {
                var index = $rootScope.settings.system.fav_offers_hash.indexOf(hash);
                if (index > -1) {
                    deleteFavorite(index);
                } else {
                    $rootScope.settings.system.fav_offers_hash.push(hash);
                    $rootScope.storeAppData();
                }
            };

            $scope.countryAllChange = function () {
                $scope.$broadcast('angucomplete-alt:clearInput');
                if ($scope.tabs.currencyTab) {
                    if ($scope.currencyFilter.countryAll) {
                        $scope.currencyFilter.location_country = '000All';
                        $scope.currencyFilter.country_name = '';
                        $scope.currencyFilter.location_city = '';
                    } else {
                        $scope.currencyFilter.location_country = '';
                        $scope.currencyFilter.country_name = '';
                        $scope.currencyFilter.location_city = '';
                    }
                } else if ($scope.tabs.goodsTab) {
                    if ($scope.goodsFilter.countryAll) {
                        $scope.goodsFilter.location_country = '000All';
                        $scope.goodsFilter.country_name = '';
                        $scope.goodsFilter.location_city = '';
                    } else {
                        $scope.goodsFilter.location_country = '';
                        $scope.goodsFilter.country_name = '';
                        $scope.goodsFilter.location_city = '';
                    }
                }
                $scope.filterChange();
            };

            var timerTab = $timeout(function () {
                $scope.changeSelectedTab($routeParams.tab || 'currency');
            }, 300);

            $scope.$on('$destroy', function () {
                if (timerTab) $timeout.cancel(timerTab);
                if (timerCoreEvent) $timeout.cancel(timerCoreEvent);
            });

        }
    ]);

    module.controller('marketOfferCreateEditCtrl', ['CONFIG', 'cancelingCreate', 'backend', '$rootScope', '$scope', 'informer', '$routeParams', '$filter', '$location', '$timeout', 'market', '$http', '$q', '$uibModalInstance', 'options', 'uuid', '$uibModal', '$route', 'showHideTabs', 'messengerList',
        function (CONFIG, cancelingCreate, backend, $rootScope, $scope, informer, $routeParams, $filter, $location, $timeout, market, $http, $q, $uibModalInstance, options, uuid, $uibModal, $route, showHideTabs, messengerList) {

            var refreshSafesList = function () {
                $scope.safesList = [];
                angular.forEach($rootScope.safes, function (safe) {
                    $scope.safesList.push({
                        name: safe.name,
                        walletId: safe.wallet_id,
                        unlockedBalance: safe.unlocked_balance,
                        balance: safe.balance
                    });
                }, true);
            };

            refreshSafesList();

            var broadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                refreshSafesList();
            });
            var broadSafes = $rootScope.$on('NEED_REFRESH_SAFES', function () {
                refreshSafesList();
            });

            $scope.messengerList = messengerList;

            $scope.selectedMessenger = function (obj) {
                if (angular.isDefined(obj)) {
                    $scope.offer.contacts[this.$parent.$index].name = obj.originalObject.name;
                    $scope.offer.contacts[this.$parent.$index].is_edit = $scope.blurIMS($scope.offer.contacts[this.$parent.$index])
                }
            };
            $scope.changeMessengerInput = function (str) {
                $scope.offer.contacts[this.$parent.$index].name = str;
            };

            $scope.newOfferType = 1;
            if (options) {
                var _type_ = options.type || false;
                if (_type_ === 2) $scope.newOfferType = 2; else $scope.newOfferType = 1;
                var offer = options.offer || false;
            }
            $scope.intervals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
            $scope.currencies = market.currencies;
            $scope.currenciesWithMoney = [{
                rank: 1,
                code: $rootScope.currencySymbol,
                title: $filter('translate')('CURRENCY.MONEY')
            }].concat($scope.currencies);

            $scope.latestTransactions = true;

            $scope.errorAgreement = false;
            $scope.dealDetails = market.dealDetails;
            $scope.paymentTypes = market.paymentTypes;
            $scope.offerTypes = [
                {key: 0, value: $filter('translate')('BUY_SELL_OFFER.BUY_GOOD')},
                {key: 1, value: $filter('translate')('BUY_SELL_OFFER.SELL_GOOD')},
                {key: 2, value: $filter('translate')('BUY_SELL_OFFER.BUY_MONEY')},
                {key: 3, value: $filter('translate')('BUY_SELL_OFFER.SELL_MONEY')}
            ];
            $scope.page = {
                deliveryWay: '',
                paymentType: '',
                contact: ''
            };
            $scope.disabledPaymentType = {
                'BTX': false,
                'BCX': false,
                'CSH': false,
                'EPS': false
            };
            $scope.disabledContacts = {
                'EMAIL': false,
                'PHONE': false,
                'IMS': false
            };
            $scope.disabledDeals = {
                'HANDS': false,
                'STORAGE': false
            };
            $scope.deliveryWays = market.deliveryWays;
            $scope.offer = {
                expiration_time: $scope.intervals[13],
                is_standard: false,
                is_premium: true,
                fee_premium: CONFIG.premiumFee,
                fee_standard: CONFIG.standardFee,
                location_country: '',
                location_city: '',
                contacts: [],
                deal_details: [],
                comment: '',
                bonus: '',
                initial_country: '',
                show_way_selector: true,
                show_contact_selector: true,
                categories: [],
                category: '',
                currency: $scope.currencies[0].code,
                payment_types: [],
                show_type_selector: true,
                offer_type: 0
            };
            $scope.agreement = false;

            $scope.isEdit = false;
            $scope.countryCheckboxDoNot = false;
            $scope.countryCheckboxAll = false;
            $scope.statusPackage = [
                {
                    bool: true,
                    title: $filter('translate')('BUY_SELL_OFFER.PREMIUM.MIN')
                }, {
                    bool: false,
                    title: $filter('translate')('BUY_SELL_OFFER.STANDARD.MIN')
                }
            ];
            $scope.currencyOfferBuy = [];
            $scope.currencyOfferSell = [];
            if ($rootScope.safes.length) {
                if (angular.isDefined($rootScope.recommendWalletId)) {
                    angular.forEach($rootScope.safes, function (item) {
                        if (item.wallet_id === $rootScope.recommendWalletId) {
                            $scope.offer.wallet_id = $rootScope.recommendWalletId;
                        }
                    });
                } else {
                    var localSafes1 = $filter('orderBy')($rootScope.safes, 'balance', true);
                    $scope.offer.wallet_id = localSafes1[0].wallet_id;
                }
            }
            $scope.categories = angular.copy(market.categories);
            $scope.contacts = market.contacts;
            $scope.subcategories = [[], []];
            $scope.subcategoriesTitle = ['', ''];
            if ($scope.isEdit === false) {
                if (_type_) {
                    $scope.offer.offer_type = _type_;
                } else {
                    $scope.offer.offer_type = 0;
                }
            }

            if ($scope.offer.offer_type === 0 || $scope.offer.offer_type === 1) {
                $scope.offer.currency = $scope.currenciesWithMoney[0].code;
            }

            $scope.$on('modal.closing', function (event, needClean) {
                if (!offer) {
                    if (needClean === true) {
                        cancelingCreate.savedOffer = null;
                    } else {
                        $timeout(function () {
                            cancelingCreate.savedOffer = angular.copy($scope.offer);
                        }, 500);
                    }
                }
            });
            $scope.isExistsWay = function (type) {
                var deliveryWay = $filter('filter')($scope.offer.deal_details, {type: type});
                if (angular.isDefined(deliveryWay) && deliveryWay.length) {
                    return $scope.offer.deal_details.indexOf(deliveryWay[0]);
                } else {
                    return false;
                }
            };
            $scope.isExistsType = function (type) {
                var paymentType = $filter('filter')($scope.offer.payment_types, {type: type});
                if (angular.isDefined(paymentType) && paymentType.length) {
                    return $scope.offer.payment_types.indexOf(paymentType[0]);
                } else {
                    return false;
                }
            };

            $scope.onChangeOfferType = function () {
                if (($scope.offer.offer_type === 0 || $scope.offer.offer_type === 1) && $scope.newOfferType === 2 && !oldOffer) {
                    $scope.newOfferType = 1;

                    $scope.$broadcast('angucomplete-alt:clearInput', 'countryInput');
                    $scope.$broadcast('angucomplete-alt:clearInput', 'cityInput');

                    $scope.offer.expiration_time = $scope.intervals[13];
                    $scope.offer.is_standard = false;
                    $scope.offer.is_premium = true;
                    $scope.offer.fee_premium = CONFIG.premiumFee;
                    $scope.offer.fee_standard = CONFIG.standardFee;
                    $scope.offer.location_country = '';
                    $scope.offer.location_city = '';
                    $scope.offer.contacts = [];
                    $scope.offer.deal_details = [];
                    $scope.offer.comment = '';
                    $scope.offer.bonus = '';
                    $scope.offer.initial_country = '';
                    $scope.offer.show_way_selector = true;
                    $scope.offer.show_contact_selector = true;
                    $scope.offer.categories = [];
                    $scope.offer.category = '';
                    $scope.offer.currency = $scope.currenciesWithMoney[0].code;
                    $scope.offer.payment_types = [];
                    $scope.offer.show_type_selector = true;
                    delete $scope.offer.amount_p;
                    delete $scope.offer.amount_etc;
                    delete $scope.offer.rate;
                    $scope.disabledPaymentType = {
                        'BTX': false,
                        'BCX': false,
                        'CSH': false,
                        'EPS': false
                    };
                    $scope.modalOfferForm.$submitted = false;
                    $scope.countryCheckboxAll = false;
                }
                if (($scope.offer.offer_type === 2 || $scope.offer.offer_type === 3) && $scope.newOfferType === 1 && !oldOffer) {
                    $scope.newOfferType = 2;

                    $scope.$broadcast('angucomplete-alt:clearInput', 'countryInput');
                    $scope.$broadcast('angucomplete-alt:clearInput', 'cityInput');

                    $scope.offer.expiration_time = $scope.intervals[13];
                    $scope.offer.is_standard = false;
                    $scope.offer.is_premium = true;
                    $scope.offer.fee_premium = CONFIG.premiumFee;
                    $scope.offer.fee_standard = CONFIG.standardFee;
                    $scope.offer.location_country = '';
                    $scope.offer.location_city = '';
                    $scope.offer.contacts = [];
                    $scope.offer.deal_details = [];
                    $scope.offer.comment = '';
                    $scope.offer.bonus = '';
                    $scope.offer.initial_country = '';
                    $scope.offer.show_way_selector = true;
                    $scope.offer.show_contact_selector = true;
                    $scope.offer.categories = [];
                    $scope.offer.category = '';
                    $scope.offer.currency = $scope.currencies[0].code;
                    $scope.offer.payment_types = [];
                    $scope.offer.show_type_selector = true;
                    delete $scope.offer.amount_p;
                    delete $scope.offer.amount_etc;
                    delete $scope.offer.rate;

                    $scope.disabledDeals = {
                        'HANDS': false,
                        'STORAGE': false
                    };
                    $scope.modalOfferForm.$submitted = false;
                    $scope.countryCheckboxAll = false;
                }
                checkDisabledContacts();
            };

            $scope.recalcOffers = function () {
                if (($scope.offer.offer_type === 0 || $scope.offer.offer_type === 1) && $scope.offer.currency === $rootScope.currencySymbol) {
                    if (angular.isDefined($scope.offer.amount_p)) $scope.offer.amount_p = $rootScope.cutLastZeros($scope.offer.amount_p);
                }
                var params = {
                    order_by: 0,
                    reverse: true,
                    offset: 0,
                    limit: 50
                };

                if ($scope.newOfferType === 1) {
                    if ($scope.offer.offer_type === 0) {
                        params.offer_type_mask = 1;
                    }
                    if ($scope.offer.offer_type === 1) {
                        params.offer_type_mask = 2;
                    }
                    if (angular.isDefined($scope.offer.categories) && $scope.offer.categories[$scope.offer.categories.length - 1] !== 'ROOT') {
                        params.category = $scope.offer.categories[$scope.offer.categories.length - 1];
                    }
                    if (angular.isDefined($scope.offer.amount_p)) {
                        params.amount_up_limit = parseInt($filter('moneyToInt')($scope.offer.amount_p));
                    }
                    if (angular.isDefined($scope.offer.location_country) && $scope.offer.location_country.length) {
                        params.location_country = $scope.offer.location_country;
                    }
                    if (angular.isDefined($scope.offer.location_city) && $scope.offer.location_city.length) {
                        params.location_city = $scope.offer.location_city;
                    }
                    if (angular.isDefined($scope.offer.currency)) {
                        params.primary = $scope.offer.currency;
                    }
                    backend.getOffers(params, function (status, data) {
                        $scope.$apply(function () {
                            var loadedOffers = (status && 'offers' in data) ? data.offers : [];
                            $scope.buySellCount = loadedOffers.length;
                        });
                    });
                } else {
                    if ($scope.offer.offer_type === 2) {
                        params.offer_type_mask = 4;
                    }
                    if ($scope.offer.offer_type === 3) {
                        params.offer_type_mask = 8;
                    }
                    if (angular.isDefined($scope.offer.currency) && $scope.offer.currency.length) {
                        params.target = $scope.offer.currency;
                    }
                    if (angular.isDefined($scope.offer.payment_types) && $scope.offer.payment_types.length) {
                        var localPaymentTypes = [];
                        for (var i = 0; i < $scope.offer.payment_types.length; i++) {
                            if (localPaymentTypes.indexOf($scope.offer.payment_types[i].type) === -1) {
                                localPaymentTypes.push($scope.offer.payment_types[i].type);
                            }
                        }
                        params.payment_types = localPaymentTypes;
                    }
                    if (angular.isDefined($scope.offer.amount_p)) {
                        params.amount_up_limit = parseInt($filter('moneyToInt')($scope.offer.amount_p));
                    }
                    if (angular.isDefined($scope.offer.rate)) {
                        params.rate_up_limit = parseFloat($scope.offer.rate).toFixed(8);
                    }
                    if (angular.isDefined($scope.offer.location_country) && $scope.offer.location_country.length) {
                        params.location_country = $scope.offer.location_country;
                    }
                    if (angular.isDefined($scope.offer.location_city) && $scope.offer.location_city.length) {
                        params.location_city = $scope.offer.location_city;
                    }
                    backend.getOffers(params, function (status, data) {
                        $scope.$apply(function () {
                            var loadedOffers = (status && 'offers' in data) ? data.offers : [];
                            $scope.buySellCount = loadedOffers.length;
                        });
                    });
                }
            };
            var checkDisabledDeals = function () {
                angular.forEach(['HANDS', 'STORAGE'], function (val) {
                    $scope.disabledDeals[val] = !($scope.isExistsWay(val) === false);
                });
                $timeout(function () {
                    $('#SelectPickerDeals').selectpicker('refresh');
                    $('.SelectPickerDealsEdit').selectpicker('refresh');
                });
            };
            var checkDisabledContacts = function () {
                var contactFilter = $filter('filter')($scope.offer.contacts, {type: 'EMAIL'});
                $scope.disabledContacts['EMAIL'] = !(angular.isDefined(contactFilter) && contactFilter.length < 8);

                contactFilter = $filter('filter')($scope.offer.contacts, {type: 'PHONE'});
                $scope.disabledContacts['PHONE'] = !(angular.isDefined(contactFilter) && contactFilter.length < 8);

                contactFilter = $filter('filter')($scope.offer.contacts, {type: 'IMS'});
                $scope.disabledContacts['IMS'] = !(angular.isDefined(contactFilter) && contactFilter.length < 8);

                $timeout(function () {
                    $('#SelectPickerContacts').selectpicker('refresh');
                });
            };
            var checkDisabledPaymentType = function () {
                var contactFilter = $filter('filter')($scope.offer.payment_types, {type: 'EPS'});
                $scope.disabledPaymentType['EPS'] = !(angular.isDefined(contactFilter) && contactFilter.length < 10);
                angular.forEach(['BTX', 'BCX', 'CSH'], function (val) {
                    $scope.disabledPaymentType[val] = !($scope.isExistsType(val) === false);
                });
                $timeout(function () {
                    $('#SelectPickerPaymentType').selectpicker('refresh');
                    $('.SelectPickerPaymentTypeEdit').selectpicker('refresh');
                });
            };
            $scope.setSubCategory = function (index) {
                if (index === 0) {
                    angular.forEach($scope.categories, function (category) {
                        if (category.id === $scope.offer.categories[0]) {
                            if (angular.isDefined(category.subcategories)) {
                                $scope.subcategories[0] = category.subcategories;
                                $scope.subcategories[1] = [];
                            } else {
                                $scope.subcategories = [[], []];
                            }
                            $scope.subcategoriesTitle[0] = category.title;
                            $scope.offer.categories = $scope.offer.categories.slice(0, 1);
                        }
                    });
                } else if (index === 1) {
                    angular.forEach($scope.categories, function (category) {
                        if (category.id === $scope.offer.categories[0]) {
                            if (angular.isDefined(category.subcategories)) {
                                angular.forEach(category.subcategories, function (subcategory) {
                                    if (subcategory.id === $scope.offer.categories[1]) {
                                        if (angular.isDefined(subcategory.subcategories)) {
                                            $scope.subcategories[1] = subcategory.subcategories;
                                        } else {
                                            $scope.subcategories[1] = [];
                                        }
                                        $scope.subcategoriesTitle[1] = subcategory.title;
                                        $scope.offer.categories = $scope.offer.categories.slice(0, 2);
                                    }
                                });
                            } else {
                                $scope.offer.categories = $scope.offer.categories.slice(0, 1);
                                $scope.subcategories = [[], []];
                            }
                            $scope.subcategoriesTitle[0] = category.title;
                        }
                    });
                } else if (index === 'set') {
                    angular.forEach($scope.categories, function (category) {
                        if (category.id === $scope.offer.categories[0]) {
                            if (angular.isDefined(category.subcategories)) {
                                $scope.subcategories[0] = category.subcategories;

                                angular.forEach(category.subcategories, function (subcategory) {
                                    if (subcategory.id === $scope.offer.categories[1]) {
                                        if (angular.isDefined(subcategory.subcategories)) {
                                            $scope.subcategories[1] = subcategory.subcategories;
                                        } else {
                                            $scope.subcategories[1] = [];
                                        }
                                        $scope.subcategoriesTitle[1] = subcategory.title;
                                    }
                                });
                            } else {
                                $scope.subcategories = [[], []];
                            }
                            $scope.subcategoriesTitle[0] = category.title;
                        }
                    });
                }
            };

            $scope.recount = function (type) {
                $timeout(function () {
                    switch (type) {
                        case 'primary':
                            if (toInt($scope.offer.amount_p) && toInt($scope.offer.amount_etc)) {
                                $scope.offer.rate = $rootScope.cutLastZeros($rootScope.convertFloatSToIntS($scope.offer.amount_etc) / $rootScope.convertFloatSToIntS($scope.offer.amount_p));
                            } else if (toInt($scope.offer.rate)) {
                                $scope.offer.amount_etc = $rootScope.cutLastZeros($scope.offer.amount_p * $scope.offer.rate);
                            }
                            break;
                        case 'target':
                            if (toInt($scope.offer.amount_etc) && toInt($scope.offer.amount_p)) {
                                $scope.offer.rate = $rootScope.cutLastZeros($rootScope.convertFloatSToIntS($scope.offer.amount_etc) / $rootScope.convertFloatSToIntS($scope.offer.amount_p));
                            } else if (toInt($scope.offer.amount_etc) && toInt($scope.offer.rate)) {
                                $scope.offer.amount_p = $rootScope.cutLastZeros($scope.offer.amount_etc / $scope.offer.rate);
                            }
                            break;
                        case 'rate':
                            if (toInt($scope.offer.rate) && toInt($scope.offer.amount_p)) {
                                $scope.offer.amount_etc = $rootScope.cutLastZeros($scope.offer.rate * $scope.offer.amount_p);
                            } else if (toInt($scope.offer.rate) && toInt($scope.offer.amount_etc)) {
                                $scope.offer.amount_p = $rootScope.cutLastZeros($scope.offer.amount_etc / $scope.offer.rate);
                            }
                            break;
                    }
                    $scope.recalcOffers();
                });
            };
            var oldOffer = false;
            $scope.isOldOffer = false;
            if (offer) {
                if (offer.ot === 0 || offer.ot === 1) {
                    $scope.offer = market.offerPrepareForForm(offer);
                    if ($scope.offer.location_country === '') {
                        $scope.countryCheckboxDoNot = true;
                        $scope.countryCheckboxAll = false;
                    } else if ($scope.offer.location_country === '000All') {
                        $scope.countryCheckboxDoNot = false;
                        $scope.countryCheckboxAll = true;
                    }

                    oldOffer = angular.copy($scope.offer);
                    if (oldOffer) {
                        $scope.isOldOffer = true;
                        $scope.newOfferType = 1;
                        oldOffer.fee_original = oldOffer.fee;
                    }

                    checkDisabledDeals();
                    checkDisabledContacts();
                    $scope.setSubCategory('set');

                    $scope.isEdit = true;
                } else {
                    $scope.offer = market.gOfferPrepareForForm(offer);
                    if ($scope.offer.location_country === '') {
                        $scope.countryCheckboxDoNot = true;
                        $scope.countryCheckboxAll = false;
                    } else if ($scope.offer.location_country === '000All') {
                        $scope.countryCheckboxDoNot = false;
                        $scope.countryCheckboxAll = true;
                    }
                    $scope.recount('target');
                    oldOffer = angular.copy($scope.offer);
                    if (oldOffer) {
                        $scope.isOldOffer = true;
                        $scope.newOfferType = 2;
                        oldOffer.fee_original = oldOffer.fee;
                    }
                    checkDisabledPaymentType();
                    checkDisabledContacts();
                    $scope.isEdit = true;
                }
            }

            if (cancelingCreate.savedOffer != null && !offer) {
                if ((cancelingCreate.savedOffer.offer_type === 0 || cancelingCreate.savedOffer.offer_type === 1) && ($scope.offer.offer_type === 0 || $scope.offer.offer_type === 1) ||
                    (cancelingCreate.savedOffer.offer_type === 2 || cancelingCreate.savedOffer.offer_type === 3) && ($scope.offer.offer_type === 2 || $scope.offer.offer_type === 3)
                ) {
                    $scope.offer = cancelingCreate.savedOffer;

                    if (angular.isDefined($scope.offer.wallet_id)) {
                        var isExist = false;
                        angular.forEach($rootScope.safes, function (item) {
                            if (item.wallet_id === $scope.offer.wallet_id) {
                                isExist = true;
                            }
                        });
                        if (!isExist) {
                            var localSafes = $filter('orderBy')($rootScope.safes, 'balance', true);
                            $scope.offer.wallet_id = localSafes[0].wallet_id;
                        }
                    }

                    if ($scope.offer.location_country === '000All' || $scope.offer.location_country === '') {
                        $scope.offer.initial_country = '';
                    } else {
                        var country = $filter('filter')($rootScope.countryList, {alpha2Code: $scope.offer.location_country});
                        if (country.length) {
                            country = country[0];
                            $scope.offer.initial_country = country.name;
                        }
                    }
                    if ($scope.offer.offer_type === 0 || $scope.offer.offer_type === 1) {
                        $scope.newOfferType = 1;
                        if ($scope.offer.location_country === '') {
                            $scope.countryCheckboxDoNot = true;
                            $scope.countryCheckboxAll = false;
                        } else if ($scope.offer.location_country === '000All') {
                            $scope.countryCheckboxDoNot = false;
                            $scope.countryCheckboxAll = true;
                        }
                        checkDisabledDeals();
                        checkDisabledContacts();
                        $scope.setSubCategory('set');
                    } else {
                        $scope.newOfferType = 2;
                        if ($scope.offer.location_country === '') {
                            $scope.countryCheckboxDoNot = true;
                            $scope.countryCheckboxAll = false;
                        } else if ($scope.offer.location_country === '000All') {
                            $scope.countryCheckboxDoNot = false;
                            $scope.countryCheckboxAll = true;
                        }
                        $scope.recount('target');
                        checkDisabledPaymentType();
                        checkDisabledContacts();
                    }
                }
            }

            var watchDealDetails = $scope.$watch(
                function () {
                    return $scope.offer.deal_details;
                },
                function (newV, oldV) {
                    if (angular.isDefined($scope.dealDetails) && angular.isDefined(newV) && angular.isDefined(oldV)) {

                        var pos1 = newV.indexOf($scope.dealDetails[0].key);
                        var pos2 = newV.indexOf($scope.dealDetails[1].key);
                        var pos3 = newV.indexOf($scope.dealDetails[2].key);
                        var pos4 = newV.indexOf($scope.dealDetails[3].key);

                        var pos1Old = oldV.indexOf($scope.dealDetails[0].key);
                        var pos3Old = oldV.indexOf($scope.dealDetails[2].key);

                        $timeout(function () {
                            if (pos1 > -1 && pos2 > -1) {
                                if (pos1Old > -1) {
                                    $scope.offer.deal_details.splice(pos1, 1);
                                } else {
                                    $scope.offer.deal_details.splice(pos2, 1);
                                }
                            }
                            if (pos3 > -1 && pos4 > -1) {
                                if (pos3Old > -1) {
                                    $scope.offer.deal_details.splice(pos3, 1);
                                } else {
                                    $scope.offer.deal_details.splice(pos4, 1);
                                }
                            }
                        });
                    }
                }
            );

            $scope.getPaymentsRequired = function () {
                var contactList = $filter('filter')($scope.offer.payment_types, {is_edit: false});
                return !(angular.isDefined(contactList) && contactList.length);
            };
            $scope.pushPaymentType = function (type) {
                var id = uuid.generate();
                var paymentType = {
                    id: id,
                    type: type,
                    new_type: type,
                    is_edit: (type === 'EPS'),
                    name: ''
                };
                var contactFilter = $filter('filter')($scope.offer.payment_types, {type: 'EPS'});
                if ($scope.isExistsType(type) === false || ($scope.isEPS(paymentType) && angular.isDefined(contactFilter) && contactFilter.length < 10)) {
                    if (!Array.isArray($scope.offer.payment_types)) $scope.offer.payment_types = [];
                    $scope.offer.payment_types.push(paymentType);
                    $scope.recalcOffers();
                }
                checkDisabledPaymentType();
                $timeout(function () {
                    $scope.page.paymentType = '';
                    $scope.offer.show_type_selector = false;
                });
            };
            $scope.isEPS = function (paymentType) {
                return paymentType.type === 'EPS';
            };
            $scope.removePaymentType = function (id) {
                var paymentType = $filter('filter')($scope.offer.payment_types, {id: id});
                if (angular.isDefined(paymentType) && paymentType.length) {
                    var index = $scope.offer.payment_types.indexOf(paymentType[0]);
                    $scope.offer.payment_types.splice(index, 1);
                    $scope.recalcOffers();
                    checkDisabledPaymentType();
                }
            };
            $scope.editPaymentType = function (paymentType) {
                if (paymentType.type === paymentType.new_type) {
                    paymentType.is_edit = false;
                    return;
                }
                if (Object.keys($scope.paymentTypes).indexOf(paymentType.new_type) > -1) {
                    if ($scope.isExistsType(paymentType.new_type) === false || paymentType.new_type === 'EPS') {
                        paymentType.name = '';
                        paymentType.type = paymentType.new_type;
                        paymentType.is_edit = (paymentType.new_type === 'EPS');
                    } else {
                        paymentType.new_type = paymentType.type;
                    }
                } else {
                    paymentType.new_type = paymentType.type;
                }
                checkDisabledPaymentType();
            };
            $scope.blurInputByName = function (item) {
                if ($(event.target).hasClass('doNotDoBlur')) return true;
                if (item.type === 'EMAIL') {
                    if (validateEmail(item.name)) {
                        if (angular.isDefined(item.valid)) {
                            delete item.valid;
                        }
                        return false;
                    } else {
                        item.valid = false;
                        return true;
                    }
                } else {
                    return (item.name === '');
                }
            };
            $scope.getDealsRequired = function () {
                if ($scope.offer.offer_type === 0 || $scope.offer.offer_type === 1) {
                    var dealList = $filter('filter')($scope.offer.deal_details, {is_edit: false});
                    return !(angular.isDefined(dealList) && dealList.length);
                } else {
                    return !(angular.isDefined($scope.offer.deal_details) && $scope.offer.deal_details.length);
                }
            };
            $scope.blurIMS = function (item) {
                if ($(event.target).hasClass('doNotDoBlur')) return true;
                return !(item.name !== '' && item.username !== '');
            };
            $scope.removeContact = function (id) {
                var contact = $filter('filter')($scope.offer.contacts, {id: id});
                if (angular.isDefined(contact) && contact.length) {
                    var index = $scope.offer.contacts.indexOf(contact[0]);
                    $scope.offer.contacts.splice(index, 1);
                    checkDisabledContacts();
                }
            };
            $scope.pushContact = function (contactType) {
                var id = uuid.generate();
                var contact = {
                    id: id,
                    type: contactType,
                    new_type: contactType,
                    is_edit: true,
                    name: '',
                    username: ''
                };
                var contactFilter = $filter('filter')($scope.offer.contacts, {type: contactType});
                if (angular.isDefined(contactFilter) && contactFilter.length < 8) {
                    if (!Array.isArray($scope.offer.contacts)) $scope.offer.contacts = [];
                    $scope.offer.contacts.push(contact);
                }
                checkDisabledContacts();
                $timeout(function () {
                    $scope.page.contact = '';
                    $scope.offer.show_contact_selector = false;
                });
            };
            $scope.editWay = function (deliveryWay) {
                if (deliveryWay.type === deliveryWay.new_type) {
                    deliveryWay.is_edit = false;
                    return;
                }
                if (Object.keys($scope.deliveryWays).indexOf(deliveryWay.new_type) > -1) {
                    if ($scope.isExistsWay(deliveryWay.new_type) === false || deliveryWay.new_type === 'DELIVERY') {
                        deliveryWay.name = '';
                        deliveryWay.type = deliveryWay.new_type;
                        deliveryWay.is_edit = deliveryWay.new_type === 'DELIVERY';
                    } else {
                        deliveryWay.new_type = deliveryWay.type;
                    }
                } else {
                    deliveryWay.new_type = deliveryWay.type;
                }
                checkDisabledDeals();
            };
            $scope.removeWay = function (id) {
                var deliveryWay = $filter('filter')($scope.offer.deal_details, {id: id});
                if (angular.isDefined(deliveryWay) && deliveryWay.length) {
                    var index = $scope.offer.deal_details.indexOf(deliveryWay[0]);
                    $scope.offer.deal_details.splice(index, 1);
                    checkDisabledDeals();
                }
            };
            $scope.pushDeliveryWay = function (type) {
                var id = uuid.generate();
                var deliveryWay = {
                    id: id,
                    type: type,
                    new_type: type,
                    is_edit: type === 'DELIVERY',
                    name: ''
                };
                if ($scope.isExistsWay(type) === false || type === 'DELIVERY') {
                    if (!Array.isArray($scope.offer.deal_details)) $scope.offer.deal_details = [];
                    $scope.offer.deal_details.push(deliveryWay);
                }
                checkDisabledDeals();
                $timeout(function () {
                    $scope.page.deliveryWay = '';
                    $scope.offer.show_way_selector = false;
                });
            };
            $scope.close = function (needClean) {
                $uibModalInstance.close(needClean);
            };
            $scope.changeCountryVisibleAll = function () {
                if ($scope.countryCheckboxAll) {
                    $scope.offer.location_country = '000All';
                    $scope.offer.location_city = '';
                    $scope.offer.initial_country = '';
                    $scope.$broadcast('angucomplete-alt:clearInput', 'countryInput');
                } else {
                    $scope.offer.location_country = '';
                }
                $scope.countryCheckboxDoNot = false;
                $scope.recalcOffers();
            };
            $scope.focusOutCountry = function () {
                var localCountry = '';
                for (var i = 0; i < $rootScope.countryList.length; i++) {
                    if ($rootScope.countryList[i].alpha2Code === $scope.offer.location_country) {
                        localCountry = $rootScope.countryList[i].name;
                        break;
                    }
                }
                var countryInput = $('#countryInput_value');
                if (countryInput.val() !== localCountry || countryInput.val() === '') {
                    $scope.$broadcast('angucomplete-alt:clearInput', 'countryInput');
                    $scope.offer.location_country = '';
                    $scope.offer.location_city = '';
                    $scope.recalcOffers();
                }
            };
            $scope.selectedCountry = function (obj) {
                if (angular.isDefined(obj)) {
                    var o = obj.originalObject;
                    $scope.offer.location_country = o.alpha2Code;
                    $scope.offer.location_city = '';
                    $scope.recalcOffers();
                }
            };
            $scope.changeCountryInput = function (str) {
                if (str === '') {
                    $scope.offer.location_country = '';
                    $scope.recalcOffers();
                }
            };
            $scope.setValuesForSafeChange = function (recommendWalletId) {
                $rootScope.recommendWalletId = recommendWalletId;
                $scope.balanceError = false;
            };
            $scope.changeStatusPackage = function () {
                $scope.balanceError = false;
                $scope.offer.is_standard = !($scope.offer.is_premium);
            };
            $scope.refreshKotTables = function () {
                if (angular.isDefined($scope.offer.currency) && $scope.offer.currency.length) {
                    var params = {
                        offer_type_mask: 4,
                        order_by: 0,
                        target: $scope.offer.currency,
                        reverse: true,
                        offset: 0,
                        limit: 15,
                        bonus: false
                    };
                    backend.getOffers(params, function (status, data) {
                        $scope.$apply(function () {
                            $scope.currencyOfferBuy = (status && 'offers' in data) ? data.offers : [];
                        });
                    });

                    params = {
                        offer_type_mask: 8,
                        order_by: 0,
                        target: $scope.offer.currency,
                        reverse: true,
                        offset: 0,
                        limit: 15,
                        bonus: false
                    };
                    backend.getOffers(params, function (status, data) {
                        $scope.$apply(function () {
                            $scope.currencyOfferSell = (status && 'offers' in data) ? data.offers : [];
                        });
                    });
                }
            };
            $scope.refreshKotTables();
            $scope.agreementChange = function () {
                $scope.errorAgreement = false;
            };

            var marketOfferConfirmOpened = false;
            $scope.confirmOffer = function (offer) {
                $scope.balanceError = false;
                $scope.balanceErrorSync = false;
                angular.forEach($scope.safes, function (item) {
                    if (!$scope.balanceError) {
                        if (item.wallet_id === offer.wallet_id) {
                            if (offer.is_premium && item.unlocked_balance < $filter('moneyToInt')(offer.fee_premium)) {
                                $scope.balanceError = true;
                            } else if (offer.is_standard && item.unlocked_balance < $filter('moneyToInt')(offer.fee_standard)) {
                                $scope.balanceError = true;
                            } else if (item.unlocked_balance === 0) {
                                $scope.balanceError = true;
                            } else if (!item.loaded) {
                                $scope.balanceErrorSync = true;
                            }
                        }
                    }
                });

                if (offer.is_standard && $filter('moneyToInt')(offer.fee_standard) < $filter('moneyToInt')(CONFIG.standardFee)) return;
                if (!$scope.modalOfferForm.$valid || $scope.balanceError || $scope.balanceErrorSync) return;
                if ((offer.offer_type === 2 || offer.offer_type === 3) && (parseFloat(offer.amount_etc) === 0 || parseFloat(offer.amount_p) === 0)) return;

                if (offer.ot !== 1 && offer.ot !== 3) {
                    offer.b = '';
                }

                var newOffer = angular.copy(offer);

                if (!$scope.agreement && ($scope.offer.offer_type === 0 || $scope.offer.offer_type === 1)) {
                    $scope.errorAgreement = true;
                    return;
                }

                if (offer.contacts.length === 0) return;
                if (($filter('filter')(offer.contacts, {is_edit: true})).length) return;

                var newPayments = [];
                angular.forEach(newOffer.payment_types, function (item) {
                    if (item.is_edit === false) newPayments.push(item);
                });
                newOffer.payment_types = newPayments;

                $scope.modalOfferForm.$submitted = false;

                var windowClass = 'modal-confirm-operation';
                if (oldOffer) {
                    windowClass = 'modal-confirm-operation-edited';
                }

                angular.element('.modal-create-offer').addClass('modalTopClassBackground');

                if (marketOfferConfirmOpened) return;
                marketOfferConfirmOpened = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper ' + windowClass + ' base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/marketOfferConfirm.html',
                    controller: 'offerNewConfirmCtrl',
                    resolve: {
                        offer: function () {
                            return newOffer;
                        },
                        oldOffer: function () {
                            return oldOffer;
                        },
                        parentModal: function () {
                            return $scope.close;
                        }
                    }
                }).result.then(function () {
                    angular.element('.modal-create-offer').removeClass('modalTopClassBackground');
                    marketOfferConfirmOpened = false;
                }, function () {
                    angular.element('.modal-create-offer').removeClass('modalTopClassBackground');
                    marketOfferConfirmOpened = false;
                });
            };

            $scope.sendFilteredList = function () {
                var i;
                if ($scope.newOfferType === 1) {
                    showHideTabs.market.goodsFilter = true;
                    market.goodsFilter.clear = true;
                    market.goodsFilter.order_by = 0;
                    market.goodsFilter.order_reverse = true;
                    market.goodsFilter.offset = 0;
                    market.goodsFilter.limit = 10;
                    market.goodsFilter.category = 'ALL';
                    market.goodsFilter.location_country = '';
                    market.goodsFilter.location_city = '';
                    market.goodsFilter.payment_types = [];
                    market.goodsFilter.date_from = '';
                    market.goodsFilter.date_to = '';
                    market.goodsFilter.price_from = '';
                    market.goodsFilter.price_to = '';
                    market.goodsFilter.currency = 'all_cur';
                    market.goodsFilter.country_name = '';
                    market.goodsFilter.find_in_names = false;
                    market.goodsFilter.countryAll = false;
                } else {
                    showHideTabs.market.currencyFilter = true;
                    market.currencyFilter.offer_type_mask = 12;
                    market.currencyFilter.currency = 'all_cur';
                    market.currencyFilter.amount_from = '';
                    market.currencyFilter.amount_to = '';
                    market.currencyFilter.rate_from = '';
                    market.currencyFilter.rate_to = '';
                    market.currencyFilter.keywords = '';
                    market.currencyFilter.country_name = '';
                    market.currencyFilter.interval = -1;
                    market.currencyFilter.order_by = 0;
                    market.currencyFilter.clear = true;
                    market.currencyFilter.order_reverse = true;
                    market.currencyFilter.offset = 0;
                    market.currencyFilter.limit = 10;
                    market.currencyFilter.location_country = '';
                    market.currencyFilter.location_city = '';
                    market.currencyFilter.payment_types = [];
                    market.currencyFilter.date_from = '';
                    market.currencyFilter.date_to = '';
                    market.currencyFilter.countryAll = false;
                }

                if ($scope.offer.offer_type === 0) {
                    market.goodsFilter.offer_type_mask = 1;
                }
                if ($scope.offer.offer_type === 1) {
                    market.goodsFilter.offer_type_mask = 2;
                }
                if ($scope.offer.offer_type === 2) {
                    market.currencyFilter.offer_type_mask = 4;
                }
                if ($scope.offer.offer_type === 3) {
                    market.currencyFilter.offer_type_mask = 8;
                }
                if (angular.isDefined($scope.offer.categories) && $scope.offer.categories.length) {
                    market.goodsFilter.category = $scope.offer.categories[$scope.offer.categories.length - 1];
                }
                if (angular.isDefined($scope.offer.amount_p)) {
                    if ($scope.newOfferType === 1) {
                        market.goodsFilter.price_to = $scope.offer.amount_p;
                    } else {
                        market.currencyFilter.amount_to = $scope.offer.amount_p;
                    }
                }
                if (angular.isDefined($scope.offer.location_country) && $scope.offer.location_country.length && $scope.offer.location_country !== '000All') {
                    if ($scope.newOfferType === 1) {
                        market.goodsFilter.location_country = $scope.offer.location_country;
                        for (i = 0; i < $rootScope.countryList.length; i++) {
                            if ($rootScope.countryList[i].alpha2Code === $scope.offer.location_country) {
                                market.goodsFilter.country_name = $rootScope.countryList[i].name;
                                break;
                            }
                        }
                    } else {
                        market.currencyFilter.location_country = $scope.offer.location_country;
                        for (i = 0; i < $rootScope.countryList.length; i++) {
                            if ($rootScope.countryList[i].alpha2Code === $scope.offer.location_country) {
                                market.currencyFilter.country_name = $rootScope.countryList[i].name;
                                break;
                            }
                        }
                    }
                } else if ($scope.offer.location_country === '000All') {
                    if ($scope.newOfferType === 1) {
                        market.goodsFilter.countryAll = true;
                        market.goodsFilter.location_country = '000All';
                    } else {
                        market.currencyFilter.countryAll = true;
                        market.currencyFilter.location_country = '000All';
                    }
                }
                if (angular.isDefined($scope.offer.location_city) && $scope.offer.location_city.length) {
                    if ($scope.newOfferType === 1) {
                        market.goodsFilter.location_city = $scope.offer.location_city;
                    } else {
                        market.currencyFilter.location_city = $scope.offer.location_city;
                    }
                }
                if (angular.isDefined($scope.offer.currency) && $scope.offer.currency.length) {
                    if ($scope.newOfferType === 1) {
                        market.goodsFilter.currency = $scope.offer.currency;
                    } else {
                        market.currencyFilter.currency = $scope.offer.currency;
                    }
                }
                if (angular.isDefined($scope.offer.payment_types) && $scope.offer.payment_types.length) {
                    var localPaymentTypes = [];
                    for (i = 0; i < $scope.offer.payment_types.length; i++) {
                        if (localPaymentTypes.indexOf($scope.offer.payment_types[i].type) === -1) {
                            localPaymentTypes.push($scope.offer.payment_types[i].type);
                        }
                    }
                    market.currencyFilter.payment_types = localPaymentTypes;
                }
                if (angular.isDefined($scope.offer.rate)) {
                    market.currencyFilter.rate_to = parseFloat($scope.offer.rate);
                }

                $scope.close();

                if ($scope.newOfferType === 1) {
                    if ($location.path() === '/market/goods') {
                        $route.reload();
                    } else {
                        $location.path('/market/goods');
                    }
                } else {
                    if ($location.path() === '/market/currency') {
                        $route.reload();
                    } else {
                        $location.path('/market/currency');
                    }
                }
            };
            $scope.recalcOffers();

            $scope.$on('$destroy', function () {
                broadHistory();
                broadSafes();
                watchDealDetails();
            });

        }
    ]);

    module.controller('offerNewConfirmCtrl', ['$scope', 'backend', '$uibModalInstance', 'informer', '$rootScope', 'offer', 'parentModal', 'market', 'oldOffer', '$filter',
        function ($scope, backend, $uibModalInstance, informer, $rootScope, offer, parentModal, market, oldOffer, $filter) {

            offer.fee = offer.is_premium ? offer.fee_premium : offer.fee_standard;
            if (oldOffer !== false) {
                oldOffer.fee = $rootScope.moneyParse(oldOffer.fee_original, false);
            }
            $scope.offer = offer;

            $scope.oldOffer = oldOffer;
            $scope.paymentTypes = market.paymentTypes;
            $scope.dealDetails = market.dealDetails;
            $scope.deliveryWays = market.deliveryWays;
            $scope.categories = market.categories;

            $scope.appPass = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.confirm = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.appPass, confirmSend);
            };

            $scope.sendingOffer = false;

            var confirmSend = function () {
                var o, safe;
                if (offer.offer_type === 0 || offer.offer_type === 1) {
                    o = market.offerPrepareForSave(offer);
                    o.category = o.category || '';
                    if (offer.tx_hash) {
                        safe = $filter('filter')($rootScope.safes, offer.tx_hash);
                        if (safe.length) {
                            if ($scope.sendingOffer) return;
                            $scope.sendingOffer = true;
                            if ($scope.needPass) $scope.$digest();
                            backend.pushUpdateOffer(
                                safe[0].wallet_id, offer.tx_hash, o.offer_type, o.amount_p, o.target, o.location_city, o.location_country, o.contacts,
                                o.comment, o.expiration_time, o.fee, o.amount_etc, o.payment_types, o.bonus, o.deal_details, o.category, o.currency, function (s) {
                                    $scope.sendingOffer = false;
                                    $scope.$digest();
                                    if (s) {
                                        $rootScope.editedOffers.push(offer.tx_hash);
                                        informer.success('INFORMER.REQUEST');
                                        parentModal(true);
                                        $uibModalInstance.close();
                                    }
                                }
                            );
                        } else {
                            informer.error('INFORMER.NOT_FIND_SAFE');
                        }
                    } else {
                        if ($scope.sendingOffer) return;
                        $scope.sendingOffer = true;
                        if ($scope.needPass) $scope.$digest();
                        backend.pushOffer(
                            o.wallet_id, o.offer_type, o.amount_p, o.target, o.location_city, o.location_country, o.contacts,
                            o.comment, o.expiration_time, o.fee, o.amount_etc, o.payment_types, o.bonus, o.deal_details, o.category, o.currency, function (s) {
                                $scope.sendingOffer = false;
                                $scope.$digest();
                                if (s) {
                                    informer.success('INFORMER.OFFER_ADD');
                                    parentModal(true);
                                    $uibModalInstance.close();
                                }
                            }
                        );
                    }
                } else {
                    o = market.gOfferPrepareForSave(offer);
                    o.category = o.category || '';
                    if (offer.tx_hash) {
                        safe = $filter('filter')($rootScope.safes, offer.tx_hash);
                        if (safe.length) {
                            if ($scope.sendingOffer) return;
                            $scope.sendingOffer = true;
                            if ($scope.needPass) $scope.$digest();
                            backend.pushUpdateOffer(
                                safe[0].wallet_id, offer.tx_hash, o.offer_type, o.amount_p, o.target, o.location_city, o.location_country, o.contacts,
                                o.comment, o.expiration_time, o.fee, o.amount_etc, o.payment_types, o.bonus, o.deal_details, o.category, o.currency, function (s) {
                                    $scope.sendingOffer = false;
                                    $scope.$digest();
                                    if (s) {
                                        $rootScope.editedOffers.push(offer.tx_hash);
                                        informer.success('INFORMER.REQUEST');
                                        parentModal(true);
                                        $uibModalInstance.close();
                                    }
                                }
                            );
                        } else {
                            informer.error('INFORMER.NOT_FIND_SAFE');
                        }
                    } else {
                        if ($scope.sendingOffer) return;
                        $scope.sendingOffer = true;
                        if ($scope.needPass) $scope.$digest();
                        backend.pushOffer(
                            o.wallet_id, o.offer_type, o.amount_p, o.target, o.location_city, o.location_country, o.contacts,
                            o.comment, o.expiration_time, o.fee, o.amount_etc, o.payment_types, o.bonus, o.deal_details, o.category, o.currency, function (s) {
                                $scope.sendingOffer = false;
                                $scope.$digest();
                                if (s) {
                                    informer.success('INFORMER.OFFER_ADD');
                                    parentModal(true);
                                    $uibModalInstance.close();
                                }
                            }
                        );
                    }
                }
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                parentModal();
                $uibModalInstance.close();
            };

        }
    ]);

})();