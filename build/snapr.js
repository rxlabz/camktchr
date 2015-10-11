/**
 * XBrowser webcam manager
 */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
            _this.xMedia.startCam(_this.videoElement);

            // success callback only after camera initialization
            _this.videoElement.addEventListener('canplay', function (e) {
                return _this.successHandler(stream);
            });
        };
    }

    /**
     * composant de capture WebCam
     * trois état d'ui :
     * use es7 class static properties
     * cf. https://github.com/jeffmo/es-class-static-properties-and-fields
     * needs babel --stage 0
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
            if (this.state.isWaiting == true) {
                return Snapr.UIStates.WAIT;
            } else if (this.state.cam && !this.state.img) {
                return Snapr.UIStates.CAM;
            } else if (!this.state.cam) {
                return Snapr.UIStates.OFF;
            } else if (this.state.img) {
                return Snapr.UIStates.IMG;
            }
        }
    }], [{
        key: 'UIStates',

        /**
         * components uiStates definition
         */
        value: {
            OFF: "off",
            WAIT: "wait",
            CAM: "cam",
            IMG: "img"
        },

        /**
         * initial state
         */
        enumerable: true
    }]);

    function Snapr(props) {
        var _this2 = this;

        _classCallCheck(this, Snapr);

        _get(Object.getPrototypeOf(Snapr.prototype), 'constructor', this).call(this, props);
        this.BUTTON_BAR_HEIGHT = 32;
        this.CAM_WIDTH = 640;
        this.CAM_HEIGHT = 480;
        this.state = {
            isWaiting: false,
            cam: null,
            img: null
        };

        this.activateCam = function (e) {
            var cam = new Cam();
            _this2.setState({ isWaiting: true });
            cam.init(_this2.video, function (stream) {
                console.log("snapr.onStream");
                _this2.setState({ cam: cam });
                _this2.setState({ isWaiting: false });
            }, function (err) {
                console.log("[snapr] An error occured! " + err);
            });
        };

        this.captureCam = function (e) {
            console.log('captureCam()... ', _this2.currentUIState);
            if (_this2.currentUIState == Snapr.UIStates.CAM) {
                _this2.canvas.getContext('2d').drawImage(_this2.video, 0, 0, _this2.video.width, _this2.video.height);
                _this2.setState({ img: _this2.canvas.toDataURL('image/png') });
            }
        };

        this.cancelCapture = function (e) {
            _this2.setState({ img: null });
        };

        this.onCloseCamRequest = function (e) {
            console.log("onCloseCamRequest");

            if (!_this2.state.cam) return;
            _this2.state.cam.off();
            _this2.setState({ cam: null });
        };
    }

    /*
     * ES6 arrow function & ES7 property initializer to avoid .bind(this)
     * on every child-injected methods
     * http://babeljs.io/blog/2015/06/07/react-on-es6-plus/
     * http://egorsmirnov.me/2015/08/16/react-and-es6-part3.html
     */

    _createClass(Snapr, [{
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
                React.createElement(SnaprButtonBar, { height: this.BUTTON_BAR_HEIGHT,
                    width: this.CAM_WIDTH,
                    currentState: this.currentUIState,
                    imgData: this.state.img,
                    onActivateCamRequest: this.activateCam,
                    onCloseCamRequest: this.onCloseCamRequest,
                    captureCam: this.captureCam,
                    cancelCapture: this.cancelCapture
                })
            );
        }
    }]);

    return Snapr;
})(React.Component);

var CaptureDisplay = (function (_React$Component2) {
    _inherits(CaptureDisplay, _React$Component2);

    function CaptureDisplay() {
        _classCallCheck(this, CaptureDisplay);

        _get(Object.getPrototypeOf(CaptureDisplay.prototype), 'constructor', this).apply(this, arguments);
    }

    return CaptureDisplay;
})(React.Component);

var SnaprButtonBar = (function (_React$Component3) {
    _inherits(SnaprButtonBar, _React$Component3);

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
            hidden: { display: 'none' },
            message: { fontSize: 0.8 + 'em' }
        };
        this.compStates = [{ name: 'btActivate', includeIn: 'off', basedOn: 'Button' }, { name: 'btCapture', includeIn: 'cam', basedOn: 'Button' }, { name: 'btStopCam', includeIn: 'cam', basedOn: 'Button' }, { name: 'btSave', includeIn: 'img', basedOn: 'Button' }, { name: 'btCancel', includeIn: 'img', basedOn: 'Button' }, { name: 'msgWait', includeIn: 'wait', basedOn: 'message' }];

        this.saveImg = function (e) {
            console.log("saveImg()...", _this3.refs.btSave);
            var data = _this3.props.imgData;
            _this3.refs.btSave.href = data;
        };

        this.uiStateStyle = function (includeIn, styleBase) {
            return _extends({}, styleBase, _this3.displayInState(includeIn));
        };

        this.displayInState = function (uiState) {
            return _this3.props.currentState == uiState ? _this3.styles.visible : _this3.styles.hidden;
        };
    }

    _createClass(SnaprButtonBar, [{
        key: 'updateStyles',
        value: function updateStyles() {
            var _this4 = this;

            // object assign shorthand
            this.styles = _extends({}, this.styles, this.compStates.map(function (item) {
                return _defineProperty({}, item.name, _this4.uiStateStyle(item.includeIn, _this4.styles[item.basedOn]));
            }));

            /*Object.assign(this.styles, ...this.compStates.map(item => {
                return ( {[item.name]: this.uiStateStyle(item.includeIn, this.styles[item.basedOn]) } )
            }));*/
        }

        /**
         *
         * @param includeIn visible dans l'état
         * @param styleBase
         * @returns {*}
         */
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
                        'span',
                        { style: this.styles.msgWait },
                        'Camera Initialization...'
                    ),
                    React.createElement(
                        'button',
                        { style: this.styles.btActivate,
                            onClick: this.props.onActivateCamRequest
                        },
                        'Activate camera'
                    ),
                    React.createElement(
                        'button',
                        { style: this.styles.btCapture,
                            onClick: this.props.captureCam
                        },
                        'Capture image'
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
                            'Save image'
                        )
                    ),
                    React.createElement(
                        'button',
                        { style: this.styles.btCancel,
                            onClick: this.props.cancelCapture
                        },
                        'Back to camera'
                    ),
                    React.createElement(
                        'button',
                        { style: this.styles.btStopCam,
                            onClick: this.props.onCloseCamRequest },
                        'Stop Camera'
                    )
                )
            );
        }
    }]);

    return SnaprButtonBar;
})(React.Component);

ReactDOM.render(React.createElement(Snapr, null), document.getElementById("snapr"));