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
```html
<ion-google-place placeholder="Enter an address, Apt# and ZIP" ng-model="location"></ion-google-place>
```

#Customisation

You can specify `data-search-placeholder` and `data-label-cancel` to customise text in search input and cancel button.

Like so:
```html
<ion-google-place
  placeholder="Enter an address, Apt# and ZIP"
  data-search-placeholder="Type your search"
  data-label-cancel="back"
  ng-model="location"></ion-google-place>
```
