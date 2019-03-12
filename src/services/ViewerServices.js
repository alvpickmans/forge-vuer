import axios from 'axios';
import ForgeSDK from 'forge-apis';


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
 * Creates a new ViewerService object to handle viewer interaction
 * @param {Object} ViewerSDK Forge Viewer Autodesk SDK
 */
const service = function (ViewerSDK) {
  this.Viewing = ViewerSDK.Viewing;
  this.ViewerApp;
}


/**
 * 
 */
service.prototype.LaunchViewer = function (containerId, token, urn) {

  var options = {
    env: 'AutodeskProduction',
    getAccessToken: function (onSuccess) {
      var expire = 60 * 30;
      // Code to retrieve and assign token value to
      // accessToken and expire time in seconds.
      onSuccess(token, expire);
    }
  };
  var documentId = 'urn:' + urn;

  this.Viewing.Initializer(options, function onInitialized() {
    this.ViewerApp = new this.Viewing.ViewingApplication(containerId);
    this.ViewerApp.registerViewer(this.ViewerApp.k3D, this.Viewing.Private.GuiViewer3D);
    this.ViewerApp.loadDocument(documentId, this.onDocumentLoadSuccess.bind(this), onDocumentLoadFailure);
  }.bind(this));
}

service.prototype.onDocumentLoadSuccess = function(doc) {
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

export const ViewerService = service;