/**
 * XBrowser webcam manager
 */
'use strict';

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var XMedia = (function () {
    function XMedia(stream) {
        _classCallCheck(this, XMedia);

        this.stream = stream;
    }

    /**
     * pseudo Webcam object
     */

    _createClass(XMedia, [{
        key: 'startCam',
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
        key: 'stopCam',
        value: function stopCam() {
            if (navigator.mozGetUserMedia) {
                this.stream.stop();
                this.stream.mozSrcObject = null;
            } else if (navigator.webkitGetUserMedia) {
                this.stream.getVideoTracks()[0].stop();
                this.stream.src = '';
            } else {
                this.stream.src = '';
            }
        }
    }], [{
        key: 'getMedia',
        value: function getMedia() {
            return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }
    }]);

    return XMedia;
})();

var Cam = (function () {
    function Cam() {
        var _this = this;

        _classCallCheck(this, Cam);

        this.onStream = function (stream) {
            console.log('onStream...', _this);
            _this.stream = stream;
            _this.xMedia = new XMedia(stream);
            _this.successHandler(stream);

            _this.xMedia.startCam(_this.videoElement);
        };
    }

    /**
     * composant de capture WebCam
     * trois état d'ui :
     *
     * transpiled with : babel --stage 0
     */

    _createClass(Cam, [{
        key: 'init',
        value: function init(videoElement, onSuccess, onError) {
            var useAudio = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            console.log("cam.on()...", this);
            this.videoElement = videoElement;
            this.successHandler = onSuccess;
            navigator.getMedia = XMedia.getMedia();
            navigator.getMedia({ video: true, audio: useAudio }, this.onStream, onError);
        }
    }, {
        key: 'off',
        value: function off() {
            if (!this.stream) return;
            this.xMedia.stopCam();
        }
    }]);

    return Cam;
})();

var Snapr = (function (_React$Component) {
    _inherits(Snapr, _React$Component);

    _createClass(Snapr, [{
        key: 'video',
        get: function get() {
            return this.refs.video;
        }
    }, {
        key: 'canvas',
        get: function get() {
            return this.refs.canvas;
        }
    }, {
        key: 'currentUIState',
        get: function get() {
            if (!this.state || this.state && !this.state.cam) {
                return Snapr.UIStates.OFF;
            } else if (this.state.cam && !this.state.img) {
                return Snapr.UIStates.CAM;
            } else if (this.state.img) {
                return Snapr.UIStates.IMG;
            }
        }
    }], [{
        key: 'UIStates',

        /**
         * es7 class static properties
         * cf. https://github.com/jeffmo/es-class-static-properties-and-fields
         */
        value: {
            OFF: "off",
            CAM: "cam",
            IMG: "img"
        },
        enumerable: true
    }]);

    function Snapr(props) {
        var _this2 = this;

        _classCallCheck(this, Snapr);

        _get(Object.getPrototypeOf(Snapr.prototype), 'constructor', this).call(this, props);
        this.BUTTON_BAR_HEIGHT = 32;
        this.CAM_WIDTH = 640;
        this.CAM_HEIGHT = 480;

        this.activateCam = function (e) {
            var cam = new Cam();
            _this2.setState({ cam: cam });
            cam.init(_this2.video, function (stream) {
                console.log("snapr.onStream");
            }, function (err) {
                console.log("[snapr] An error occured! " + err);
            });
        };

        this.captureCam = function (e) {
            console.log('captureCam()...');
            if (_this2.currentUIState == Snapr.UIStates.IMG) {
                _this2.canvas.getContext('2d').drawImage(_this2.video, 0, 0, _this2.video.width, _this2.video.height);
                _this2.setState({ img: _this2.canvas.toDataURL('image/png') });
            }
        };

        this.cancelCapture = function (e) {
            _this2.setState({ img: null });
        };

        this.onCloseCamRequest = function (e) {
            console.log("onCloseCamRequest");
            _this2.closeCam();
        };
    }

    _createClass(Snapr, [{
        key: 'closeCam',
        value: function closeCam() {
            this.state.cam.off();
            this.setState({ cam: null });
        }
    }, {
        key: 'render',
        value: function render() {
            var styles = {
                container: {
                    width: this.CAM_WIDTH,
                    height: this.CAM_HEIGHT + this.BUTTON_BAR_HEIGHT
                },
                camDisplay: {
                    margin: 0,
                    backgroundColor: '#CCC',
                    width: this.CAM_WIDTH,
                    height: this.CAM_HEIGHT
                }
            };

            styles.video = this.currentUIState != Snapr.UIStates.CAM ? { display: 'none' } : {};
            styles.canvas = this.currentUIState != Snapr.UIStates.IMG ? { display: 'none' } : {};

            return React.createElement(
                'div',
                { style: styles.container },
                React.createElement(
                    'div',
                    { style: styles.camDisplay },
                    React.createElement('canvas', { ref: 'canvas',
                        width: this.CAM_WIDTH, height: this.CAM_HEIGHT,
                        style: styles.canvas }),
                    React.createElement('video', { ref: 'video',
                        width: this.CAM_WIDTH, height: this.CAM_HEIGHT,
                        style: styles.video })
                ),
                React.createElement(SnaprButtonBar, { onActivateCamRequest: this.activateCam,
                    onCloseCamRequest: this.onCloseCamRequest,
                    captureCam: this.captureCam,
                    cancelCapture: this.cancelCapture,
                    imgData: this.imgData,
                    currentState: this.currentUIState,
                    height: this.BUTTON_BAR_HEIGHT,
                    width: this.CAM_WIDTH
                })
            );
        }
    }, {
        key: 'imgData',
        get: function get() {
            return this.state && this.state.img ? this.state.img : null;
        }

        /*
         * ES6 arrow function & ES7 property initializer to avoid .bind(this)
         * on every child-injected methods
         * http://babeljs.io/blog/2015/06/07/react-on-es6-plus/
         * http://egorsmirnov.me/2015/08/16/react-and-es6-part3.html
         */
    }]);

    return Snapr;
})(React.Component);

