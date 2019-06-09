# ForgeVuer

A Vue.js component aiming to provide a easy to setup, almost *"plug and play"* experience when an instance of an Autodesk Forge Viewer is needed on your application.

## Getting Started

These instructions will get you started on how to install, use and customize the **ForgeVuer** component.

### Prerequisites

- A minimal **Vue** app to use the component.
- The latest Autodesk Forge Viewer styling and javascript files referenced on the html `head` section.

```html
<head>
    [...]
    <!-- Autodesk Forge Viewer files -->
    <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css?v=v6.0" type="text/css">
    <script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.min.js?v=v6.0"></script>
    [...]
</head>
```

### Installing
```
npm install @alvpickmans/forge-vuer
```

## TL;DR

A minimal working setup on a SPA application:

```html
<!-- App.vue-->
<template>
  <div id="app">
    <forge-vuer
      :getAccessToken="myGetTokenMethodAsync"
      :urn="myObjectUrn"
    />
  </div>
</template>

<script>
import ForgeVuer from 'forge-vuer';

export default {
    name: 'app',
    components: {
        ForgeVuer
    },
    data: () => {
        return {
            myToken:"{A VALID TOKEN CAN BE USE FOR TESTING PURPOSES}",
            myObjectUrn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c2Rhc2Rhc2QvYnVubnkub2Jq",
        }
    },
    methods: {
        myGetTokenMethodAsync: async function(onSuccess){
            // An API call to retrieve a valid token should be
            // done here. A backend service might need to be implemented
            // to avoid exposing your CLIENT_ID and CLIENT_SECRET credentials.

            // For testing purposes, a valid token can be hardcoded but will 
            // last a maximum of 1 hour (3600 seconds.)
            let token = this.myToken;
            let expireTimeSeconds = 3599;
            onSuccess(token, expireTimeSeconds);
        },
    }
}
</script>
```

## Setup

 Nevertheless, it requires some level of setup in order to have an secure and stable use.

### Access Token

Forge Viewer requires to be associated to a valid Forge Application, and this is achieved by the use of **access token** retrieved using the application's **CLIENT_SECRET** and **CLIENT_ID** credentials.

These credentials **MUST NOT** be exposed on the front-end as:
- Entails a security risk for your Forge Application.
- Making calls to Forge API from the front-end will likely return a **Cross Origin** error.

Instead, a backend service should be implemented so it securely returns a valid token an expiring time. An example of an endpoint for this purpose using **Express.js** and **Axios**:

```javascript
// Backend API
let app = new Express();

app.use("/api/token", async (req, res, next) => {
    return axios.post(
            "https://developer.api.autodesk.com/authentication/v1/authenticate",
            {
                client_id: "YOUR CLIENT_ID",
                client_secret: "YOUR CLIENT_SECRET",
                grant_type: "client_credentials&",
                scopes: "data:read"
            });
});
```
```html
<!-- SPA -->
<template>
    [...]

    <forge-vuer
      [...]

      @getAccessToken="handleAccessToken"
    />
    [...]
</template>

<script>

export default{
    [...]

    methods: {
        handleAccessToken: async function(onSuccess){
            axios.get(`/api/token`)
            .then(response => {
                onSuccess(response.data.access_token, response.data.expires_in);
            })
            .catch(error => {
                console.log(error);
            });
        }
    }

    [...]
}

</script>
```


## Props
The component has some vue prop to configure and customize it.

| Prop | Type | Default | Required |Description |
| --- | --- | --- | --- | --- |
| `id` |`String` | `forge-vuer` | `false` |This defines the DOM `id` attribute of the element that will host the Viewer |
| `getAccessToken` | `Function` | - | `true` | Function that will provide a valid access token to the Viewer by calling the `onSuccess` callback. |
| `urn` | `String` | - | `false` | Urn of the file to load. Make sure the file has already been [translated](https://forge.autodesk.com/en/docs/model-derivative/v2/tutorials/prepare-file-for-viewer/). | 
| `options` | `Object` | - | `false` | Options use to [initialize](https://forge.autodesk.com/en/docs/viewer/v6/reference/Viewing/Initializer/#new-initializer-options-callback) the Viewer instance. The only property that will not be used is `getAccessToken`, as it is replace by the corresponding function passed as a component's property. |
| `headless` | `Boolean` | `false` | `false` | This property defines if the viewer is meant to be use in [headless](https://forge.autodesk.com/en/docs/viewer/v6/tutorials/headless/) mode. |
| `extensions` | `Object` | - | `false` | Object containing the custom extensions. See [custom extensions](#custom-extensions) for more detail.



## Events
The component exposes two types of events to which can be subscribed: original Forge Viewer Events and Custom Events.

### Original Forge Viewer Events

As described on Forge Viewer [API documentation](https://autodeskviewer.com/viewers/latest/docs/Autodesk.Viewing.html#events), the viewer provides several events like `SELECTION_CHANGED`, `PROGRESS_UPDATED`, etc. The component allows to seamlessly subscribe to these event using the familiar vue syntax `v-on:` or `@` by the convention:
- Same name of original event but all lower cased.
- Underscores `_` replaced by hyphens/dashes `-`
- Ended by `-event`.

| Original Event | Subscribed on component |
| --- | --- |
| `SELECTION_CHANGED_EVENT` | `@selection-change-event` |
| `PROGRESS_UPDATE_EVENT` | `@progress-update-event` |

Internally, on creation it will try to map the component's events to the corresponding on the Viewer, providing an easy interface to subscribe to any original event.
Any data associated that an event might return is encapsulated on a single object to allow for an automated mapping. This means that your subscribing function will have a single input object containing all parameters passed by the event.

```html
<!-- SPA -->
<template>
    [...]

    <forge-vuer
      [...]

      @progress-update-event="handleProgressUpdated"
    />
    [...]
</template>

<script>

export default{
    [...]

    methods: {
        handleProgressUpdated: function(e){
            console.log(`Progress: ${e.percentage}%`)
        }
    }

    [...]
}

</script>
```


### ForgeVuer Events
Additionally, the component provides some additional events that allows to act when certain actions happen during the execution of the component.

| Name | Arguments | Description |
| --- | --- | --- |
| `error` | `Error` | This event is fired whenever any error that hasn't been handle in any other way (internally by Forge emitting their events or some other of these custom events). When fired, this event will have as input the actual error that has been thrown.|
| `documentLoading` | - | Event fired when a new `urn` has been provided and the process of loading its associated document starts. |
| `documentLoadError` | `Error` | Fired when Forge fails to load a document. If no function is subscribed to this event, the default `onError` will be thrown. The `Error` passed as argument contains the Forge `errorCode` reference.*|
| `viewerStarted` | `Viewer3D` instance | Event fired when the Viewer3D has been initialized, passing this instance as function argument. |
| `modelLoading` | - | Fired when the model associated with the document starts to load. |
| `modelLoaded` | `model` | Fired when the model is successfully loaded. The argument is a [Model](https://forge.autodesk.com/en/docs/viewer/v6/reference/Viewing/Model/) instance.|
| `modelLoadError` | `Error` | Fired when Forge fails to load a model. If no function is subscribed to this event, the default `onError` will be thrown. The `Error` passed as argument contains the Forge `errorCode` reference.*| 



> *For a detailed list of Forge ErrorCodes and their meaning, visit [this blog post](https://forge.autodesk.com/cloud_and_mobile/2016/01/error-codes-in-view-and-data-api.html)

## Custom Extensions