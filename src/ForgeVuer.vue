<template>
    <div class="fv-container" id="fv-container">
        
    </div>
</template>

<script>
import { ViewerService } from './services/ViewerServices.js';
import axios from 'axios';

export default {
    name: 'ForgeVuer',
    props:{
        setToken: {
            type: Function,
            required: true
        },
        urn:{
            type: String,
            required: true
        }
    },
    
    data() {
        return {
            viewerService: null,
            token: null,
            timeout: 3600000,
            expires: null,
        }
    },
    mounted: async function(){
        console.log("vuer has been mounted!");        

        // Retrieving Autodesk global object.
        if(!window.Autodesk){
            throw new Error("Forge Viewer js missing. Make sure you add it on the HTML header");
        }else{
            this.viewerService = new ViewerService(window.Autodesk);
        }

        // Initializing setToken prop function
        if(typeof this.setToken !== 'function'){
            throw new Error(`The 'setToken' prop needs to be a function 
                implementing a callback passing in the generated token and expire timeout in miliseconds.`)
        }else{
            this.setToken(this._setToken);
            this._setRefreshInterval();
        }
        

        // let items = await ViewerServices.GetBucketObjects(this.token, 'sdasdasd');
        // //console.log(items);

        // Creating a new instance of the ViewerService
        

        this.viewerService.LaunchViewer('fv-container', this.token, this.urn);
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
        _setToken: function(token, timeout = 3600000 ){
            this.token = token;
            this.timeout = timeout;
            this.expires = Date.now() + timeout;
        }
    }
}
</script>

<style lang="scss" scoped>
.fv-container{
    width: 100%;
    height: 100%;
    background-color: beige
}
</style>
