<template>
    <div class="fv-container" id="fv-container">
        
    </div>
</template>

<script>
import ViewerServices from './services/ViewerServices.js';
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
            ViewerSDK: null,
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
            this.ViewerSDK = window.Autodesk;
        }

        // Initializing setToken prop function
        if(typeof this.setToken !== 'function'){
            throw new Error(`The 'setToken' prop needs to be a function implementing a callback passing in the generated token.`)
        }else{
            this.setToken(this._setToken);
            this._setRefreshInterval();
        }
        

        // let items = await ViewerServices.GetBucketObjects(this.token, 'sdasdasd');
        // //console.log(items);

        // ViewerServices.LaunchViewer(
        //     'fv-container',
        //     this.token,
        //     this.urn,
        // )
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
            console.log(`Token refreshed ${this.token}`);
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
