import React, {PureComponent, useContext, useEffect, useRef, useState} from "react";

import PropTypes from "prop-types";
import Draggable from 'react-draggable'; // The default

import {ThemeContext} from "../../../ThemeContext/ThemeContext";

import "./TimelineGraph.scss";

TimelineGraph.propTypes = {
    logFileState: PropTypes.object,
};

/**
 * Timeline graph to navigate log file.
 *
 * @param {object} logFileState Current state of the log file
 * @return {JSX.Element}
 * @constructor
 */
function TimelineGraph ({logFileState}) {
    const {theme} = useContext(ThemeContext);

    const dragEl = useRef();
    const parentEl = useRef();

    useEffect(() => {

    }, [theme]);

    useEffect(() => {

    }, []);
    
    return (
        <div className="timeline-graph d-flex flex-row">
            <div ref={parentEl} style={{width: "30px", height: "100%", background: "red"}}>
                <div ref={dragEl} style={{width: "100%", height: "40px", background: "green"}}>
                </div>
            </div>
        </div>
    );
}

export default TimelineGraph;
