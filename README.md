# Flux API

Flux API constantly monitors flux network and features api for about flux network. Current and Historical.

## Requirements

Requires node version 8.0 and above, mongodb

## Installation

Install npm dependencies with command:

```javascript
npm install
```

## Usage

Start the service with command:

```javascript
npm start
```

Service will be started on 127.0.0.1:8123

## Calls

Get stored Geolocations

```javascript
/storedlocations
```

Get Information about all Fluxes

```javascript
/fluxinfo
```

## API Management tool

Start the API management tool

```javascript
node apiManager.js
```

Marketplace apps follow the v4 FLux app specification, with the addition of some extra fields:

 - Visible: set this to false to remove the app from the marketplace list
 - Enabled: set this to false to leave it in the list, but prevent spawning
 - Category: displayed on the marketplace UI
 - Price: ensure this is not less than the calculated app price
 - Components:
  - Each component can have both static environment parameters (not editable by user)
    and user environment parameters. The user parameters are defined using JSON like this:
    ```javascript
    [
      {
        "name": "parametername",
        "description": "parameter description",
        "placeholder": "an example of the parameter value",
        "port": 0
      }
    ]
    ```
    When entering the JSON it needs to added as a single line. The "port" value is optional, and
    will auto-fill the UI with value of the specified port.
    