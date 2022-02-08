import ThreeD from '3d-viewer-core';
var transferUrl = function (url) {
    return typeof url === 'string'
        ? url
        : URL.createObjectURL(url);
};
export default {
    install: function (app, options) {
        app.component('ThreeDViewer', {
            props: ['options', 'url'],
            template: "<div class=\"threed-viewer\" ref=\"viewRef\" >asdf</div>",
            mounted: function () {
                var _this = this;
                debugger;
                var config = Object.assign({}, options, this.options);
                var viewer = new ThreeD(this.$refs.viewRef, config);
                viewer.on('preLoad', function (loader, threedViewer) {
                    _this.emit('preLoad', [loader, threedViewer]);
                });
                viewer.on('loading', function (event, threedViewer) {
                    _this.emit('loading', [event, threedViewer]);
                });
                viewer.on('loaded', function (gltf, threedViewer) {
                    _this.emit('loaded', [gltf, threedViewer]);
                });
                viewer.load(transferUrl(this.url)).then(function (gltf) {
                    console.log(gltf);
                });
            }
        });
    }
};
