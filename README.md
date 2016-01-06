ion-google-place
================

Ionic directive for a location dropdown that utilizes google maps

![Animated demo](https://github.com/israelidanny/ion-google-place/raw/master/demo.gif)

This is a simple directive for an autocomplete overlay location field built for Ionic Framework.

#Installation

Installation should be dead simple, you can grab a copy from bower:
```bash
bower install ion-google-place
```

Or clone this repository.

For the geolocation service to work, you'll need to have Google Maps javascript API somewhere in your HEAD tag:
`<script src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"></script>`

You'll need to add `ion-google-place` as a dependency on your Ionic app:
```javascript
angular.module('myApp', [
  'ionic',
  'ion-google-place'
]);
```

That's pretty much it. Now you can use the directive like so:
`<ion-google-place placeholder="Enter an address, Apt# and ZIP" ng-model="location" />`

You can in this version have the current location by adding to the directive "ion-google-place" the attribute currentLocation to true.

example:  `<ion-google-place placeholder="Enter an address, Apt# and ZIP" ng-model="location" current-location="true" />`

the acceptable value fot the attribute currentLocation are true or false.