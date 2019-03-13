

/**
 * 
 * @param {Object} viewing Autodesk's Viewing
 * @param {Function} baseExtension Autodesk.Viewing.Extension
 * @param {Object} customExtensions Custom extensions
 */
const AddCustomExtensions = function(viewing, baseExtension, customExtensions){

  let extensionNames = Object.keys(customExtensions);

  let registeredEvents = [];

  for(let i = 0; i < extensionNames.length; i++){
    let name = extensionNames[i];
    let ExtensionCtor = customExtensions[name];

    let extended = new ExtensionCtor(baseExtension);
    
    let result = viewing.theExtensionManager.registerExtension(name, extended);
    if(result === true){
      registeredEvents.push(name);
    }
  }

  return registeredEvents;

}

const VueToViewer3DEvent = function(eventName){
  // Vuer component events should be on the same as Viewer3D's,
  // but low case and hypen insted of underscore

  return eventName.toUpperCase().replace(/-/g, '_');
}

const CreateEmitterFunction = function(vue, name){
  return (...prop) => { 
    let p = Object.assign({}, ...prop);
    delete p.target;
    delete p.type;
    vue.$emit(name, p);
   };
}

/**
 * Creates a new ViewerService object to handle viewer interaction
 * @param {Object} ViewerSDK Forge Viewer Autodesk SDK
 */
export class ViewerService {

  Viewing = null;
  Viewer3D = null;
  /**
   * Events is an object storing the vue name of the event
   * and the function applied to Viewer3D, so it can be removed later on.
   */
  Events = {};
  VueInstance = null;

  constructor(ViewerSDK, VueInstance){
    /**
     * Autodesk.Viewing object
     */
    this.Viewing = ViewerSDK.Viewing;

    /**
     * Autodesk.Vieweing.Extensions function
     */
    this.Extension = ViewerSDK.Viewing.Extension;

    this.VueInstance = VueInstance;
    /**
     * Custom Extensions loaded by client
     */
    this.CustomExtensions= {};

    this.ViewerContainer;

  }

  SetCustomExtensions = function(extensions){
    this.CustomExtensions = extensions;
  }
  
  HasCustomExtensions = function(){
    return this.CustomExtensions && Object.keys(this.CustomExtensions).length > 0;
  }
  
  GetViewer3DConfig = function(){
    let config3d = {};

    if(this.HasCustomExtensions()){
      let registered = AddCustomExtensions(this.Viewing, this.Extension, this.CustomExtensions);      
      config3d['extensions'] = registered;
    }

    return config3d;
  }


  SetEvents = function(events){
    
    this.Events = events.filter(name => name.endsWith('-event')).reduce((acc, name) => {
      acc[name] = null;
      return acc;
    }, {});
    
  }

  /**
   * Initialize a viewer Instance given the DOM container id, token and timeout
   */
  LaunchViewer = function (containerId, token, timeout = 3600*1000) {

    let options = {
      env: 'AutodeskProduction',
      getAccessToken: function (onSuccess) {
        onSuccess(token, timeout);
      }
    };


    this.Viewing.Initializer(options);
    this.ViewerContainer = document.getElementById(containerId);

  }

  /**
   * Load a document by a given urn
   */
  LoadDocument = function(urn){
    let documentId = `urn:${urn}`;
    this.Viewing.Document.load(documentId, this.onDocumentLoadSuccess.bind(this), this.onDocumentLoadError.bind(this));
    
  }

  /**
   * Register the View3D events according to those supplied by
   * the Vuer component
   */
  RegisterEvents = function(){
    if (this.Viewer3D == null) {
      throw new Error("jeeeez, viewer hasn't been started.");
    }

    let eventNames = Object.keys(this.Events);
    if(eventNames.length > 0) {

      for(let i = 0; i < eventNames.length; i++){
        const vueEventname = eventNames[i];
        const viewerEventName = VueToViewer3DEvent(vueEventname);
        const eventType = this.Viewing[viewerEventName];
        
        if(eventType != null){
          let emitterFunction = CreateEmitterFunction(this.VueInstance, vueEventname);
          this.Events[vueEventname] = emitterFunction;
          
          this.Viewer3D.addEventListener(eventType, emitterFunction);
        }else{
          console.log(`Event '${vueEventname}' doesn't exist on Forge Viewer`);
        }
      }

    }
    

  }

  
  onDocumentLoadSuccess = function(doc) {

    let geometries = doc.getRoot().search({'type':'geometry'});
    if (geometries.length === 0) {
        console.error('Document contains no geometries.');
        return;
    }
  
    // Load the chosen geometry
    var svfUrl = doc.getViewablePath(geometries[0]);
    var modelOptions = {
        sharedPropertyDbPath: doc.getPropertyDbPath()
    };
    
    // If Viewer3D is null, it needs to be created and started.
    if(this.Viewer3D == null){
      this.Viewer3D = new this.Viewing.Private.GuiViewer3D(this.ViewerContainer, this.GetViewer3DConfig());
      this.Viewer3D.start(svfUrl, modelOptions, this.onModelLoaded.bind(this), this.onModelLoadError.bind(this));
      this.RegisterEvents();
    }
    else{
      this.Viewer3D.tearDown();
      this.Viewer3D.load(svfUrl, modelOptions, this.onModelLoaded.bind(this), this.onModelLoadError.bind(this));
    }
    
  }

  onDocumentLoadError = function (errorCode) {
    this.VueInstance.$emit('onDocumentLoadError', errorCode);
  }
  
  onModelLoaded = function (item) {
    this.VueInstance.$emit('onModelLoaded', item);
  }
  
  onModelLoadError = function (errorCode) {
    this.VueInstance.$emit('onModelLoadError', errorCode);
  }
}
