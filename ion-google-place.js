/* Options Example
*
* options = {
*        types: '(cities)',
*        country: 'BG',
*        language: 'bg_BG'
*    }
*/
angular.module('ion-google-place', [])
    .directive('ionGooglePlace', [
        '$ionicTemplateLoader',
        '$ionicBackdrop',
        '$q',
        '$timeout',
        '$rootScope',
        '$document',
        function ($ionicTemplateLoader, $ionicBackdrop, $q, $timeout, $rootScope, $document) {
            return {
                require: '?ngModel',
                restrict: 'E',
                template: '<input type="text" readonly="readonly" class="ion-google-place" ng-click="onClick();$event.preventDefault();$event.stopPropagation();" autocomplete="off">',
                replace: true,
                scope: {
                    model: '=ngModel',
                    options: '=?'
                },
                link: function (scope, element, attrs, ngModel) {
                    scope.locations = [];
                    var request = {};

                    if (scope.options) {
                        if (scope.options.types) {
                            request.types = [];
                            request.types.push(scope.options.types);
                        }

                        if (scope.options.country) {
                            request.componentRestrictions = { country: scope.options.country };
                        }

                        if (scope.options.language) {
                            request.language = scope.options.language;
                        }
                    }

                    var service = new google.maps.places.AutocompleteService();

                    var searchEventTimeout = undefined;

                    var POPUP_TPL = [
                        '<div class="ion-google-place-container">',
                            '<div class="bar bar-header item-input-inset">',
                                '<label class="item-input-wrapper">',
                                    '<i class="icon ion-ios7-search placeholder-icon"></i>',
                                    '<input class="google-place-search" type="search" ng-model="searchQuery" placeholder="Enter an address, place or ZIP code">',
                                '</label>',
                                '<button class="button button-clear">',
                                    'Cancel',
                                '</button>',
                            '</div>',
                            '<ion-content class="has-header has-header">',
                                '<ion-list>',
                                    '<ion-item ng-repeat="location in locations" type="item-text-wrap" ng-click="selectLocation(location)">',
                                        '{{location.description}}',
                                    '</ion-item>',
                                '</ion-list>',
                            '</ion-content>',
                        '</div>'
                    ].join('');

                    var popupPromise = $ionicTemplateLoader.compile({
                        template: POPUP_TPL,
                        scope: scope,
                        appendTo: $document[0].body
                    });

                    popupPromise.then(function (el) {
                        var searchInputElement = angular.element(el.element.find('input'));

                        scope.selectLocation = function (location) {
                            ngModel.$setViewValue(location.description);
                            ngModel.$render();
                            el.element.css('display', 'none');
                            $ionicBackdrop.release();
                        };

                        scope.$watch('searchQuery', function (query) {
                            if (searchEventTimeout) $timeout.cancel(searchEventTimeout);
                            searchEventTimeout = $timeout(function () {
                                if (!query) return;

                                request.input = query;
                                service.getPlacePredictions(request, function (predictions, status) {
                                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                                        scope.$apply(function () {
                                            scope.locations = predictions;
                                        });
                                    }
                                    else {
                                        // @TODO: Figure out what to do when the google places fails
                                    }
                                });
                            }, 350); // we're throttling the input by 350ms to be nice to google's API
                        });

                        scope.onClick = function (e) {
                            $ionicBackdrop.retain();
                            el.element.css('display', 'block');
                            searchInputElement[0].focus();
                            setTimeout(function () {
                                searchInputElement[0].focus();

                            }, 0);
                        };

                        var onCancel = function (e) {
                            scope.searchQuery = '';
                            $ionicBackdrop.release();
                            el.element.css('display', 'none');
                        };

                        el.element.find('button').bind('click', onCancel);
                    });

                    if (attrs.placeholder) {
                        element.attr('placeholder', attrs.placeholder);
                    }


                    ngModel.$formatters.unshift(function (modelValue) {
                        if (!modelValue) return '';
                        return modelValue;
                    });

                    ngModel.$parsers.unshift(function (viewValue) {
                        return viewValue;
                    });

                    ngModel.$render = function () {
                        if (!ngModel.$viewValue) {
                            element.val('');
                        } else {
                            element.val(ngModel.$viewValue.formatted_address || '');
                        }
                    };
                }
            };
        }
    ]);