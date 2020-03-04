// Example from https://forge.autodesk.com/en/docs/viewer/v6/tutorials/extensions/#step-2-write-the-extension-code
// my-awesome-extension.js

export default function (AutodeskViewing) {

    function MyAwesomeExtension(viewer, options) {
        AutodeskViewing.Extension.call(this, viewer, options);
    }

    MyAwesomeExtension.prototype = Object.create(AutodeskViewing.Extension.prototype);
    MyAwesomeExtension.prototype.constructor = MyAwesomeExtension;

    MyAwesomeExtension.prototype.load = function () {
        console.log('MyAwesomeExtension.load()');
        return true;
    };

    MyAwesomeExtension.prototype.unload = function () {
        console.log('MyAwesomeExtension.unload()');
        return true;
    };

    // Is not necessary to implicitly register the extension
    // as this is handled by the component.
    // Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);

    // IMPORTANT to return the extension function itself.
    return MyAwesomeExtension;
}