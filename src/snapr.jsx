import ReactDOM from 'react-dom';
import React from 'react';
import Cam from './Cam.jsx';
import SnaprButtonBar from './SnaprButtonBar.jsx';

/**
 * composant de capture WebCam
 * trois état d'ui :
 * use es7 class static properties
 * cf. https://github.com/jeffmo/es-class-static-properties-and-fields
 * needs babel --stage 0
 */
export default class Snapr extends React.Component {

    BUTTON_BAR_HEIGHT = 32;

    CAM_WIDTH = 640;

    CAM_HEIGHT = 480;

    /**
     * components uiStates definition
     */
    static UIStates = {
        OFF: "off",
        WAIT: "wait",
        CAM: "cam",
        IMG: "img"
    }

    /**
     * initial state
     */
    state = {
        isWaiting: false,
        cam: null,
        img: null
    }

    get video() {
        return this.refs ? this.refs.video : null;
    }

    set video(v){
        console.log("set video", v);
    }

    get canvas() {
        return this.refs ? this.refs.canvas : null;
    }

    set canvas(c){
        console.log("set canvas", c);
    }

    get currentUIState() {
        if( ! this.state )
            return Snapr.UIStates.OFF;

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

    set currentUIState(c){
        console.log("set currentUIState", c);
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
        this.setState({isWaiting: true});
        cam.init(
            this.video,
            (stream) => {
                console.log("snapr.onStream");
                this.setState({cam: cam});
                this.setState({isWaiting: false});
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

        if (!this.state.cam)
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

