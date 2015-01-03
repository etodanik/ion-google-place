'use strict';

describe('Geocoder Options', function () {

  // load the directive's module
  beforeEach(module('ionic'));
  beforeEach(module('ion-google-place'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('Should have geocoder options in the scope', inject(function ($compile) {
    scope.geocoderOptions = {
      componentRestrictions: {
        country: 'IT'
      }
    };
    element = angular.element('<ion-google-place ng-model="location" geocoder-options="geocoderOptions"></ion-google-place>');
    element = $compile(element)(scope);
    expect(angular.element(element).scope().geocoderOptions).toBe(scope.geocoderOptions);
  }));

  it('Should change geocoder options', inject(function ($compile) {
    scope.geocoderOptions = {
      componentRestrictions: {
        country: 'IT'
      }
    };
    element = angular.element('<ion-google-place ng-model="location" geocoder-options="geocoderOptions"></ion-google-place>');
    element = $compile(element)(scope);
    scope.geocoderOptions.componentRestrictions.country = 'EN';
    expect(angular.element(element).scope().geocoderOptions.componentRestrictions.country).toBe('EN');
  }));

  it('Should send address only req if no options', inject(function ($compile) {
    element = angular.element('<ion-google-place ng-model="location"></ion-google-place>');
    element = $compile(element)(scope);
    expect(angular.element(element).scope().geocoderOptions).toBeUndefined();
  }));
});
