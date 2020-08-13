/*
    Copyright (c) 2014-2020 The Virie Project
    Distributed under  MIT/X11 software license, see the accompanying
    file COPYING or http://www.opensource.org/licenses/mit-license.php.
*/

var DEBUG = true;

function Debug(type, message) {
    if (DEBUG) {
        switch (type) {
            case 0:
                console.error(message);
                break;
            case 1:
                console.warn(message);
                break;
            case 2:
                console.log(message);
                break;
            default:
                console.debug(message);
                break;
        }
    }
}

function onlyDigits() {
    return function () {
        if (this.value.length) {
            var $this = $(this);
            var lengthAfterPoint = parseInt($this.data('min-count-replace')) ? parseInt($this.data('min-count-replace')) : 8;
            var currentValue = $this.val();
            var originalValue = currentValue;
            var onlyDigits = /[^\d\.]/g;
            var hasError = currentValue.match(onlyDigits);
            if (hasError && hasError.length) {
                currentValue = currentValue.replace(',', '.').replace(onlyDigits, '');
            }
            var doubleSeparator = currentValue.match(/\./g);
            if (doubleSeparator && doubleSeparator.length > 1) {
                currentValue = currentValue.substr(0, currentValue.lastIndexOf('.'));
            }
            if (currentValue.indexOf('.') === 0) {
                currentValue = '0' + currentValue;
            }
            var zeroFill = currentValue.split('.');
            if (zeroFill[0].length > 11) {
                zeroFill[0] = zeroFill[0].substr(0, 11);
            }
            if (1 in zeroFill && zeroFill[1].length) {
                zeroFill[1] = zeroFill[1].substr(0, parseInt(lengthAfterPoint));
            }
            currentValue = zeroFill.join('.');
            if (currentValue !== originalValue) {
                $this.val(currentValue).trigger('input');
            }
        }
    }
}

function onlyDigitsInt() {
    if (this.value.length) {
        var $this = $(this);
        var currentValue = $this.val();
        var originalValue = currentValue;
        var onlyDigits = /[^\d]/g;

        var hasError = currentValue.match(onlyDigits);

        if (hasError && hasError.length) {
            currentValue = currentValue.replace(onlyDigits, '');
        }
        if (currentValue !== originalValue) {
            $this.val(currentValue).trigger('input');
        }
    }
}

function onlyDigitsIntPhone() {
    if (this.value.length) {
        var $this = $(this);
        var currentValue = $this.val();
        var originalValue = currentValue;
        var onlyDigits = /[^\d\+\(\)]/g;

        var hasError = currentValue.match(onlyDigits);

        if (hasError && hasError.length) {
            currentValue = currentValue.replace(onlyDigits, '');
        }
        if (currentValue !== originalValue) {
            $this.val(currentValue).trigger('input');
        }
    }
}

