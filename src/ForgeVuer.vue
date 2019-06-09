<template>
    <div class="forge-vuer-container" >
        <div class="forge-vuer-viewer-display" :id="containerId"/>
        <slot />
    </div>
</template>

<script>
import { ViewerService } from './services/ViewerService.js';

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
            type: String
        },

        options: {
            type: Object,
            default: {},
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
        }
    },
    mounted: async function(){

        // Retrieving Autodesk global object.
        if(!window.Autodesk){
            throw new Error("Forge Viewer js missing. Make sure you add it on the HTML header");
        }
        else if(typeof this.setAccessToken !== 'function'){
            throw new Error(`The 'setToken' prop needs to be a function implementing a callback passing in the generated token and expire timeout in seconds.`)
        }
        else{
            this.viewerService = new ViewerService(window.Autodesk, this);

            if(this.extensions && Object.keys(this.extensions).length > 0)
                this.viewerService.SetCustomExtensions(this.extensions);

            // Creating a new instance of the ViewerService
            await this.viewerService.LaunchViewer(this.containerId, this.setAccessToken, this.options);

            // If a urn is supplied, load it to viewer;
            if(typeof this.urn === 'string' && this.urn.trim().length > 0)
                this.viewerService.LoadDocument(this.urn);
        }
    }
}
</script>

<style>
.forge-vuer-container{
    width: 100%;
    height: 100%;
    position: relative;
}

.forge-vuer-viewer-display{
    height: 100%;
}
</style>
