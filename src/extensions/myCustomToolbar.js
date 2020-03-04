// Example from https://forge.autodesk.com/en/docs/viewer/v6/tutorials/toolbar-button/#step-1-detect-the-toolbar
// my-custom-toolbar.js

export default function (AutodeskViewing) {

    return class ToolbarExtension extends AutodeskViewing.Extension {
        viewer;
        options;
        subToolbar;

        constructor(viewer, options) {
            super(viewer, options);
            this.viewer = viewer;
            this.options = options;
        }

        load = function () {
            if (this.viewer.toolbar) {
                // Toolbar is already available, create the UI
                this.createUI();
            } else {
                // Toolbar hasn't been created yet, wait until we get notification of its creation
                this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
                this.viewer.addEventListener(AutodeskViewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
            }

            return true;
        }

        unload = function () {
            this.viewer.toolbar.removeControl(this.subToolbar);
            return true;
        };

        onToolbarCreated = function () {
            this.viewer.removeEventListener(AutodeskViewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
            this.onToolbarCreatedBinded = null;
            this.createUI();
        };

        createUI = async function () {
            let viewer = this.viewer;
            const vC = await viewer.loadExtension('Autodesk.ViewCubeUi');

            // Button 1
            let button1 = new AutodeskViewing.UI.Button('my-view-front-button');
            button1.onClick = function () {
                vC.setViewCube('front');
            };
            button1.addClass('my-view-front-button');
            button1.setToolTip('View front');
            button1.setIcon('adsk-icon-first'); 

            // Button 2
            let button2 = new AutodeskViewing.UI.Button('my-view-back-button');
            button2.onClick = function () {
                vC.setViewCube('back');
            };
            button2.addClass('my-view-back-button');
            button2.setToolTip('View Back');
            button2.setIcon('adsk-icon-second');

            // SubToolbar
            this.subToolbar = new AutodeskViewing.UI.ControlGroup('my-custom-view-toolbar');
            this.subToolbar.addControl(button1);
            this.subToolbar.addControl(button2);

            viewer.toolbar.addControl(this.subToolbar);
        };
    }
}