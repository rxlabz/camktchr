/**
 *
 */
"use strict";

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var XMedia = (function () {
    function XMedia(stream) {
        _classCallCheck(this, XMedia);

        this.stream = stream;
    }

    _createClass(XMedia, [{
        key: "startCam",
        value: function startCam(videoElement) {
            console.log("startCam", videoElement);
            if (navigator.mozGetUserMedia) {
                videoElement.mozSrcObject = this.stream;
            } else {
                var vendorURL = window.URL || window.webkitURL;
                videoElement.src = vendorURL.createObjectURL(this.stream);
            }
            videoElement.play();
        }
    }, {
        key: "stopCam",
        value: function stopCam() {
            if (navigator.mozGetUserMedia) {
                this.stream.stop();
                this.stream.mozSrcObject = null;
            } else {
                this.stream.getVideoTracks()[0].stop();
                this.stream.src = '';
            }
        }
    }], [{
        key: "getMedia",
        value: function getMedia() {
            return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }
    }]);

    return XMedia;
})();

var Cam = (function () {
    function Cam() {
        _classCallCheck(this, Cam);

        this.onStream = this.onStream.bind(this);
    }

    _createClass(Cam, [{
        key: "init",
        value: function init(videoElement, onSuccess, onError) {
            var useAudio = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            console.log("cam.on()...", this);
            this.videoElement = videoElement;
            this.successHandler = onSuccess;
            navigator.getMedia = XMedia.getMedia();
            navigator.getMedia({ video: true, audio: useAudio }, this.onStream, onError);
        }
    }, {
        key: "onStream",
        value: function onStream(stream) {
            console.log('onStream...', this);
            this.stream = stream;
            this.xMedia = new XMedia(stream);
            this.successHandler(stream);

            this.xMedia.startCam(this.videoElement);
        }
    }, {
        key: "off",
        value: function off() {
            if (!this.stream) return;
            this.xMedia.stopCam();
        }

        /*captureCam(img){
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(video, 0, 0, width, height);
            var data = canvas.toDataURL('image/png');
            img.setAttribute('src', data);
        }*/
    }]);

    return Cam;
})();

var Snapr = (function (_React$Component) {
    _inherits(Snapr, _React$Component);

    function Snapr(props) {
        _classCallCheck(this, Snapr);

        _get(Object.getPrototypeOf(Snapr.prototype), "constructor", this).call(this, props);
        this.onActivateCamRequest = this.onActivateCamRequest.bind(this);
        this.onCloseCamRequest = this.onCloseCamRequest.bind(this);
        this.captureCam = this.captureCam.bind(this);
    }

    _createClass(Snapr, [{
        key: "onActivateCamRequest",
        value: function onActivateCamRequest() {
            console.log("onActivateCamRequest", this);
            this.activateCam();
        }
    }, {
        key: "onCloseCamRequest",
        value: function onCloseCamRequest() {
            console.log("onCloseCamRequest");
            this.closeCam();
        }
    }, {
        key: "activateCam",
        value: function activateCam() {
            var cam = new Cam();
            this.setState({ cam: cam });
            cam.init(this.video, function (stream) {
                console.log("snapr.onStream");
            }, function (err) {
                console.log("[snapr] An error occured! " + err);
            });
        }
    }, {
        key: "closeCam",
        value: function closeCam() {
            this.state.cam.off();
            this.setState({ cam: null });
            //this.video.style = {display: 'none'};
        }
    }, {
        key: "captureCam",
        value: function captureCam() {
            console.log('captureCam()...');
            if (this.state && this.state.cam) {
                console.log('canvas size', this.video.width, this.video.height);
                this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.video.width, this.video.height);
                this.setState({ img: this.canvas.toDataURL('image/png') });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var BUTTON_BAR_HEIGHT = 32;

            var styles = {
                container: {
                    width: 640,
                    height: 480 + BUTTON_BAR_HEIGHT
                },
                camDisplay: {
                    margin: 0,
                    backgroundColor: '#CCC',
                    width: 640,
                    height: 480
                }
            };
            var vid = this.state && this.state.cam && !this.state.img ? React.createElement("video", { ref: "video", width: "640", height: "480" }) : React.createElement("video", { ref: "video", width: "640", height: "480", style: { display: 'none' } });
            var canvas = this.state && this.state.img ? React.createElement("canvas", { ref: "canvas", width: "640", height: "480" }) : React.createElement("canvas", { ref: "canvas", style: { display: 'none' }, width: "640", height: "480" });
            return React.createElement(
                "div",
                { style: styles.container },
                React.createElement(
                    "div",
                    { style: styles.camDisplay },
                    canvas,
                    vid
                ),
                React.createElement(SnaprButtonBar, { onActivateCamRequest: this.onActivateCamRequest,
                    onCloseCamRequest: this.onCloseCamRequest,
                    captureCam: this.captureCam,
                    saveImg: this.saveImg,
                    imgData: this.imgData
                })
            );
        }
    }, {
        key: "video",
        get: function get() {
            return this.refs.video;
        }
    }, {
        key: "canvas",
        get: function get() {
            return this.refs.canvas;
        }
    }, {
        key: "imgData",
        get: function get() {
            return this.state && this.state.img ? this.state.img : null;
        }
    }]);

    return Snapr;
})(React.Component);

