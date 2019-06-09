<template>
    <div class="forge-vuer-container" >
        <div class="forge-vuer-viewer-display" :id="id" @resize="handleResize"/>
        <slot />
    </div>
</template>

<script>
import { ViewerService } from './services/ViewerService.js';

export default {
    name: 'ForgeVuer',
    props:{

        id:{
            type: String,
            default: function(){
                return 'forge-vuer'
            }
        },

        getAccessToken: {
            type: Function,
            required: true
        },

        urn:{
            type: String
        },

        options: {
            type: Object,
            default: () => {},
        },

        headless: {
            type: Boolean,
            default: false,
        },

        extensions:{
            type: Object
        },
    },

    watch: {
        urn: function(){
            this.viewerService.LoadDocument(this.urn);
        },

        headless: function(){
            this.viewerService.SetHeadless(this.headless);
        }
    },
    
    data() {
        return {
            viewerService: null,
        }
    },
    mounted: async function(){

        // Retrieving Autodesk global object.
        if(!window.Autodesk)
            throw new Error("Forge Viewer js missing. Make sure you add it on the HTML header");

        if(typeof this.getAccessToken !== 'function')
            throw new Error(`The 'getAccessToken' prop needs to be a function implementing a callback passing in the generated token and expire timeout in seconds.`);
        
        this.viewerService = new ViewerService(window.Autodesk, this);

        if(this.extensions && Object.keys(this.extensions).length > 0)
            this.viewerService.SetCustomExtensions(this.extensions);

        // Creating a new instance of the ViewerService
        await this.viewerService.LaunchViewer(this.id, this.getAccessToken, this.options, this.headless);

        // If a urn is supplied, load it to viewer;
        if(typeof this.urn === 'string' && this.urn.trim().length > 0)
            this.viewerService.LoadDocument(this.urn);
    },
    methods: {
        handleResize: function(){
            if(this.viewerService.Viewer3D != null)
                this.viewerService.Viewer3D.resize();
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
