/**
 *
 * @param {Object} autodeskViewing Autodesk.Viewing
 * @param {Object} customExtensions Custom extensions
 */
const RegisterCustomExtensions = function (AutodeskViewing, customExtensions) {

    let extensionNames = Object.keys(customExtensions);

    let registeredExtensions = [];

    for (let i = 0; i < extensionNames.length; i++) {
        let name = extensionNames[i];

        // If extension already registered
        if(AutodeskViewing.theExtensionManager.getExtension(name) != null){
            registeredExtensions.push(name);
            continue;
        }

        let ExtensionCtor = customExtensions[name];

        let extended = new ExtensionCtor(AutodeskViewing);
        
        let result = AutodeskViewing.theExtensionManager.registerExtension(name, extended);
        if (result === true)
            registeredExtensions.push(name);

    }

    return registeredExtensions;

}

const VueToViewer3DEvent = function (eventName) {
    // Vuer component events should be the same as Viewer3D's,
    // but low cased and hypen insted of underscore
    return eventName.toUpperCase().replace(/-/g, '_');
}

const CreateEmitterFunction = function (vue, name) {
    return (...prop) => {
        let p = Object.assign({}, ...prop);
        delete p.target;
        delete p.type;
        vue.$emit(name, p);
    };
}

const EmitError = function (vue, error) {
    vue.$emit('error', error);
}

const GetEncodedURN = function (urn) {
    let encoded;

    if (urn.indexOf('adsk') != -1) {
        encoded = `urn:${btoa(urn)}`;
    }
    else if (urn.indexOf('urn') == -1) {
        encoded = `urn:${urn}`;
    }
    else {
        encoded = urn;
    }

    return encoded;
}

export const Utils = {
    RegisterCustomExtensions,
    VueToViewer3DEvent,
    CreateEmitterFunction,
    EmitError,
    GetEncodedURN,
}