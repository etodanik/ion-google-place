angular.module('ion-google-place', [])
    .directive('ionGooglePlace', [
        '$ionicTemplateLoader',
        '$ionicBackdrop',
        '$q',
        '$timeout',
        '$rootScope',
        '$document',
        function($ionicTemplateLoader, $ionicBackdrop, $q, $timeout, $rootScope, $document) {
            return {
                require: '?ngModel',
                restrict: 'EA',
                link: function(scope, element, attrs, ngModel) {
                    scope.locations = [];

                    // Get handles on the Services
                    var geocoderService = new google.maps.Geocoder();
                    var placesService = new google.maps.places.AutocompleteService();

                    var searchEventTimeout = undefined;

                    var popupPromise = $ionicTemplateLoader.compile({
                        templateUrl: 'lib/ion-google-place/ion-google-place-results-tpl.html',
                        scope: scope,
                        appendTo: $document[0].body
                    });

                    popupPromise.then(function(el){
                        var searchInputElement = angular.element(el.element.find('input'));

                        // Once the user has selected a Place Service prediction, go back out
                        // to the Places Service and get details for the selected location.
                        // Or if using Geocode Service we'll just passing through
                        scope.getDetails = function (selection) {
                            var deferred = $q.defer();
                            if (attrs.service !== 'places') {
                                deferred.resolve(selection);
                            } else {
                                var placesService = new google.maps.places.PlacesService(element[0]);
                                placesService.getDetails(
                                    {'placeId' : selection.place_id},
                                    function (placeDetails, placesServiceStatus) {
                                        if (placesServiceStatus == "OK") {
                                            deferred.resolve(placeDetails);
                                        } else {
                                            deferred.reject(placesServiceStatus);
                                        }
                                    }
                                );
                            }
                            return deferred.promise;
                        };


                        // User selects a Place 'prediction' or Geocode result
                        // Do stuff with the selection
                        scope.selectLocation = function(selection){
                            // If using Places Service, we need to go back out to the Service to get
                            // the details of the place.
                            var promise = scope.getDetails(selection);
                            promise.then(onResolve, onReject, onUpdate);
                            el.element.css('display', 'none');
                            $ionicBackdrop.release();
                        };

                        function onResolve(details) {
                            // Update the model
                            ngModel.$setViewValue(details);
                            ngModel.$render();
                        }

                        function onReject(rejection) {
                            // Rejection if using Places service
                            console.log('Places API error: ', rejection);
                            ngModel.$setViewValue(selection);
                            ngModel.$render();
                        }

                        function onUpdate(update) {
                            console.log('Places API notification: ', update);
                        }

                        // Watch the search input and execute request from service
                        scope.$watch('searchQuery', function(query){
                            if (searchEventTimeout) $timeout.cancel(searchEventTimeout);
                            searchEventTimeout = $timeout(function() {
                                if(!query) return;
                                if(query.length < 3) return;
                                // Are we using the Google Geocode service?
                                if(attrs.service === "geocode") {
                                    geocoderService.geocode({ address: query }, function(results, status) {
                                        if (status == google.maps.GeocoderStatus.OK) {
                                            scope.$apply(function(){
                                                scope.locations = results;
                                            });
                                        } else {
                                            // @TODO: Figure out what to do when the geocoding fails
                                        }
                                    });
                                }
                                // Are we using the Google Places service?
                                // Places Service differs from the Geocode service in that it initially
                                // returns a list of 'predictions'. When the user selects a prediction,
                                // We'll then go back out the Service to get details for the prediction
                                // using the getDetails() method.
                                if(attrs.service == "places") {
                                    placesService.getPlacePredictions({ input : query }, function (results, status) {
                                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                                            scope.$apply(function () {
                                                scope.locations = results;
                                            });
                                        } else {
                                            // @TODO: Handle failed call
                                        }
                                    });
                                }
                            }, 350); // we're throttling the input by 350ms to be nice to google's API
                        });

                        var onClick = function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            $ionicBackdrop.retain();
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
                        };

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
                }
            };
        }
    ]);