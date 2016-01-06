angular.module('ion-google-place', [])
    .directive('ionGooglePlace', [
        '$ionicTemplateLoader',
        '$ionicBackdrop',
        '$ionicPlatform',
        '$q',
        '$timeout',
        '$rootScope',
        '$document',
        function($ionicTemplateLoader, $ionicBackdrop, $ionicPlatform, $q, $timeout, $rootScope, $document) {
            return {
                require: '?ngModel',
                restrict: 'E',
                template: '<input type="text" readonly="readonly" class="ion-google-place" autocomplete="off">',
                replace: true,
                scope: {
                    ngModel: '=?',
                    geocodeOptions: '=',
                    currentLocation: '@'
                },
                link: function(scope, element, attrs, ngModel) {
                    var unbindBackButtonAction;

                    scope.locations = [];
                    var geocoder = new google.maps.Geocoder();
                    var searchEventTimeout = undefined;

                    scope.displayCurrentLocation = false;
                    scope.currentLocation = scope.currentLocation === "true"? true:false;
                    
                    if(!!navigator.geolocation && scope.currentLocation){
                        scope.displayCurrentLocation = true;
                    }
                    var POPUP_TPL = [
                        '<div class="ion-google-place-container modal">',
                            '<div class="bar bar-header item-input-inset">',
                                '<label class="item-input-wrapper">',
                                    '<i class="icon ion-ios7-search placeholder-icon"></i>',
                                    '<input class="google-place-search" type="search" ng-model="searchQuery" placeholder="' + (attrs.searchPlaceholder || 'Enter an address, place or ZIP code') + '">',
                                '</label>',
                                '<button class="button button-clear">',
                                    attrs.labelCancel || 'Cancel',
                                '</button>',
                            '</div>',
                            '<ion-content class="has-header has-header">',
                                '<ion-list>',
                                    '<ion-item type="item-text-wrap" ng-click="setCurrentLocation()" ng-if="displayCurrentLocation">',
                                        'Use current location',
                                    '</ion-item>',
                                    '<ion-item ng-repeat="location in locations" type="item-text-wrap" ng-click="selectLocation(location)">',
                                        '{{location.formatted_address}}',
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

                    popupPromise.then(function(el){
                        var searchInputElement = angular.element(el.element.find('input'));

                        scope.selectLocation = function(location){
                            ngModel.$setViewValue(location);
                            ngModel.$render();
                            el.element.css('display', 'none');
                            $ionicBackdrop.release();

                            if (unbindBackButtonAction) {
                                unbindBackButtonAction();
                                unbindBackButtonAction = null;
                            }
                            scope.$emit('ionGooglePlaceSetLocation',location);
                        };

                        scope.setCurrentLocation = function(){
                            var location = {
                                formatted_address: 'getting current location...'
                            };
                            ngModel.$setViewValue(location);
                            ngModel.$render();
                            el.element.css('display', 'none');
                            $ionicBackdrop.release();
                            getLocation()
                                .then(reverseGeocoding)
                                .then(function(location){
                                    ngModel.$setViewValue(location);
                                    element.attr('value', location.formatted_address);
                                    ngModel.$render();
                                    el.element.css('display', 'none');
                                    $ionicBackdrop.release();
                                })
                                .catch(function(error){
                                    console.log('erreur catch',error);
                                    //if(error.from == 'getLocation'){
                                    //    getLocationError(error);
                                    //} else {
                                    //    //TODO when error from reverse geocode
                                    //}
                                    var location = {
                                        formatted_address: 'Error in getting current location'
                                    };
                                    ngModel.$setViewValue(location);
                                    ngModel.$render();
                                    el.element.css('display', 'none');
                                    $ionicBackdrop.release();
                                    $timeout(function(){
                                        ngModel.$setViewValue(null);
                                        ngModel.$render();
                                        el.element.css('display', 'none');
                                        $ionicBackdrop.release();
                                    }, 2000);
                                });
                        };

                        scope.$watch('searchQuery', function(query){
                            if (searchEventTimeout) $timeout.cancel(searchEventTimeout);
                            searchEventTimeout = $timeout(function() {
                                if(!query) return;
                                if(query.length < 3);

                                var req = scope.geocodeOptions || {};
                                req.address = query;
                                geocoder.geocode(req, function(results, status) {
                                    if (status == google.maps.GeocoderStatus.OK) {
                                        scope.$apply(function(){
                                            scope.locations = results;
                                        });
                                    } else {
                                        // @TODO: Figure out what to do when the geocoding fails
                                    }
                                });
                            }, 350); // we're throttling the input by 350ms to be nice to google's API
                        });

                        var onClick = function(e){
                            e.preventDefault();
                            e.stopPropagation();

                            $ionicBackdrop.retain();
                            unbindBackButtonAction = $ionicPlatform.registerBackButtonAction(closeOnBackButton, 250);

                            el.element.css('display', 'block');
                            searchInputElement[0].focus();
                            setTimeout(function(){
                                searchInputElement[0].focus();
                            },0);
                        };

                        var onCancel = function(e){
                            scope.searchQuery = '';
                            $ionicBackdrop.release();
                            el.element.css('display', 'none');

                            if (unbindBackButtonAction){
                                unbindBackButtonAction();
                                unbindBackButtonAction = null;
                            }
                        };

                        closeOnBackButton = function(e){
                            e.preventDefault();

                            el.element.css('display', 'none');
                            $ionicBackdrop.release();

                            if (unbindBackButtonAction){
                                unbindBackButtonAction();
                                unbindBackButtonAction = null;
                            }
                        }

                        element.bind('click', onClick);
                        element.bind('touchend', onClick);

                        el.element.find('button').bind('click', onCancel);
                    });

                    if(attrs.placeholder){
                        element.attr('placeholder', attrs.placeholder);
                    }


                    ngModel.$formatters.unshift(function (modelValue) {
                        if (!modelValue) return '';
                        return modelValue;
                    });

                    ngModel.$parsers.unshift(function (viewValue) {
                        return viewValue;
                    });

                    ngModel.$render = function(){
                        if(!ngModel.$viewValue){
                            element.val('');
                        } else {
                            element.val(ngModel.$viewValue.formatted_address || '');
                        }
                    };

                    scope.$on("$destroy", function(){
                        if (unbindBackButtonAction){
                            unbindBackButtonAction();
                            unbindBackButtonAction = null;
                        }
                    });

                    function getLocation() {
                        return $q(function (resolve, reject) {
                            navigator.geolocation.getCurrentPosition(function (position) {
                                resolve(position);
                            }, function (error) {
                                error.from = 'getLocation';
                                reject(error);
                            });
                        });
                    }

                    function reverseGeocoding(location) {
                        return $q(function (resolve, reject) {
                            var latlng = {
                                lat: location.coords.latitude,
                                lng: location.coords.longitude
                            };
                            geocoder.geocode({'location': latlng}, function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[1]) {
                                        resolve(results[1]);
                                    } else {
                                        resolve(results[0])
                                    }
                                } else {
                                    var error = {
                                        status: status,
                                        from: 'reverseGeocoding'
                                    };
                                    reject(error);
                                }
                            })
                        });
                    }
                }
            };
        }
    ]);
