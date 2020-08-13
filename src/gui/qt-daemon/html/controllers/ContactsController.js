// Copyright (c) 2014-2020 The Virie Project
// Distributed under  MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


(function() {
    'use strict';
    var module = angular.module('app.contacts', []);

    module.factory('groupFactory', function () {
        return {
            filter: {
                groupId: 0,
                keywords: ''
            }
        }
    });

    module.controller('contactGroupsCtrl', ['$scope', '$uibModalInstance', 'informer', '$rootScope', '$timeout', 'uuid', '$filter', 'groupFactory', '$uibModal',
        function ($scope, $uibModalInstance, informer, $rootScope, $timeout, uuid, $filter, groupFactory, $uibModal) {

            $scope.groupFactory = groupFactory;

            if (angular.isUndefined($rootScope.settings.contacts)) {
                $rootScope.settings.contacts = [];
            }

            if (angular.isUndefined($rootScope.settings.contact_groups)) {
                $rootScope.settings.contact_groups = [];
            }

            $scope.close = function () {
                groupFactory.filter.groupId = 0;
                $uibModalInstance.close();
            };

            var contactsAddGroupOpened = false;

            $scope.addGroup = function () {
                angular.element('.modal-contacts-groups').addClass('modalTopClassBackground');

                if (contactsAddGroupOpened) return;
                contactsAddGroupOpened = true;

                $uibModal.open({
                    templateUrl: 'views/contactsAddGroup.html',
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-add-group base-scroll light-scroll',
                    animation: true,
                    controller: function ($scope, $rootScope, $uibModalInstance) {
                        $scope.newGroup = {
                            name: ''
                        };

                        var timerAddGroupError;

                        $scope.addNewGroup = function () {
                            $scope.addGroupError = false;
                            angular.forEach($rootScope.settings.contact_groups, function (rootGroup) {
                                if ($scope.newGroup.name === rootGroup.name) {
                                    $scope.addGroupError = true;
                                    if (timerAddGroupError) $timeout.cancel(timerAddGroupError);
                                    timerAddGroupError = $timeout(function () {
                                        $scope.addGroupError = false;
                                    }, 5000);
                                }
                            });
                            if (!$scope.addGroupError) {
                                $scope.newGroup.id = uuid.generate();
                                $rootScope.settings.contact_groups.push(angular.copy($scope.newGroup));
                                $rootScope.storeAppData();
                                $scope.close();
                            }
                        };

                        $scope.close = function () {
                            $uibModalInstance.close();
                        };

                        $scope.$on('$destroy', function () {
                            if (timerAddGroupError) $timeout.cancel(timerAddGroupError);
                        });
                    }
                }).result.then(function () {
                    angular.element('.modal-contacts-groups').removeClass('modalTopClassBackground');
                    contactsAddGroupOpened = false;
                }, function () {
                    angular.element('.modal-contacts-groups').removeClass('modalTopClassBackground');
                    contactsAddGroupOpened = false;
                });
            };

            $rootScope.removeGroup = function (group) {
                var contacts = angular.copy(group.contacts);
                angular.forEach($rootScope.settings.contact_groups, function (item, index) {
                    if (item.id === group.id) {
                        $rootScope.settings.contact_groups.splice(index, 1);
                        $rootScope.storeAppData();
                        angular.forEach(contacts, function (contact) {
                            var groupIndex = contact.group_ids.indexOf(group.id);
                            if (groupIndex > -1) {
                                contact.group_ids.splice(groupIndex, 1);
                            }
                        });
                    }
                });
            };

            var contactsEditGroupOpened = false;

            $scope.editGroupByIndex = function (group) {
                angular.element('.modal-contacts-groups').addClass('modalTopClassBackground');

                if (contactsEditGroupOpened) return;
                contactsEditGroupOpened = true;

                $uibModal.open({
                    templateUrl: 'views/contactsEditGroup.html',
                    controller: 'editContactsGroup',
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-edit-group base-scroll light-scroll',
                    animation: true,
                    resolve: {
                        group: function () {
                            return group;
                        }
                    }
                }).result.then(function () {
                    angular.element('.modal-contacts-groups').removeClass('modalTopClassBackground');
                    contactsEditGroupOpened = false;
                }, function () {
                    angular.element('.modal-contacts-groups').removeClass('modalTopClassBackground');
                    contactsEditGroupOpened = false;
                });
            };

            var contactsDeleteGroupOpened = false;

            $scope.removeGroupByIndex = function (group) {
                angular.element('.modal-contacts-groups').addClass('modalTopClassBackground');

                if (contactsDeleteGroupOpened) return;
                contactsDeleteGroupOpened = true;

                $uibModal.open({
                    templateUrl: 'views/contactsDeleteGroup.html',
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-delete-group base-scroll light-scroll',
                    animation: true,
                    controller: function ($scope, $rootScope, $uibModalInstance) {
                        $scope.delete = function () {
                            $rootScope.removeGroup(group);
                            informer.success('GROUP.DELETE.DELETED');
                            $scope.close();
                        };

                        $scope.close = function () {
                            $uibModalInstance.close();
                        };
                    }
                }).result.then(function () {
                    angular.element('.modal-contacts-groups').removeClass('modalTopClassBackground');
                    contactsDeleteGroupOpened = false;
                }, function () {
                    angular.element('.modal-contacts-groups').removeClass('modalTopClassBackground');
                    contactsDeleteGroupOpened = false;
                });
            };

        }
    ]);

    module.controller('editContactsGroup', ['$scope', '$rootScope', 'group', '$uibModalInstance', '$filter',
        function ($scope, $rootScope, group, $uibModalInstance, $filter) {

            $scope.group = angular.copy(group);

            $scope.contacts = angular.copy($rootScope.settings.contacts);
            $scope.filteredContactsToGroup = $filter('filter')($scope.contacts, {group_ids: $scope.group.id});

            var removedContacts = [];

            $scope.removeContactFromGroup = function (contact) {
                removedContacts.push(contact.id);
                var arr = [];
                for (var i = 0; i < $scope.filteredContactsToGroup.length; i++) {
                    if ($scope.filteredContactsToGroup[i].id !== contact.id) {
                        arr.push($scope.filteredContactsToGroup[i]);
                    }
                }
                $scope.filteredContactsToGroup = arr;
                if ($scope.filteredContactsToGroup.length <= 3) {
                    $scope.keywords = '';
                }
            };

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.onSaveBtn = function () {
                for (var i = 0; i < removedContacts.length; i++) {
                    var contact = $filter('filter')($rootScope.settings.contacts, {id: removedContacts[i]});
                    var groupId = contact[0].group_ids.indexOf($scope.group.id);
                    if (groupId > -1) {
                        contact[0].group_ids.splice(groupId, 1);
                    }
                }
                $scope.addGroupError = false;
                angular.forEach($rootScope.settings.contact_groups, function (rootGroup) {
                    if ($scope.group.name === rootGroup.name && rootGroup.id !== $scope.group.id) {
                        $scope.addGroupError = true;
                        $('#groupName').focus();
                    }
                });
                if (!$scope.addGroupError && $scope.group.name.length > 0) {
                    angular.forEach($rootScope.settings.contact_groups, function (rootGroup) {
                        if (rootGroup.id === $scope.group.id) {
                            rootGroup.name = $scope.group.name;
                            $rootScope.storeAppData();
                        }
                    });
                    $scope.close();
                }
            };

        }
    ]);

    module.controller('contactsCtrl', ['backend', '$rootScope', '$scope', 'informer', '$filter', '$uibModal', 'groupFactory', 'uuid', 'sortingParamsLists', '$timeout', 'showHideTabs',
        function (backend, $rootScope, $scope, informer, $filter, $uibModal, groupFactory, uuid, sortingParamsLists, $timeout, showHideTabs) {

            if (angular.isUndefined($rootScope.settings.contact_groups)) {
                $rootScope.settings.contact_groups = [];
            }

            $scope.contactsShowHideTabs = showHideTabs.contacts;

            $scope.safes = $rootScope.safes;

            $scope.groupFactory = groupFactory;

            var watchCollectionContacts = $scope.$watchCollection($rootScope.settings.contacts, function () {
                angular.forEach($rootScope.settings.contacts, function (contact) {
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
            });

            var contactsGroupsOpened = false;

            $scope.contactGroups = function () {
                if (contactsGroupsOpened) return;
                contactsGroupsOpened = true;

                $uibModal.open({
                    backdrop: false,
                    windowClass: 'modal-main-wrapper modal-contacts-groups base-scroll light-scroll',
                    animation: true,
                    templateUrl: 'views/contactsGroups.html',
                    controller: 'contactGroupsCtrl'
                }).result.then(function () {
                    contactsGroupsOpened = false;
                }, function () {
                    contactsGroupsOpened = false;
                });
            };

            $scope.contactsSortBy = sortingParamsLists.contacts.contactsSortBy;

            $scope.contactsSortDir = sortingParamsLists.contacts.contactsSortDir;

            $scope.order = function (row) {
                if (sortingParamsLists.contacts.contactsSortBy !== row) {
                    sortingParamsLists.contacts.contactsSortBy = row;
                    sortingParamsLists.contacts.contactsSortDir = true;
                } else {
                    sortingParamsLists.contacts.contactsSortDir = !sortingParamsLists.contacts.contactsSortDir;
                }
                $scope.contactsSortBy = sortingParamsLists.contacts.contactsSortBy;
                $scope.contactsSortDir = sortingParamsLists.contacts.contactsSortDir;
                $scope.filterChange();
            };

            var showedContacts = [];

            $scope.groupIds = ['0'];

            $scope.filterChange = function () {
                angular.forEach($rootScope.settings.contacts, function (val) {
                    if (val.connections instanceof Array) {
                        angular.forEach(val.connections, function (connection) {
                            if ((connection.new_type === 'EMAIL' && connection.name === '') || (connection.new_type === 'PHONE' && connection.name === '') || (connection.new_type === 'IMS' && (connection.name === '' && connection.username === ''))) {
                                $scope.removeConnection(val.id, connection.id);
                            }
                        });
                    }
                });
                var filteredContacts = angular.copy($rootScope.settings.contacts);
                if ($scope.groupIds.indexOf('-1') > -1) {
                    $scope.groupIds = ['0'];
                    $scope.contactGroups();
                } else if ($scope.groupIds.indexOf('-2') > -1) {
                    $scope.groupIds = ['-2'];
                    $timeout(function () {
                        $scope.groupIds = ['0'];
                    });
                } else {
                    if ($scope.groupIds.indexOf('0') > -1) {
                        $scope.groupIds.splice($scope.groupIds.indexOf('0'), 1);
                    }
                    if ($scope.groupIds.length === 0) {
                        $scope.groupIds = ['0'];
                    }
                    if ($scope.groupIds.length >= 1 && $scope.groupIds[0] !== '0') {
                        var matchesCriteria = function (arr) {
                            return function (item) {
                                var rez = false;
                                for (var i = 0; i < arr.length; i++) {
                                    if (item.group_ids.indexOf(arr[i]) > -1) {
                                        rez = true;
                                        break;
                                    }
                                }
                                return rez;
                            };
                        };
                        filteredContacts = $filter('filter')(filteredContacts, matchesCriteria($scope.groupIds));
                    }
                }

                if (groupFactory.filter.keywords !== '') {
                    angular.forEach(filteredContacts, function (contact) {
                        var aliases = [];
                        angular.forEach(contact.addresses, function (address) {
                            var alias = $rootScope.getSafeAlias(address);
                            if (alias) {
                                aliases.push(alias);
                            }
                        });
                        contact.aliases = aliases;
                    });
                    angular.forEach(filteredContacts, function (contact) {
                        var groupNames = [];
                        angular.forEach(contact.group_ids, function (id) {
                            var group = $rootScope.getGroup(id);
                            if (group) {
                                groupNames.push(group.name);
                            }
                        });
                        contact.groupNames = groupNames;
                    });
                    filteredContacts = $filter('filter')(filteredContacts, groupFactory.filter.keywords);
                }
                if (sortingParamsLists.contacts.contactsSortBy === 'group_ids') {
                    showedContacts = $filter('orderBy')(filteredContacts, function (contact) {
                        var group = $rootScope.getGroup(contact.group_ids[0]);
                        return group ? group.name : false;
                    }, sortingParamsLists.contacts.contactsSortDir);
                } else if (sortingParamsLists.contacts.contactsSortBy === 'connections') {
                    var localSort1 = function (a) {
                        return a.normal_connections.length ? a.normal_connections[0].type.toLowerCase() : false;
                    };
                    var localSort2 = function (a) {
                        return a.normal_connections.length ? a.normal_connections[0].text.toLowerCase() : false;
                    };
                    showedContacts = $filter('orderBy')(filteredContacts, [localSort1, localSort2], sortingParamsLists.contacts.contactsSortDir);
                } else if (sortingParamsLists.contacts.contactsSortBy === 'location') {
                    var localSort3 = function (a) {
                        return a.location.country.length ? a.location.country.toLowerCase() : false;
                    };
                    var localSort4 = function (a) {
                        return a.location.city.length ? a.location.city.toLowerCase() : false;
                    };
                    showedContacts = $filter('orderBy')(filteredContacts, [localSort3, localSort4], sortingParamsLists.contacts.contactsSortDir);
                } else {
                    showedContacts = $filter('orderBy')(filteredContacts, sortingParamsLists.contacts.contactsSortBy, sortingParamsLists.contacts.contactsSortDir);
                }
                $scope.paginator.currentPage = 1;
                $scope.filteredContacts = $scope.paginator.Limit(showedContacts);
            };

            $scope.paginator = {
                currentPage: 1,
                inPage: (angular.isDefined($scope.contactsShowHideTabs.paginatorLimit) && parseInt($scope.contactsShowHideTabs.paginatorLimit) > 0) ? $scope.contactsShowHideTabs.paginatorLimit : 20,
                showAll: false,
                changeLimit: function (limit) {
                    $scope.contactsShowHideTabs.paginatorLimit = limit;
                    $scope.paginator.inPage = limit;
                    $scope.paginator.setPage(1, true);
                }
            };

            $scope.$on('pageChanged', function () {
                $scope.filteredContacts = $scope.paginator.Limit(showedContacts);
            });

            $scope.removeConnection = function (contactId, connectionId) {
                angular.forEach($rootScope.settings.contacts, function (contact, index) {
                    if (contact.id === contactId) {
                        var connection = $filter('filter')($rootScope.settings.contacts[index].connections, {'id': connectionId});
                        if (connection.length) {
                            var connectionIndex = $rootScope.settings.contacts[index].connections.indexOf(connection[0]);
                            $rootScope.settings.contacts[index].connections.splice(connectionIndex, 1);
                        }
                    }
                });
            };

            var watchContacts = $scope.$watch(
                function () {
                    return $rootScope.settings.contacts;
                },
                function () {
                    $scope.filterChange();
                },
                true
            );

            var contactCreateNewOpened = false;

            $scope.addContact = function () {
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
                            return false;
                        }
                    }
                }).result.then(function () {
                    contactCreateNewOpened = false;
                }, function () {
                    contactCreateNewOpened = false;
                });
            };

            $scope.saveContacts = function () {
                var caption = $filter('translate')('SAFES.CHOOSE_PATH');
                backend.saveFileDialog(caption, '*.xml', function (status, result) {
                    if (angular.isDefined(result) && result.path && status) {
                        backend.isFileExist(result.path + '.xml', function (s, d) {
                            if (d === 'ALREADY_EXISTS') {
                                informer.error('INFORMER.FILE_EXIST');
                                return false;
                            }
                            var path = result.path;
                            if (path.slice(-4).toLowerCase() === '.xml') {
                                path = path.slice(0, -4);
                            }
                            var xml = '<?xml version="1.0" encoding="UTF-8"?>';
                            xml += '<contacts>';

                            angular.forEach($rootScope.settings.contacts, function (contact) {
                                xml += '<contact>';
                                xml += '<name>' + contact.name + '</name>';

                                xml += '<groups>';
                                angular.forEach(contact.group_ids, function (groupId) {
                                    var group = $rootScope.getGroup(groupId);
                                    if (group) {
                                        xml += '<group name="' + group.name + '" />';
                                    }
                                });
                                xml += '</groups>';

                                xml += '<location>';
                                xml += '<country>' + contact.location.country + '</country>';
                                xml += '<city>' + contact.location.city + '</city>';
                                xml += '<address>' + contact.location.address + '</address>';
                                xml += '</location>';

                                xml += '<comment>' + contact.comment + '</comment>';

                                xml += '<connections>';
                                angular.forEach(contact.connections, function (connection) {
                                    xml += '<connection type="' + connection.type + '" new_type="' + connection.new_type + '" name="' + connection.name + '" username="' + connection.username + '"/>';
                                });
                                xml += '</connections>';

                                xml += '<addresses>';
                                angular.forEach(contact.addresses, function (address) {
                                    xml += '<address address="' + address + '" />';
                                });
                                xml += '</addresses>';

                                xml += '<show_contact_selector>' + contact.show_contact_selector + '</show_contact_selector>';
                                xml += '<is_valid_address>' + contact.is_valid_address + '</is_valid_address>';
                                xml += '<id>' + contact.id + '</id>';

                                xml += '</contact>';
                            });

                            angular.forEach($rootScope.settings.contact_groups, function (group) {
                                xml += '<group>' + group.name + '</group>';
                            });

                            xml += '</contacts>';

                            backend.storeFile(path + '.xml', xml, function (status) {
                                if (status) {
                                    informer.success('INFORMER.FILE_SAVE');
                                }
                            });
                        });
                    }
                });
            };

            $scope.explodeAndImportContacts = function (arrayContacts) {
                var x2js = new X2JS();
                arrayContacts = x2js.xml_str2json(arrayContacts);
                if (arrayContacts && arrayContacts.hasOwnProperty('contacts')) {

                    var arrayGroups = arrayContacts.contacts.group;
                    if (!(arrayGroups instanceof Array)) {
                        arrayGroups = [arrayGroups];
                    }
                    if (angular.isUndefined($rootScope.settings.contact_groups)) {
                        $rootScope.settings.contact_groups = [];
                    }

                    angular.forEach(arrayGroups, function (group) {
                        var exist = false;
                        for (var i = 0; i < $rootScope.settings.contact_groups.length; i++) {
                            if ($rootScope.settings.contact_groups[i].name === group) {
                                exist = true;
                                break;
                            }
                        }
                        if (!exist) {
                            $rootScope.settings.contact_groups.push({id: uuid.generate(), name: group});
                        }
                    });

                    arrayContacts = arrayContacts.contacts.contact;
                    if (!(arrayContacts instanceof Array)) {
                        arrayContacts = [arrayContacts];
                    }
                    if (angular.isUndefined($rootScope.settings.contacts)) {
                        $rootScope.settings.contacts = [];
                    }

                    var rootContacts = [];
                    angular.forEach($rootScope.settings.contacts, function (rootContact) {
                        rootContacts.push(rootContact.id);
                    });

                    angular.forEach(arrayContacts, function (value) {
                        var contact = angular.copy(value);
                        if (rootContacts.indexOf(contact.id) === -1) {
                            contact.addresses = [];
                            if (angular.isDefined(value.addresses.address)) {
                                if (!(value.addresses.address instanceof Array)) {
                                    value.addresses.address = [value.addresses.address];
                                }
                                angular.forEach(value.addresses.address, function (valTemp) {
                                    contact.addresses.push(valTemp._address);
                                });
                            }

                            contact.group_ids = [];
                            if (angular.isDefined(value.groups.group)) {
                                if (!(value.groups.group instanceof Array)) {
                                    value.groups.group = [value.groups.group];
                                }
                                angular.forEach(value.groups.group, function (GI) {
                                    var group = $filter('filter')($rootScope.settings.contact_groups, {name: GI._name});
                                    if (angular.isDefined(group) && group.length) {
                                        contact.group_ids.push(group[0].id);
                                    } else {
                                        var id = uuid.generate();
                                        $rootScope.settings.contact_groups.push({id: id, name: GI._name});
                                        contact.group_ids.push(id);
                                    }
                                });
                            }

                            contact.connections = [];
                            contact.normal_connections = [];
                            if (angular.isDefined(value.connections.connection)) {
                                if (!(value.connections.connection instanceof Array)) {
                                    value.connections.connection = [value.connections.connection];
                                }
                                angular.forEach(value.connections.connection, function (valTemp) {
                                    var id = uuid.generate();
                                    contact.connections.push({
                                        id: id,
                                        is_edit: false,
                                        name: valTemp._name,
                                        new_type: valTemp._new_type,
                                        type: valTemp._type,
                                        username: valTemp._username
                                    });
                                    if (valTemp._type === 'PHONE') {
                                        contact.normal_connections.push({
                                            type: $filter('translate')('MARKET.PHONE.TEXT') + ': ',
                                            text: valTemp._name
                                        });
                                    } else if (valTemp._type === 'EMAIL') {
                                        contact.normal_connections.push({
                                            type: $filter('translate')('MARKET.EMAIL.TEXT') + ': ',
                                            text: valTemp._name
                                        });
                                    } else if (valTemp._type === 'IMS') {
                                        contact.normal_connections.push({
                                            type: valTemp._name + ': ',
                                            text: valTemp._username
                                        });
                                    }
                                });
                            }
                            if (contact.$$hashKey) {
                                delete contact.$$hashKey;
                            }

                            $rootScope.settings.contacts.push(contact);
                        }
                    });

                    $rootScope.storeAppData();

                    if (rootContacts.length === $rootScope.settings.contacts.length) {
                        informer.warning('CONTACTS.ERROR.CONTACT_EXISTS');
                    } else {
                        informer.success('CONTACTS.FILE_IMPORTED');
                    }
                } else {
                    informer.error('CONTACTS.FILE_INVALID');
                }
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

            angular.forEach($rootScope.settings.contacts, function (contact) {
                if (contact.connections instanceof Array) {
                    angular.forEach(contact.connections, function (connection) {
                        if ((connection.new_type === 'EMAIL' && connection.name === '') ||
                            (connection.new_type === 'PHONE' && connection.name === '') ||
                            (connection.new_type === 'IMS' && (connection.name === '' && connection.username === ''))) {
                            $scope.removeConnection(contact.id, connection.id);
                        }
                    });
                }
            });

            $scope.$on('$destroy', function () {
                watchCollectionContacts();
                watchContacts();
            })

        }
    ]);

    module.controller('contactDetailsCtrl', ['backend', '$rootScope', '$scope', 'informer', 'uuid', '$routeParams', '$filter', 'market', '$timeout', 'txHistory', 'sortingParamsLists', '$uibModal', 'showHideTabs', 'messengerList',
        function (backend, $rootScope, $scope, informer, uuid, $routeParams, $filter, market, $timeout, txHistory, sortingParamsLists, $uibModal, showHideTabs, messengerList) {

            var originalName = '';
            $scope.messengerList = messengerList;

            $scope.selectedMessenger = function (obj) {
                if (angular.isDefined(obj)) {
                    $scope.contact.connections[this.$parent.$index].name = obj.originalObject.name;
                    $scope.contact.connections[this.$parent.$index].is_edit = !($scope.contact.connections[this.$parent.$index].name && $scope.contact.connections[this.$parent.$index].username)
                }
            };

            var contactsGroupsOpened = false;

            $scope.groupsChange = function () {
                if ($scope.contact.group_ids.indexOf('-1') > -1) {
                    $timeout(function () {
                        $scope.contact.group_ids.splice($scope.contact.group_ids.indexOf('-1'), 1);
                    });
                    if (contactsGroupsOpened) return;
                    contactsGroupsOpened = true;

                    $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-contacts-groups base-scroll light-scroll',
                        animation: true,
                        templateUrl: 'views/contactsGroups.html',
                        controller: 'contactGroupsCtrl'
                    }).result.then(function () {
                        contactsGroupsOpened = false;
                    }, function () {
                        contactsGroupsOpened = false;
                    });
                }
            };

            $scope.changeMessengerInput = function (str) {
                $scope.contact.connections[this.$parent.$index].name = str;
            };

            $scope.contactShowHideTabs = showHideTabs.contact;

            $scope.txHistory = [];

            $scope.historySortBy = sortingParamsLists.contactDetails.historySortBy;

            $scope.historySortDir = sortingParamsLists.contactDetails.historySortDir;

            $scope.order = function (row) {
                if (sortingParamsLists.contactDetails.historySortBy !== row) {
                    sortingParamsLists.contactDetails.historySortBy = row;
                    sortingParamsLists.contactDetails.historySortDir = true;
                } else {
                    sortingParamsLists.contactDetails.historySortDir = !sortingParamsLists.contactDetails.historySortDir;
                }
                $scope.historySortBy = sortingParamsLists.contactDetails.historySortBy;
                $scope.historySortDir = sortingParamsLists.contactDetails.historySortDir;
                $scope.reloadHistory();
            };

            $scope.reloadHistory = function () {
                $scope.txHistory = txHistory.contactHistory($scope.contact);
                if (sortingParamsLists.contactDetails.historySortBy.indexOf(',') > -1) {
                    var localArr = sortingParamsLists.contactDetails.historySortBy.split(',');
                    $scope.txHistory = $filter('orderBy')($scope.txHistory, localArr, sortingParamsLists.contactDetails.historySortDir);
                } else {
                    $scope.txHistory = $filter('orderBy')($scope.txHistory, sortingParamsLists.contactDetails.historySortBy, sortingParamsLists.contactDetails.historySortDir);
                }
            };

            $scope.$on('$routeChangeStart', function () {
                if ($scope.contact.name === '') {
                    $scope.contact.name = originalName;
                } else {
                    for (var i = 0; i < $rootScope.settings.contacts.length; i++) {
                        if ($scope.contact.name === $rootScope.settings.contacts[i].name && $scope.contact.id !== $rootScope.settings.contacts[i].id) {
                            $scope.contact.name = originalName;
                            break;
                        }
                    }
                }
                $scope.contact.connections = $filter('filter')($scope.contact.connections, {'is_edit': false});
                $rootScope.storeAppData();
            });

            $scope.addContactError = false;

            $scope.checkDuplicate = function (localContactName) {
                $scope.addContactError = false;
                for (var i = 0; i < $rootScope.settings.contacts.length; i++) {
                    if (localContactName === $rootScope.settings.contacts[i].name && $scope.contact.id !== $rootScope.settings.contacts[i].id) {
                        $scope.addContactError = true;
                        break;
                    }
                }
            };

            if ($routeParams['contact_id']) {
                var contacts = $filter('filter')($rootScope.settings.contacts, {id: $routeParams['contact_id']});
                if (contacts.length) {
                    $scope.contact = contacts[0];
                    originalName = $scope.contact.name;
                    if (angular.isUndefined($scope.contact.connections)) {
                        $scope.contact.connections = [];
                    }
                    $scope.reloadHistory();
                }
            }

            $scope.contacts = market.contacts;
            $scope.contact.is_valid_address = false;
            $scope.newAddress = '';
            $scope.newAddressLength = 0;

            $scope.disabledConnections = {
                'EMAIL': false,
                'PHONE': false,
                'IMS': false
            };

            $scope.removeConnection = function (id) {
                var connection = $filter('filter')($scope.contact.connections, {'id': id});
                if (angular.isDefined(connection) && connection.length) {
                    var index = $scope.contact.connections.indexOf(connection[0]);
                    $scope.contact.connections.splice(index, 1);
                    checkDisabledConnections();
                }
            };

            $scope.pushConnection = function (contactType) {
                var id = uuid.generate();
                var connection = {
                    id: id,
                    type: contactType,
                    new_type: contactType,
                    is_edit: true,
                    name: '',
                    username: ''
                };
                var connectionFilter = $filter('filter')($scope.contact.connections, {'type': contactType});
                if (angular.isDefined(connectionFilter) && connectionFilter.length < 5) {
                    $scope.contact.connections.push(connection);
                }
                checkDisabledConnections();
                $timeout(function () {
                    $scope.page.contact = '';
                    $scope.contact.show_contact_selector = false;
                });
            };

            var checkDisabledConnections = function () {
                var connectionFilter = $filter('filter')($scope.contact.connections, {'type': 'EMAIL'});
                $scope.disabledConnections['EMAIL'] = !(angular.isDefined(connectionFilter) && connectionFilter.length < 5);

                connectionFilter = $filter('filter')($scope.contact.connections, {'type': 'PHONE'});
                $scope.disabledConnections['PHONE'] = !(angular.isDefined(connectionFilter) && connectionFilter.length < 5);

                connectionFilter = $filter('filter')($scope.contact.connections, {'type': 'IMS'});
                $scope.disabledConnections['IMS'] = !(angular.isDefined(connectionFilter) && connectionFilter.length < 5);

                $timeout(function () {
                    $('#SelectPickerConnections').selectpicker('refresh');
                });
            };

            checkDisabledConnections();

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
            $scope.blurIMS = function (item) {
                if ($(event.target).hasClass('doNotDoBlur')) return true;
                return !(item.name !== '' && item.username !== '');
            };

            $scope.selectAlias = function (obj) {
                if (angular.isDefined(obj)) {
                    var alias = obj.originalObject;
                    $scope.contact.is_valid_address = true;
                    $scope.newAddress = alias.address;
                    $scope.addAddress();
                }
            };

            $scope.newAddressShow = false;

            $scope.showHideNewAddress = function (value) {
                $scope.newAddressShow = value;
            };

            $scope.addAddress = function () {
                $scope.errorDeleteAddress = false;
                if ($scope.newAddress.length && $scope.contact.is_valid_address) {
                    if ($scope.contact.addresses.indexOf($scope.newAddress) === -1) {
                        $scope.contact.addresses.push($scope.newAddress);
                        $scope.reloadHistory();
                    } else {
                        informer.info('INFORMER.ADDRESS');
                    }
                    $scope.$broadcast('angucomplete-alt:clearInput');
                    $scope.newAddressShow = false;
                    $scope.contact.is_valid_address = false;
                    $scope.newAddressLength = 0;
                }
            };

            $scope.errorDeleteAddress = false;

            var contactsDeleteAddressOpened = false;

            $scope.removeAddress = function (index) {
                var contact = $scope.contact;
                if (contact.addresses.length > 1) {
                    var reloadHistory = $scope.reloadHistory;

                    if (contactsDeleteAddressOpened) return;
                    contactsDeleteAddressOpened = true;

                    $uibModal.open({
                        templateUrl: 'views/contactsDeleteAddress.html',
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-disable-safe base-scroll light-scroll',
                        animation: true,
                        controller: function ($scope, $uibModalInstance) {
                            $scope.delete = function () {
                                contact.addresses.splice(index, 1);
                                reloadHistory();
                                informer.success();
                                $scope.close();
                            };
                            $scope.close = function () {
                                $uibModalInstance.close();
                            };
                        }
                    }).result.then(function () {
                        contactsDeleteAddressOpened = false;
                    }, function () {
                        contactsDeleteAddressOpened = false;
                    });
                } else {
                    $scope.errorDeleteAddress = true;
                    setTimeout(function () {
                        $scope.errorDeleteAddress = false;
                        $scope.$digest();
                    }, 2000);
                }
            };

            $scope.inputChanged = function (str) {
                $scope.newAddressLength = str.length;
                if (str.indexOf('@') !== 0) {
                    backend.validateAddress(str, function (status) {
                        if (status) {
                            $scope.contact.is_valid_address = true;
                            $scope.newAddress = str;
                        } else {
                            $scope.contact.is_valid_address = false;
                            $scope.newAddress = '';
                        }
                    });
                } else {
                    backend.getAliasByName(str.replace('@', ''), function (status, data) {
                        if (status) {
                            $scope.contact.is_valid_address = true;
                            $scope.newAddress = data.address;
                        } else {
                            $scope.contact.is_valid_address = false;
                            $scope.newAddress = '';
                        }
                    });
                }
            };

            $scope.clearInput = function () {
                $scope.$broadcast('angucomplete-alt:clearInput');
                $scope.contact.is_valid_address = false;
                $scope.newAddress = '';
                $scope.newAddressLength = 0;
            };

            if ($routeParams.address) {
                if ($scope.contact.addresses.indexOf($routeParams.address) === -1) {
                    $scope.contact.addresses.push($routeParams.address);
                }
            }

        }
    ]);

    module.controller('addEditContactCtrl', ['backend', '$rootScope', '$scope', 'informer', 'uuid', '$filter', '$uibModalInstance', 'address', 'market', '$timeout', '$uibModal', 'messengerList',
        function (backend, $rootScope, $scope, informer, uuid, $filter, $uibModalInstance, address, market, $timeout, $uibModal, messengerList) {

            $scope.messengerList = messengerList;

            $scope.selectedMessenger = function (obj) {
                if (angular.isDefined(obj)) {
                    $scope.contact.connections[this.$parent.$index].name = obj.originalObject.name;
                    $scope.contact.connections[this.$parent.$index].is_edit = !($scope.contact.connections[this.$parent.$index].name && $scope.contact.connections[this.$parent.$index].username)
                }
            };

            $scope.changeMessengerInput = function (str) {
                $scope.contact.connections[this.$parent.$index].name = str;
            };

            var contactsGroupsOpened = false;

            $scope.groupsChange = function () {
                if ($scope.contact.group_ids.indexOf('-1') > -1) {
                    $timeout(function () {
                        $scope.contact.group_ids.splice($scope.contact.group_ids.indexOf('-1'), 1);
                    });

                    if (contactsGroupsOpened) return;
                    contactsGroupsOpened = true;

                    $uibModal.open({
                        backdrop: false,
                        windowClass: 'modal-main-wrapper modal-contacts-groups base-scroll light-scroll',
                        animation: true,
                        templateUrl: 'views/contactsGroups.html',
                        controller: 'contactGroupsCtrl'
                    }).result.then(function () {
                        contactsGroupsOpened = false;
                    }, function () {
                        contactsGroupsOpened = false;
                    });
                }
            };

            $scope.contact = {
                name: '',
                group_ids: [],
                location: {
                    country: '',
                    city: '',
                    address: ''
                },
                comment: '',
                connections: [],
                addresses: [],
                show_contact_selector: true
            };

            if (address) {
                $scope.contact.addresses.push(address);
            }

            $scope.close = function () {
                $uibModalInstance.close();
            };

            $scope.page = {
                contact: ''
            };

            $scope.contacts = market.contacts;
            $scope.contact.is_valid_address = false;
            $scope.newAddress = '';
            $scope.newAddressLength = 0;

            $scope.disabledConnections = {
                'EMAIL': false,
                'PHONE': false,
                'IMS': false
            };

            $scope.removeConnection = function (id) {
                var connection = $filter('filter')($scope.contact.connections, {'id': id});
                if (angular.isDefined(connection) && connection.length) {
                    var index = $scope.contact.connections.indexOf(connection[0]);
                    $scope.contact.connections.splice(index, 1);
                    checkDisabledConnections();
                }
            };

            $scope.pushConnection = function (contactType) {
                var id = uuid.generate();
                var connection = {
                    id: id,
                    type: contactType,
                    new_type: contactType,
                    is_edit: true,
                    name: '',
                    username: ''
                };
                if (contactType === 'EMAIL') connection.valid = false;
                var connectionFilter = $filter('filter')($scope.contact.connections, {'type': contactType});
                if (angular.isDefined(connectionFilter) && connectionFilter.length < 5) {
                    $scope.contact.connections.push(connection);
                }
                checkDisabledConnections();
                $timeout(function () {
                    $scope.page.contact = '';
                    $scope.contact.show_contact_selector = false;
                });
            };

            var checkDisabledConnections = function () {
                var connectionFilter = $filter('filter')($scope.contact.connections, {'type': 'EMAIL'});
                $scope.disabledConnections['EMAIL'] = !(angular.isDefined(connectionFilter) && connectionFilter.length < 5);

                connectionFilter = $filter('filter')($scope.contact.connections, {'type': 'PHONE'});
                $scope.disabledConnections['PHONE'] = !(angular.isDefined(connectionFilter) && connectionFilter.length < 5);

                connectionFilter = $filter('filter')($scope.contact.connections, {'type': 'IMS'});
                $scope.disabledConnections['IMS'] = !(angular.isDefined(connectionFilter) && connectionFilter.length < 5);

                $timeout(function () {
                    $('#SelectPickerConnections').selectpicker('refresh');
                });
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
            $scope.blurIMS = function (item) {
                if ($(event.target).hasClass('doNotDoBlur')) return true;
                return !(item.name !== '' && item.username !== '');
            };

            $scope.addContactError = false;

            $scope.checkDuplicate = function (localContactName) {
                $scope.addContactError = false;
                for (var i = 0; i < $rootScope.settings.contacts.length; i++) {
                    if (localContactName === $rootScope.settings.contacts[i].name) {
                        $scope.addContactError = true;
                        break;
                    }
                }
            };

            $scope.saveContact = function (contact) {
                if (!$scope.contactForm.$valid || !contact.addresses.length) {
                    return;
                }
                for (var i = 0; i < $rootScope.settings.contacts.length; i++) {
                    if (contact.name === $rootScope.settings.contacts[i].name) {
                        $scope.addContactError = true;
                        return;
                    }
                }
                if (($filter('filter')(contact.connections, {'is_edit': true})).length) return;

                if (angular.isUndefined(contact.id)) {
                    contact.id = uuid.generate();
                    $rootScope.settings.contacts.push(contact);
                    $rootScope.storeAppData();

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
                }
                $scope.close();
            };

            $scope.selectAlias = function (obj) {
                if (angular.isDefined(obj)) {
                    var alias = obj.originalObject;
                    $scope.contact.is_valid_address = true;
                    $scope.newAddress = alias.address;
                    $scope.addAddress();
                }
            };

            $scope.newAddressShow = !$scope.contact.addresses.length;
            $scope.showHideNewAddress = function (value) {
                $scope.newAddressShow = value;
            };

            $scope.addAddress = function () {
                if ($scope.newAddress.length && $scope.contact.is_valid_address) {
                    if ($scope.contact.addresses.indexOf($scope.newAddress) === -1) {
                        $scope.contact.addresses.push($scope.newAddress);
                    } else {
                        informer.info('INFORMER.ADDRESS');
                    }
                    $scope.$broadcast('angucomplete-alt:clearInput');
                    $scope.newAddressShow = false;
                    $scope.contact.is_valid_address = false;
                    $scope.newAddressLength = 0;
                }
            };

            $scope.clearInput = function () {
                $scope.$broadcast('angucomplete-alt:clearInput');
                $scope.contact.is_valid_address = false;
                $scope.newAddress = '';
                $scope.newAddressLength = 0;
            };

            var contactsDeleteAddressOpened = false;
            $scope.removeAddress = function (index) {
                var contact = $scope.contact;

                if (contactsDeleteAddressOpened) return;
                contactsDeleteAddressOpened = true;

                $uibModal.open({
                    animation: true,
                    backdrop: false,
                    templateUrl: 'views/contactsDeleteAddress.html',
                    windowClass: 'modal-main-wrapper modal-disable-safe base-scroll light-scroll',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.delete = function () {
                            contact.addresses.splice(index, 1);
                            $scope.close();
                        };
                        $scope.close = function () {
                            $uibModalInstance.close();
                        };
                    }
                }).result.then(function () {
                    contactsDeleteAddressOpened = false;
                    if (contact.addresses.length === 0) {
                        $scope.newAddressShow = true;
                    }
                }, function () {
                    contactsDeleteAddressOpened = false;
                });
            };

            $scope.inputChanged = function (str) {
                $scope.newAddressLength = str.length;
                if (str.indexOf('@') !== 0) {
                    backend.validateAddress(str, function (status) {
                        if (status) {
                            $scope.contact.is_valid_address = true;
                            $scope.newAddress = str;
                        } else {
                            $scope.contact.is_valid_address = false;
                            $scope.newAddress = '';
                        }
                    });
                } else {
                    backend.getAliasByName(str.replace('@', ''), function (status, data) {
                        if (status) {
                            $scope.contact.is_valid_address = true;
                            $scope.newAddress = data.address;
                        } else {
                            $scope.contact.is_valid_address = false;
                            $scope.newAddress = '';
                        }
                    });
                }
            };

        }
    ]);
})();