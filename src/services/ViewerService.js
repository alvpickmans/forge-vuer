import { Utils } from "./Utils";

const CustomEventNames = [
    'error',
    `documentLoading`,
    `documentLoadError`,
    `viewerStarted`,
    `modelLoading`,
    `modelLoaded`,
    `modelLoadError`,
];

/**
 * Creates a new ViewerService object to handle viewer interaction
 * @param {Object} Autodesk Forge Viewer Autodesk SDK
 * @param {Object} VueInstance Vue Instance
 */
const ViewerService = function(Autodesk, VueInstance) {

    // Autodesk Viewing object
    this.AutodeskViewing = Autodesk.Viewing;

    // Vue instance, store to be able to emit events
    this.VueInstance = VueInstance;

    // Events is an object storing the vue name of the event
    // and the function applied to Viewer3D, so it can be removed later on.
    this.Events = {};

    // Viewer3D instance
    this.Viewer3D = null;

    // Custom Extensions
    this.CustomExtensions;

    this.ViewerContainer;

    // Records the state of the ViewerService
    this.State = {
        initialized: false,
        headless: false,
        urn: '',
        svf: '',
        modelOptions: '',
    };

    // If any event, try to add it to the Viewer instance
    let events = Object.keys(this.VueInstance.$listeners);
    this.SetEvents(events);
}

/**
 * Initialize the a Viewer instance
 * @param {String} containerId Id of the DOM element to host the viewer
 * @param {Function} getTokenMethod Function to retrieve the token, which will execute a callback
 */
ViewerService.prototype.LaunchViewer = async function(containerId, getTokenMethod, options, headless) {

    let viewerOptions = Object.assign({}, options, {
        getAccessToken: getTokenMethod
    });

    this.SetHeadless(headless);

    return new Promise((resolve, reject) => {
        try {
            this.ViewerContainer = document.getElementById(containerId);
            this.AutodeskViewing.Initializer(viewerOptions, () => {
                this.Initialize();
                resolve(true);
            });

        } catch (error) {
            Utils.EmitError(this.VueInstance, error);
            reject(error);
        }
    })
}

ViewerService.prototype.Initialize = function() {
    this.State.initialized = true;

    if (typeof this.State.urn === 'string' && this.State.urn.trim().length > 0)
        this.LoadDocument(this.State.urn);
}

/**
 * Sets the CustomExtensions object.
 * @param {Object} extensions Object where keys will be the extensions names and values should be functions to initialize new extensions.
 */
ViewerService.prototype.SetCustomExtensions = function(extensions) {
    if (Object.values(extensions).some(value => typeof(value) != 'function')) {
        throw new Error("Extensions should be an object where its values are valid extension functions.");
    }

    this.CustomExtensions = extensions;
}

/**
 * Determines if the ViewerService has any custom extensions
 * @return {Boolean} True if it has any custom extensions.
 */
ViewerService.prototype.HasCustomExtensions = function() {
    return this.CustomExtensions != null && Object.keys(this.CustomExtensions).length > 0;
}

/**
 * Creates a new Viewer3DConfig with custom extensions, if any
 * @returns {Object} Viewer3DConfig
 */
ViewerService.prototype.GetViewer3DConfig = function() {
    let config3d = {
        //https://stackoverflow.com/questions/60100029/failed-calling-executeuserfunction-with-error-instancetreenull-maxtreedepth
        disabledExtensions: { hyperlink: true }
    };

    if (this.HasCustomExtensions())
        config3d['extensions'] = Utils.RegisterCustomExtensions(this.AutodeskViewing, this.CustomExtensions);

    return config3d;
}

/**
 * Sets, from the VueInstance event names, an object where to later on store
 * emmiters for the corresponding ForgeViewer events.
 * @param {String[]} events All Vue instance event names.
 */
ViewerService.prototype.SetEvents = function(events) {

    this.Events = events
        .filter(name => CustomEventNames.indexOf(name) == -1)
        .reduce((acc, name) => {
            acc[name] = null;
            return acc;
        }, {});

}

/**
 * Loads a document by a given urn. If the URN is not base64 encoded, but the id retrieved from the API,
 * it will try to encoded to base64.
 * https://forge.autodesk.com/en/docs/model-derivative/v2/tutorials/prepare-file-for-viewer
 */
ViewerService.prototype.LoadDocument = function(urn) {

    this.State.urn = urn;

    if (this.State.initialized !== true)
        return;

    if (typeof urn !== 'string' || urn.trim().length <= 0) {
        if (this.Viewer3D != null) {
            this.Viewer3D.uninitialize();
            this.Viewer3D = null;
        }
        return;
    }

    let documentId = Utils.GetEncodedURN(urn);
    try {
        this.VueInstance.$emit('documentLoading');
        this.AutodeskViewing.Document.load(documentId, this.onDocumentLoadSuccess.bind(this), this.onDocumentLoadError.bind(this));
    } catch (error) {
        Utils.EmitError(this.VueInstance, error);
    }

}