var SnaprButtonBar = (function (_React$Component2) {
    _inherits(SnaprButtonBar, _React$Component2);

    function SnaprButtonBar(props) {
        _classCallCheck(this, SnaprButtonBar);

        _get(Object.getPrototypeOf(SnaprButtonBar.prototype), "constructor", this).call(this, props);
        this.saveImg = this.saveImg.bind(this);
    }

    _createClass(SnaprButtonBar, [{
        key: "saveImg",
        value: function saveImg() {
            console.log("saveImg()...", this.refs.btSave);
            var data = this.props.imgData;
            this.refs.btSave.href = data;
        }
    }, {
        key: "render",
        value: function render() {
            var BUTTON_BAR_HEIGHT = 32;
            var styles = {
                buttonBar: {
                    backgroundColor: '#E0E0E0',
                    height: BUTTON_BAR_HEIGHT + 'px',
                    lineHeight: BUTTON_BAR_HEIGHT + 'px'
                },
                ButtonGroup: {
                    /*backgroundColor: '#DADADA',*/
                    display: 'inline-block',
                    width: 460,
                    height: BUTTON_BAR_HEIGHT + 'px',
                    textAlign: 'center'
                },
                Button: {
                    margin: "0 10px"
                }
            };

            return React.createElement(
                "div",
                { style: styles.buttonBar },
                React.createElement(
                    "span",
                    { className: "test" },
                    "CamSnapr"
                ),
                React.createElement(
                    "span",
                    { style: styles.ButtonGroup },
                    React.createElement(
                        "button",
                        { style: styles.Button,
                            onClick: this.props.onActivateCamRequest },
                        "Activate"
                    ),
                    React.createElement(
                        "button",
                        { style: styles.Button,
                            onClick: this.props.captureCam
                        },
                        "Capture"
                    ),
                    React.createElement(
                        "button",
                        { style: styles.Button,
                            onClick: this.props.captureCam
                        },
                        "Capture"
                    ),
                    React.createElement(
                        "a",
                        { href: "#", ref: "btSave", style: styles.Button,
                            download: "img.png",
                            onClick: this.saveImg
                        },
                        React.createElement(
                            "button",
                            null,
                            "Save"
                        )
                    ),
                    React.createElement(
                        "button",
                        { style: styles.Button,
                            onClick: this.props.onCloseCamRequest },
                        "Stop Cam"
                    )
                )
            );
        }
    }]);

    return SnaprButtonBar;
})(React.Component);

ReactDOM.render(React.createElement(Snapr, null), document.getElementById("snapr"));