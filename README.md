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
      :setAccessToken="myGetTokenMethodAsync"
      :urn="myObjectUrn"
    >
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