/**
 * Register the View3D events according to those supplied by
 * the Vuer component
 */
ViewerService.prototype.RegisterEvents = function() {

    let eventNames = Object.keys(this.Events);
    if (eventNames.length <= 0)
        return;

    for (let i = 0; i < eventNames.length; i++) {
        const vueEventName = eventNames[i];
        const viewerEventName = Utils.VueToViewer3DEvent(vueEventName);
        const eventType = this.AutodeskViewing[viewerEventName];

        if (eventType == null)
            throw new Error(`Event '${vueEventName}' doesn't exist on Forge Viewer`);

        //Avaliable event list: https://forge.autodesk.com/en/docs/viewer/v7/reference/Viewing/
        let emitterFunction = Utils.CreateEmitterFunction(this.VueInstance, vueEventName);
        this.Events[vueEventName] = emitterFunction;

        this.Viewer3D.addEventListener(eventType, emitterFunction);
    }
}

ViewerService.prototype.SetHeadless = function(headless) {
    let currentHeadless = this.State.headless;
    this.State.headless = headless;

    if (currentHeadless !== headless && this.Viewer3D != null) {
        this.Viewer3D.uninitialize();
        this.Viewer3D = null;

        if (this.State.svf && this.State.doc)
            this.LoadModel(this.State.svf, this.State.modelOptions, this.State.doc);
    }
};

ViewerService.prototype.onDocumentLoadSuccess = function(doc) {

    let geometries = doc.getRoot().search({ 'type': 'geometry' });
    if (geometries.length === 0) {
        Utils.EmitError(this.VueInstance, new Error('Document contains no geometries.'))
        return;
    }

    // Load the chosen geometry
    let svf = doc.getViewablePath(geometries[0]);;
    let modelOptions = {
        sharedPropertyDbPath: doc.getFullPath(doc.getRoot().findPropertyDbPath())
    };

    this.LoadModel(svf, modelOptions, doc);
}

ViewerService.prototype.GetViewerInstance = function(container, configuration, headless) {
    let config = this.GetViewer3DConfig();
    if (headless === true)
        return new this.AutodeskViewing.Private.Viewer3D(this.ViewerContainer, config);

    return new this.AutodeskViewing.Private.GuiViewer3D(this.ViewerContainer, config);
}

ViewerService.prototype.LoadModel = async function(svfURL, modelOptions, doc) {

    // If Viewer3D is null, it needs to be created and started.
    if (this.Viewer3D == null) {
        this.Viewer3D = this.GetViewerInstance(this.ViewerContainer, this.GetViewer3DConfig(), this.State.headless);

        //Ref: https://github.com/Autodesk-Forge/forge-buckets-tools/blob/master/www/index.html
        //Fix for loading 2D model. Unknown side effect. 
        this.Viewer3D.start();

        //This will cause a bug in 2D model (Why there is a 3D view in a DWG?)
        let geometryItems = [];
        geometryItems.push(doc.getRoot().getDefaultGeometry()); //doc.getRoot().search({ "role": "3d", "type": "geometry" });

        this.Viewer3D.loadDocumentNode(doc, geometryItems[0]).then(this.onModelLoaded.bind(this)).catch(this.onModelLoadError.bind(this));

        //2D Model will not work. Strange.
        //this.Viewer3D.start(svfURL, modelOptions, this.onModelLoaded.bind(this), this.onModelLoadError.bind(this));
        this.RegisterEvents();

        // Emitting Viewer3D Started event
        this.VueInstance.$emit('viewerStarted', this.Viewer3D);
    } else {
        this.Viewer3D.tearDown();
        this.Viewer3D.setUp();
        await this.Viewer3D.loadModel(svfURL, modelOptions, this.onModelLoaded.bind(this), this.onModelLoadError.bind(this));
    }

    this.VueInstance.$emit('modelLoading');
    this.State.svf = svfURL;
    this.State.doc = doc;
    this.State.modelOptions = modelOptions;
}

ViewerService.prototype.onDocumentLoadError = function(errorCode) {
    if (this.VueInstance.$listeners['documentLoadError'])
        this.VueInstance.$emit('documentLoadError', errorCode);
    else
        Utils.EmitError(this.VueInstance, new Error('Failed to load document. Error Code: ' + errorCode));
}

ViewerService.prototype.onModelLoaded = function(item) {
    this.VueInstance.$emit('modelLoaded', item);
}

ViewerService.prototype.onModelLoadError = function(errorCode) {

    if (this.VueInstance.$listeners['modelLoadError'])
        this.VueInstance.$emit('modelLoadError', errorCode);
    else
        Utils.EmitError(this.VueInstance, new Error('Failed to load model. Error Code: ' + errorCode));
}

export { ViewerService };