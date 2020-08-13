// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function() {
    'use strict';

    var module = angular.module('app.filters', []);

    module.filter('moneyToInt', ['CONFIG', function (CONFIG) {
        return function (input) {
            var currencyDisplayDecimalPoint = CONFIG.CDDP;
            var appendStringWithZeros = function (result, len) {
                for (var i = 0; i !== len; i++) {
                    result = result + '0';
                }
                return result;
            };
            var result = false;
            if (angular.isDefined(input)) {
                input = input.toString();
                var amStr = input.trim();
                var pointIndex = amStr.indexOf('.');
                var fractionSize = 0;
                if (-1 !== pointIndex) {
                    fractionSize = amStr.length - pointIndex - 1;
                    while (currencyDisplayDecimalPoint < fractionSize && '0' === amStr[amStr.length - 1]) {
                        amStr = amStr.slice(0, amStr.length - 1);
                        --fractionSize;
                    }
                    if (currencyDisplayDecimalPoint < fractionSize)
                        return undefined;
                    amStr = amStr.slice(0, pointIndex) + amStr.slice(pointIndex + 1, amStr.length);
                } else {
                    fractionSize = 0;
                }
                if (!amStr.length)
                    return undefined;
                if (fractionSize < currencyDisplayDecimalPoint) {
                    amStr = appendStringWithZeros(amStr, currencyDisplayDecimalPoint - fractionSize);
                }
                result = parseInt(amStr);
            }
            return result;
        }
    }]);

    module.filter('numberName', ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (digit) {
            var result = '';
            if (angular.isDefined(digit)) {
                digit = parseInt(digit);
                if ($rootScope.settings.app_interface.general.language === 'de') {
                    result = digit.toString();
                } else {
                    var units = [
                        'NUMBERS.FIRST', 'NUMBERS.SECOND', 'NUMBERS.THIRD', 'NUMBERS.FOURTH', 'NUMBERS.FIFTH',
                        'NUMBERS.SIXTH', 'NUMBERS.SEVENTH', 'NUMBERS.EIGHTH', 'NUMBERS.NINTH'
                    ];
                    var teens = [
                        'NUMBERS.ELEVENTH', 'NUMBERS.TWELFTH', 'NUMBERS.THIRTEENTH', 'NUMBERS.FOURTEENTH', 'NUMBERS.FIFTEENTH',
                        'NUMBERS.SIXTEENTH', 'NUMBERS.SEVENTEENTH', 'NUMBERS.EIGHTEENTH', 'NUMBERS.NINETEENTH'
                    ];
                    var dozens = [
                        'NUMBERS.TENTH', 'NUMBERS.TWENTIETH', 'NUMBERS.THIRTIETH', 'NUMBERS.FORTIETH', 'NUMBERS.FIFTIETH',
                        'NUMBERS.SIXTIETH', 'NUMBERS.SEVENTIETH', 'NUMBERS.EIGHTIETH', 'NUMBERS.NINETIETH'
                    ];
                    var dozensParts = [
                        '', 'NUMBERS.TWENTY', 'NUMBERS.THIRTY', 'NUMBERS.FORTY', 'NUMBERS.FIFTY',
                        'NUMBERS.SIXTY', 'NUMBERS.SEVENTY', 'NUMBERS.EIGHTY', 'NUMBERS.NINETY'
                    ];
                    var hundred = 'NUMBERS.HUNDREDTH';

                    if (digit > 0 && digit <= 100) {
                        var digitStr = digit.toString();

                        switch (digitStr.length) {
                            case 1:
                                result = $filter('translate')(units[digit - 1]);
                                break;
                            case 2:
                                if (digitStr[0] === '1') {
                                    if (digitStr[1] === '0') {
                                        result = $filter('translate')(dozens[0]);
                                    } else {
                                        result = $filter('translate')(teens[parseInt(digitStr[1]) - 1]);
                                    }
                                } else {
                                    if (digitStr[1] === '0') {
                                        result = $filter('translate')(dozens[parseInt(digitStr[0]) - 1]);
                                    } else {
                                        result = $filter('translate')(dozensParts[parseInt(digitStr[0]) - 1]) + ' ' + $filter('translate')(units[parseInt(digitStr[1]) - 1]);
                                    }
                                }
                                break;
                            case 3:
                                result = $filter('translate')(hundred);
                        }
                    }
                }
            }
            return result;
        }
    }]);

    module.filter('intToDate', [function () {
        return function (input) {
            if (angular.isDefined(input)) {
                input = parseInt(input);
                var result = '';
                if (!isNaN(input)) {
                    result = new Date(input * 1000);
                }
                return result;
            }
        }
    }]);

    module.filter('offerRate', ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (offer, currency) {
            var currencyRate = '';
            if (currency && $filter('isCurrencyCorrect')(currency)) {
                currencyRate = ' ' + currency + '/' + $rootScope.currencySymbol;
            }
            var rateFloat = parseInt(offer.at) / parseInt(offer.ap);
            if (isNaN(rateFloat) || !isFinite(rateFloat)) {
                return '0' + currencyRate;
            } else {
                return $rootScope.cutLastZeros(rateFloat) + currencyRate;
            }
        }
    }]);

    module.filter('splitKey', [function () {
        return function (input) {
            if (input) {
                return input.replace(/(^\s+|\s+$)/g, '').split(' ');
            }
        }
    }]);

    module.filter('isCurrencyCorrect', ['$rootScope', 'market', function ($rootScope, market) {
        return function (currency) {
            if (currency === $rootScope.currencySymbol) {
                return true;
            } else {
                var search = market.currencies.find(function(curr) {
                    return curr.code === currency;
                });
                return search !== undefined;
            }
        }
    }]);

    module.filter('categoryTitle', ['market', function (market) {
        function findCategory(array, search, result) {
            for (var i = 0; i < array.length; i++) {
                if (search.indexOf(array[i].id) > -1) {
                    result.push(array[i].title);
                    if (angular.isDefined(array[i].subcategories)) {
                        return findCategory(array[i].subcategories, search, result);
                    } else {
                        return result;
                    }
                }
            }
            return result;
        }

        return function (categoryId) {
            var category = findCategory(market.categories, categoryId.toString().split(','), []);
            return category.length ? category.join(' <span class="separator">></span> ') : '';
        }
    }]);

    module.filter('countryName', ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (locationCountry) {
            if (locationCountry === '000All') {
                return $filter('translate')('BUY_SELL_OFFER.PLACE.ALL');
            } else if (locationCountry === '') {
                return $filter('translate')('BUY_SELL_OFFER.PLACE.NOT');
            } else {
                var countryName = $filter('filter')($rootScope.countryList, {alpha2Code: locationCountry});
                if (countryName.length) {
                    return countryName[0].name;
                } else {
                    return $filter('translate')('BUY_SELL_OFFER.PLACE.NOT');
                }
            }
        }
    }]);

    module.filter('daysFilter', ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (num) {
            if ($rootScope.settings.app_interface.general.language === 'en') {
                if (num === 1) {
                    return num + ' ' + $filter('translate')('FILTER.DAYS.ONE');
                } else {
                    return num + ' ' + $filter('translate')('FILTER.DAYS');
                }
            } else {
                var n10 = num % 10;
                if ((n10 === 1) && ((num === 1) || (num > 20))) {
                    return num + ' ' + $filter('translate')('FILTER.DAYS.ONE');
                } else if ((n10 > 1) && (n10 < 5) && ((num > 20) || (num < 10))) {
                    return num + ' ' + $filter('translate')('FILTER.DAYS.FEW');
                } else {
                    return num + ' ' + $filter('translate')('FILTER.DAYS');
                }
            }
        }
    }]);

    module.filter('adsFilter', ['$filter', function ($filter) {
        return function (num) {
            if (angular.isDefined(num)) {
                if (num >= 50) {
                    return $filter('translate')('BUY_SELL_OFFER.THERE_ARE_MANY');
                } else {
                    var n = num % 10;
                    if (((num > 20) && (n === 1)) || num === 1) {
                        return $filter('translate')('BUY_SELL_OFFER.THERE_ARE');
                    } else if ((num > 1) && (num < 5) || ((num > 20) && (n === 2 || n === 3 || n === 4))) {
                        return $filter('translate')('BUY_SELL_OFFER.THERE_ARE_SECOND');
                    } else {
                        return $filter('translate')('BUY_SELL_OFFER.THERE_ARE_MANY');
                    }
                }
            } else {
                return $filter('translate')('BUY_SELL_OFFER.THERE_ARE_MANY');
            }
        };
    }]);

    module.filter('firstUpper', [function () {
        return function (input) {
            return input.charAt(0).toUpperCase() + input.slice(1);
        }
    }]);

    module.filter('buyingTime', ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (time, num) {
            time = parseInt((parseInt(time) - $rootScope.exp_med_ts) / 3600);
            if (time === 0) return $filter('translate')('DEALS.TIME_LEFT.LESS_ONE');
            var n = time % 10;
            if ($rootScope.settings.app_interface.general.language === 'en') {
                if (num === 0) {
                    if (time === 1) {
                        return $filter('translate')('DEALS.TIME_LEFT.ONE', {time: time});
                    } else {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY', {time: time});
                    }
                } else if (num === 1) {
                    if (time === 1) {
                        return $filter('translate')('DEALS.TIME_LEFT.ONE_RESPONSE', {time: time});
                    } else {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY_RESPONSE', {time: time});
                    }
                } else if (num === 2) {
                    if (time === 1) {
                        return $filter('translate')('DEALS.TIME_LEFT.ONE_WAITING', {time: time});
                    } else {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY_WAITING', {time: time});
                    }
                }
            } else {
                if (num === 0) {
                    if (((time > 20) && (n === 1)) || time === 1) {
                        return $filter('translate')('DEALS.TIME_LEFT.ONE', {time: time});
                    } else if ((time > 1) && (time < 5) || ((time > 20) && (n === 2 || n === 3 || n === 4))) {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY', {time: time});
                    } else {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY_ALT', {time: time});
                    }
                } else if (num === 1) {
                    if (((time > 20) && (n === 1)) || time === 1) {
                        return $filter('translate')('DEALS.TIME_LEFT.ONE_RESPONSE', {time: time});
                    } else if ((time > 1) && (time < 5) || ((time > 20) && (n === 2 || n === 3 || n === 4))) {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY_RESPONSE', {time: time});
                    } else {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY_ALT_RESPONSE', {time: time});
                    }
                } else if (num === 2) {
                    if (((time > 20) && (n === 1)) || time === 1) {
                        return $filter('translate')('DEALS.TIME_LEFT.ONE_WAITING', {time: time});
                    } else if ((time > 1) && (time < 5) || ((time > 20) && (n === 2 || n === 3 || n === 4))) {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY_WAITING', {time: time});
                    } else {
                        return $filter('translate')('DEALS.TIME_LEFT.MANY_ALT_WAITING', {time: time});
                    }
                }
            }
        }
    }]);

    module.filter('blocksRemaining', ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (number) {
            if ($rootScope.settings.app_interface.general.language === 'en') {
                if (number === 1) {
                    return $filter('translate')('BLOCKS.REMAINING.ONE', {blocks: number});
                } else {
                    return $filter('translate')('BLOCKS.REMAINING', {blocks: number});
                }
            } else {
                var lastDigit = number % 10;
                var twoDigits = number % 100;
                if (number === 0) return $filter('translate')('BLOCKS.REMAINING', {blocks: number});
                if (((number > 20) && (twoDigits > 20) && (lastDigit === 1)) || twoDigits === 1) {
                    return $filter('translate')('BLOCKS.REMAINING.ONE', {blocks: number});
                } else if ((number > 1 && number < 5) || ((number > 20) && (twoDigits < 10 || twoDigits > 20) && (lastDigit > 1 && lastDigit < 5))) {
                    return $filter('translate')('BLOCKS.REMAINING.FEW', {blocks: number});
                } else {
                    return $filter('translate')('BLOCKS.REMAINING', {blocks: number});
                }
            }
        }
    }]);

    module.filter('lowercaseLang', ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (text) {
            if ($rootScope.settings.app_interface.general.language === 'de') {
                return text;
            } else {
                return $filter('lowercase')(text);
            }
        }
    }]);

    module.filter('joinLangReverse', ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (arr) {
            if ($rootScope.settings.app_interface.general.language === 'de') {
                return arr.reverse().join('');
            } else {
                return arr.join('');
            }
        }
    }]);

})();