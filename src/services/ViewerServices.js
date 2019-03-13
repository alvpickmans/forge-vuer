function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onLoadModelSuccess(viewer, item) {
  // item loaded, any custom action?
}
function onLoadModelError(errorCode) {
  console.error('onItemLoadFail() - errorCode:' + errorCode);
}

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


/**
 * Creates a new ViewerService object to handle viewer interaction
 * @param {Object} ViewerSDK Forge Viewer Autodesk SDK
 */
export class ViewerService {

  Viewing = null;
  ViewerApp = null;

  constructor(ViewerSDK){
    /**
     * Autodesk.Viewing object
     */
    this.Viewing = ViewerSDK.Viewing;

    /**
     * Autodesk.Vieweing.Extensions function
     */
    this.Extension = ViewerSDK.Viewing.Extension;

    /**
     * Custom Extensions loaded by client
     */
    this.CustomExtensions= {};

    this.ViewerContainer;
    this.Viewer3D;

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
    this.Viewing.Document.load(documentId, this.onDocumentLoadSuccess.bind(this), onDocumentLoadFailure);
    
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
      this.Viewer3D.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
    }
    else{
      this.Viewer3D.tearDown();
      this.Viewer3D.load(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
    }
    
  }

  /**
   * Register the View3D events according to those supplied by
   * the Vuer component
   */
  RegisterEvents = function(vueInstance, eventNames){
    
    eventNames.forEach(name => {
      let viewerEvent = VueToViewer3DEvent(name);
    });

  }
}
