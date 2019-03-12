import axios from  'axios';
import ForgeSDK from 'forge-apis';

let viewerApp;

function onDocumentLoadSuccess(doc) {
    // We could still make use of Document.getSubItemsWithProperties()
    // However, when using a ViewingApplication, we have access to the **bubble** attribute,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    var viewables = viewerApp.bubble.search({ 'type': 'geometry' });
    if (viewables.length === 0) {
      console.error('Document contains no viewables.');
      return;
    }
  
    // Choose any of the avialble viewables
    viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
  }
  
  function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }

  function onItemLoadSuccess(viewer, item) {
    // item loaded, any custom action?
  }
  function onItemLoadFail(errorCode) {
    console.error('onItemLoadFail() - errorCode:' + errorCode);
  }

export default {

    GetBucketObjects: async function(token, bucketName){

        return axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketName}/objects`,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => response.data)
        .catch(error => {throw error;});
    },


    LaunchViewer: function (containerId, token, urn) {
        var options = {
          env: 'AutodeskProduction',
          getAccessToken: function(onSuccess) {
            var expire = 60*30;
            // Code to retrieve and assign token value to
            // accessToken and expire time in seconds.
            onSuccess(token, expire);
        }
        };
        var documentId = 'urn:' + urn;
        
        window.Autodesk.Viewing.Initializer(options, function onInitialized() {
          viewerApp = new window.Autodesk.Viewing.ViewingApplication(containerId);
          viewerApp.registerViewer(viewerApp.k3D, window.Autodesk.Viewing.Private.GuiViewer3D);
          viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
      }
}