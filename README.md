ion-google-place
================

An Ionic directive that adds an autocomplete location popup/overlay search menu, using google's geocoding API.
The directive also returns the full geocode result object.

![Animated demo](https://github.com/israelidanny/ion-google-place/raw/master/demo.gif)

This is a simple directive for an autocomplete overlay location field built for Ionic Framework.

# Installation

### Bower
```bash
bower install ion-google-place
```

### OR Bower from a specific github commit (NOTE: As github repo releases may not always be up to date)
```bash
bower install git://github.com/israelidanny/ion-google-place#<CommitId>
```

### Implementing into Ionic

For the geolocation service to work, you'll need to have Google Maps javascript API in your HEAD/Index.html:

`<script src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"></script>`

Followed by ion-google-place:

`<script type="text/javascript" src="lib/ion-google-place/ion-google-place.js"></script>`


You'll also need to add `ion-google-place` as a dependency in your Ionic app:
```javascript
angular.module('myApp', [
  'ionic',
  'ion-google-place'
]);
```

# Usage

### ng-model (Required)
Used to store the Google Geocoding result object (See api documentation for object description https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingResults)

```<ion-google-place ng-model="geocodeObject"/>```

### current-location (Optional)
Setting to "true" will add the option of quick-selecting the device's current location as the address to geocode

```<ion-google-place ng-model="geocodeObject" current-location="true"/>```

### geocode-options (Optional)
Passes geocode options to the directive. Useful when you want to restrict search results to specific areas.
The following example restricts results to Ireland(IE) only. See google's api documentation for more options. https://developers.google.com/maps/documentation/javascript/geocoding

```<ion-google-place ng-model="geocodeObject" geocode-options="{componentRestrictions: {country: 'IE'}}/>```
