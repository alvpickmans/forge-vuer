function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer, item) {
  // item loaded, any custom action?
}
function onItemLoadFail(errorCode) {
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

    this.ViewerApp;

  }

  SetCustomExtensions = function(extensions){
    this.CustomExtensions = extensions;
  }

  HasCustomExtensions = function(){
    return this.CustomExtensions && Object.keys(this.CustomExtensions).length > 0;
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

    let config3d = {};

    if(this.HasCustomExtensions()){
      let registered = AddCustomExtensions(this.Viewing, this.Extension, this.CustomExtensions);
      console.log(registered);
      
      config3d['extensions'] = registered;
    }
  
    this.Viewing.Initializer(options, function onInitialized() {
      this.ViewerApp = new this.Viewing.ViewingApplication(containerId);
      this.ViewerApp.registerViewer(this.ViewerApp.k3D, this.Viewing.Private.GuiViewer3D, config3d);
      //this.ViewerApp.loadDocument(documentId, this.onDocumentLoadSuccess.bind(this), onDocumentLoadFailure);
    }.bind(this));
  }

  /**
   * Load a document by a given urn
   */
  LoadDocument = function(urn){
    let documentId = `urn:${urn}`;
  
    this.ViewerApp.loadDocument(documentId, this.onDocumentLoadSuccess.bind(this), onDocumentLoadFailure);
  }


  onDocumentLoadSuccess = function(doc) {
    // We could still make use of Document.getSubItemsWithProperties()
    // However, when using a ViewingApplication, we have access to the **bubble** attribute,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    var viewables = this.ViewerApp.bubble.search({ 'type': 'geometry' });
    if (viewables.length === 0) {
      console.error('Document contains no viewables.');
      return;
    }
  
    // Choose any of the avialble viewables
    this.ViewerApp.selectItem(viewables[0], onItemLoadSuccess, onItemLoadFail);
  }

}
