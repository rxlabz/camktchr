/**
 * XBrowser webcam manager
 */
class XMedia {
    constructor(stream) {
        this.stream = stream;
    }

    static getMedia() {
        return navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
    }

    startCam(videoElement) {
        console.log("startCam", videoElement);
        if (navigator.mozGetUserMedia) {
            videoElement.mozSrcObject = this.stream;
        } else {
            var vendorURL = window.URL || window.webkitURL;
            videoElement.src = vendorURL.createObjectURL(this.stream);
        }
        videoElement.play();
    }

    stopCam() {
        if (navigator.mozGetUserMedia) {
            this.stream.stop();
            this.stream.mozSrcObject = null;
        }
        else if (navigator.webkitGetUserMedia) {
            this.stream.getVideoTracks()[0].stop();
            this.stream.src = '';
        } else {
            this.stream.src = '';
        }
    }
}

/**
 * pseudo Webcam object
 */
class Cam {

    init(videoElement, onSuccess, onError, useAudio = false) {
        console.log("cam.on()...", this);
        this.videoElement = videoElement;
        this.successHandler = onSuccess;
        navigator.getMedia = XMedia.getMedia();
        navigator.getMedia({video: true, audio: useAudio}, this.onStream, onError);
    }

    onStream = (stream) => {
        console.log('onStream...', this);
        this.stream = stream;

        this.xMedia = new XMedia(stream);
        this.xMedia.startCam(this.videoElement);

        // success callback only after camera initialization
        this.videoElement.addEventListener('canplay', e => this.successHandler(stream));
    }

    off() {
        if (!this.stream)
            return;
        this.xMedia.stopCam();
    }
}

/**
 * composant de capture WebCam
 * trois état d'ui :
 *
 * transpiled with : babel --stage 0
 */
class Snapr extends React.Component {

    /*
     * es7 class static properties
     * cf. https://github.com/jeffmo/es-class-static-properties-and-fields
     */

    BUTTON_BAR_HEIGHT = 32;

    CAM_WIDTH = 640;

    CAM_HEIGHT = 480;

    static UIStates = {
        OFF: "off",
        WAIT: "wait",
        CAM: "cam",
        IMG: "img"
    }

    state = {
        wait: false,
        cam: null,
        img: null
    }

    get video() {
        return this.refs.video;
    }

    get canvas() {
        return this.refs.canvas;
    }

    get currentUIState() {
        if (this.state.wait == true) {
            return Snapr.UIStates.WAIT;
        } else if (this.state.cam && !this.state.img) {
            return Snapr.UIStates.CAM;
        } else if (!this.state.cam) {
            return Snapr.UIStates.OFF;
        } else if (this.state.img) {
            return Snapr.UIStates.IMG;
        }
    }

    constructor(props) {
        super(props);
    }

    /*
     * ES6 arrow function & ES7 property initializer to avoid .bind(this)
     * on every child-injected methods
     * http://babeljs.io/blog/2015/06/07/react-on-es6-plus/
     * http://egorsmirnov.me/2015/08/16/react-and-es6-part3.html
     */
    activateCam = (e) => {
        var cam = new Cam();
        this.setState({wait: true});
        cam.init(
            this.video,
            (stream) => {
                console.log("snapr.onStream");
                this.setState({cam: cam});
                this.setState({wait: false});
            },
            (err) => {
                console.log("[snapr] An error occured! " + err);
            }
        );
    }

    captureCam = (e) => {
        console.log('captureCam()... ', this.currentUIState);
        if (this.currentUIState == Snapr.UIStates.CAM) {
            this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.video.width, this.video.height);
            this.setState({img: this.canvas.toDataURL('image/png')});
        }
    }

    cancelCapture = (e)=> {
        this.setState({img: null});
    }

    onCloseCamRequest = (e) => {
        console.log("onCloseCamRequest");

        if(!this.state.cam)
            return;
        this.state.cam.off();
        this.setState({cam: null});
    }

    render() {
        let styles = {
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

        styles.video = (this.currentUIState != Snapr.UIStates.CAM) ? {display: 'none'} : {};
        styles.canvas = (this.currentUIState != Snapr.UIStates.IMG) ? {display: 'none'} : {};

        return (
            <div style={styles.container}>
                <div style={styles.camDisplay}>
                    <canvas ref="canvas"
                            width={this.CAM_WIDTH} height={this.CAM_HEIGHT}
                            style={styles.canvas}/>
                    <video ref="video"
                           width={this.CAM_WIDTH} height={this.CAM_HEIGHT}
                           style={styles.video}/>
                </div>
                <SnaprButtonBar height={this.BUTTON_BAR_HEIGHT}
                                width={this.CAM_WIDTH}
                                currentState={this.currentUIState}
                                imgData={this.state.img}
                                onActivateCamRequest={this.activateCam}
                                onCloseCamRequest={this.onCloseCamRequest}
                                captureCam={this.captureCam}
                                cancelCapture={this.cancelCapture}
                />
            </div>
        );
    }
}

class SnaprButtonBar extends React.Component {

    styles = {
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
        Button: {margin: "0 10px"},
        visible: {display: 'inline'},
        hidden: {display: 'none'},
        message: {fontSize: 0.8 + 'em'}
    }

    constructor(props) {
        super(props);
    }

    saveImg = (e) => {
        console.log("saveImg()...", this.refs.btSave);
        var data = this.props.imgData;
        this.refs.btSave.href = data;
    }

    updateStyles() {
        this.styles.btActivate = this.uiStateStyle('off', this.styles.Button);
        this.styles.btCapture = this.uiStateStyle('cam', this.styles.Button);
        this.styles.btSave = this.uiStateStyle('img', this.styles.Button);
        this.styles.btCancel = this.uiStateStyle('img', this.styles.Button);
        this.styles.btStopCam = this.uiStateStyle('cam', this.styles.Button);
        this.styles.msgWait = this.uiStateStyle('wait', this.styles.message);
    }

    /**
     *
     * @param includeIn visible dans l'état
     * @param styleBase
     * @returns {*}
     */
    uiStateStyle(includeIn, styleBase) {
        return Object.assign({}, styleBase, this.displayInState(includeIn))
    }

    displayInState(uiState) {
        return this.props.currentState == uiState ? this.styles.visible : this.styles.hidden
    }

    render() {
        this.updateStyles();

        return (
            <div style={this.styles.ButtonBar}>
                <span>CamSnapr</span>
                    <span style={this.styles.ButtonGroup}>

                        <span style={this.styles.msgWait}>Camera Initialization...</span>

                        <button style={this.styles.btActivate}
                                onClick={this.props.onActivateCamRequest}
                        >Activate camera
                        </button>

                        <button style={this.styles.btCapture}
                                onClick={this.props.captureCam}
                        >Capture image
                        </button>

                        <a href="#" ref="btSave" style={this.styles.btSave}
                           download="img.png"
                           onClick={this.saveImg}
                        >
                            <button>Save image</button>
                        </a>

                        <button style={this.styles.btCancel}
                                onClick={this.props.cancelCapture}
                        >Back to camera
                        </button>

                        <button style={this.styles.btStopCam}
                                onClick={this.props.onCloseCamRequest}>Stop Camera
                        </button>
                    </span>
            </div>
        )
    }
}

ReactDOM.render(<Snapr />, document.getElementById("snapr"));