var SnaprButtonBar = (function (_React$Component2) {
    _inherits(SnaprButtonBar, _React$Component2);

    function SnaprButtonBar(props) {
        var _this3 = this;

        _classCallCheck(this, SnaprButtonBar);

        _get(Object.getPrototypeOf(SnaprButtonBar.prototype), 'constructor', this).call(this, props);
        this.styles = {
            ButtonBar: {
                backgroundColor: '#E0E0E0',
                height: this.props.height,
                width: this.props.width,
                lineHeight: this.props.height + 'px'
            },
            ButtonGroup: {
                display: 'inline-block',
                width: 460,
                height: this.props.height,
                textAlign: 'center'
            },
            Button: { margin: "0 10px" },
            visible: { display: 'inline' },
            hidden: { display: 'none' }
        };

        this.saveImg = function (e) {
            console.log("saveImg()...", _this3.refs.btSave);
            var data = _this3.props.imgData;
            _this3.refs.btSave.href = data;
        };
    }

    _createClass(SnaprButtonBar, [{
        key: 'updateStyles',
        value: function updateStyles() {
            this.styles.btActivate = this.uiStateStyle('off', this.styles.Button);
            this.styles.btCapture = this.uiStateStyle('cam', this.styles.Button);
            this.styles.btSave = this.uiStateStyle('img', this.styles.Button);
            this.styles.btCancel = this.uiStateStyle('img', this.styles.Button);
            this.styles.btStopCam = this.uiStateStyle('cam', this.styles.Button);
        }

        /**
         *
         * @param includeIn visible dans l'état
         * @param styleBase
         * @returns {*}
         */
    }, {
        key: 'uiStateStyle',
        value: function uiStateStyle(includeIn, styleBase) {
            return Object.assign({}, styleBase, this.displayInState(includeIn));
        }
    }, {
        key: 'displayInState',
        value: function displayInState(uiState) {
            return this.props.currentUIState == uiState ? this.styles.visible : this.styles.hidden;
        }
    }, {
        key: 'render',
        value: function render() {
            this.updateStyles();

            return React.createElement(
                'div',
                { style: this.styles.ButtonBar },
                React.createElement(
                    'span',
                    null,
                    'CamSnapr'
                ),
                React.createElement(
                    'span',
                    { style: this.styles.ButtonGroup },
                    React.createElement(
                        'button',
                        { style: this.styles.btActivate,
                            onClick: this.props.onActivateCamRequest
                        },
                        'Activate'
                    ),
                    React.createElement(
                        'button',
                        { style: this.styles.btCapture,
                            onClick: this.props.captureCam
                        },
                        'Capture'
                    ),
                    React.createElement(
                        'a',
                        { href: '#', ref: 'btSave', style: this.styles.btSave,
                            download: 'img.png',
                            onClick: this.saveImg
                        },
                        React.createElement(
                            'button',
                            null,
                            'Save'
                        )
                    ),
                    React.createElement(
                        'button',
                        { style: this.styles.btCancel,
                            onClick: this.props.cancelCapture
                        },
                        'Cancel'
                    ),
                    React.createElement(
                        'button',
                        { style: this.styles.btStopCam,
                            onClick: this.props.onCloseCamRequest },
                        'Stop Cam'
                    )
                )
            );
        }
    }]);

    return SnaprButtonBar;
})(React.Component);

ReactDOM.render(React.createElement(Snapr, null), document.getElementById("snapr"));