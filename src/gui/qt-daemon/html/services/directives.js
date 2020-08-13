// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function () {
    'use strict';

    var module = angular.module('app.directives', []);

    module.animation('.slideAnimation', function () {
        var hideClass = 'ng-hide';
        return {
            beforeAddClass: function (element, className, done) {
                if (className === hideClass) {
                    element.slideUp(done);
                }
            },
            removeClass: function (element, className, done) {
                if (className === hideClass) {
                    element.hide().slideDown(done);
                }
            }
        }
    });

    module.animation('.filterBlockAnimation', function () {
        var hideClass = 'ng-hide';
        return {
            beforeAddClass: function (element, className, done) {
                if (className === hideClass) {
                    element.hide(0, done);
                }
            },
            removeClass: function (element, className, done) {
                if (className === hideClass) {
                    element.hide();
                    setTimeout(function () {
                        element.show(0, done());
                    }, 500);
                }
            }
        }
    });

    module.animation('.filterBlockAnimation2', function () {
        var hideClass = 'ng-hide';
        return {
            beforeAddClass: function (element, className, done) {
                if (className === hideClass) {
                    element.hide(400, done);
                }
            },
            removeClass: function (element, className, done) {
                if (className === hideClass) {
                    element.hide().show(400, function () {
                        $('.switch-option.active').each(function () {
                            $(this).parent().find('.switch-marker').css({
                                left: $(this).position().left,
                                width: $(this).outerWidth()
                            })
                        });
                        done();
                    });
                }
            }
        }
    });

    module.animation('.optionAnimate', function () {
        return {
            beforeAddClass: function (element, className, done) {
                if (className === 'active') {
                    element.parent().find('.switch-marker').css({
                        left: element.position().left,
                        width: element.outerWidth()
                    });
                }
                done();
            }
        }
    });

    module.directive('marketInfoBlur', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {

                var timeout;

                var closeFunction = function (e) {
                    if (!angular.element(e.target).closest('.market-detail-window').length) {
                        element.removeClass('focused');
                        angular.element('body').off('click', closeFunction);
                    }
                };

                element.on('click', function (e) {
                    angular.element('body').click();
                    element.addClass('focused');
                    e.stopPropagation();
                    angular.element('body').on('click', closeFunction);
                    timeout = setTimeout(function () {
                        scope.$digest();
                    }, 100);
                });

                element.on('$destroy', function () {
                    element.off('click');
                    angular.element('body').off('click', closeFunction);
                    clearTimeout(timeout);
                });

            }
        }
    });

    module.directive('initSwitchOption', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                setTimeout(function () {
                    var active = element.find('.switch-option.active');
                    if (active.length) {
                        element.find('.switch-marker').css({
                            left: active.position().left,
                            width: active.outerWidth()
                        });
                    }
                }, 500);
            }
        }
    });

    module.directive('maxLengthField', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var limit = parseInt(attr.maxLengthField);
                element.on('keypress keyup', function (e) {
                    if (e.type === 'keypress' && angular.element(element).get(0).selectionStart === angular.element(element).get(0).selectionEnd) {
                        if (angular.element(element).val().length >= limit) {
                            e.preventDefault();
                        }
                    } else {
                        if (angular.element(element).val().length > limit) {
                            angular.element(element).val(angular.element(element).val().substr(0, limit)).trigger('input');
                        }
                    }
                });
                element.on('$destroy', function () {
                    element.off('keypress keyup');
                });
            }
        }
    });

    module.directive('onReadTextFile', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attr) {
                var fn = $parse(attr.onReadTextFile);
                element.on('change', function (onChangeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (onLoadEvent) {
                        scope.$apply(function () {
                            fn(scope, {ArrayContacts: onLoadEvent.target.result});
                        });
                    };
                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                    angular.element(element).val(null);
                });
                element.on('$destroy', function () {
                    element.off('change');
                });
            }
        };
    }]);

    module.directive('onFinishRender', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope) {
                var timeoutFin = null;
                if (scope.$last === true) {
                    timeoutFin = $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
                scope.$on('$destroy', function () {
                    if (timeoutFin != null) {
                        clearTimeout(timeoutFin);
                    }
                });
            }
        }
    }]);

    module.directive('baseScroll', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                if (!element.hasClass('market-detail-body')) {
                    element.on('scroll', function () {
                        if ($('body>.tooltip').length || $('body>.dropdown-menu:visible').length || ($('body>.table-long-item-inner').length && $('body>.table-long-item-inner').get(0).innerHTML !== element.get(0).innerHTML)) $('body').click();
                    });
                    scope.$on('$destroy', function () {
                        element.off('scroll');
                    });
                }
            }
        }
    });

    module.directive('gradientText', ['$timeout', function ($timeout) {
        return {
            scope: {
                ngValue: '='
            },
            restrict: 'A',
            link: function (scope, element) {
                $timeout(function () {
                    element.css('visibility', 'hidden');

                    var span = document.createElement('span');
                    span.innerHTML = scope.ngValue;
                    span.className = element.get(0).className;
                    angular.element(span).css({
                        position: 'absolute',
                        left: element.get(0).offsetLeft + 'px',
                        'max-width': element.get(0).clientWidth + 'px',
                        'min-width': element.get(0).clientWidth + 'px'
                    });
                    angular.element(span).insertAfter(element);

                    var watchValue = scope.$watch(function () {
                        return scope.ngValue;
                    }, function () {
                        span.innerHTML = scope.ngValue;
                    }, true);

                    element.on('$destroy', function () {
                        angular.element(span).remove();
                        watchValue();
                    });
                }, 100);
            }
        }
    }]);

    module.directive('dashboardCarousel', ['backend', '$rootScope', function (backend, $rootScope) {
        return {
            restrict: 'A',
            templateUrl: 'views/dashboardCarousel.html',
            scope: {
                items: '=',
                height: '='
            },
            controller: function ($scope) {
                $scope.setClipboard = function (str) {
                    backend.setClipboard(str);
                };
                $scope.checkAvailableMining = $rootScope.checkAvailableMining;
                $scope.startMining = $rootScope.startMining;
                $scope.stopMining = $rootScope.stopMining;
                $scope.registerAlias = $rootScope.registerAlias;
                $scope.confirmOff = $rootScope.confirmOff;
                $scope.devOptions = $rootScope.devOptions;
                $scope.openSendMoneyModal = $rootScope.openSendMoneyModal;
                $scope.syncWallet = $rootScope.syncWallet;
                $scope.safeBackup = $rootScope.safeBackup;
                $scope.daemonState = {daemon_network_state: $rootScope.daemonState.daemon_network_state};

                $scope.$on('ngRepeatFinished', function () {
                    $scope.initDashboardCarousel();
                });

                var watchItems = $scope.$watchCollection('items', function (newValue, oldValue) {
                    if (!angular.equals(newValue, oldValue)) {
                        $scope.initDashboardCarousel();
                    }
                });

                $scope.$on('$destroy', function () {
                    watchItems();
                });
            },
            link: function (scope, element) {

                scope.prevItem = function () {
                    if (scope.active_item > 0) {
                        scope.active_item--;
                        element.find('.dashboard-slider-item:nth-child(1)').css('margin-left', -scope.active_item * 25 + '%');

                        if (scope.active_item > 0 && (scope.active_item % 2) === 1) {
                            scope.active_item--;
                            element.find('.dashboard-slider-item:nth-child(1)').css('margin-left', -scope.active_item * 25 + '%');
                        }
                        refreshPoints();
                    }
                };

                scope.nextItem = function () {
                    if (scope.active_item + 2 < scope.items_count) {
                        scope.active_item++;
                        element.find('.dashboard-slider-item:nth-child(1)').css('margin-left', -scope.active_item * 25 + '%');

                        if (scope.active_item + 2 < scope.items_count) {
                            scope.active_item++;
                            element.find('.dashboard-slider-item:nth-child(1)').css('margin-left', -scope.active_item * 25 + '%');
                        }
                        refreshPoints();
                    }
                };

                scope.items_count = scope.items.length;

                var refreshPoints = function () {
                    var points = [];
                    if (scope.items_count > 2) {
                        var carouselActivePoint = Math.ceil(scope.active_item / 2);
                        for (var i = 0; i < Math.ceil(scope.items_count / 2); i++) {
                            if (i === carouselActivePoint) {
                                points.push('active-slide');
                            } else {
                                points.push('');
                            }
                        }
                    }
                    scope.carouselPoints = points;
                };

                scope.goToPage = function (page) {
                    var activeItem = page * 2;
                    if (activeItem >= scope.items_count) {
                        activeItem = scope.items_count - 2;
                    }
                    if (scope.active_item > activeItem) {
                        var max1 = scope.active_item - activeItem;
                        for (var i1 = 0; i1 < max1; i1 = i1 + 2) {
                            scope.prevItem();
                        }
                    } else if (scope.active_item < activeItem) {
                        var max2 = activeItem - scope.active_item;
                        for (var i2 = 0; i2 < max2; i2 = i2 + 2) {
                            scope.nextItem();
                        }
                    }
                };

                scope.initDashboardCarousel = function () {
                    scope.items_count = scope.items.length;
                    scope.active_item = 0;
                    element.find('.dashboard-slider-item').css('margin-left', '0');
                    refreshPoints();
                }

            }
        };
    }]);

    module.directive('safesEmptySlide', function () {
        return {
            restrict: 'A',
            templateUrl: 'views/dashboardEmptySlide.html',
            scope: true,
            controller: 'safeModals',
            link: function (scope, element) {
                scope.collapsed = false;
                var timeout = null;
                element.on('mouseleave', function () {
                    if (scope.collapsed) {
                        timeout = setTimeout(function () {
                            scope.collapsed = false;
                            scope.$digest();
                        }, 100);
                    }
                });
                element.on('$destroy', function () {
                    element.off('mouseleave');
                    if (timeout != null) {
                        clearTimeout(timeout);
                    }
                });
                scope.$watch(function () {
                    return element.children().get(0).scrollTop;
                }, function () {
                    element.children().get(0).scrollTop = 0;
                }, true);
            }
        };
    });

    module.directive('paginator', function () {
        return {
            restrict: 'E',
            scope: {model: '='},
            template:
            '<div class="pagination" ng-style="{\'visibility\': (model.pagesCount > 1 && !model.showAll)? \'visible\': \'hidden\' }">' +
            '<div class="prev-page" ng-click="prev();" ng-style="{\'visibility\': (model.currentPage == 1 || model.showAll) ? \'hidden\' : \'visible\' }">' +
            '<i data-icon="f" class="base-icon pagination-arrow"></i>' +
            '</div>' +
            '<div class="pages">' +
            '<span class="active-page"><input type="text" ng-model="model.currentPage" ng-keyup="enter(false, $event)" ng-blur="enter(true)" class="general-input no-hover" maxlength="3" min="1"></span>' +
            '<span ng-bind="::(\'COMMON.OF\' | translate)"></span>' +
            '<span ng-bind="model.pagesCount"></span>' +
            '</div>' +
            '<div class="next-page" ng-click="next()" ng-style="{\'visibility\': (model.currentPage == model.pagesCount || model.showAll) ? \'hidden\' : \'visible\' }">' +
            '<i data-icon="f" class="base-icon pagination-arrow"></i>' +
            '</div>' +
            '</div>',

            controller: function ($scope) {
                var paginator = $scope.model;
                paginator.lastPage = $scope.model.currentPage;
                paginator.pagesCount = 1;

                function changeEvent() {
                    $scope.$emit('pageChanged');
                }

                paginator.setPage = function (page, important) {
                    if (page && ((page !== paginator.currentPage || page !== paginator.lastPage) || important)) {
                        if (page > 0 && page <= paginator.pagesCount) {
                            paginator.currentPage = page;
                            paginator.lastPage = page;
                            changeEvent();
                        }
                    }
                };
                paginator.Limit = function (arrayFull, withOutCopy) {
                    var array = arrayFull;
                    var Count = array.length;
                    paginator.totalCount = Count;
                    var Pages = Math.ceil(Count / paginator.inPage);
                    paginator.pagesCount = (Pages < 1) ? 1 : Pages;
                    if (Count) {
                        var Offset = (paginator.showAll) ? 0 : (paginator.currentPage - 1) * paginator.inPage;
                        var Limit = paginator.inPage * paginator.currentPage;
                        return (withOutCopy) ? array.slice(Offset, Limit) : angular.copy(array.slice(Offset, Limit));
                    }
                    return (withOutCopy) ? array : angular.copy(array);
                };

                var scrolledBlock = angular.element('.content-wrapper');

                function ScrollEvent(e) {
                    var target = e.target;
                    var scrolled = target.scrollHeight - (target.scrollTop + target.clientHeight);
                    if (scrolled < 200) {
                        $scope.$apply(function () {
                            paginator.setPage(paginator.currentPage + 1);
                        });
                    }
                }

                function ScrollEventRemove() {
                    scrolledBlock.off('scroll', ScrollEvent)
                }

                paginator.viewAll = function (status) {
                    paginator.showAll = status;
                    if (status) {
                        paginator.currentPage = 1;
                        paginator.setPage(paginator.currentPage + 1);
                        scrolledBlock.on('scroll', ScrollEvent);
                    } else {
                        ScrollEventRemove();
                        paginator.setPage(1);
                    }
                };

                $scope.$on('$destroy', function () {
                    ScrollEventRemove()
                })
            },
            link: function (scope) {

                function __noIntFix(page) {
                    return parseInt(page, 0) || 1
                }

                scope.enter = function (isFocusOut, event) {
                    if (scope.model.currentPage.length) {
                        var newPage = __noIntFix(scope.model.currentPage);
                        if (newPage < 1) {
                            newPage = 1
                        }
                        if (newPage > scope.model.pagesCount) {
                            newPage = scope.model.pagesCount;
                        }
                        scope.model.currentPage = newPage;
                    }
                    if (isFocusOut) {
                        scope.model.setPage(__noIntFix(scope.model.currentPage));
                    } else if (event.keyCode && event.keyCode === 13) {
                        scope.model.setPage(__noIntFix(scope.model.currentPage));
                    }
                    if (isFocusOut) {
                        scope.model.setPage(__noIntFix(scope.model.currentPage));
                    }
                };

                scope.next = function () {
                    scope.model.setPage(scope.model.currentPage + 1);
                };

                scope.prev = function () {
                    scope.model.setPage(scope.model.currentPage - 1);
                };

            }
        }
    });

    module.directive('beforeRemoveOffer', function () {
        return {
            restrict: 'A',
            scope: {
                timestamp: '=',
                expiration: '='
            },
            link: function (scope, element) {
                scope.timeout = null;
                if (Date.now() / 1000 > scope.timestamp + (scope.expiration * 86400) - 3600) {
                    element.addClass('deleted-offer');
                }
                scope.timeout = setInterval(function () {
                    if (Date.now() / 1000 > scope.timestamp + (scope.expiration * 86400) - 3600) {
                        element.addClass('deleted-offer');
                    }
                    if (Date.now() / 1000 > scope.timestamp + (scope.expiration * 86400)) {
                        element.remove();
                    }
                }, 60000);
                element.on('$destroy', function () {
                    if (scope.timeout != null) {
                        clearInterval(scope.timeout);
                    }
                });
            }
        };
    });

    module.directive('circleBig', function () {
        return {
            restrict: 'E',
            scope: {
                class: '=',
                percent: '='
            },
            template:
            '<svg width="25rem" height="25rem" xmlns="http://www.w3.org/2000/svg" class="balance-svg">' +
            '<circle class="circle-blank" r="10.75rem" cy="12.5rem" cx="12.5rem" stroke-width="1.5" fill="none"/>' +
            '<circle class="balance-graph" r="10.75rem" cy="12.5rem" cx="12.5rem" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none" ' +
            'style="stroke-dasharray:67.5442rem;" ng-style="{\'stroke-dashoffset\': (67.5442-(( ((animationFinished)?percent:0) /100)*67.5442))+\'rem\' }" />' +
            '</svg>',

            controller: function ($scope, $element) {
                $scope.animationFinished = false;

                var timeout = setTimeout(function () {
                    $scope.animationFinished = true;
                    $scope.$digest();
                }, 400);

                $element.on('$destroy', function () {
                    if (timeout != null) {
                        clearTimeout(timeout);
                    }
                });
            }
        }
    });

    module.directive('circleShow', function () {
        return {
            restrict: 'E',
            scope: {
                item: '=',
                height: '=',
                type: '='
            },
            template:
            '<svg class="status-svg" width="6rem" height="6rem" xmlns="http://www.w3.org/2000/svg" ng-if="type==\'standard\' || !type" uib-tooltip="{{getTooltipText()}}" data-tooltip-class="general-tooltip" data-tooltip-append-to-body="true">' +
            '<circle class="circle-blank" r="2.5rem" cy="3rem" cx="3rem" stroke-width="1" fill="none"/>' +
            '<circle class="status-graph" ng-class="{\'income\': item.is_income, \'outgoing\': !item.is_income}" r="2.5rem" cy="3rem" cx="3rem" stroke-width="2" style="stroke-dasharray: 15.70796325rem;" ng-style="{\'stroke-dashoffset\': getDashOffsetStandard()}" stroke-linejoin="round" stroke-linecap="round" fill="none"/>' +
            '</svg>' +
            '<svg class="status-svg" width="6rem" height="6rem" xmlns="http://www.w3.org/2000/svg" ng-if="type==\'small\'" uib-tooltip="{{getTooltipText()}}" data-tooltip-class="general-tooltip" data-tooltip-append-to-body="true">' +
            '<circle class="circle-blank" r="2.0rem" cy="3rem" cx="3rem" stroke-width="1" fill="none"/>' +
            '<circle class="status-graph" ng-class="{\'income\': item.is_income, \'outgoing\': !item.is_income}" r="2.0rem" cy="3rem" cx="3rem" stroke-width="2" style="stroke-dasharray: 12.56637061rem;" ng-style="{\'stroke-dashoffset\': getDashOffsetSmall()}" stroke-linejoin="round" stroke-linecap="round" fill="none"/>' +
            '</svg>' +
            '<span class="status-inner">' +
            '<i data-icon="c" class="base-icon status-icon" ng-class="{\'income\': (height - item.height >= 10) && (item.height != 0)}" ng-if="item.is_income"></i>' +
            '<i data-icon="c" class="base-icon status-icon rotate-icon" ng-class="{\'outgoing\': (height - item.height >= 10) && (item.height != 0)}" ng-if="!item.is_income"></i>' +
            '</span>' +

            '<i data-icon="\'" class="base-icon mined-icon" ng-if="item.is_mining && item.height != 0"></i>',

            link: function (scope) {

                // stroke-dasharray = pi() * 2 * 2.5rem; // 15,70796325 rem

                scope.getDashOffsetStandard = function () {
                    var percent = scope.getPercent();
                    return 15.70796325 - ((percent / 100) * 15.70796325) + 'rem';
                };

                scope.getDashOffsetSmall = function () {
                    var percent = scope.getPercent();
                    return 12.56637061 - ((percent / 100) * 12.56637061) + 'rem';
                };

                scope.getPercent = function () {
                    if ((scope.height - scope.item.height >= 10 && scope.item.height !== 0) || (scope.item.is_mining === true && scope.item.height === 0)) {
                        return 100;
                    } else {
                        return (scope.item.height === 0 || scope.height - scope.item.height < 0) ? 0 : (scope.height - scope.item.height) * 10;
                    }
                };

                scope.isExclamation = function () {
                    var timeCondition = scope.item.unlock_time > 500000000 && scope.item.unlock_time > new Date().getTime() / 1000;
                    var blockCondition = scope.item.unlock_time <= 500000000 && scope.item.unlock_time > scope.item.height;
                    return timeCondition || blockCondition;
                };

                scope.getTooltipText = function () {
                    var percent = scope.getPercent();
                    return percent / 10 + '/' + 10;
                }

            }
        }
    });

    module.directive('animateTransaction', ['$rootScope', '$filter', function ($rootScope, $filter) {
        return {
            restrict: 'E',
            scope: {
                history: '=',
                mining: '=',
                height: '=',
                type: '='
            },
            template:
            '<div class="safe-status-wrapper" ng-style="{\'display\': ($index==0)? \'flex\':\'none\' }" ng-repeat="item in newHistory track by $index" ng-if="height>=0 && ( (height - item.height) < 10 || item.height == 0) && !(item.is_mining == true && item.height == 0)">' +
            '<div class="transaction-status-indicator">' +
            '<circle-show item="item" height="height" type="type"></circle-show>' +
            '</div>' +
            '<div class="safe-status-amount">{{item.is_income ? moneyParse(item.amount) : moneyParse(item.amount + item.fee)}}</div>' +
            '</div>',

            link: function (scope, element) {

                var criteriaMatch = function () {
                    return function (item) {
                        var rez = false;
                        if (scope.height >= 0 && ((scope.height - item.height) < 10 || item.height === 0) && !(item.is_mining === true && item.height === 0)) {
                            rez = true;
                        }
                        return rez;
                    };
                };

                scope.newHistory = $filter('filter')(scope.history, criteriaMatch());

                var removeBroadHistory = $rootScope.$on('NEED_REFRESH_HISTORY', function () {
                    scope.newHistory = $filter('filter')(scope.history, criteriaMatch());
                });

                scope.moneyParse = $rootScope.moneyParse;

                scope.timeout = null;

                scope.timeout = setTimeout(function () {
                    scope.animateItems();
                }, 2000);

                scope.interval = null;

                element.on('click', function () {
                    if (scope.interval != null) {
                        clearInterval(scope.interval);
                    }
                    scope.animate();
                    scope.animateItems();
                });

                scope.animateItems = function () {
                    scope.interval = setInterval(scope.animate, 3000);
                };

                scope.animate = function () {
                    var isVisible = false;
                    var arrLength = element.children().length;
                    var countVisible = 0;

                    if (arrLength > 1) {
                        $.each(element.children(), function (key, value) {
                            isVisible = ($(value).is(':visible'));
                            if (isVisible) {
                                countVisible++;
                                if (key === arrLength - 1) {
                                    $(value).fadeOut(function () {
                                        if (countVisible === 1) {
                                            $(element.children()[0]).fadeIn();
                                        }
                                    });
                                } else {
                                    $(value).fadeOut(function () {
                                        if (countVisible === 1) {
                                            $(value).next().fadeIn();
                                        }
                                    });
                                }
                            }
                        });
                        if (countVisible === 0 && $(element).is(':visible')) {
                            $(element.children()[0]).show();
                        }
                    } else {
                        $(element.children()[0]).show();
                    }
                };

                element.on('$destroy', function () {
                    if (scope.interval != null) {
                        clearInterval(scope.interval);
                    }
                    if (scope.timeout != null) {
                        clearTimeout(scope.timeout);
                    }
                    scope.history = null;
                    removeBroadHistory();
                    element.off('click');
                });

            }
        };
    }]);

    module.directive('nextFocus', function () {
        return {
            scope: false,
            link: function (scope, element) {
                var timeout = setTimeout(function () {
                    element[0].focus();
                    scope.$digest();
                }, 0);
                element.on('$destroy', function () {
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                });
            }
        };
    });

    module.directive('contactsDropdown', ['$document', function ($document) {
        return {
            restrict: 'E',
            scope: {
                contacts: '=',
                blockclass: '='
            },
            template:
            '<div class="table-long-item-wrapper dropdown-animation {{blockclass}}" ng-class="{\'open\':opened}">' +
            '<div class="table-long-item" ng-click="showBlock()">' +
            '<div style="overflow: hidden; position: relative;"><span style="white-space: nowrap; visibility: hidden; position: absolute;" class="mainItem">{{contacts[0].type}} {{contacts[0].text}}</span></div>' +
            '<span style="white-space: nowrap;" ng-class="{\'table-long-item-text\': long}">{{contacts[0].type}} {{contacts[0].text}}</span>' +
            '<i data-icon="d" class="base-icon table-long-item-icon" ng-if="contacts.length > 1"></i>' +
            '<i data-icon="e" class="base-icon table-long-item-icon" ng-if="long && contacts.length == 1"></i>' +
            '</div>' +
            '<div class="table-long-item-inner base-scroll dark-scroll" ng-class="{\'open\':opened}">' +
            '<div ng-repeat="item in contacts">' +
            '<span>{{item.type}} {{item.text}}</span>' +
            '<i data-icon="&#xe001;" class="base-icon copy-icon" ng-click="$root.setClipboard(item.text);"></i>' +
            '</div>' +
            '</div>' +
            '</div>',

            link: function ($scope, $element) {

                $scope.long = true;
                $scope.opened = false;
                var timeout1, timeout2, timeout3, timeout4, timeout5;
                var openedBlock = $element.find('.table-long-item-inner');

                $scope.showBlock = function () {
                    document.body.appendChild(openedBlock.get(0));
                    openedBlock.css('transition', '0s');
                    openedBlock.css('display', 'block');
                    timeout1 = setTimeout(function () {
                        openedBlock.css('top', $element.get(0).getBoundingClientRect().top + $element.height() + 'px');
                        openedBlock.css('left', $element.get(0).getBoundingClientRect().left + 'px');
                        if (angular.isDefined($element.get(0).getBoundingClientRect()) && openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top + $element.height() > document.body.clientHeight) {
                            openedBlock.css('top', document.body.clientHeight - openedBlock.get(0).clientHeight - 10 + 'px');
                        }
                        if (angular.isDefined($element.get(0).getBoundingClientRect()) && openedBlock.width() + $element.get(0).getBoundingClientRect().left > document.body.clientWidth) {
                            openedBlock.css('left', document.body.clientWidth - openedBlock.width() - 30 + 'px');
                        }
                        timeout2 = setTimeout(function () {
                            openedBlock.css('transition', '');
                            $scope.opened = true;
                            $scope.$digest();
                            timeout3 = setTimeout(function () {
                                $document.one('click', function () {
                                    $scope.opened = false;
                                    $scope.$digest();
                                    timeout4 = setTimeout(function () {
                                        openedBlock.css('display', '');
                                        $element.find('.table-long-item-wrapper').get(0).appendChild(openedBlock.get(0));
                                    }, 350);
                                });
                                openedBlock.on('click', function (e) {
                                    if (!angular.element(e.target).hasClass('copy-icon')) event.stopPropagation();
                                });
                            }, 350);
                        }, 0);
                    }, 0);
                };

                var checkWidth = function () {
                    var outBlock = $element.find('.table-long-item').get(0).clientWidth;
                    var inBlock = $element.find('.mainItem').get(0).clientWidth;
                    if ($scope.contacts.length > 1) inBlock += $element.find('.table-long-item-icon').get(0).clientWidth;
                    $scope.long = (inBlock > outBlock);
                    $scope.$digest();
                };

                timeout5 = setTimeout(function () {
                    checkWidth();
                }, 50);

                $element.on('$destroy', function () {
                    openedBlock.remove();
                    if (timeout1) clearTimeout(timeout1);
                    if (timeout2) clearTimeout(timeout2);
                    if (timeout3) clearTimeout(timeout3);
                    if (timeout4) clearTimeout(timeout4);
                    if (timeout5) clearTimeout(timeout5);
                    openedBlock.off('click');
                });

            }
        }
    }]);

    module.directive('textDropdown', ['$document', function ($document) {
        return {
            restrict: 'E',
            scope: {
                text: '=',
                clipboard: '=',
                blockclass: '='
            },
            template:
            '<div class="table-long-item-wrapper dropdown-animation {{blockclass}}" ng-class="{\'open\':opened}">' +
            '<div class="table-long-item" ng-click="showBlock()">' +
            '<div style="overflow:hidden; position: relative;"><span style="white-space: nowrap; visibility: hidden; position: absolute;" class="mainItem" ng-bind-html="text"></span></div>' +
            '<span style="white-space: nowrap;" ng-class="{\'table-long-item-text\':long}" ng-bind-html="text"></span>' +
            '<i data-icon="e" class="base-icon" ng-if="long"></i>' +
            '</div>' +
            '<div class="table-long-item-inner base-scroll dark-scroll" ng-class="{\'open\':opened}">' +
            '<div>' +
            '<span ng-bind-html="text"></span>' +
            '<i data-icon="&#xe001;" class="base-icon copy-icon" ng-if="clipboard" ng-click="$root.setClipboard(text)"></i>' +
            '</div>' +
            '</div>' +
            '</div>',

            link: function ($scope, $element) {

                $scope.long = true;
                $scope.opened = false;
                var timeout1, timeout2, timeout3, timeout4, timeout5;
                var openedBlock = $element.find('.table-long-item-inner');

                $scope.showBlock = function () {
                    document.body.appendChild(openedBlock.get(0));
                    openedBlock.css('transition', '0s');
                    openedBlock.css('display', 'block');
                    timeout1 = setTimeout(function () {
                        openedBlock.css('top', $element.get(0).getBoundingClientRect().top + $element.height() + 'px');
                        openedBlock.css('left', $element.get(0).getBoundingClientRect().left + 'px');
                        if (angular.isDefined($element.get(0).getBoundingClientRect()) && openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top + $element.height() > document.body.clientHeight) {
                            openedBlock.css('top', document.body.clientHeight - openedBlock.get(0).clientHeight - 10 + 'px');
                        }
                        if (angular.isDefined($element.get(0).getBoundingClientRect()) && openedBlock.width() + $element.get(0).getBoundingClientRect().left > document.body.clientWidth) {
                            openedBlock.css('left', document.body.clientWidth - openedBlock.width() - 30 + 'px');
                        }
                        timeout2 = setTimeout(function () {
                            openedBlock.css('transition', '');
                            $scope.opened = true;
                            $scope.$digest();
                            timeout3 = setTimeout(function () {
                                $document.one('click', function () {
                                    $scope.opened = false;
                                    $scope.$digest();
                                    timeout4 = setTimeout(function () {
                                        openedBlock.css('display', '');
                                        $element.find('.table-long-item-wrapper').get(0).appendChild(openedBlock.get(0));
                                    }, 350);
                                });
                                openedBlock.on('click', function (e) {
                                    if (!angular.element(e.target).hasClass('copy-icon')) event.stopPropagation();
                                });
                            }, 350);
                        }, 0);
                    }, 0);
                };

                var checkWidth = function () {
                    var outBlock = $element.find('.table-long-item').get(0).clientWidth;
                    var inBlock = $element.find('.mainItem').get(0).clientWidth;
                    $scope.long = (inBlock > outBlock);
                    $scope.$digest();
                };

                timeout5 = setTimeout(function () {
                    checkWidth();
                }, 50);

                $element.on('$destroy', function () {
                    openedBlock.remove();
                    if (timeout1) clearTimeout(timeout1);
                    if (timeout2) clearTimeout(timeout2);
                    if (timeout3) clearTimeout(timeout3);
                    if (timeout4) clearTimeout(timeout4);
                    if (timeout5) clearTimeout(timeout5);
                    openedBlock.off('click');
                });
            }
        }
    }]);

    module.directive('placeDropdown', ['textDropdownDirective', function (textDropdownDirective) {
        var link = angular.copy(textDropdownDirective)[0].link;
        var template = angular.copy(textDropdownDirective)[0].template;
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                country: '=',
                city: '=',
                clipboard: '=',
                blockclass: '='
            },
            template: template,
            link: function (scope, element, attr) {
                scope.text = scope.country + ((scope.country && scope.city) ? ', ' + scope.city : scope.city);
                link(scope, element, attr);
            }
        };
    }]);

    module.directive('dateAge', ['marketAge', '$filter', function (marketAge, $filter) {
        return {
            restrict: 'E',
            scope: {
                fromTime: '@'
            },
            template:
            '<span uib-tooltip="{{(isTooltip) ? fromTime : \'\' | intToDate | date:\'dd.MM.yy&nbsp;&nbsp;HH:mm\'}}" data-tooltip-class="general-tooltip" data-tooltip-append-to-body="true">' +
            '<market-age from-time="{{fromTime | intToDate | date: \'medium\'}}"></market-age>' +
            '</span>',

            link: function (scope, element) {
                scope.isTooltip = true;

                var dateFormat = $filter('date')($filter('intToDate')(scope.fromTime), 'medium');
                var fromTime = marketAge.parse(dateFormat);
                if ((Date.now() - fromTime) / 1000 < 60) {
                    scope.isTooltip = false;
                }

                var updateTooltip = setInterval(function () {
                    var dateFormat = $filter('date')($filter('intToDate')(scope.fromTime), 'medium');
                    var fromTime = marketAge.parse(dateFormat);
                    if ((Date.now() - fromTime) / 1000 < 60) {
                        scope.isTooltip = false;
                        scope.$digest();
                    }
                }, 60000);

                element.on('$destroy', function () {
                    clearInterval(updateTooltip);
                });
            }
        }
    }]);

    module.directive('marketAge', ['marketAge', function (marketAge) {
        return {
            scope: {
                fromTime: '@',
                format: '@'
            },
            restrict: 'EA',
            link: function (scope, elem) {
                var fromTime = marketAge.parse(scope.fromTime);
                angular.element(elem).text(marketAge.inWords(Date.now() - fromTime, fromTime, scope.format));

                var update = setInterval(function () {
                    angular.element(elem).text(marketAge.inWords(Date.now() - fromTime, fromTime, scope.format));
                    scope.$digest();
                }, 30000);

                elem.on('$destroy', function () {
                    clearInterval(update);
                });
            }
        };
    }]);

    module.directive('balanceImage', ['CONFIG', function (CONFIG) {
        return {
            restrict: 'EA',
            scope: {
                balance: '='
            },
            template: '<div class="coins-icon {{coinsClass}}"></div>',
            link: function (scope) {
                var watchBalance = scope.$watch('balance', function (bal) {
                    reImage(bal)
                });
                var pow = Math.pow(10, CONFIG.CDDP);
                var reImage = function (balance) {
                    var bl = balance / pow;
                    if (bl > 0 && bl <= 1.99) {
                        scope.coinsClass = 'coins1';
                    } else if (bl >= 2 && bl < 11) {
                        scope.coinsClass = 'coins2';
                    } else if (bl >= 11 && bl < 50) {
                        scope.coinsClass = 'coins3';
                    } else if (bl >= 50 && bl < 100) {
                        scope.coinsClass = 'coins4';
                    } else if (bl >= 100 && bl < 150) {
                        scope.coinsClass = 'coins5';
                    } else if (bl >= 150 && bl < 200) {
                        scope.coinsClass = 'coins6';
                    } else if (bl >= 200 && bl < 250) {
                        scope.coinsClass = 'coins7';
                    } else if (bl >= 250 && bl < 300) {
                        scope.coinsClass = 'coins8';
                    } else if (bl >= 300 && bl < 500) {
                        scope.coinsClass = 'coins9';
                    } else if (bl >= 500 && bl < 2000) {
                        scope.coinsClass = 'coins10';
                    } else if (bl >= 2000) {
                        scope.coinsClass = 'coins11';
                    } else {
                        scope.coinsClass = 'coins-empty';
                    }
                };
                scope.$on('$destroy', function () {
                    watchBalance();
                });
            }
        };
    }]);

    module.directive('aliasDisplay', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                alias: '=',
                notshowcomment: '='
            },
            templateUrl: 'views/aliasDisplay.html',
            link: function (scope, element) {
                scope.longName = false;
                scope.firstHide = {opacity: 0};
                var timerSafeName;

                timerSafeName = $timeout(function () {
                    var safeName = element.find('.safe-alias-name');
                    var w1 = safeName.width();
                    var w2 = safeName.children('span').width();
                    scope.longName = (w2 > w1);
                    scope.firstHide = {};
                }, 0);

                element.on('$destroy', function () {
                    if (timerSafeName) $timeout.cancel(timerSafeName);
                });
            }
        }
    }]);

    module.directive('contactDisplay', ['$location', function ($location) {
        return {
            restrict: 'AE',
            scope: {
                contact: '='
            },
            templateUrl: 'views/contactDisplay.html',
            controller: function ($scope) {
                $scope.goToHrefPage = function () {
                    $location.path('/contact/' + $scope.contact.id);
                }
            }
        }
    }]);

    module.directive('paymentDisplay', ['market', function (market) {
        return {
            restrict: 'AE',
            scope: {
                paymentTypes: '='
            },
            template: '<i data-icon="{{type.classname}}" class="base-icon payment-type-icon" uib-tooltip="{{::(type.title | translate)}}" data-tooltip-class="general-tooltip" data-tooltip-append-to-body="true" ng-repeat="type in localPaymentTypes track by $index"></i>',
            link: function (scope) {
                if (scope.paymentTypes !== '') {
                    var defaultTypes = ['BTX', 'BCX', 'CSH'];
                    var availablePaymentTypes = market.paymentTypes;
                    var offerPaymentTypes;
                    try {
                        offerPaymentTypes = angular.fromJson(scope.paymentTypes);
                    } catch (err) {
                        offerPaymentTypes = [];
                    }
                    scope.localPaymentTypes = [];
                    if (offerPaymentTypes.indexOf('CSH') > -1) {
                        scope.localPaymentTypes.push(availablePaymentTypes['CSH'])
                    }
                    if (offerPaymentTypes.indexOf('BCX') > -1) {
                        scope.localPaymentTypes.push(availablePaymentTypes['BCX'])
                    }
                    if (offerPaymentTypes.indexOf('BTX') > -1) {
                        scope.localPaymentTypes.push(availablePaymentTypes['BTX'])
                    }
                    var availableEPS = false;
                    var title = '';
                    for (var i = 0, length = offerPaymentTypes.length; i < length; i++) {
                        if (i in offerPaymentTypes) {
                            if (defaultTypes.indexOf(offerPaymentTypes[i]) === -1 && offerPaymentTypes[i] !== 'EPS') {
                                availableEPS = true;
                                title = title + offerPaymentTypes[i] + ', ';
                            }
                        }
                    }
                    if (availableEPS) {
                        scope.localPaymentTypes.push({
                            classname: availablePaymentTypes['EPS'].classname,
                            title: title.substring(0, title.length - 2)
                        });
                    }
                }
            }
        }
    }]);

    module.directive('selectWatcher', ['$timeout', function ($timeout) {
        return {
            link: function (scope, element, attr) {
                var timeout1;
                var timeout2;
                var select = angular.element(element).parent();
                select.selectpicker();
                var last = attr.last;
                if (last === 'true') {
                    timeout2 = $timeout(function () {
                        var FirstSelect = select.find('>:first-child');
                        if (FirstSelect.length && FirstSelect.html() === '') {
                            FirstSelect.remove();
                        }
                        select.selectpicker('refresh');
                    });
                }
                if (attr.selectWatcher === 'open') {
                    timeout1 = setTimeout(function () {
                        select.next().addClass('open')
                    }, 0);
                }
                element.on('$destroy', function () {
                    if (timeout2) $timeout.cancel(timeout2);
                    if (timeout1) clearTimeout(timeout1);
                });
            }
        };
    }]);

    module.directive('animateSearch', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            scope: {
                opened: '=',
                check: '='
            },
            controller: function ($scope, $element) {
                if ($scope.opened) {
                    $element.addClass('open');
                }
            },
            link: function ($scope, $element) {

                var blurTimer = 0;
                var blurFinished = true;
                var blurTimeout;

                var search = angular.element($element);
                var input = search.find('.search-input');
                var button = search.find('.search-icon');

                var toggleAction = function () {
                    if (!blurFinished) return;
                    if (blurTimer) $timeout.cancel(blurTimer);
                    if (!search.hasClass('open')) {
                        search.addClass('open');
                        input.focus();
                        if ($scope.check) {
                            search.parent().find($scope.check).show();
                        }
                    } else {
                        search.removeClass('open');
                        blurTimer = $timeout(function () {
                            input.val('').change();
                        }, 500);
                        search.parent().find($scope.check).hide();
                    }
                };

                button.on('click', toggleAction);

                var blurAction = function () {
                    if ($scope.check) return;
                    if (input.hasClass('doNotDoBlur')) return;
                    if (!input.val().trim().length) {
                        search.removeClass('open');
                        search.parent().find($scope.check).hide();
                        blurFinished = false;
                        search.find('.search-input-hidden').focus();
                        blurTimeout = setTimeout(function () {
                            blurFinished = true;
                        }, 500);
                    }
                };

                input.on('blur', blurAction);

                $element.on('$destroy', function () {
                    button.off('click', toggleAction);
                    input.off('blur', blurAction);
                    if (blurTimer) $timeout.cancel(blurTimer);
                    if (blurTimeout) clearTimeout(blurTimeout);
                });

            }
        }
    }]);

    module.directive('airCalendar', ['$rootScope', '$filter', function ($rootScope, $filter) {
        return {
            restrict: 'A',
            scope: {
                minDate: '=',
                maxDate: '=',
                ngModel: '='
            },
            link: function (scope, element, attr) {

                var datepic = angular.element(element);
                var params = {
                    autoClose: true,
                    toggleSelected: false,
                    dateFormat: 'dd/mm/yyyy',
                    language: {
                        daysMin: [
                            $filter('translate')('DATEPICKER.WEEKDAY.SUN.SHORT'),
                            $filter('translate')('DATEPICKER.WEEKDAY.MON.SHORT'),
                            $filter('translate')('DATEPICKER.WEEKDAY.TUE.SHORT'),
                            $filter('translate')('DATEPICKER.WEEKDAY.WED.SHORT'),
                            $filter('translate')('DATEPICKER.WEEKDAY.THU.SHORT'),
                            $filter('translate')('DATEPICKER.WEEKDAY.FRI.SHORT'),
                            $filter('translate')('DATEPICKER.WEEKDAY.SAT.SHORT')
                        ],
                        months: [
                            $filter('translate')('MINING.CHART.JAN.FULL'),
                            $filter('translate')('MINING.CHART.FEB.FULL'),
                            $filter('translate')('MINING.CHART.MAR.FULL'),
                            $filter('translate')('MINING.CHART.APR.FULL'),
                            $filter('translate')('MINING.CHART.MAY.FULL'),
                            $filter('translate')('MINING.CHART.JUN.FULL'),
                            $filter('translate')('MINING.CHART.JUL.FULL'),
                            $filter('translate')('MINING.CHART.AUG.FULL'),
                            $filter('translate')('MINING.CHART.SEP.FULL'),
                            $filter('translate')('MINING.CHART.OCT.FULL'),
                            $filter('translate')('MINING.CHART.NOV.FULL'),
                            $filter('translate')('MINING.CHART.DEC.FULL')
                        ],
                        monthsShort: [
                            $filter('translate')('MINING.CHART.JAN'),
                            $filter('translate')('MINING.CHART.FEB'),
                            $filter('translate')('MINING.CHART.MAR'),
                            $filter('translate')('MINING.CHART.APR'),
                            $filter('translate')('MINING.CHART.MAY'),
                            $filter('translate')('MINING.CHART.JUN'),
                            $filter('translate')('MINING.CHART.JUL'),
                            $filter('translate')('MINING.CHART.AUG'),
                            $filter('translate')('MINING.CHART.SEP'),
                            $filter('translate')('MINING.CHART.OCT'),
                            $filter('translate')('MINING.CHART.NOV'),
                            $filter('translate')('MINING.CHART.DEC')
                        ],
                        firstDay: (['en', 'ko', 'ja'].indexOf($rootScope.settings.app_interface.general.language) > -1) ? 0 : 1
                    },
                    maxDate: new Date(),
                    position: 'top left',
                    navTitles: {
                        days: 'MM \' yy'
                    },
                    onSelect: function () {
                        datepic.trigger('input');
                    }
                }, zParams = attr.airCalendar;
                if (zParams.length) $.extend(params, scope.$eval(zParams));

                var calendar = datepic.datepicker(params).data('datepicker');

                function getDateFromFormat(date, defDate) {
                    if (date) {
                        date = date.split('/');
                        return new Date(parseInt(date[2]), parseInt(date[1]) - 1, parseInt(date[0]));
                    }
                    return (defDate) ? defDate : false;
                }

                if (scope.ngModel) calendar.selectDate(getDateFromFormat(scope.ngModel, new Date()));

                var watchMaxDate = scope.$watch('maxDate', function () {
                    calendar.update('maxDate', getDateFromFormat(scope.maxDate, new Date()));
                });

                var watchMinDate = scope.$watch('minDate', function () {
                    if (angular.isUndefined(scope.minDate)) {
                        calendar.update('minDate', new Date(2018, 0, 1));
                    } else {
                        calendar.update('minDate', getDateFromFormat(scope.minDate));
                    }
                });

                element.on('$destroy', function () {
                    watchMaxDate();
                    watchMinDate();
                    calendar.destroy();
                });

            }
        }
    }]);

    module.directive('formPassword', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element) {
                element.on('click', function () {
                    var $input = element.parent().find('.general-input');
                    $input.attr('type', ($input.attr('type') !== 'text') ? 'text' : 'password');
                    if ($input.attr('type') === 'text') {
                        element.addClass('open');
                    } else {
                        element.removeClass('open');
                    }
                });
                element.on('$destroy', function () {
                    element.off('click');
                });
            }
        };
    });

    module.directive('safeMenu', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            scope: true,
            templateUrl: 'views/safeMenu.html',
            link: function (scope) {
                scope.mainLinkEnabled = function () {
                    return !(!scope.safe.loaded || $rootScope.daemonState.daemon_network_state === 0 || $rootScope.daemonState.daemon_network_state === 1);
                }
            }
        }
    }]);

    module.directive('safeAddressCopy', function () {
        return {
            restrict: 'E',
            scope: {
                address: '='
            },
            template:
            '<div class="safe-address dropdown-animation contextMenuButton" contextMenuEnabledItems="copy" contextMenuCopyText="{{address}}" uib-dropdown ng-if="address">' +
            '<div class="safe-address-wrap" uib-dropdown-toggle ng-click="showBlock()">' +
            '<span class="safe-address-text" ng-bind="address"></span>' +
            '<i data-icon="e" class="base-icon safe-address-icon"></i>' +
            '</div>' +
            '<div class="safe-address-inner dropdown-menu" uib-dropdown-menu>' +
            '<span class="safe-address-inner-text" ng-bind="address"></span>' +
            '<i data-icon="&#xe001;" class="base-icon copy-icon" ng-click="$root.setClipboard(address);"></i>' +
            '</div>' +
            '</div>',

            link: function ($scope, $element) {

                var timeout1, timeout2;
                var openedBlock = $element.find('.safe-address-inner');

                timeout1 = setTimeout(function () {
                    if (!openedBlock.length) openedBlock = $element.find('.safe-address-inner');
                    if (angular.isDefined($element.get(0)) && angular.isDefined($element.get(0).getBoundingClientRect()) && angular.isDefined(document.body) && angular.isDefined(openedBlock.get(0)) && openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top > document.body.clientHeight) {
                        openedBlock.css('top', document.body.clientHeight - (openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top) - 10 + 'px');
                    }
                }, 100);

                $scope.showBlock = function () {
                    if (!openedBlock.length) openedBlock = $element.find('.safe-address-inner');
                    openedBlock.css('transition', '0s');
                    openedBlock.css('opacity', '0');
                    openedBlock.css('top', '');
                    timeout2 = setTimeout(function () {
                        openedBlock.css('transition', '');
                        openedBlock.css('opacity', '');
                        if (angular.isDefined($element.get(0).getBoundingClientRect()) && openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top > document.body.clientHeight) {
                            openedBlock.css('top', document.body.clientHeight - (openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top) - 10 + 'px');
                        }
                    }, 0);
                };

                $element.on('$destroy', function () {
                    openedBlock.remove();
                    if (timeout1) clearTimeout(timeout1);
                    if (timeout2) clearTimeout(timeout2);
                });

            }
        }
    });

    module.directive('safeAddressAliasCopy', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                address: '='
            },
            template:
            '<div class="safe-address dropdown-animation" uib-dropdown ng-if="address">' +
            '<div class="safe-address-wrap contextMenuButton" contextMenuEnabledItems="copy" contextMenuCopyText="{{address[0]}}" uib-dropdown-toggle ng-click="showBlock()">' +
            '<span class="safe-address-text" ng-bind="address[0]"></span>' +
            '<i data-icon="e" class="base-icon safe-address-icon" ng-if="address.length == 1"></i>' +
            '<i data-icon="d" class="base-icon safe-address-icon" ng-if="address.length > 1"></i>' +
            '</div>' +
            '<div class="safe-address-inner dropdown-menu base-scroll" uib-dropdown-menu>' +
            '<div class="contact-address" ng-repeat="oneAlias in localAliases">' +
            '<span class="safe-address-inner-text contextMenuButton" contextMenuEnabledItems="copy" contextMenuCopyText="{{oneAlias.address}}" ng-bind="oneAlias.address"></span>' +
            '<div class="safe-address-inner-additional">' +
            '<i data-icon="&#xe001;" class="base-icon copy-icon" ng-click="$root.setClipboard(oneAlias.address);"></i>' +
            '<alias-display class="safe-address-inner-alias" ng-if="oneAlias.alias.name" alias="oneAlias.alias"></alias-display>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<alias-display ng-if="localAliases[0].alias.name" alias="localAliases[0].alias"></alias-display>',

            link: function ($scope, $element) {

                $scope.localAliases = [];
                angular.forEach($scope.address, function (item) {
                    $scope.localAliases.push({address: item, alias: $rootScope.getSafeAlias(item)});
                });

                var timeout1, timeout2;
                var openedBlock = $element.find('.safe-address-inner');

                timeout1 = setTimeout(function () {
                    if (!openedBlock.length) openedBlock = $element.find('.safe-address-inner');
                    if (angular.isDefined($element.get(0).getBoundingClientRect()) && openedBlock.get(0) && openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top > document.body.clientHeight) {
                        openedBlock.css('top', document.body.clientHeight - (openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top) - 10 + 'px');
                    }
                }, 100);

                $scope.showBlock = function () {
                    if (!openedBlock.length) openedBlock = $element.find('.safe-address-inner');
                    openedBlock.css('transition', '0s');
                    openedBlock.css('opacity', '0');
                    openedBlock.css('top', '');
                    timeout2 = setTimeout(function () {
                        openedBlock.css('transition', '');
                        openedBlock.css('opacity', '');
                        if (angular.isDefined($element.get(0).getBoundingClientRect()) && openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top > document.body.clientHeight) {
                            openedBlock.css('top', document.body.clientHeight - (openedBlock.get(0).clientHeight + $element.get(0).getBoundingClientRect().top) - 10 + 'px');
                        }
                    }, 0);
                };

                $element.on('$destroy', function () {
                    openedBlock.remove();
                    if (timeout1) clearTimeout(timeout1);
                    if (timeout2) clearTimeout(timeout2);
                });

            }
        }
    }]);

    module.directive('contextMenu', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
        return {
            restrict: 'E',
            scope: false,
            template:
            '<div class="contextMenu" tabindex="-1" style="display:none">' +
            '<ul>' +
            '<li ng-if="copy" ng-click="sendCopy()" data-ng-disabled="!copyText.length" translate>CONTEXT.MENU.COPY</li>' +
            '<li ng-if="paste" ng-click="sendPaste()" translate>CONTEXT.MENU.PASTE</li>' +
            '<li ng-if="cut" ng-click="sendCut()" data-ng-disabled="!copyText.length" translate>CONTEXT.MENU.CUT</li>' +
            '<li ng-if="select" ng-click="sendSelect()" translate>CONTEXT.MENU.SELECT</li>' +
            '</ul>' +
            '</div>',

            link: function (scope) {

                var timerHide = false;
                var watchCopyText = false;
                var target = undefined;
                var menu = angular.element('.contextMenu');

                scope.sendCopy = function () {
                    if (scope.copyText.length) {
                        $rootScope.setClipboard(scope.copyText);
                        menu.blur();
                        if (watchCopyText) watchCopyText();
                    }
                };

                scope.sendCut = function () {
                    if (scope.copyText.length && angular.isDefined(target)) {
                        $rootScope.setClipboard(scope.copyText);
                        var _pre = target.value.substring(0, target.selectionStart);
                        var _aft = target.value.substring(target.selectionEnd, target.value.length);
                        angular.element(target).val(_pre + _aft).change();
                        if (angular.element(target).hasClass('textarea_count_rows')) angular.element(target).keyup();
                        angular.element(target).focus();
                        menu.blur();
                        if (watchCopyText) watchCopyText();
                    }
                };

                scope.sendSelect = function () {
                    if (angular.isDefined(target)) {
                        if (angular.element(target).parent().hasClass('angucomplete-holder')) {
                            $timeout(function () {
                                target.select();
                            }, 300);
                        } else {
                            target.select();
                        }
                        menu.blur();
                        if (watchCopyText) watchCopyText();
                    }
                };

                scope.sendPaste = function () {
                    if (angular.isDefined(target)) {
                        $rootScope.getClipboard(function (status, clipboard) {
                            clipboard = String(clipboard);
                            if (typeof clipboard !== 'string' || clipboard.length) {
                                var canUseSelection = ((target.selectionStart) || (target.selectionStart == '0'));
                                if (canUseSelection) {
                                    var _pre = target.value.substring(0, target.selectionStart);
                                    var _aft = target.value.substring(target.selectionEnd, target.value.length);
                                }
                                var text = (!canUseSelection) ? clipboard : _pre + clipboard + _aft;
                                var maxlength = angular.element(target).attr('maxlength');
                                if (angular.isDefined(maxlength) && parseInt(maxlength) > 0) {
                                    text = text.substr(0, parseInt(maxlength));
                                }
                                angular.element(target).val(text).change();
                                if (angular.element(target).hasClass('textarea_count_rows')) angular.element(target).keyup();
                                angular.element(target).focus();
                                if (angular.element(target).parent().hasClass('angucomplete-holder')) {
                                    $timeout(function () {
                                        angular.element(target).keyup();
                                    }, 300);
                                }
                            }
                            menu.blur();
                            if (watchCopyText) watchCopyText();
                        });
                    }
                };

                var body = angular.element('body');

                body.on('keydown', 'input.contextMenuButton,textarea.contextMenuButton', function () {
                    if (menu.css('display') === 'block') {
                        return false;
                    }
                });

                body.on('blur', 'input.contextMenuButton,textarea.contextMenuButton', function () {
                    if (menu.css('display') === 'block') {
                        timerHide = $timeout(function () {
                            menu.blur();
                            if (watchCopyText) watchCopyText();
                        }, 300);
                    }
                });

                body.on('mousedown', '.contextMenuButton', function (event) {
                    if (event.button === 2) {
                        if ((event.clientX + menu.width()) > window.innerWidth) {
                            menu.css('left', event.clientX - menu.width());
                        } else {
                            menu.css('left', event.clientX);
                        }
                        if ((event.clientY + menu.height()) > window.innerHeight) {
                            menu.css('top', event.clientY - menu.height());
                        } else {
                            menu.css('top', event.clientY);
                        }

                        if (menu.css('display') === 'block' && target === event.target) {
                            return false;
                        } else {
                            scope.copy = true;
                            scope.paste = true;
                            scope.cut = true;
                            scope.select = true;
                            scope.copyText = '';
                            var contextMenuEnabledItems = angular.element(this).attr('contextMenuEnabledItems');
                            if (angular.isDefined(contextMenuEnabledItems) && contextMenuEnabledItems.length) {
                                if (contextMenuEnabledItems.indexOf('copy') === -1) scope.copy = false;
                                if (contextMenuEnabledItems.indexOf('paste') === -1) scope.paste = false;
                                if (contextMenuEnabledItems.indexOf('cut') === -1) scope.cut = false;
                                if (contextMenuEnabledItems.indexOf('select') === -1) scope.select = false;
                            }
                            var contextMenuCopyText = angular.element(this).attr('contextMenuCopyText');
                            if (angular.isDefined(contextMenuCopyText) && contextMenuCopyText.length) {
                                scope.copyText = contextMenuCopyText;
                            }

                            if (this.nodeName.toUpperCase() === 'TEXTAREA' || this.nodeName.toUpperCase() === 'INPUT') {
                                target = this;
                                angular.element(target).addClass('doNotDoBlur');
                                if (watchCopyText) watchCopyText();
                                watchCopyText = scope.$watch(
                                    function () {
                                        return target.selectionEnd;
                                    },
                                    function () {
                                        var canUseSelection = ((target.selectionStart) || (target.selectionStart == '0'));
                                        var SelectedText = (canUseSelection) ? target.value.substring(target.selectionStart, target.selectionEnd) : target.value;
                                        scope.copyText = String(SelectedText);
                                    },
                                    true
                                );
                            } else {
                                target = undefined;
                                if (watchCopyText) watchCopyText();
                            }

                            $timeout(function () {
                                if (timerHide) $timeout.cancel(timerHide);
                                menu.css('display', 'block');
                                if (angular.isUndefined(target)) {
                                    menu.focus();
                                }
                            });
                        }
                    } else {
                        menu.blur();
                        if (watchCopyText) watchCopyText();
                    }
                });

                menu.on('blur', function () {
                    menu.css('display', 'none');
                    if (watchCopyText) watchCopyText();
                    var dItem = angular.element('.detailed-item');
                    if (dItem.length) {
                        dItem.focus();
                    }
                    if (angular.isDefined(target) && angular.element(target).hasClass('doNotDoBlur')) angular.element(target).removeClass('doNotDoBlur');
                });

                scope.$on('$destroy', function () {
                    if (timerHide) $timeout.cancel(timerHide);
                });

            }
        }
    }]);

    module.directive('stateStatus', function () {
        return {
            restrict: 'E',
            scope: {
                mainstate: '=',
                customer: '='
            },
            template: '<div class="transaction-status" translate>{{state.status}}</div>' +
            '<div class="transaction-info" ng-if="state.secondStatus" translate>{{state.SecondStatus}}</div>' +
            '<button class="reply-btn" type="button" ng-if="!customer && (mainstate==1 || mainstate == 5)" ng-click="showDealInfo(contract)">' +
            '<i data-icon="O" class="base-icon"></i>' +
            '<span class="btn-text" translate>DEALS.ANSWER</span>' +
            '</button>',

            link: function (scope) {

                function getStateSeller(stateNum) {
                    var state = {};
                    switch (stateNum) {
                        case 1:
                            state.status = 'DEALS.PROPOSAL_SENT';
                            state.secondStatus = '';
                            break;
                        case 110:
                            state.status = 'DEALS.SELLER_IGNORE_CUSTOMER_DEAL';
                            state.secondStatus = false;
                            break;
                        case 201:
                            state.status = 'DEALS.ACCEPT_STATE';
                            state.secondStatus = 'DEALS.ACCEPT_STATE_WAIT';
                            break;
                        case 2:
                            state.status = 'DEALS.CUSTOMER_WAITING_GOOD';
                            state.secondStatus = 'DEALS.PLEDGE_INCLUDED';
                            break;
                        case 3:
                            state.status = 'DEALS.DEAL_OK';
                            state.secondStatus = 'DEALS.PLEDGE_IS_OK';
                            break;
                        case 4:
                            state.status = 'DEALS.ACTIONS.GOOD_NOT_GOT';
                            state.secondStatus = 'DEALS.PLEDGE_BURNED';
                            break;
                        case 5:
                            state.status = 'DEALS.CUSTOMER_SENTENCE_FOR_CANCEL_DEAL';
                            state.secondStatus = false;
                            break;
                        case 601:
                            state.status = 'DEALS.DEALS_CANCELED_WAIT';
                            state.secondStatus = false;
                            break;
                        case 6:
                            state.status = 'DEALS.DEAL_CANCELED';
                            state.secondStatus = 'DEALS.PLEDGE_IS_RETURNED';
                            break;
                        case 130:
                            state.status = 'DEALS.SELLER_IGNORE_SENTENCE_ABOUT_CANCELLING';
                            state.secondStatus = false;
                            break;
                        case 140:
                            state.status = 'DEALS.TRANSACTION_CANCELED';
                            state.secondStatus = false;
                            break;
                        default:
                            state.status = false;
                            state.secondStatus = false;
                            break;
                    }
                    return state;
                }

                function getStateCustomer(stateNum) {
                    var state = {};
                    switch (stateNum) {
                        case 1:
                            state.status = 'DEALS.CUSTOMER_WAITING_ANSWER';
                            state.secondStatus = 'DEALS.YOU_CONTRIBUTED_PLEDGE';
                            break;
                        case 110:
                            state.status = 'DEALS.SELLER_IGNORE_DEAL_SENTENCE';
                            state.secondStatus = 'DEALS.YOU_PLEDGE_RETURNED';
                            break;
                        case 201:
                            state.status = 'DEALS.SELLER_OK';
                            state.secondStatus = 'DEALS.ACCEPT_STATE_WAIT';
                            break;
                        case 2:
                            state.status = 'DEALS.SELLER_OK';
                            state.secondStatus = 'DEALS.PLEDGE_INCLUDED';
                            break;
                        case 120:
                            state.status = 'DEALS.WAITING_GOOD_FROM_SELLER';
                            state.secondStatus = 'DEALS.PLEDGE_INCLUDED';
                            break;
                        case 3:
                            state.status = 'DEALS.DEAL_OK';
                            state.secondStatus = 'DEALS.PLEDGE_IS_OK';
                            break;
                        case 4:
                            state.status = 'DEALS.ACTIONS.GOOD_NOT_GOT';
                            state.secondStatus = 'DEALS.PLEDGE_BURNED';
                            break;
                        case 5:
                            state.status = 'DEALS.WAITING_FROM_SELLER_FOR_CANCEL';
                            state.secondStatus = false;
                            break;
                        case 601:
                            state.status = 'DEALS.DEALS_CANCELED_WAIT';
                            state.secondStatus = false;
                            break;
                        case 6:
                            state.status = 'DEALS.DEAL_CANCELED';
                            state.secondStatus = 'DEALS.PLEDGE_IS_RETURNED';
                            break;
                        case 130:
                            state.status = 'DEALS.SELLER_IGNORE_CANCELLING_SENTENCE';
                            state.secondStatus = false;
                            break;
                        case 140:
                            state.status = 'DEALS.TRANSACTION_CANCELED';
                            state.secondStatus = false;
                            break;
                        default:
                            state.status = false;
                            state.secondStatus = false;
                            break;
                    }
                    return state;
                }

                function getState() {
                    if (scope.customer) {
                        scope.state = getStateCustomer(scope.mainstate);
                    } else {
                        scope.state = getStateSeller(scope.mainstate);
                    }
                }

                getState();

                var watchState = scope.$watch(
                    function () {
                        return scope.mainstate
                    },
                    function () {
                        getState();
                    }
                );

                scope.$on('$destroy', function () {
                    watchState();
                });

            }
        };
    });

    module.directive('elastic', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function ($scope, element) {
                $scope.initialHeight = $scope.initialHeight || element[0].style.height;
                var resize = function () {
                    element[0].style.height = $scope.initialHeight;
                    element[0].style.height = '' + element[0].scrollHeight + 'px';
                };
                element.on('input change', resize);
                $timeout(resize, 0);
            }
        };
    }]);

    module.directive('selectpicker', ['$parse', '$timeout', function ($parse, $timeout) {
        return {
            restrict: 'A',
            priority: 1000,
            scope: {
                nameoptions: '=',
                ngModel: '='
            },
            link: function (scope, element, attr) {

                function refresh(newVal) {
                    scope.$applyAsync(function () {
                        if (attr.ngOptions && /track by/.test(attr.ngOptions)) element.val(newVal);
                        element.selectpicker('setStyle', 'sLongLoading', 'remove');
                        element.selectpicker('refresh');
                    });
                }

                element.selectpicker($parse(attr.selectpicker)());
                element.selectpicker({iconBase: '', tickIcon: ''});
                element.selectpicker('refresh');

                if (attr.ngModel || attr.ngDisabled) {
                    element.selectpicker('setStyle', 'sLongLoading', 'add');
                }

                var w1, w2, w3, w4;

                w1 = scope.$watch(function () {
                    return scope.ngModel;
                }, refresh, true);

                if (scope.nameoptions) {
                    w2 = scope.$watch(function () {
                        return scope.nameoptions;
                    }, function () {
                        refresh();
                    }, true);
                }

                if (attr.title) {
                    w3 = scope.$watch(function () {
                        return attr.title;
                    }, function () {
                        element.find('.bs-title-option').html(attr.title);
                        element.selectpicker({title: undefined});
                        refresh();
                    }, true);
                }

                if (attr.ngDisabled) {
                    w4 = scope.$watch(attr.ngDisabled, refresh, true);
                }

                var timerShow;

                element.on('shown.bs.select', function () {
                    timerShow = $timeout(function () {
                        var clientHeight = element.data('selectpicker').$menu.children()[0].clientHeight;
                        var scrollHeight = element.data('selectpicker').$menu.children()[0].scrollHeight;
                        if (clientHeight < scrollHeight) {
                            if (!element.data('selectpicker').$menu.hasClass('haveScroll')) element.data('selectpicker').$menu.addClass('haveScroll');
                        } else {
                            if (element.data('selectpicker').$menu.hasClass('haveScroll')) element.data('selectpicker').$menu.removeClass('haveScroll');
                        }
                    }, 500);
                });

                scope.$on('$destroy', function () {
                    if (w1) w1();
                    if (w2) w2();
                    if (w3) w3();
                    if (w4) w4();
                    element.selectpicker('destroy');
                    if (timerShow) $timeout.cancel(timerShow);
                    element.off('shown.bs.select');
                });
            }
        };
    }]);

    module.directive('uiChart', ['$timeout', '$rootScope', '$filter', function ($timeout, $rootScope, $filter) {
        return {
            restrict: 'EACM',
            template: '<div></div>',
            replace: true,
            link: function (scope, elem, attr) {

                var shortMonths = [
                    $filter('translate')('MINING.CHART.JAN'),
                    $filter('translate')('MINING.CHART.FEB'),
                    $filter('translate')('MINING.CHART.MAR'),
                    $filter('translate')('MINING.CHART.APR'),
                    $filter('translate')('MINING.CHART.MAY'),
                    $filter('translate')('MINING.CHART.JUN'),
                    $filter('translate')('MINING.CHART.JUL'),
                    $filter('translate')('MINING.CHART.AUG'),
                    $filter('translate')('MINING.CHART.SEP'),
                    $filter('translate')('MINING.CHART.OCT'),
                    $filter('translate')('MINING.CHART.NOV'),
                    $filter('translate')('MINING.CHART.DEC')
                ];

                var months = [
                    $filter('translate')('MINING.CHART.JAN.FULL'),
                    $filter('translate')('MINING.CHART.FEB.FULL'),
                    $filter('translate')('MINING.CHART.MAR.FULL'),
                    $filter('translate')('MINING.CHART.APR.FULL'),
                    $filter('translate')('MINING.CHART.MAY.FULL'),
                    $filter('translate')('MINING.CHART.JUN.FULL'),
                    $filter('translate')('MINING.CHART.JUL.FULL'),
                    $filter('translate')('MINING.CHART.AUG.FULL'),
                    $filter('translate')('MINING.CHART.SEP.FULL'),
                    $filter('translate')('MINING.CHART.OCT.FULL'),
                    $filter('translate')('MINING.CHART.NOV.FULL'),
                    $filter('translate')('MINING.CHART.DEC.FULL')
                ];

                var weekdays = [
                    $filter('translate')('MINING.CHART.WEEKDAY.SUN'),
                    $filter('translate')('MINING.CHART.WEEKDAY.MON'),
                    $filter('translate')('MINING.CHART.WEEKDAY.TUE'),
                    $filter('translate')('MINING.CHART.WEEKDAY.WED'),
                    $filter('translate')('MINING.CHART.WEEKDAY.THU'),
                    $filter('translate')('MINING.CHART.WEEKDAY.FRI'),
                    $filter('translate')('MINING.CHART.WEEKDAY.SAT')
                ];

                var from = $filter('translate')('MINING.CHART.WEEKDAY.FROM');

                var to = $filter('translate')('MINING.CHART.WEEKDAY.TO');

                var renderChart = function () {
                    var data = scope.$eval(attr.uiChart);
                    elem.html('');
                    if (!angular.isArray(data) || data.length === 0) return;

                    var opts = {};
                    if (!angular.isUndefined(attr.chartOptions)) {
                        opts = scope.$eval(attr.chartOptions);
                        if (!angular.isObject(opts)) {
                            throw 'Invalid ui.chart options attribute';
                        }
                    }

                    Highcharts.setOptions({
                        lang: {
                            months: months,
                            weekdays: weekdays,
                            shortMonths: shortMonths,
                            rangeSelectorFrom: from,
                            rangeSelectorTo: to,
                            rangeSelectorZoom: ' '
                        }
                    });

                    if (opts.type === 'chartWithNavigator') {

                        var series = [{
                            color: opts.color,
                            dataGrouping: {
                                approximation: 'sum',
                                enabled: true,
                                forced: true,
                                units: [
                                    [opts.dataGrouping, [1]]
                                ]
                            },
                            name: ' ',
                            pointPlacement: 0.1,
                            data: data,
                            type: 'areaspline',
                            threshold: null,
                            tooltip: {
                                valueDecimals: 2
                            },
                            lineWidth: 1,
                            marker: {
                                radius: 1
                            },
                            fillColor: {
                                linearGradient: {
                                    x1: 1,
                                    y1: 1,
                                    x2: 1,
                                    y2: 0
                                },
                                stops: [
                                    [0, Highcharts.Color(opts.colors.fillColor).setOpacity(0).get('rgba')],
                                    [1, Highcharts.Color(opts.colors.fillColor).setOpacity(1).get('rgba')]
                                ]
                            }
                        }];

                        var navigator = {
                            maskFill: opts.colors.maskFill,
                            maskInside: true,
                            outlineColor: opts.colors.outlineColor,
                            outlineWidth: 1,
                            handles: {
                                backgroundColor: 'url(#g27)',
                                borderColor: opts.colors.handlesBorderColor
                            },
                            series: series,
                            xAxis: {
                                labels: {
                                    style: {
                                        color: opts.colors.axisLabelColor,
                                        fontSize: '12px',
                                        fontFamily: 'Titillium Web, AgoraSansPro'
                                    },
                                    y: 20,
                                    align: 'center'
                                },
                                lineWidth: 1,
                                lineColor: opts.colors.axisLineColor,
                                tickLength: 7,
                                tickWidth: 1,
                                tickPosition: 'outside',
                                minorTickLength: 0,
                                ordinal: false
                            }
                        };

                        $timeout(function () {

                            elem.highcharts('StockChart', {
                                rangeSelector: {
                                    selected: opts.selected,
                                    inputEnabled: false,
                                    buttonTheme: {
                                        visibility: 'hidden'
                                    },
                                    labelStyle: {
                                        visibility: 'hidden'
                                    },
                                    buttons: [{
                                        type: 'day',
                                        count: 7,
                                        text: '1 Week'
                                    }, {
                                        type: 'day',
                                        count: 14,
                                        text: '2 Week'
                                    }, {
                                        type: 'month',
                                        count: 1,
                                        text: '1 Month'
                                    }, {
                                        type: 'month',
                                        count: 3,
                                        text: '3 Month'
                                    }, {
                                        type: 'month',
                                        count: 6,
                                        text: '6 Month'
                                    }, {
                                        type: 'year',
                                        count: 1,
                                        text: '1 Year'
                                    }, {
                                        type: 'all',
                                        text: 'All'
                                    }]
                                },
                                exporting: {enabled: false},

                                tooltip: {
                                    style: {
                                        color: opts.colors.labelColor,
                                        fontFamily: 'Titillium Web, AgoraSansPro'
                                    },
                                    backgroundColor: opts.colors.tooltipBgColor,
                                    borderRadius: 10,
                                    borderColor: opts.colors.tooltipBorderColor,
                                    pointFormat: '{series.name}<b>{point.y}</b>',
                                    useHTML: true,
                                    valueSuffix: ' ' + $rootScope.currencySymbol,
                                    shared: true,
                                    formatter: function () {
                                        var date = new Date(0);
                                        date.setUTCSeconds(this.x / 1000);
                                        return Highcharts.dateFormat('%b, %A, %e, %Y', this.x) + '<b>' + $rootScope.cutLastZeros(this.y) + ' ' + $rootScope.currencySymbol + '</b>';
                                    }
                                },

                                navigator: navigator,

                                scrollbar: {
                                    enabled: true,
                                    useHtml: true,
                                    barBackgroundColor: opts.colors.scrollBarColor,
                                    barBorderColor: opts.colors.handlesBorderColor,
                                    barBorderRadius: 8,
                                    barBorderWidth: 0,
                                    buttonBackgroundColor: 'transparent',
                                    buttonBorderWidth: 0,
                                    buttonBorderRadius: 7,
                                    trackBackgroundColor: 'none',
                                    trackBorderWidth: 0,
                                    trackBorderRadius: 0,
                                    trackBorderColor: 'transparent',
                                    height: 0
                                },

                                credits: {
                                    enabled: false
                                },

                                xAxis: {
                                    align: 'right',
                                    labels: {
                                        style: {
                                            color: opts.colors.labelColor,
                                            fontSize: '12px',
                                            fontFamily: 'Titillium Web, AgoraSansPro'
                                        }
                                    },
                                    crosshair: {
                                        width: 1,
                                        color: opts.colors.gridColor
                                    },
                                    ordinal: false
                                },

                                yAxis: {
                                    opposite: false,
                                    useHtml: true,
                                    startOnTick: false,
                                    crosshair: {
                                        width: 1,
                                        color: opts.colors.gridColor,
                                        className: 'crosshairX'
                                    },
                                    labels: {
                                        style: {
                                            color: opts.colors.labelColor,
                                            fontFamily: 'Titillium Web, AgoraSansPro'
                                        },
                                        align: 'left',
                                        x: 0,
                                        y: -4,
                                        formatter: function () {
                                            return $rootScope.cutLastZeros(this.value) + ' ' + $rootScope.currencySymbol;
                                        }
                                    },
                                    gridLineColor: opts.colors.gridColor,
                                    tickColor: opts.colors.gridColor,
                                    tickLength: 80,
                                    tickWidth: 1,
                                    tickPosition: 'inside',
                                    offset: 80
                                },

                                plotOptions: {
                                    series: {
                                        pointInterval: 24 * 3600 * 1000,
                                        states: {
                                            hover: {
                                                enabled: true,
                                                lineWidth: 1
                                            }
                                        },
                                        enableMouseTracking: true
                                    },
                                    column: {
                                        pointPadding: 0
                                    }
                                },

                                chart: {
                                    spacingLeft: 25,
                                    spacingRight: 28,
                                    spacingBottom: 25,
                                    borderWidth: 0,
                                    type: 'line',
                                    style: {
                                        fontFamily: 'Titillium Web, AgoraSansPro'
                                    },
                                    events: {
                                        load: function () {
                                            elem.find('.highcharts-scrollbar').insertAfter('.highcharts-navigator');
                                            elem.find('.highcharts-navigator-handle').attr('d', 'M 0 7 V 14 M -4 7 a4,4 0 1 1 8,0 V 13 M 4 13 a4,4 0 1 1 -8,0 V 7');
                                        }
                                    }
                                },

                                series: series
                            });

                        }, 100);

                    } else if (opts.type === 'chartForCalc') {

                        elem.highcharts('StockChart', {
                            rangeSelector: {
                                selected: 4,
                                inputEnabled: false,
                                buttonTheme: {
                                    visibility: 'hidden'
                                },
                                labelStyle: {
                                    visibility: 'hidden'
                                }
                            },

                            exporting: {enabled: false},

                            tooltip: {
                                style: {
                                    color: opts.colors.labelColor,
                                    fontFamily: 'Titillium Web, AgoraSansPro'
                                },
                                backgroundColor: opts.colors.tooltipBgColor,
                                borderRadius: 10,
                                borderColor: opts.colors.tooltipBorderColor,
                                pointFormat: '{series.name}<b>{point.y}</b>',
                                useHTML: true,
                                valueSuffix: ' ' + $rootScope.currencySymbol,
                                shared: true,
                                formatter: function () {
                                    var date = new Date(0);
                                    date.setUTCSeconds(this.x / 1000);
                                    return Highcharts.dateFormat('%b, %A, %e, %Y', this.x) + '<b>' + $rootScope.cutLastZeros(this.y) + ' ' + $rootScope.currencySymbol + '</b>';
                                }
                            },

                            navigator: {
                                enabled: false
                            },

                            scrollbar: {
                                enabled: false
                            },

                            credits: {
                                enabled: false
                            },

                            xAxis: {
                                align: 'right',
                                labels: {
                                    style: {
                                        color: opts.colors.labelColor,
                                        fontSize: '12px',
                                        fontFamily: 'Titillium Web, AgoraSansPro'
                                    }
                                },
                                crosshair: {
                                    width: 1,
                                    color: opts.colors.gridColor
                                }
                            },

                            yAxis: {
                                opposite: false,
                                useHtml: true,
                                startOnTick: false,
                                crosshair: {
                                    width: 1,
                                    color: opts.colors.gridColor,
                                    className: 'crosshairX'
                                },
                                labels: {
                                    style: {
                                        color: opts.colors.labelColor,
                                        fontFamily: 'Titillium Web, AgoraSansPro'
                                    },
                                    align: 'left',
                                    x: 0,
                                    y: -4,
                                    formatter: function () {
                                        return $rootScope.cutLastZeros(this.value) + ' ' + $rootScope.currencySymbol;
                                    }
                                },
                                gridLineColor: opts.colors.gridColor,
                                tickColor: opts.colors.gridColor,
                                tickLength: 80,
                                tickWidth: 1,
                                tickPosition: 'inside',
                                offset: 80
                            },

                            plotOptions: {
                                series: {
                                    pointInterval: 24 * 3600 * 1000,
                                    states: {
                                        hover: {
                                            enabled: true,
                                            lineWidth: 1
                                        }
                                    }
                                }
                            },

                            chart: {
                                spacingTop: -25,
                                spacingLeft: 25,
                                spacingRight: 28,
                                borderWidth: 0,
                                type: 'line',
                                style: {
                                    fontFamily: 'Titillium Web, AgoraSansPro'
                                }
                            },

                            series: [{
                                color: opts.color,
                                dataGrouping: {
                                    forced: true,
                                    units: [
                                        [opts.dataGrouping, [1]]
                                    ]
                                },
                                name: ' ',
                                pointPlacement: 0.1,
                                data: data,
                                type: 'areaspline',
                                threshold: null,
                                tooltip: {
                                    valueDecimals: 2
                                },
                                lineWidth: 1,
                                marker: {
                                    radius: 1
                                },
                                fillColor: {
                                    linearGradient: {
                                        x1: 1,
                                        y1: 1,
                                        x2: 1,
                                        y2: 0
                                    },
                                    stops: [
                                        [0, Highcharts.Color(opts.colors.fillColor).setOpacity(0).get('rgba')],
                                        [1, Highcharts.Color(opts.colors.fillColor).setOpacity(1).get('rgba')]
                                    ]
                                }
                            }]
                        });

                    } else if (opts.type === 'chartWidget') {

                        var series = [{
                            color: opts.color,
                            dataGrouping: {
                                approximation: 'sum',
                                enabled: true,
                                forced: true,
                                units: [
                                    [opts.dataGrouping, [1]]
                                ]
                            },
                            name: ' ',
                            pointPlacement: 0.1,
                            data: data,
                            type: 'areaspline',
                            threshold: null,
                            tooltip: {
                                valueDecimals: 2
                            },
                            lineWidth: 1,
                            marker: {
                                radius: 1
                            },
                            fillColor: {
                                linearGradient: {
                                    x1: 1,
                                    y1: 1,
                                    x2: 1,
                                    y2: 0
                                },
                                stops: [
                                    [0, Highcharts.Color(opts.colors.fillColor).setOpacity(0).get('rgba')],
                                    [1, Highcharts.Color(opts.colors.fillColor).setOpacity(1).get('rgba')]
                                ]
                            }
                        }];

                        $timeout(function () {

                            elem.highcharts('StockChart', {
                                rangeSelector: {
                                    selected: opts.selected,
                                    inputEnabled: false,
                                    buttonTheme: {
                                        visibility: 'hidden'
                                    },
                                    labelStyle: {
                                        visibility: 'hidden'
                                    },
                                    buttons: [{
                                        type: 'day',
                                        count: 7,
                                        text: '1 Week'
                                    }, {
                                        type: 'day',
                                        count: 14,
                                        text: '2 Week'
                                    }, {
                                        type: 'month',
                                        count: 1,
                                        text: '1 Month'
                                    }, {
                                        type: 'month',
                                        count: 3,
                                        text: '3 Month'
                                    }, {
                                        type: 'month',
                                        count: 6,
                                        text: '6 Month'
                                    }, {
                                        type: 'year',
                                        count: 1,
                                        text: '1 Year'
                                    }, {
                                        type: 'all',
                                        text: 'All'
                                    }]
                                },
                                exporting: {enabled: false},

                                tooltip: {
                                    style: {
                                        color: opts.colors.labelColor,
                                        fontFamily: 'Titillium Web, AgoraSansPro'
                                    },
                                    backgroundColor: opts.colors.tooltipBgColor,
                                    borderRadius: 10,
                                    borderColor: opts.colors.tooltipBorderColor,
                                    pointFormat: '{series.name}<b>{point.y}</b>',
                                    useHTML: true,
                                    valueSuffix: ' ' + $rootScope.currencySymbol,
                                    shared: true,
                                    formatter: function () {
                                        var date = new Date(0);
                                        date.setUTCSeconds(this.x / 1000);
                                        return Highcharts.dateFormat('%b, %A, %e, %Y', this.x) + '<b>' + $rootScope.cutLastZeros(this.y) + ' ' + $rootScope.currencySymbol + '</b>';
                                    }
                                },

                                navigator: false,

                                scrollbar: {
                                    enabled: true,
                                    useHtml: true,
                                    barBackgroundColor: opts.colors.scrollBarColor,
                                    barBorderColor: opts.colors.handlesBorderColor,
                                    barBorderRadius: 8,
                                    barBorderWidth: 0,
                                    buttonBackgroundColor: 'transparent',
                                    buttonBorderWidth: 0,
                                    buttonBorderRadius: 7,
                                    trackBackgroundColor: 'none',
                                    trackBorderWidth: 0,
                                    trackBorderRadius: 0,
                                    trackBorderColor: 'transparent',
                                    height: 0
                                },

                                credits: {
                                    enabled: false
                                },

                                xAxis: {
                                    align: 'right',
                                    labels: {
                                        style: {
                                            color: opts.colors.labelColor,
                                            fontSize: '12px',
                                            fontFamily: 'Titillium Web, AgoraSansPro'
                                        }
                                    },
                                    crosshair: {
                                        width: 1,
                                        color: opts.colors.gridColor
                                    },
                                    ordinal: false
                                },

                                yAxis: {
                                    opposite: false,
                                    useHtml: true,
                                    startOnTick: false,
                                    crosshair: {
                                        width: 1,
                                        color: opts.colors.gridColor,
                                        className: 'crosshairX'
                                    },
                                    labels: {
                                        style: {
                                            color: opts.colors.labelColor,
                                            fontFamily: 'Titillium Web, AgoraSansPro'
                                        },
                                        align: 'left',
                                        x: 0,
                                        y: -4,
                                        formatter: function () {
                                            return $rootScope.cutLastZeros(this.value) + ' ' + $rootScope.currencySymbol;
                                        }
                                    },
                                    gridLineColor: opts.colors.gridColor,
                                    tickColor: opts.colors.gridColor,
                                    tickLength: 80,
                                    tickWidth: 1,
                                    tickPosition: 'inside',
                                    offset: 80
                                },

                                plotOptions: {
                                    series: {
                                        pointInterval: 24 * 3600 * 1000,
                                        states: {
                                            hover: {
                                                enabled: true,
                                                lineWidth: 1
                                            }
                                        },
                                        enableMouseTracking: true
                                    },
                                    column: {
                                        pointPadding: 0
                                    }
                                },

                                chart: {
                                    spacingLeft: 25,
                                    spacingRight: 28,
                                    borderWidth: 0,
                                    type: 'line',
                                    style: {
                                        fontFamily: 'Titillium Web, AgoraSansPro'
                                    }
                                },

                                series: series
                            });
                        }, 100);
                    }
                };

                var watchChart = scope.$watch(attr.uiChart, function () {
                    renderChart();
                }, true);
                var watchOption = scope.$watch(attr.chartOptions, function () {
                    renderChart();
                }, true);

                scope.$on('$destroy', function () {
                    watchChart();
                    watchOption();
                    if (elem.highcharts() !== undefined) elem.highcharts().destroy();
                })

            }
        };
    }]);

})();