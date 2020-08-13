// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function() {
    'use strict';
    var module = angular.module('app.settings',[]);

    module.controller('settingsCtrl',['backend', '$rootScope', '$scope', 'informer', 'PassDialogs', 'Idle', 'Languages', '$translate', '$timeout', 'market', 'marketAge',
        function (backend, $rootScope, $scope, informer, PassDialogs, Idle, Languages, $translate, $timeout, market, marketAge) {

            $scope.changeScale = function () {
                $rootScope.changeInterfaceSize($rootScope.settings.app_interface.general.font_size);
            };

            $scope.settingsTab = 'interface-table';

            $scope.reInitSwitch = function () {
                $timeout(function () {
                    $('.switch-option.active').each(function () {
                        $(this).parent().find('.switch-marker').css({
                            'left': $(this).position().left,
                            'width': $(this).outerWidth()
                        })
                    });
                }, 10);
            };

            $scope.reInitSwitch();

            $scope.languages = Languages;

            $scope.changeLang = function (lang) {
                $translate.use(lang).then(function () {
                    $rootScope.getMenuTranslate();
                    market.refreshCategories();
                    market.refreshCurrencies();
                    $rootScope.updateLocalization();
                    marketAge.initLang();
                });
                angular.element('html').attr('lang', lang);
                $rootScope.getCountries(lang);
            };

            $scope.changePass = function (isFromSettings) {
                $rootScope.changeFromSettings = !!(isFromSettings);
                $rootScope.settings.security.is_use_app_pass = true;
                PassDialogs.changeMasPass(function () {});
            };

            $scope.checkPass = function (option) {
                if ($rootScope.settings.security.is_use_app_pass === option) {
                    return false;
                } else {
                    if (option) {
                        $rootScope.settings.security.is_use_app_pass = true;
                        PassDialogs.generateMPDialog(
                            function () {
                                $rootScope.settings.security.is_use_app_pass = false;
                                $rootScope.settings.security.is_pass_required_on_transfer = false;
                            },
                            function () {
                                if ($rootScope.settings.security.password_required_interval > 0) {
                                    Idle.watch();
                                    Idle.setIdle($rootScope.settings.security.password_required_interval);
                                }
                            }
                        );
                    } else {
                        PassDialogs.cancelMPDialog(
                            function () {
                                $rootScope.settings.security.is_use_app_pass = false;
                                $rootScope.settings.security.is_pass_required_on_transfer = false;
                                informer.info('SETTINGS.MAST_PASS_OFF');
                                Idle.unwatch();
                            }
                        );
                    }
                }
            };

            $scope.toggleAutoStart = function (value) {
                backend.toggleAutoStart(value);
            };

            $scope.requestPass = function () {
                PassDialogs.requestMPDialog(function () {
                    $rootScope.settings.security.is_pass_required_on_transfer = true;
                }, false, false);
            };

            $scope.passReqIntervalIndex = $rootScope.passRequiredIntervals.indexOf($rootScope.settings.security.password_required_interval);

            $scope.changePassReqInterval = function (index) {
                $scope.passReqIntervalIndex = index;
                $rootScope.settings.security.password_required_interval = $rootScope.passRequiredIntervals[index];
                if ($rootScope.settings.security.password_required_interval > 0) {
                    Idle.watch();
                    Idle.setIdle($rootScope.settings.security.password_required_interval);
                } else {
                    Idle.unwatch();
                }
            };

            $scope.changeLogLevel = function () {
                backend.setLogLevel(parseInt($rootScope.settings.system.log_level));
            };

            var watchSettings = $scope.$watch(
                function () {
                    return $rootScope.settings;
                },
                function () {
                    $rootScope.storeAppData();
                },
                true
            );

            $scope.$on('$destroy', function () {
                watchSettings();
            });

        }
    ]);

})();