// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function () {
    'use strict';
    var module = angular.module('app.deals', []);

    module.controller('dealsController', ['$scope', '$uibModal', '$rootScope', '$filter', 'showHideTabs',
        function ($scope, $uibModal, $rootScope, $filter, showHideTabs) {

            $scope.contractsShowHideTabs = showHideTabs.contracts;
            $scope.contracts = [];

            var watchContracts = $scope.$watchCollection(function () {
                return $rootScope.contracts
            }, function () {
                $scope.changeTable();
            });

            var watchNewCustomerContracts = $scope.$watch(function () {
                return $rootScope.newCustomerContractsCount;
            }, function () {
                if ($scope.userIsCustomer) $scope.changeTable();
            });

            var watchNewSellerContracts = $scope.$watch(function () {
                return $rootScope.newSellerContractsCount;
            }, function () {
                if ($scope.userIsSeller) $scope.changeTable();
            });

            $scope.$on('$destroy', function () {
                watchContracts();
                watchNewCustomerContracts();
                watchNewSellerContracts();
            });

            $scope.userIsCustomer = true;
            $scope.userIsSeller = false;

            $scope.paginator = {
                currentPage: 1,
                inPage: (angular.isDefined($scope.contractsShowHideTabs.paginatorLimit) && parseInt($scope.contractsShowHideTabs.paginatorLimit) > 0) ? $scope.contractsShowHideTabs.paginatorLimit : 20,
                showAll: false,
                changeLimit: function (limit) {
                    $scope.contractsShowHideTabs.paginatorLimit = limit;
                    $scope.paginator.inPage = limit;
                    $scope.paginator.setPage(1, true);
                }
            };

            $scope.$on('pageChanged', function () {
                $scope.contracts = $scope.paginator.Limit(localContracts, true);
                angular.forEach($scope.contracts, function (contract) {
                    contract.contact = (contract.is_a) ? $rootScope.getContactByAddress(contract['private_details'].b_addr) : $rootScope.getContactByAddress(contract['private_details'].a_addr);
                });
            });

            var localContracts = [];
            var lastTableName = 'customer';

            $scope.changeTable = function (tableName) {
                localContracts = [];
                if (angular.isUndefined(tableName)) {
                    tableName = lastTableName;
                } else {
                    $scope.paginator.currentPage = 1;
                    lastTableName = tableName;
                }
                if (tableName === 'customer') {
                    $scope.userIsCustomer = true;
                    $scope.userIsSeller = false;
                    localContracts = $filter('filter')($rootScope.contracts, {is_a: true});
                } else {
                    $scope.userIsCustomer = false;
                    $scope.userIsSeller = true;
                    localContracts = $filter('filter')($rootScope.contracts, {is_a: false});
                }
                localContracts = $filter('orderBy')(localContracts, [function (a) {
                    return !(a.state === 1);
                }, '-isNew', '-timestamp']);
                $scope.contracts = $scope.paginator.Limit(localContracts, true);
                angular.forEach($scope.contracts, function (contract) {
                    contract.contact = (contract.is_a) ? $rootScope.getContactByAddress(contract['private_details'].b_addr) : $rootScope.getContactByAddress(contract['private_details'].a_addr);
                });
            };

            var dealsCreateOpened = false;

            $scope.createNewDeals = function () {
                if (dealsCreateOpened) return;
                dealsCreateOpened = true;
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-create-purchase base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsCreate.html',
                    controller: 'dealsCreateController'
                }).result.then(function () {
                    dealsCreateOpened = false;
                }, function () {
                    dealsCreateOpened = false;
                });
            };

            var dealsDetailsOpened = false;

            $scope.showDealInfo = function (contract) {
                var localContract = {};
                for (var j = 0; j < $rootScope.contracts.length; j++) {
                    if ($rootScope.contracts[j].contract_id === contract.contract_id && $rootScope.contracts[j].is_a === contract.is_a) {
                        localContract = $rootScope.contracts[j];
                        break;
                    }
                }
                if (dealsDetailsOpened) return;
                dealsDetailsOpened = true;
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-escrow-details base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsDetails.html',
                    controller: 'dealsDetailsController',
                    resolve: {
                        contract: function () {
                            return localContract;
                        },
                        userIsCustomer: function () {
                            return $scope.userIsCustomer;
                        },
                        userIsSeller: function () {
                            return $scope.userIsSeller;
                        }
                    }
                }).result.then(function () {
                    dealsDetailsOpened = false;
                }, function () {
                    dealsDetailsOpened = false;
                });
            };

        }
    ]);

    module.controller('dealsCreateController', ['$scope', '$uibModalInstance', '$uibModal', '$rootScope', '$filter', 'backend', 'CONFIG', '$timeout',
        function ($scope, $uibModalInstance, $uibModal, $rootScope, $filter, backend, CONFIG, $timeout) {

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

            var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                refreshSafesList();
            });
            var removeBroadSafes = $rootScope.$on('NEED_REFRESH_SAFES', function () {
                refreshSafesList();
            });

            $scope.balanceErrorSync = false;

            $timeout(function () {
                $('.general-range').change();
            }, 10);

            $scope.close = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.dep = {
                t: '',
                c: '',
                to_pay: '',
                a_pledge: 0,
                b_pledge: 0,
                b_addr: '',
                a_addr: '',
                wallet_id: 0,
                payment_id: '',
                time: 12,
                payment_id_integrated: ''
            };

            if ($rootScope.safes.length) {
                var localSafes = $filter('orderBy')($rootScope.safes, 'balance', true);
                $scope.dep.wallet_id = localSafes[0].wallet_id;
                $scope.dep.a_addr = localSafes[0].address;
            }

            $scope.percents = {p1: 105, p2: 100};
            $scope.recountSize = function () {
                $scope.dep.a_pledge = ($scope.dep.to_pay) ? $rootScope.moneyParse(($filter('moneyToInt')($scope.dep.to_pay) * $scope.percents.p1) / 100, false) : 0;
                $scope.dep.b_pledge = ($scope.dep.to_pay) ? $rootScope.moneyParse(($filter('moneyToInt')($scope.dep.to_pay) * $scope.percents.p2) / 100, false) : 0;
                $scope.checkAvailableSources();
            };

            var timer;

            $scope.checkAvailableSources = function () {
                if ($scope.dep.a_pledge && $scope.dep.a_pledge !== null) {
                    var safe = $rootScope.getSafeById($scope.dep.wallet_id);
                    $scope.balanceErrorSync = false;
                    if (!safe.loaded) {
                        $scope.balanceErrorSync = true;
                        if (timer) $timeout.cancel(timer);
                        timer = $timeout(function () {
                            $scope.checkAvailableSources();
                        }, 10000);
                        return;
                    }
                    backend.checkAvailableSources($scope.dep.wallet_id, $scope.dep.a_pledge, function (response, data) {
                        $scope.availableSourcesError = response && (data === 'FALSE');
                        $scope.$digest();
                    });
                }
            };

            $scope.clearAddress = function () {
                $scope.dep.b_addr = '';
                $scope.transaction.to = '';
                $scope.$broadcast('angucomplete-alt:clearInput');
            };

            $scope.alias = false;

            $scope.isAddressValid = false;

            $scope.validateAddress = function (address) {
                backend.validateAddress(address, function (status, data) {
                    if (status === true) {
                        $scope.dep.payment_id_integrated = (data['payment_id']) ? data['payment_id'] : '';
                        $scope.isAddressValid = true;
                        $scope.alias = $rootScope.getSafeAlias(address);
                        $scope.$digest();
                    } else {
                        $scope.dep.payment_id_integrated = '';
                        $scope.isAddressValid = false;
                        $scope.alias = false;
                        $scope.$digest();
                    }
                });
            };

            $scope.transaction = {
                to2: ''
            };

            var selectContactOpened = false;

            $scope.selectContact = function () {
                $scope.transaction.to2 = $scope.dep.b_addr;
                if (selectContactOpened) return;
                selectContactOpened = true;
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-select-contact base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/sendMoneySelectContact.html',
                    controller: 'selectContactCtrl',
                    resolve: {
                        tr: function () {
                            return $scope.transaction;
                        }
                    }
                }).result.then(function () {
                    selectContactOpened = false;
                }, function () {
                    selectContactOpened = false;
                });
            };

            var watchTr = $scope.$watch(
                function () {
                    return $scope.transaction.to2;
                },
                function () {
                    $scope.dep.b_addr = $scope.transaction.to2;
                    $('#angucomplete_safe_address_value').val($scope.transaction.to2).change();
                }
            );

            $scope.selectAlias = function (obj) {
                if (angular.isDefined(obj)) {
                    var alias = obj.originalObject;
                    $scope.dep.b_addr = alias.address;
                    $scope.validateAddress($scope.dep.b_addr);
                    return alias.address;
                }
            };

            $scope.inputChanged = function (str) {
                if (str.slice(0, 1) === '@') {
                    backend.getAliasByName(str.replace('@', ''), function (status, data) {
                        if (status) {
                            $scope.dep.b_addr = data.address;
                        } else {
                            $scope.dep.b_addr = str;
                        }
                        $scope.validateAddress($scope.dep.b_addr);
                    });
                } else {
                    $scope.dep.b_addr = str;
                    $scope.validateAddress($scope.dep.b_addr);
                }
            };

            $scope.setCustomerAddress = function () {
                angular.forEach($rootScope.safes, function (item) {
                    if (item.wallet_id === $scope.dep.wallet_id) {
                        $scope.dep.a_addr = item.address;
                    }
                });
            };

            var contactCreateNewOpened = false;

            $scope.addNewContact = function () {
                if (contactCreateNewOpened) return;
                contactCreateNewOpened = true;
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-new-contact base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/contactCreateNew.html',
                    controller: 'addEditContactCtrl',
                    resolve: {
                        address: function () {
                            return $scope.dep.b_addr;
                        }
                    }
                }).result.then(function () {
                    contactCreateNewOpened = false;
                }, function () {
                    contactCreateNewOpened = false;
                });
            };

            var safeAddToExistContactOpened = false;

            $scope.addToExist = function () {
                if (safeAddToExistContactOpened) return;
                safeAddToExistContactOpened = true;
                $uibModal.open({
                    templateUrl: 'views/safeAddToExistContact.html',
                    controller: 'addToExistCtrl',
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-select-contact base-scroll light-scroll',
                    animation: true,
                    resolve: {
                        tr: function () {
                            return {to: $scope.dep.b_addr};
                        }
                    }
                }).result.then(function () {
                    safeAddToExistContactOpened = false;
                }, function () {
                    safeAddToExistContactOpened = false;
                });
            };

            var dealsCreateConfirmOpened = false;

            $scope.createNewDealsSubmit = function () {
                $scope.balanceError = false;
                angular.forEach($rootScope.safes, function (item) {
                    if (!$scope.balanceError) {
                        if (item.wallet_id === $scope.dep.wallet_id) {
                            if (item.unlocked_balance < $filter('moneyToInt')(parseFloat($scope.dep.a_pledge) + parseFloat(CONFIG.standardFee))) {
                                $scope.balanceError = true;
                            }
                        }
                    }
                });

                if (!$scope.dealsCreateForm.$valid || $scope.balanceError || $scope.balanceErrorSync || parseFloat($scope.dep.to_pay) === 0 || $scope.dep.a_addr === $scope.dep.b_addr || $scope.dep.a_addr.length === 0 || !$scope.isAddressValid) {
                    return;
                }
                if (dealsCreateConfirmOpened) return;
                dealsCreateConfirmOpened = true;
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-purchase-condition base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsCreateConfirm.html',
                    controller: 'dealsCreateConfirmController',
                    resolve: {
                        dep: function () {
                            return $scope.dep;
                        },
                        parentModalClose: function () {
                            return $uibModalInstance;
                        }
                    }
                }).result.then(function () {
                    dealsCreateConfirmOpened = false;
                }, function () {
                    dealsCreateConfirmOpened = false;
                });
            };

            var dealsCreateSizeOpened = false;

            $scope.dealsCreateSize = function () {
                if (dealsCreateSizeOpened) return;
                dealsCreateSizeOpened = true;
                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-change-pledges base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsCreateSize.html',
                    controller: 'dealsCreateSizeController',
                    resolve: {
                        dep: function () {
                            return $scope.dep;
                        },
                        percents: function () {
                            return $scope.percents;
                        }
                    }
                }).result.then(function () {
                    dealsCreateSizeOpened = false;
                    $scope.checkAvailableSources();
                }, function () {
                    dealsCreateSizeOpened = false;
                });
            };

            $scope.$on('$destroy', function () {
                removeBroadHistory();
                removeBroadSafes();
                watchTr();
                if (timer) $timeout.cancel(timer);
            });

        }
    ]);

    module.controller('dealsCreateSizeController', ['$scope', '$uibModalInstance', 'dep', 'percents', '$rootScope', '$timeout', '$filter',
        function ($scope, $uibModalInstance, dep, percents, $rootScope, $timeout, $filter) {

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.dep = dep;

            $timeout(function () {
                $('.general-range').change();
            }, 10);

            $scope.percent1 = percents.p1;
            $scope.percent2 = percents.p2;

            $scope.dealsCreateSizeSubmit = function () {
                $scope.dep.a_pledge = ($scope.dep.to_pay) ? $rootScope.moneyParse(($filter('moneyToInt')($scope.dep.to_pay) * $scope.percent1) / 100, false) : 0;
                $scope.dep.b_pledge = ($scope.dep.to_pay) ? $rootScope.moneyParse(($filter('moneyToInt')($scope.dep.to_pay) * $scope.percent2) / 100, false) : 0;
                percents.p1 = $scope.percent1;
                percents.p2 = $scope.percent2;
                $scope.close();
            };

        }
    ]);

    module.controller('dealsCreateConfirmController', ['$scope', '$uibModalInstance', 'dep', 'parentModalClose', 'informer', 'backend', '$rootScope',
        function ($scope, $uibModalInstance, dep, parentModalClose, informer, backend, $rootScope) {

            $scope.depConfirm = angular.copy(dep);

            $scope.closeAll = function () {
                $scope.close();
                parentModalClose.close();
            };
            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.confirm = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {
                    angular.forEach($rootScope.safes, function (item) {
                        if (item.wallet_id === dep.wallet_id) {
                            dep.a_addr = item.address;
                        }
                    });
                    if (dep.payment_id_integrated.length > 0) {
                        dep.payment_id = dep.payment_id_integrated;
                    }
                    backend.createProposal(
                        dep.wallet_id, dep.t, dep.c, dep.a_addr, dep.b_addr, dep.to_pay, dep.a_pledge, dep.b_pledge, dep.time, dep.payment_id, function (s) {
                            if (s) {
                                informer.success('DEALS.SUCCESS_CREATE_PROPOSAL');
                                $scope.closeAll();
                            }
                        }
                    );
                });
            };

        }
    ]);

    module.controller('dealsDetailsFinishController', ['$scope', '$uibModalInstance', 'parentModalClose', 'contract', 'informer', 'backend', '$rootScope',
        function ($scope, $uibModalInstance, parentModalClose, contract, informer, backend, $rootScope) {

            $scope.contract = contract;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.finishProposal = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {
                    backend.releaseProposal($scope.contract.wallet_id, $scope.contract.contract_id, 'REL_N', function (status) {
                        if (status === true) {
                            $uibModalInstance.close();
                            parentModalClose.close();
                            informer.success('DEALS.SUCCESS_FINISH_PROPOSAL');
                        }
                    });
                });
            };

        }
    ]);

    module.controller('dealsDetailsDontCancelingController', ['$scope', '$uibModalInstance', 'parentModalClose', 'contract', '$rootScope', 'informer',
        function ($scope, $uibModalInstance, parentModalClose, contract, $rootScope, informer) {

            $scope.contract = contract;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.ignoredConfirmed = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {

                    $rootScope.settings.notViewedContracts = angular.isDefined($rootScope.settings.notViewedContracts) ? $rootScope.settings.notViewedContracts : [];
                    var isContractViewed = false;
                    for (var j = 0; j < $rootScope.settings.notViewedContracts.length; j++) {
                        if ($rootScope.settings.notViewedContracts[j].contract_id === $scope.contract.contract_id && $rootScope.settings.notViewedContracts[j].is_a === $scope.contract.is_a) {
                            $rootScope.settings.notViewedContracts[j].state = 130;
                            $rootScope.settings.notViewedContracts[j].time = $scope.contract['cancel_expiration_time'];
                            isContractViewed = true;
                            break;
                        }
                    }
                    if (!isContractViewed) {
                        $rootScope.settings.notViewedContracts.push({
                            contract_id: $scope.contract.contract_id,
                            is_a: $scope.contract.is_a,
                            state: 130,
                            time: $scope.contract['cancel_expiration_time']
                        });
                    }
                    for (var i = 0; i < $rootScope.contracts.length; i++) {
                        if ($rootScope.contracts[i].contract_id === $scope.contract.contract_id && $rootScope.contracts[i].is_a === $scope.contract.is_a) {
                            $rootScope.contracts[i].isNew = true;
                            $rootScope.contracts[i].state = 130;
                            $rootScope.contracts[i].time = $scope.contract['cancel_expiration_time'];
                            break;
                        }
                    }
                    $rootScope.getContractsRecount();

                    $uibModalInstance.close();
                    parentModalClose.close();
                    informer.success('DEALS.IGNORED_CANCEL');
                });
            };

        }
    ]);

    module.controller('dealsDetailsCancelController', ['$scope', '$uibModalInstance', 'parentModalClose', 'informer', 'contract', 'backend', '$rootScope', '$timeout',
        function ($scope, $uibModalInstance, parentModalClose, informer, contract, backend, $rootScope, $timeout) {

            $scope.contract = contract;

            $timeout(function () {
                $('.general-range').change();
            }, 10);

            $scope.close = function () {
                $uibModalInstance.close();
            };
            $scope.time = 15;

            $scope.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.confirm = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {
                    backend.requestCancelContract($scope.contract.wallet_id, $scope.contract.contract_id, $scope.time, function (s) {
                        if (s) {
                            informer.success('DEALS.SEND_CANCEL_PROPOSAL');
                            $scope.close();
                            parentModalClose.close();
                        }
                    });
                });
            };

        }
    ]);

    module.controller('dealsDetailsController', ['$scope', '$uibModalInstance', 'contract', 'userIsCustomer', 'userIsSeller', '$uibModal', '$rootScope', 'backend', 'informer', 'txHistory',
        function ($scope, $uibModalInstance, contract, userIsCustomer, userIsSeller, $uibModal, $rootScope, backend, informer, txHistory) {

            $scope.contract = contract;

            var checkAndChangeHistory = function () {
                if (contract.state === 201) {
                    $scope.historyBlock = txHistory.contractHistory(contract.contract_id, contract.is_a, 8);
                } else if (contract.state === 601) {
                    $scope.historyBlock = txHistory.contractHistory(contract.contract_id, contract.is_a, 12);
                }
            };

            checkAndChangeHistory();

            var watchHeight = $scope.$watch(
                function () {
                    return $rootScope.appHeight
                },
                function () {
                    if ($scope.contract.state === 201 && $scope.contract.height !== 0 && ($rootScope.appHeight - $scope.contract.height) >= 10) {
                        $scope.contract.state = 2;
                        $scope.contract.isNew = true;
                        $rootScope.getContractsRecount();
                    } else if ($scope.contract.state === 601 && $scope.contract.height !== 0 && ($rootScope.appHeight - $scope.contract.height) >= 10) {
                        $scope.contract.state = 6;
                        $scope.contract.isNew = true;
                        $rootScope.getContractsRecount();
                    }
                }
            );

            $scope.userIsCustomer = userIsCustomer;
            $scope.userIsSeller = userIsSeller;

            var checkingIsNew = function () {
                if ($scope.contract.isNew) {
                    if ($scope.contract.is_a && $scope.contract.state === 2) {
                        $scope.contract.state = 120;
                    }
                    if ($scope.contract.state === 130 && $scope.contract.cancel_expiration_time !== 0 && $scope.contract.cancel_expiration_time < $rootScope.exp_med_ts) {
                        $scope.contract.state = 2;
                    }
                    $rootScope.viewContract($scope.contract);
                }
            };

            checkingIsNew();

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            var childModalWindow;
            var isModalOpened = {
                accept: false,
                ignore: false,
                finish: false,
                doNotCancel: false,
                cancel: false,
                notGot: false,
                sellerCancel: false
            };

            $scope.acceptState = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {
                    if (isModalOpened.accept) return;
                    isModalOpened.accept = true;
                    childModalWindow = $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-complete-transaction base-scroll light-scroll',
                        animation: true,
                        templateUrl: 'views/dealsDetailsAccept.html',
                        controller: 'dealsDetailsAcceptController',
                        resolve: {
                            parentModalClose: function () {
                                return $uibModalInstance;
                            },
                            contract: function () {
                                return $scope.contract;
                            }
                        }
                    });
                    childModalWindow.result.then(function () {
                        isModalOpened.accept = false;
                    }, function () {
                        isModalOpened.accept = false;
                    });
                });

            };

            $scope.ignoreContract = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {
                    if (isModalOpened.ignore) return;
                    isModalOpened.ignore = true;
                    childModalWindow = $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-complete-transaction base-scroll light-scroll',
                        animation: true,
                        templateUrl: 'views/dealsDetailsIgnored.html',
                        controller: 'dealsDetailsIgnoredController',
                        resolve: {
                            parentModalClose: function () {
                                return $uibModalInstance;
                            },
                            contract: function () {
                                return $scope.contract;
                            }
                        }
                    });
                    childModalWindow.result.then(function () {
                        isModalOpened.ignore = false;
                    }, function () {
                        isModalOpened.ignore = false;
                    });
                });
            };

            $scope.finishContract = function () {
                if (isModalOpened.finish) return;
                isModalOpened.finish = true;
                childModalWindow = $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-return-pledges base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsDetailsFinish.html',
                    controller: 'dealsDetailsFinishController',
                    resolve: {
                        parentModalClose: function () {
                            return $uibModalInstance;
                        },
                        contract: function () {
                            return $scope.contract;
                        }
                    }
                });
                childModalWindow.result.then(function () {
                    isModalOpened.finish = false;
                }, function () {
                    isModalOpened.finish = false;
                });
            };

            $scope.doNotCancelContract = function () {
                if (isModalOpened.doNotCancel) return;
                isModalOpened.doNotCancel = true;
                childModalWindow = $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-return-pledges base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsDetailsDontCanceling.html',
                    controller: 'dealsDetailsDontCancelingController',
                    resolve: {
                        parentModalClose: function () {
                            return $uibModalInstance;
                        },
                        contract: function () {
                            return $scope.contract;
                        }
                    }
                });
                childModalWindow.result.then(function () {
                    isModalOpened.doNotCancel = false;
                }, function () {
                    isModalOpened.doNotCancel = false;
                });
            };

            $scope.cancelContract = function () {
                if (isModalOpened.cancel) return;
                isModalOpened.cancel = true;
                childModalWindow = $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-cancel-transaction base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsDetailsCancel.html',
                    controller: 'dealsDetailsCancelController',
                    resolve: {
                        parentModalClose: function () {
                            return $uibModalInstance;
                        },
                        contract: function () {
                            return $scope.contract;
                        }
                    }
                });
                childModalWindow.result.then(function () {
                    isModalOpened.cancel = false;
                }, function () {
                    isModalOpened.cancel = false;
                });
            };

            $scope.productNotGot = function () {
                if (isModalOpened.notGot) return;
                isModalOpened.notGot = true;
                childModalWindow = $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-return-pledges base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsDetailsNotGot.html',
                    controller: 'dealsDetailsNotGotController',
                    resolve: {
                        parentModalClose: function () {
                            return $uibModalInstance;
                        },
                        contract: function () {
                            return $scope.contract;
                        }
                    }
                });
                childModalWindow.result.then(function () {
                    isModalOpened.notGot = false;
                }, function () {
                    isModalOpened.notGot = false;
                });
            };

            $scope.sellerCancelContract = function () {
                if (isModalOpened.sellerCancel) return;
                isModalOpened.sellerCancel = true;
                childModalWindow = $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-return-pledges base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/dealsDetailsSellerCancel.html',
                    controller: 'dealsDetailsSellerCancelController',
                    resolve: {
                        parentModalClose: function () {
                            return $uibModalInstance;
                        },
                        contract: function () {
                            return $scope.contract;
                        }
                    }
                });
                childModalWindow.result.then(function () {
                    isModalOpened.sellerCancel = false;
                }, function () {
                    isModalOpened.sellerCancel = false;
                });
            };

            var watchContractCheckIsNew = $scope.$watch(
                function () {
                    return $scope.contract.state
                },
                function () {
                    if (isModalOpened.ignore || isModalOpened.finish || isModalOpened.doNotCancel || isModalOpened.cancel || isModalOpened.notGot || isModalOpened.sellerCancel) {
                        childModalWindow.close();
                    }
                    checkAndChangeHistory();
                },
                true
            );

            $scope.$on('$destroy', function () {
                watchContractCheckIsNew();
                watchHeight();
            });

        }
    ]);

    module.controller('dealsDetailsSellerCancelController', ['$scope', '$uibModalInstance', 'parentModalClose', 'contract', 'informer', 'backend', '$rootScope',
        function ($scope, $uibModalInstance, parentModalClose, contract, informer, backend, $rootScope) {

            $scope.contract = contract;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.confirmCancelSellerDeal = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {
                    backend.acceptCancelContract($scope.contract.wallet_id, $scope.contract.contract_id, function (status) {
                        if (status) {
                            $uibModalInstance.close();
                            parentModalClose.close();
                            informer.success('DEALS.DEALS_CANCELED_WAIT');
                        }
                    });
                });
            };

        }
    ]);

    module.controller('dealsDetailsNotGotController', ['$scope', '$uibModal', '$uibModalInstance', 'parentModalClose', 'contract', '$rootScope',
        function ($scope, $uibModal, $uibModalInstance, parentModalClose, contract, $rootScope) {

            $scope.contract = contract;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            var burnProposalOpened = false;
            $scope.confirmBurning = function () {
                if (burnProposalOpened) return;
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {
                    burnProposalOpened = true;
                    $uibModal.open({
                        animation: true,
                        backdrop: false,
                        controller: 'dealsDetailsNotGotConfirmController',
                        templateUrl: 'views/dealsDetailsNotGotConfirm.html',
                        windowClass: 'modal-main-wrapper modal-return-pledges base-scroll light-scroll',
                        resolve: {
                            oldParentModalClose: function () {
                                return parentModalClose;
                            },
                            parentModalClose: function () {
                                return $uibModalInstance;
                            },
                            contract: function () {
                                return $scope.contract;
                            }
                        }
                    }).result.then(function () {
                        burnProposalOpened = false;
                    }, function () {
                        burnProposalOpened = false;
                    });
                });
            };

        }
    ]);

    module.controller('dealsDetailsNotGotConfirmController', ['$scope', '$uibModalInstance', 'oldParentModalClose', 'parentModalClose', 'contract', 'informer', 'backend', '$rootScope',
        function ($scope, $uibModalInstance, oldParentModalClose, parentModalClose, contract, informer, backend, $rootScope) {

            $scope.contract = contract;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.sPassword = '';
            $scope.needPass = $rootScope.settings.security.is_pass_required_on_transfer;

            $scope.burnProposal = function () {
                $rootScope.checkMasterPassword($scope.needPass, $scope.sPassword, function () {
                    backend.releaseProposal($scope.contract.wallet_id, $scope.contract.contract_id, 'REL_B', function (status) {
                        if (status) {
                            $uibModalInstance.close();
                            parentModalClose.close();
                            oldParentModalClose.close();
                            informer.success('DEALS.BURN_PROPOSAL');
                        }
                    });
                });
            };

        }
    ]);

    module.controller('dealsDetailsIgnoredController', ['$scope', '$uibModalInstance', 'parentModalClose', 'contract', 'informer', '$rootScope',
        function ($scope, $uibModalInstance, parentModalClose, contract, informer, $rootScope) {

            $scope.contract = contract;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.ignoredConfirm = function () {
                $rootScope.settings.notViewedContracts = angular.isDefined($rootScope.settings.notViewedContracts) ? $rootScope.settings.notViewedContracts : [];
                var isContactViewed = false;
                for (var j = 0; j < $rootScope.settings.notViewedContracts.length; j++) {
                    if ($rootScope.settings.notViewedContracts[j].contract_id === $scope.contract.contract_id && $rootScope.settings.notViewedContracts[j].is_a === $scope.contract.is_a) {
                        $rootScope.settings.notViewedContracts[j].state = 110;
                        $rootScope.settings.notViewedContracts[j].time = $scope.contract.expiration_time;
                        isContactViewed = true;
                        break;
                    }
                }
                if (!isContactViewed) {
                    $rootScope.settings.notViewedContracts.push({
                        contract_id: $scope.contract.contract_id,
                        is_a: $scope.contract.is_a,
                        state: 110,
                        time: $scope.contract.expiration_time
                    });
                }
                for (var i = 0; i < $rootScope.contracts.length; i++) {
                    if ($rootScope.contracts[i].contract_id === $scope.contract.contract_id && $rootScope.contracts[i].is_a === $scope.contract.is_a) {
                        $rootScope.contracts[i].isNew = true;
                        $rootScope.contracts[i].state = 110;
                        $rootScope.contracts[i].time = $scope.contract.expiration_time;
                        break;
                    }
                }
                $rootScope.getContractsRecount();
                $uibModalInstance.close();
                parentModalClose.close();
                informer.success('DEALS.IGNORED_ACCEPT');
            };

        }
    ]);

    module.controller('dealsDetailsAcceptController', ['$scope', '$uibModalInstance', 'parentModalClose', 'contract', 'informer', 'backend',
        function ($scope, $uibModalInstance, parentModalClose, contract, informer, backend) {

            $scope.contract = contract;

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.acceptConfirm = function () {
                backend.acceptProposal($scope.contract.wallet_id, $scope.contract.contract_id, function (status) {
                    if (status) {
                        $uibModalInstance.close();
                        parentModalClose.close();
                        informer.success('DEALS.ACCEPT_STATE_WAIT_BIG');
                    }
                });
            };
        }
    ]);

})();