/**
 *
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
        else {
            this.stream.getVideoTracks()[0].stop();
            this.stream.src = '';
        }
    }
}

class Cam {

    constructor() {
        this.onStream = this.onStream.bind(this);
    }

    init(videoElement, onSuccess, onError, useAudio = false) {
        console.log("cam.on()...", this);
        this.videoElement = videoElement;
        this.successHandler = onSuccess;
        navigator.getMedia = XMedia.getMedia();
        navigator.getMedia({video: true, audio: useAudio}, this.onStream, onError);
    }

    onStream(stream) {
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

    /*captureCam(img){
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(video, 0, 0, width, height);
        var data = canvas.toDataURL('image/png');
        img.setAttribute('src', data);
    }*/
}

class Snapr extends React.Component {

    constructor(props) {
        super(props);
        this.onActivateCamRequest = this.onActivateCamRequest.bind(this);
        this.onCloseCamRequest = this.onCloseCamRequest.bind(this);
        this.captureCam = this.captureCam.bind(this);
    }

    get video() {
        return this.refs.video;
    }

    get canvas() {
        return this.refs.canvas;
    }

    get imgData() {
        return this.state && this.state.img ? this.state.img : null;
    }

    onActivateCamRequest() {
        console.log("onActivateCamRequest", this);
        this.activateCam();
    }

    onCloseCamRequest() {
        console.log("onCloseCamRequest");
        this.closeCam();
    }

    activateCam() {
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

    closeCam() {
        this.state.cam.off();
        this.setState({cam: null});
        //this.video.style = {display: 'none'};
    }

    captureCam(){
        console.log('captureCam()...');
        if( this.state && this.state.cam ){
            console.log('canvas size', this.video.width,this.video.height );
            this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.video.width, this.video.height);
            this.setState({img:this.canvas.toDataURL('image/png')});
        }
    }



    render() {
        const BUTTON_BAR_HEIGHT = 32;

        let styles = {
            container: {
                width: 640 ,
                height: 480 + BUTTON_BAR_HEIGHT
            },
            camDisplay: {
                margin: 0,
                backgroundColor: '#CCC',
                width: 640,
                height: 480
            }
        };
        var vid = (this.state && this.state.cam && ! this.state.img)
            ? <video ref="video" width="640" height="480"></video>
            : <video ref="video" width="640" height="480" style={{display:'none'}} ></video>;
        var canvas = (this.state && this.state.img)
            ? <canvas ref="canvas" width="640" height="480"></canvas>
            : <canvas ref="canvas" style={{display:'none'}} width="640" height="480"></canvas>;
        return (
            <div style={styles.container}>
                <div style={styles.camDisplay}>
                    {canvas}
                    {vid}
                </div>
                <SnaprButtonBar onActivateCamRequest={this.onActivateCamRequest}
                                onCloseCamRequest={this.onCloseCamRequest}
                                captureCam={this.captureCam}
                                saveImg={this.saveImg}
                                imgData={this.imgData}
                />
            </div>
        );
    }
}

class SnaprButtonBar extends React.Component {

    constructor(props) {
        super(props);
        this.saveImg = this.saveImg.bind(this);
    }

    saveImg(){
        console.log("saveImg()...", this.refs.btSave);
        var data = this.props.imgData;
        this.refs.btSave.href=data;

    }

    render() {
        const BUTTON_BAR_HEIGHT = 32;
        let styles = {
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

        return (
            <div style={styles.buttonBar}>
                <span className="test">CamSnapr</span>
                    <span style={styles.ButtonGroup}>
                        <button style={styles.Button}
                                onClick={this.props.onActivateCamRequest}>Activate
                        </button>
                        <button style={styles.Button}
                                onClick={this.props.captureCam}
                        >Capture</button>

                        <button style={styles.Button}
                                onClick={this.props.captureCam}
                        >Capture</button>


                        <a href="#" ref="btSave" style={styles.Button}
                                download="img.png"
                                onClick={this.saveImg}
                        ><button>Save</button></a>

                        <button style={styles.Button}
                                onClick={this.props.onCloseCamRequest}>Stop Cam
                        </button>
                    </span>
            </div>
        )
    }
}

ReactDOM.render(<Snapr />, document.getElementById("snapr"));