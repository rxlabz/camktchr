import React from 'react';
import ReactDOM from 'react-dom';
import {reduce} from 'underscore'

/**
 * Button bar : multistates » display buttons for differents states
 * » states behaviour is defnineda compStates
 */
export default class SnaprButtonBar extends React.Component {

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

    compStates = [
        {name: 'btActivate', includeIn: 'off', basedOn: 'Button'},
        {name: 'btCapture', includeIn: 'cam', basedOn: 'Button'},
        {name: 'btStopCam', includeIn: 'cam', basedOn: 'Button'},
        {name: 'btSave', includeIn: 'img', basedOn: 'Button'},
        {name: 'btCancel', includeIn: 'img', basedOn: 'Button'},
        {name: 'msgWait', includeIn: 'wait', basedOn: 'message'}
    ]

    constructor(props) {
        super(props);
    }

    saveImg = (e) => {
        console.log("saveImg()...", this.refs.btSave);
        var data = this.props.imgData;
        this.refs.btSave.href = data;
    }

    updateStyles() {
        // cumule les uiState de chaque items compStates pour le merger avec this.styles
        var uiItemsStateStyles = reduce(this.compStates,
            (memo, item) => ({...memo, ...{[item.name]:{...this.styles[item.basedOn], ...this.displayInState(item.includeIn)}}}),
            /*(memo, item) => ({...memo, ...{[item.name]:this.uiStateStyle(item.includeIn, this.styles[item.basedOn])}}),*/
            {}
        );
        this.styles = { ...this.styles, ...uiItemsStateStyles };
    }

    /**
     *
     * @param includeIn visible dans l'état
     * @param styleBase
     * @returns {*}
     */
    uiStateStyle = (includeIn, styleBase) => {
        var s = {...styleBase, ...this.displayInState(includeIn)};
        return s;
    }

    displayInState = (uiState) => {
        let visibility = this.props.currentState == uiState ? this.styles.visible : this.styles.hidden;
        return visibility;
    }

    render() {
        this.updateStyles();

        return (
            <div style={this.styles.ButtonBar}>
                <span>CamKatch</span>
                    <span style={this.styles.ButtonGroup}>

                        <span style={this.styles.msgWait}>Camera Initialization...</span>

                        <button style={this.styles.btActivate}
                                onClick={this.props.onActivateCamRequest}
                        >Activate WebCam
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