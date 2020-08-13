// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function() {
    'use strict';
    var module = angular.module('app.mining',[]);

    module.controller('miningCtrl',['backend', '$rootScope', '$scope', 'informer', '$routeParams', '$filter', 'sortingParamsLists', 'showHideTabs', '$timeout',
        function (backend, $rootScope, $scope, informer, $routeParams, $filter, sortingParamsLists, showHideTabs, $timeout) {

            $scope.miningShowHideTabs = showHideTabs.mining;

            $scope.diagramOptionsFuture = {
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
                selected: 6,
                dataGrouping: 'day',
                type: 'chartForCalc'
            };

            $scope.calc = {
                days: 0,
                amount: 0
            };

            $scope.totalFutureMining = 0;
            $scope.calcDiagram = [];

            $scope.calcDiagramShow = false;

            $scope.calculate = function () {
                $scope.calcDiagramShow = true;
                backend.getMiningEstimate($scope.calc.amount, parseInt($scope.calc.days) * 60 * 60 * 24, function (status, result) {
                    $scope.totalFutureMining = 0;
                    var points = [];
                    $scope.calcDiagram = [];
                    var days = result.days_estimate;
                    if (angular.isDefined(days) && days.length) {
                        $scope.$apply(function () {
                            $scope.totalFutureMining = days[days.length - 1] - ($scope.calc.amount * 100000000);
                        });
                    }
                    var nextDate = (new Date()).setUTCHours(0, 0, 0, 1);
                    angular.forEach(days, function (item) {
                        points.push([nextDate, parseFloat($rootScope.moneyParse(item, false))]);
                        nextDate += 1000 * 60 * 60 * 24;
                    });
                    $timeout(function () {
                        $scope.calcDiagram = points;
                        $scope.$digest();
                    }, 500);
                });
            };

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
                type: 'chartWithNavigator'
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
            $scope.selectedSafe = 0;
            $scope.totalMined = 0;
            $scope.miningList = [];
            var localMiningList = [];

            var timeoutChangeSelect;

            $scope.selectSafe = function () {
                if (timeoutChangeSelect) $timeout.cancel(timeoutChangeSelect);
                timeoutChangeSelect = $timeout(function () {
                    if ($rootScope.safes.length) {
                        angular.forEach($rootScope.safes, function (safe) {
                            if (safe.wallet_id === $scope.selectedSafe && safe.loaded) {
                                $rootScope.settings.miningSelectedSafeAddress = safe.address;
                                backend.getMiningHistory(safe.wallet_id, function (status, data) {
                                    var diagram = [];
                                    var total = 0;
                                    localMiningList = [];
                                    if (angular.isDefined(data['mined_entries'])) {
                                        localMiningList = angular.copy(data['mined_entries']);
                                        angular.forEach(data['mined_entries'], function (item, key) {
                                            if (item.t.toString().length === 10) {
                                                data['mined_entries'][key].t = (new Date(item.t * 1000)).setUTCHours(0, 0, 0, 1);
                                            }
                                        });
                                        angular.forEach(data['mined_entries'], function (item) {
                                            total += item.a;
                                            diagram.push([parseInt(item.t), parseFloat($rootScope.moneyParse(item.a, false))]);
                                        });
                                        diagram = diagram.sort(function (a, b) {
                                            return a[0] - b[0];
                                        });
                                    }
                                    $scope.filterChange();
                                    $scope.safesDiagram = diagram;
                                    $scope.totalMined = total;
                                    $scope.$digest();
                                });
                            }
                        });
                    } else {
                        $scope.filterChange();
                        $scope.safesDiagram = [];
                        $scope.totalMined = 0;
                    }
                }, 500);
            };

            if ($rootScope.safes.length === 0) {
                var destroyWatchSafes = $scope.$watch(
                    function () {
                        return $rootScope.safes;
                    },
                    function () {
                        if ($rootScope.safes.length) {
                            $scope.selectedSafe = $rootScope.safes[0].wallet_id;
                            if (angular.isDefined($rootScope.settings.miningSelectedSafeAddress)) {
                                var safe = $rootScope.getSafeBy('address', $rootScope.settings.miningSelectedSafeAddress);
                                if (safe) {
                                    $scope.selectedSafe = safe.wallet_id;
                                }
                            }
                            $scope.selectSafe();
                            destroyWatchSafes();
                        }
                    },
                    true
                );
            } else {
                $scope.selectedSafe = $rootScope.safes[0].wallet_id;
                if (angular.isDefined($rootScope.settings.miningSelectedSafeAddress)) {
                    var safe = $rootScope.getSafeBy('address', $rootScope.settings.miningSelectedSafeAddress);
                    if (safe) {
                        $scope.selectedSafe = safe.wallet_id;
                    }
                }
                $scope.selectSafe();
            }

            $scope.miningSortBy = sortingParamsLists.miningHistory.miningSortBy;
            $scope.miningSortDir = sortingParamsLists.miningHistory.miningSortDir;

            $scope.order = function (row) {
                if (sortingParamsLists.miningHistory.miningSortBy !== row) {
                    sortingParamsLists.miningHistory.miningSortBy = row;
                    sortingParamsLists.miningHistory.miningSortDir = true;
                } else {
                    sortingParamsLists.miningHistory.miningSortDir = !sortingParamsLists.miningHistory.miningSortDir;
                }
                $scope.miningSortBy = sortingParamsLists.miningHistory.miningSortBy;
                $scope.miningSortDir = sortingParamsLists.miningHistory.miningSortDir;
                $scope.filterChange();
            };

            var listOrder = [];

            $scope.refreshGraph = function () {
                if ($scope.miningShowHideTabs.activeTab === 'graph') {
                    $timeout(function () {
                        $('#chart-statistics').highcharts().reflow();
                    }, 100);
                }
            };

            $scope.paginator = {
                currentPage: 1,
                inPage: (angular.isDefined($scope.miningShowHideTabs.paginatorLimit) && parseInt($scope.miningShowHideTabs.paginatorLimit) > 0) ? $scope.miningShowHideTabs.paginatorLimit : 20,
                showAll: false,
                changeLimit: function (limit) {
                    $scope.miningShowHideTabs.paginatorLimit = limit;
                    $scope.paginator.inPage = limit;
                    $scope.paginator.setPage(1, true);
                }
            };

            $scope.$on('pageChanged', function () {
                $scope.miningList = $scope.paginator.Limit(listOrder);
            });

            $scope.filterChange = function () {
                listOrder = $filter('orderBy')(localMiningList, sortingParamsLists.miningHistory.miningSortBy, sortingParamsLists.miningHistory.miningSortDir);
                $scope.paginator.currentPage = 1;
                $timeout(function () {
                    $scope.miningList = $scope.paginator.Limit(listOrder);
                }, 100);
            };

            var removeMiningList = $rootScope.$on('NEED_REFRESH_MINING_LIST', function (event, walletId) {
                if (walletId === $scope.selectedSafe) {
                    $scope.selectSafe();
                }
            });

            $scope.$on('$destroy', function () {
                removeMiningList();
                if (destroyWatchSafes) destroyWatchSafes();
                if (timeoutChangeSelect) $timeout.cancel(timeoutChangeSelect);
            });

        }
    ]);

})();