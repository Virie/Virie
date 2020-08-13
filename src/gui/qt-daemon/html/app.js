// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function () {
    'use strict';
    var app = angular.module('app', [
        'ngAnimate',
        'ui.bootstrap',
        'ui.slider',
        'angucomplete-alt',
        'ngRoute',
        'ngIdle',
        'ngSanitize',
        'pascalprecht.translate',
        'app.filters',
        'app.services',
        'app.backendServices',
        'app.directives',
        'app.app',
        'app.dashboard',
        'app.safes',
        'app.money',
        'app.market',
        'app.settings',
        'app.contacts',
        'app.mining',
        'app.deals',
        'ngDraggable'
    ]);

    app.constant('CONFIG', {
        filemask: '*',
        CDDP: 8,
        standardFee: '0.01',
        standardFeeDecimal: 2,
        premiumFee: '0.1',
        currencySymbol: 'VRE'
    });

    var routes = [
        {route: 'dashboard', template: 'views/dashboard.html', inMenu: true, name: 'SIDEBAR.DASHBOARD'},
        {route: 'safes',     template: 'views/safes.html',     inMenu: true, name: 'SIDEBAR.SAFES'},
        {route: 'market',    template: 'views/market.html',    inMenu: true, name: 'SIDEBAR.MARKET'},
        {route: 'deals',     template: 'views/deals.html',     inMenu: true, name: 'SIDEBAR.DEALS'},
        {route: 'contacts',  template: 'views/contacts.html',  inMenu: true, name: 'SIDEBAR.CONTACTS'},
        {route: 'history',   template: 'views/history.html',   inMenu: true, name: 'SIDEBAR.PAYMENT_HISTORY'},
        {route: 'mining',    template: 'views/mining.html',    inMenu: true, name: 'SIDEBAR.MINING'},
        {route: 'settings',  template: 'views/settings.html',  inMenu: true, name: 'SIDEBAR.SETTINGS'},

        {route: '',                                   template: 'views/dashboard.html', inMenu: false, markAs: 'dashboard'},
        {route: 'safe/:wallet_id/:slide/:slideCount', template: 'views/safe.html',      inMenu: false, markAs: 'safes'},
        {route: 'history/:contact_id',                template: 'views/history.html',   inMenu: false, markAs: 'history'},
        {route: 'market/:tab',                        template: 'views/market.html',    inMenu: false, markAs: 'market'},
        {route: 'contact/:contact_id',                template: 'views/contact.html',   inMenu: false, markAs: 'contacts'}
    ];

    app.config(['$routeProvider', 'IdleProvider', '$translateProvider', 'TranslateConfig', 'DefaultLanguage', '$animateProvider',
        function ($routeProvider, IdleProvider, $translateProvider, TranslateConfig, DefaultLanguage, $animateProvider) {

            $animateProvider.classNameFilter(/filterBlockAnimation|filterBlockAnimation2|slideAnimation|optionAnimate/);

            IdleProvider.timeout(10);

            for (var i = 0, length = routes.length; i < length; i++) {
                $routeProvider.when('/' + routes[i].route, {
                    templateUrl: routes[i].template
                });
            }

            $routeProvider.otherwise({templateUrl: 'views/routingError.html'});

            $translateProvider.useStaticFilesLoader(TranslateConfig);
            $translateProvider.determinePreferredLanguage(function () {
                return DefaultLanguage;
            });
        }]);

    app.run(['$rootScope', function ($rootScope) {
        var body = angular.element('body');
        $rootScope.currentMenuItem = 'dashboard';
        $rootScope.updateShowed = false;
        $rootScope.wrongTimeShowed = false;

        function getRouteByUrl(url) {
            for (var routeIndex in routes) {
                if (routes.hasOwnProperty(routeIndex) && '/' + routes[routeIndex].route === url) {
                    return (routes[routeIndex].inMenu !== false) ? routes[routeIndex].route : routes[routeIndex].markAs;
                }
            }
            return 'dashboard';
        }

        var showOnSync = ['/settings', '/contacts', '/safes', '/safe', '/history'];

        $rootScope.$on('$routeChangeStart', function (angularEvent, next) {
            body.removeClass('panel-open');
            $rootScope.currentMenuItem = getRouteByUrl(next.$$route.originalPath);
        });

        $rootScope.$on('$routeChangeSuccess', function () {
            var contentElement = document.getElementById('scrolled-content');
            angular.element(contentElement)[0].scrollTop = 0;
            $rootScope.showOnSync = !!~showOnSync.indexOf('/' + $rootScope.currentMenuItem);
        });

        function getMenu() {
            var Return = [];
            for (var i = 0, length = routes.length; i < length; i++) {
                if (routes[i].inMenu === true) Return.push(routes[i]);
            }
            return Return;
        }

        $rootScope.mainMenuTemp = getMenu();
        $rootScope.mainMenuEnable = ['contacts', 'settings', 'safes', 'history'];

        if (angular.isUndefined($rootScope.safes)) {
            $rootScope.safes = [];
        }

        Array.prototype.searchBy = function (type, hash) {
            for (var i = 0, length = this.length; i < length; i++) {
                if (i in this) {
                    var element = this[i];
                    if (type in element && element[type] === hash) {
                        return i;
                    }
                }
            }
            return -1;
        };
    }]);

    app.constant('TranslateConfig', {
        prefix: 'assets/languages/',
        suffix: '.json'
    });

    app.constant('Languages', [
        {key: 'de', title: 'Deutsch'},
        {key: 'en', title: 'English'},
        {key: 'es', title: 'Español'},
        {key: 'fr', title: 'Français'},
        {key: 'ja', title: '日本語'},
        {key: 'ko', title: '한국어'},
        {key: 'pt', title: 'Português'},
        {key: 'ru', title: 'Русский'},
        {key: 'zh', title: '汉语'}
    ]);

    var lng = navigator.browserLanguage || navigator.language || navigator.userLanguage;

    if (!!~lng.indexOf('de')) {
        app.constant('DefaultLanguage', 'de');
    } else if (!!~lng.indexOf('es')) {
        app.constant('DefaultLanguage', 'es');
    } else if (!!~lng.indexOf('fr')) {
        app.constant('DefaultLanguage', 'fr');
    } else if (!!~lng.indexOf('ja')) {
        app.constant('DefaultLanguage', 'ja');
    } else if (!!~lng.indexOf('ko')) {
        app.constant('DefaultLanguage', 'ko');
    } else if (!!~lng.indexOf('pt')) {
        app.constant('DefaultLanguage', 'pt');
    } else if (!!~lng.indexOf('ru')) {
        app.constant('DefaultLanguage', 'ru');
    } else if (!!~lng.indexOf('zh')) {
        app.constant('DefaultLanguage', 'zh');
    } else {
        app.constant('DefaultLanguage', 'en');
    }

})();
