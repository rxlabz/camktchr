/**
 * pseudo Webcam object
 */
export default class Cam {

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
 * XBrowser webcam helper
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

