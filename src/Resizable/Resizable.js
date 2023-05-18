import React, {useContext, useEffect, useCallback, useRef, useState} from "react";

import PropTypes, {oneOfType} from "prop-types";
import {Row} from "react-bootstrap";
import {FileEarmarkText} from "react-bootstrap-icons";
import ReactDOMServer from "react-dom/server";

import {ThemeContext} from "../ThemeContext/ThemeContext";

import "./Resizable.scss";

Resizable.propTypes = {
    children: PropTypes.object,
};

/**
 * Resizable component
 *
 * @param {object} children
 * @return {JSX.Element}
 * @constructor
 */
export function Resizable ({children}) {
    const {theme} = useContext(ThemeContext);

    const editorContainerRef = useRef();
    const leftHandlerRef = useRef();
    const rightHandleRef = useRef();
    const topHandleRef = useRef();
    const bottomHandleRef = useRef();

    const handleSize = 4;

    let selectedHandle;
    let downPointX;
    let downPointY;

    const mouseMove = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedHandle === "left") {
            downPointX = downPointX + e.movementX;
            editorContainerRef.current.style.left = (downPointX + handleSize) + "px";
            leftHandlerRef.current.style.left = (downPointX) + "px";
            topHandleRef.current.style.left = (downPointX) + "px";
            bottomHandleRef.current.style.left = (downPointX) + "px";
        } else if (selectedHandle === "right") {
            downPointX = downPointX - e.movementX;
            editorContainerRef.current.style.right = (downPointX) +"px";
            rightHandleRef.current.style.right = (downPointX - handleSize) + "px";
            topHandleRef.current.style.right = (downPointX - handleSize) + "px";
            bottomHandleRef.current.style.right = ( downPointX - handleSize) + "px";
        } else if (selectedHandle === "top") {
            downPointY = downPointY + e.movementY;
            editorContainerRef.current.style.top = downPointY + "px";
            leftHandlerRef.current.style.top = (downPointY - handleSize) + "px";
            topHandleRef.current.style.top = (downPointY - handleSize) + "px";
            rightHandleRef.current.style.top = (downPointY - handleSize) + "px";
        } else if (selectedHandle === "bottom") {
            downPointY = downPointY - e.movementY;
            editorContainerRef.current.style.bottom = downPointY + "px";
            leftHandlerRef.current.style.bottom = (downPointY - handleSize) + "px";
            bottomHandleRef.current.style.bottom = (downPointY - handleSize) + "px";
            rightHandleRef.current.style.bottom = (downPointY - handleSize) + "px";
        }
    }, [selectedHandle]);

    const mouseUp = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        document.removeEventListener("mousemove", mouseMove, true);
        document.removeEventListener("mouseup", mouseUp, true);
    }, [selectedHandle]);

    const selectHandle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        downPointX = e.nativeEvent.offsetX;
        downPointY = e.nativeEvent.offsetY;
        document.addEventListener("mousemove", mouseMove, true);
        document.addEventListener("mouseup", mouseUp, true);
    };

    const selectLeftHandle = (e) => {
        selectedHandle = "left";
        selectHandle(e);
    };

    const selectTopHandle = (e) => {
        selectedHandle = "top";
        selectHandle(e);
    };

    const selectRightHandle = (e) => {
        selectedHandle = "right";
        selectHandle(e);
    };

    const selectBottomHandle = (e) => {
        selectedHandle = "bottom";
        selectHandle(e);
    };

    return (
        <div style={{position: "relative", width: "100%", height: "100%"}}>
            <div onMouseDown={selectLeftHandle} ref={leftHandlerRef}
                 style={{cursor: "ew-resize", position: "absolute", left: 0, top: 0, bottom: 0, width: handleSize + "px", background: "grey"}}>
            </div>
            <div onMouseDown={selectRightHandle} ref={rightHandleRef}
                 style={{cursor: "ew-resize", position: "absolute", right: 0, top: 0, bottom: 0, width: handleSize + "px", background: "grey"}}>
            </div>
            <div onMouseDown={selectBottomHandle} ref={bottomHandleRef}
                 style={{cursor: "ns-resize", position: "absolute", left: 0, right: 0, bottom: 0, height: handleSize + "px", background: "grey"}}>
            </div>
            <div onMouseDown={selectTopHandle} ref={topHandleRef}
                 style={{cursor: "ns-resize", position: "absolute", left: 0, right: 0, top: 0, height: handleSize + "px", background: "grey"}}>
            </div>
            <div ref={editorContainerRef}
                 style={{cursor: "pointer", position: "absolute", left: handleSize + "px", top: handleSize + "px", bottom: handleSize + "px", right: handleSize + "px"}}>
                {children}
            </div>
        </div>
    );
}