$(document).ready(function () {

    var body = $('body');

    body
        .on('click', '.copy-icon, .safe-alias-modal-copy', function () {
            $(this).addClass('hovered');
        })
        .on('mouseleave', '.hovered', function () {
            $(this).removeClass('hovered');
        });

    body
        .on('focus', '.need-to-focus, .need-to-focus .dropdown-toggle', function () {
            $(this).closest('.need-to-focus-field').addClass('focused-line');
        })
        .on('blur', '.need-to-focus, .need-to-focus .dropdown-toggle', function () {
            $(this).closest('.need-to-focus-field').removeClass('focused-line');
        });

    body
        .on('click', 'ul.inner li a', function () {
            $(this).blur();
        })
        .on('keyup change input', '.input_replace', onlyDigits())
        .on('keyup change input', '.input_replace_int', onlyDigitsInt)
        .on('keyup change input', '.input_replace_eng_int', function () {
            $(this).val($(this).val().replace(/[^a-z0-9\.\-]/g, '')).change();
        })
        .on('change keyup', '.input_min_value', function () {
            if (this.value.length && (this.value[0] === '0' && this.value[1] !== '.')) {
                $(this).val(parseInt(this.value));
            }
        })
        .on('keydown', '.input_phone', function (e) {
            if (([8, 32, 36, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105].indexOf(e.keyCode) === -1) && !(e.ctrlKey && (e.keyCode === 65 || e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 88)) && !((e.shiftKey && e.keyCode === 187) || (e.keyCode === 107)) && !(e.shiftKey && e.keyCode === 48) && !(e.shiftKey && e.keyCode === 57)) {
                e.preventDefault();
                return false;
            }
        })
        .on('change keyup', '.input_phone', onlyDigitsIntPhone)
        .on('click', '.backInHistory', function (e) {
            e.preventDefault();
            window.history.back();
        });

    body
        .on('change mousemove', '.general-range', function () {
            var element = $(this);
            var percentValue = element.width() / (element.attr('max') - element.attr('min'));
            var outputOffset = (element.val() - element.attr('min')) * percentValue;
            var outputTransform = (outputOffset / element.width()) * 100;
            element.parent().find('.general-range-value').css({
                'left': outputOffset,
                'transform': 'translateX(-' + outputTransform + '%)'
            });
            element.parent().find('.general-range-selected').css({'width': outputOffset});
        });

    $(document).on('keydown', 'body', function (e) {
        if (e.keyCode === 9) {
            var buttonsList = document.querySelectorAll('button');
            for (var i = 0; i < buttonsList.length; i++) {
                if (buttonsList[i].parentElement.classList.contains('bootstrap-select')) {
                    continue;
                }
                if (buttonsList[i].getAttribute('tabindex') === null || buttonsList[i].getAttribute('tabindex') === '') {
                    buttonsList[i].setAttribute('tabindex', '-1')
                }
            }
        }
        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT' && e.keyCode === 8) {
            return false;
        }
    });

    var scrollEnabled = false;

    body
        .on('mouseenter', '.modal .base-scroll, .content-wrapper .base-scroll', function () {
            scrollEnabled = true;
        })
        .on('mouseleave', '.modal .base-scroll, .content-wrapper .base-scroll', function () {
            scrollEnabled = false;
        })
        .on('mousewheel', '.modal, .content-wrapper', function (e) {
            var wTable = $(e.target).closest('.base-scroll').get(0);
            if (scrollEnabled && wTable !== undefined && wTable.scrollHeight > wTable.clientHeight && ((wTable.scrollTop === 0 && e.originalEvent.wheelDelta > 0) || (wTable.scrollTop + wTable.clientHeight === wTable.scrollHeight && e.originalEvent.wheelDelta < 0))) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

    body
        .on('mousewheel', '.dragging', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
});

function addGOfferSendFocus() {
    if (document.getElementById('amount_p').value === '' || parseFloat(document.getElementById('amount_p').value) === 0) {
        document.getElementById('amount_p').focus();
    } else if (document.getElementById('amount_etc').value === '' || parseFloat(document.getElementById('amount_etc').value) === 0) {
        document.getElementById('amount_etc').focus();
    } else if (document.getElementById('dealsCount') !== null && document.getElementById('dealsCount').required) {
        $('#SelectPickerDeals').selectpicker('toggle');
    } else if (document.getElementById('paymentCount') !== null && document.getElementById('paymentCount').required) {
        if ($('#SelectPickerPaymentType').parent().is(':visible')) {
            $('#SelectPickerPaymentType').selectpicker('toggle');
        } else {
            document.getElementById('SelectPickerPaymentTypeButton2').focus();
        }
    } else if (document.getElementById('contactsCount') !== null && parseInt(document.getElementById('contactsCount').value) === 0) {
        if ($('#SelectPickerContacts').parent().is(':visible')) {
            $('#SelectPickerContacts').selectpicker('toggle');
        } else {
            document.getElementById('SelectPickerContactsButton2').focus();
        }
    } else if (document.getElementsByClassName('contact_edit').length) {
        document.getElementsByClassName('contact_edit')[0].focus();
    } else if (document.getElementById('countryInput_value') !== null && document.getElementById('countryInput_value').value === '') {
        document.getElementById('countryInput_value').focus();
    } else if (document.getElementById('fee_standard') !== null && document.getElementById('fee_standard').getAttribute('needFocus') === 'true') {
        document.getElementById('fee_standard').focus();
    }
}

function addOfferSendFocus() {
    if (document.getElementById('categories').value === '?' || document.getElementById('categories').value === '') {
        $('#categories').selectpicker('toggle');
    } else if (document.getElementById('categories2') && (document.getElementById('categories2').value === '?' || document.getElementById('categories2').value === '')) {
        $('#categories2').selectpicker('toggle');
    } else if (document.getElementById('categories3') && (document.getElementById('categories3').value === '?' || document.getElementById('categories3').value === '')) {
        $('#categories3').selectpicker('toggle');
    } else if (document.getElementById('title').value === '') {
        document.getElementById('title').focus();
    } else if (document.getElementById('comment').value === '') {
        document.getElementById('comment').focus();
    } else if (document.getElementById('currencyGoods').value === '') {
        $('#currencyGoods').selectpicker('toggle');
    } else if (document.getElementById('amount_p').value === '') {
        document.getElementById('amount_p').focus();
    } else if (document.getElementById('dealsCount') !== null && document.getElementById('dealsCount').required) {
        if ($('#SelectPickerDeals').parent().is(':visible')) {
            $('#SelectPickerDeals').selectpicker('toggle');
        } else {
            document.getElementById('SelectPickerDealsButton2').focus();
        }
    } else if (document.getElementById('contactsCount') !== null && parseInt(document.getElementById('contactsCount').value) === 0) {
        if ($('#SelectPickerContacts').parent().is(':visible')) {
            $('#SelectPickerContacts').selectpicker('toggle');
        } else {
            document.getElementById('SelectPickerContactsButton2').focus();
        }
    } else if (document.getElementsByClassName('contact_edit').length) {
        document.getElementsByClassName('contact_edit')[0].focus();
    } else if (document.getElementById('countryInput_value') !== null && document.getElementById('countryInput_value').value === '') {
        document.getElementById('countryInput_value').focus();
    } else if (document.getElementById('fee_standard') !== null && document.getElementById('fee_standard').getAttribute('needFocus') === 'true') {
        document.getElementById('fee_standard').focus();
    }
}

function dealsCreateConfirm() {
    if (document.getElementById('sb-name').value === '?' || document.getElementById('sb-name').value === '') {
        document.getElementById('sb-name').focus();
    } else if (document.getElementById('angucomplete_safe_address_value').value === '?' || document.getElementById('angucomplete_safe_address_value').value === '') {
        document.getElementById('angucomplete_safe_address_value').focus();
    } else if (document.getElementById('sb-price').value === '?' || document.getElementById('sb-price').value === '') {
        document.getElementById('sb-price').focus();
    }
}

function contactCreateConfirm() {
    if (document.getElementById('contactName').value === '') {
        document.getElementById('contactName').focus();
    } else if (document.getElementsByClassName('contact_edit').length) {
        document.getElementsByClassName('contact_edit')[0].focus();
    }
}

var toInt = function (value) {
    if (angular.isNumber(parseFloat(value))) {
        if (!isNaN(parseFloat(value))) {
            value = parseFloat(value);
        }
    } else {
        value = 0;
    }
    return value;
};

var noExponents = function (num) {
    var data = String(num).split(/[eE]/);
    if (data.length === 1) return data[0];
    var z = '', sign = num < 0 ? '-' : '',
        str = data[0].replace('.', ''),
        mag = Number(data[1]) + 1;
    if (mag < 0) {
        z = sign + '0.';
        while (mag++) z += '0';
        return z + str.replace(/^\-/, '');
    }
    mag -= str.length;
    while (mag--) z += '0';
    return str + z;
};

var historySplitter = function (inverse) {
    return function (item) {
        var rez = true;
        if ((item.tx_type === 7 && item.is_income) || (item.tx_type === 11 && item.is_income) || (item.amount === 0 && item.fee === 0)) {
            rez = false;
        }
        return (inverse) ? !rez : rez;
    };
};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Zа-яА-Я\-0-9]+\.)+[a-zA-Zа-яА-Я]{2,}))$/;
    return re.test(email);
}