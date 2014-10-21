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
            require  : '?ngModel',
            restrict : 'E',
            template: '<input type="text" readonly="readonly" class="ion-google-place" autocomplete="off">',replace  : true,
            scope: {
                model: '=ngModel',
                authUser: '=address'
            },
            link     : function (scope, element, attrs, ngModel) {
               // Vars required on scope
               scope.locations = [];
               if(!scope.location) scope.location = {};
               var api = new google.maps.places.AutocompleteService();
               var searchEventTimeout = undefined;

               var POPUP_TPL = [
                  '<div class="ion-google-place-container">',
                  '<div class="bar bar-header item-input-inset">',
                  '<label class="item-input-wrapper">',
                  '<i class="icon ion-ios7-search placeholder-icon"></i>',
                  '<input class="google-place-search" type="search" ng-model="searchQuery" placeholder="">',
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
                  template : POPUP_TPL,
                  scope    : scope,
                  appendTo : $document[0].body
               });

               popupPromise.then(function (el) {
                  var searchInputElement = angular.element(el.element.find('input'));

                  // Get place details for the prediction
                  scope.getDetails = function (prediction) {
                     var deferred = $q.defer();
                     var placesService = new google.maps.places.PlacesService(element[0]);
                     placesService.getDetails(
                        {'placeId' : prediction.place_id},
                        function (placeDetails, placesServiceStatus) {
                           if (placesServiceStatus == "OK") {
                              deferred.resolve(placeDetails);
                           } else {
                              deferred.reject(placesServiceStatus);
                           }
                        }
                     );
                     return deferred.promise;
                  };

                  // Update scope location using prediction selected by user
                  scope.selectLocation = function (prediction) {
                     var promise = scope.getDetails(prediction);
                     promise.then(
                        function (details) {
                           scope.location = details;
                           ngModel.$setViewValue(details);
                           ngModel.$render();
                        },
                        function (error) { console.log("Error: ", error); },
                        function (update) { console.log("Notification: ", update);
                        });
                     el.element.css('display', 'none');
                     $ionicBackdrop.release();
                  };

                  scope.$watch('searchQuery', function (query) {
                     if (searchEventTimeout) $timeout.cancel(searchEventTimeout);
                     searchEventTimeout = $timeout(function () {
                        if (!query) return;
                        if (query.length < 3) return;
                        api.getPlacePredictions({ input : query }, function (results, status) {
                           if (status == google.maps.places.PlacesServiceStatus.OK) {
                              scope.$apply(function () {
                                 scope.locations = results;
                              });
                           } else {
                              // @TODO: Figure out what to do when the geocoding fails
                           }
                        });
                     }, 350); // we're throttling the input by 350ms to be nice to google's API
                  });

                  var onClick = function (e) {
                     e.preventDefault();
                     e.stopPropagation();
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

                  element.bind('click', onClick);
                  element.bind('touchend', onClick);

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
