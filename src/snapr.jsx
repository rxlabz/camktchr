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
        else if(navigator.webkitGetUserMedia){
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
        this.successHandler(stream);

        this.xMedia.startCam(this.videoElement);
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

    BUTTON_BAR_HEIGHT = 32;
    CAM_WIDTH = 640;
    CAM_HEIGHT = 480;

    /**
     * es7 class static properties
     * cf. https://github.com/jeffmo/es-class-static-properties-and-fields
     */
    static UIStates = {
        OFF: "off",
        CAM: "cam",
        IMG: "img"
    }

    get video() {
        return this.refs.video;
    }

    get canvas() {
        return this.refs.canvas;
    }

    get currentUIState() {
        if (!this.state || (this.state && !this.state.cam)) {
            return Snapr.UIStates.OFF;
        } else if (this.state.cam && !this.state.img) {
            return Snapr.UIStates.CAM;
        } else if (this.state.img) {
            return Snapr.UIStates.IMG;
        }
    }

    constructor(props) {
        super(props);
    }

    get imgData() {
        return this.state && this.state.img ? this.state.img : null;
    }

    /*
     * ES6 arrow function & ES7 property initializer to avoid .bind(this)
     * on every child-injected methods
     * http://babeljs.io/blog/2015/06/07/react-on-es6-plus/
     * http://egorsmirnov.me/2015/08/16/react-and-es6-part3.html
     */
    activateCam = (e) => {
        var cam = new Cam();
        this.setState({cam: cam});
        cam.init(
            this.video,
            function (stream) {
                console.log("snapr.onStream");
            },
            function (err) {
                console.log("[snapr] An error occured! " + err);
            }
        );
    }

    captureCam = (e) => {
        console.log('captureCam()...');
        if (this.currentUIState == Snapr.UIStates.IMG) {
            this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.video.width, this.video.height);
            this.setState({img: this.canvas.toDataURL('image/png')});
        }
    }

    cancelCapture = (e)=>{
        this.setState({img:null});
    }

    onCloseCamRequest = (e) => {
        console.log("onCloseCamRequest");
        this.closeCam();
    }

    closeCam() {
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

        styles.video = (this.currentUIState != Snapr.UIStates.CAM) ? {display:'none'} : {};
        styles.canvas = (this.currentUIState != Snapr.UIStates.IMG) ? {display:'none'} : {};

        return (
            <div style={styles.container}>
                <div style={styles.camDisplay}>
                    <canvas ref="canvas"
                            width={this.CAM_WIDTH} height={this.CAM_HEIGHT}
                            style={styles.canvas} />
                    <video ref="video"
                           width={this.CAM_WIDTH} height={this.CAM_HEIGHT}
                           style={styles.video} />
                </div>
                <SnaprButtonBar onActivateCamRequest={this.activateCam}
                                onCloseCamRequest={this.onCloseCamRequest}
                                captureCam={this.captureCam}
                                cancelCapture={this.cancelCapture}
                                imgData={this.imgData}
                                currentState={this.currentUIState}
                                height={this.BUTTON_BAR_HEIGHT}
                                width={this.CAM_WIDTH}
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
            width:this.props.width,
            lineHeight: this.props.height+'px'
        },
        ButtonGroup: {
            display: 'inline-block',
            width: 460,
            height: this.props.height ,
            textAlign: 'center'
        },
        Button: { margin: "0 10px" },
        visible: { display: 'inline' },
        hidden: { display: 'none' }
    }

    constructor(props) {
        super(props);
    }

    saveImg = (e) => {
        console.log("saveImg()...", this.refs.btSave);
        var data = this.props.imgData;
        this.refs.btSave.href = data;
    }

    updateStyles(){
        this.styles.btActivate = this.uiStateStyle('off', this.styles.Button);
        this.styles.btCapture = this.uiStateStyle('cam', this.styles.Button);
        this.styles.btSave= this.uiStateStyle('img', this.styles.Button);
        this.styles.btCancel = this.uiStateStyle('img', this.styles.Button);
        this.styles.btStopCam = this.uiStateStyle('cam', this.styles.Button);
    }

    /**
     *
     * @param includeIn visible dans l'état
     * @param styleBase
     * @returns {*}
     */
    uiStateStyle(includeIn, styleBase){
        return Object.assign({}, styleBase, this.displayInState(includeIn))
    }

    displayInState(uiState){
        return this.props.currentUIState == uiState ? this.styles.visible : this.styles.hidden
    }

    render() {
        this.updateStyles();

        return (
            <div style={this.styles.ButtonBar}>
                <span>CamSnapr</span>
                    <span style={this.styles.ButtonGroup}>

                        <button style={this.styles.btActivate}
                            onClick={this.props.onActivateCamRequest}
                        >Activate
                        </button>

                        <button style={this.styles.btCapture}
                                onClick={this.props.captureCam}
                        >Capture
                        </button>

                        <a href="#" ref="btSave" style={this.styles.btSave}
                           download="img.png"
                           onClick={this.saveImg}
                        >
                            <button>Save</button>
                        </a>

                        <button style={this.styles.btCancel}
                                onClick={this.props.cancelCapture}
                        >Cancel
                        </button>

                        <button style={this.styles.btStopCam}
                                onClick={this.props.onCloseCamRequest}>Stop Cam
                        </button>
                    </span>
            </div>
        )
    }
}

ReactDOM.render(<Snapr />, document.getElementById("snapr"));