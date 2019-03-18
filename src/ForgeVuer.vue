<template>
    <div class="forge-vuer-container" >
        <div class="forge-vuer-viewer-display" :id="containerId"/>
        <slot />
    </div>
</template>

<script>
import { ViewerService } from './services/ViewerServices.js';
import axios from 'axios';

export default {
    name: 'ForgeVuer',
    props:{

        containerId:{
            type: String,
            default: function(){
                return 'fv-container'
            }
        },

        setAccessToken: {
            type: Function,
            required: true
        },
        urn:{
            type: String,
            required: true
        },

        extensions:{
            type: Object
        }
    },

    watch: {
        urn: function(){
            this.viewerService.LoadDocument(this.urn);
        }
    },
    
    data() {
        return {
            viewerService: null,
            token: null,
            timeout: 3600000,
            expires: null,
            events: [],
        }
    },
    mounted: async function(){

        // Retrieving Autodesk global object.
        if(!window.Autodesk){
            throw new Error("Forge Viewer js missing. Make sure you add it on the HTML header");
        }
        else if(typeof this.setAccessToken !== 'function'){
            throw new Error(`The 'setToken' prop needs to be a function 
                implementing a callback passing in the generated token and expire timeout in seconds.`)
        }
        else{
            this.viewerService = new ViewerService(window.Autodesk, this);
            // If any event, try to add it to the Viewer instance
            this.events = Object.keys(this.$listeners);
            this.viewerService.SetEvents(this.events);

            if(this.extensions && Object.keys(this.extensions).length > 0){
                this.viewerService.SetCustomExtensions(this.extensions);
            }
            // Creating a new instance of the ViewerService
            await this.viewerService.LaunchViewer(this.containerId, this.setAccessToken);

            // If a urn is supplied, load it to viewer;
            if(this.urn != null && typeof this.urn === 'string'){
                this.viewerService.LoadDocument(this.urn);
            }
        }
               



    },
    methods: {
        /**
         * Setting the component to refresh the user input token logic
         * after the timeout 
         */
        _setRefreshInterval: function(){
           setInterval(() => {
               this.setToken(this._setToken);
           }, this.timeout);
        },

        /**
         * Callback function to be call from setToken prop
         */
        _setToken: function(token, timeout = 3600 ){
            this.token = token;
            this.timeout = timeout;
            this.expires = Date.now() + timeout;
        }
    }
}
</script>

<style lang="scss" scoped>
.forge-vuer-container{
    width: 100%;
    height: 80%;
    background-color: beige;
    position: relative;
}

.forge-vuer-viewer-display{
    height: 100%;
}
</style>
