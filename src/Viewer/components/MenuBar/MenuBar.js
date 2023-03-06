import React, {useContext, useRef, useState} from "react";

import PropTypes from "prop-types";
import {Button, Form, Modal, ProgressBar, Table, Row, Col} from "react-bootstrap";
import {
    ChevronDoubleLeft, ChevronDoubleRight, ChevronLeft, ChevronRight, Download,
    FileText, Folder, Gear, Keyboard, Moon, Sun
} from "react-bootstrap-icons";

import {THEME_STATES} from "../../../ThemeContext/THEME_STATES";
import {ThemeContext} from "../../../ThemeContext/ThemeContext";
import MODIFY_PAGE_ACTION from "../../services/MODIFY_PAGE_ACTION";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import {EditableInput} from "./EditableInput/EditableInput";
import DOWNLOAD_WORKER_ACTION from "../../services/DOWNLOAD_WORKER_ACTION";

import "./MenuBar.scss";

MenuBar.propTypes = {
    logFileState: PropTypes.object,
    fileMetaData: PropTypes.object,
    loadingLogs: PropTypes.bool,
    changeStateCallback: PropTypes.func,
    loadFileCallback: PropTypes.func,
    prepareDownloadCallback: PropTypes.func,
};

/**
 * Callback used to change the parent component's state
 * @callback ChangeStateCallback
 * @param {string} type The type of state change ({@link STATE_CHANGE_TYPE})
 * @param {object} args Arguments used to update the state
 */

/**
 * This callback is used to load a new file.
 *
 * @callback LoadFileCallback
 * @param {File|String} fileInfo File object or file path to load.
 */


/**
 * This callback is used to trigger decompression of logs to database.
 *
 * @callback PrepareDownloadCallback
 */

/**
 * Menu bar used to navigate the log file.
 * @param {object} logFileState Current state of the log file
 * @param {object} fileMetaData Object containing file metadata
 * @param {boolean} loadingLogs Indicates if logs are being decoded and
 *                              loaded by worker.
 * @param {ChangeStateCallback} changeStateCallback
 * @param {LoadFileCallback} loadFileCallback
 * @param {PrepareDownloadCallback} prepareDownloadCallback
 * @return {JSX.Element}
 */
export function MenuBar ({
    logFileState, fileMetaData, loadingLogs, changeStateCallback, loadFileCallback
    , prepareDownloadCallback
}) {
    const {theme, switchTheme} = useContext(ThemeContext);

    const [eventsPerPage, setEventsPerPage] = useState(logFileState.pages);
    const [showSettings, setShowSettings] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showDownload, setShowDownload] = useState(false);

    const handleCloseSettings = () => setShowSettings(false);
    const handleShowSettings = () => setShowSettings(true);

    const handleCloseHelp = () => setShowHelp(false);
    const handleShowHelp = () => setShowHelp(true);

    const handleCloseDownload = () => setShowDownload(false);
    const handleshowDownload = () => setShowDownload(true);

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadingMessage, setDownloadingMessage] = useState("Decoding pages to database...");
    const [progress, setProgress] = useState(0);

    const inputFile = useRef(null);

    const goToFirstPage = () => {
        if (logFileState.page !== 1) {
            changeStateCallback(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.firstPage});
        }
    };

    const goToPrevPage = () => {
        changeStateCallback(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.prevPage});
    };

    const goToNextPage = () => {
        changeStateCallback(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.nextPage});
    };

    const goToLastPage = () => {
        if (logFileState.page !== logFileState.pages) {
            changeStateCallback(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.lastPage});
        }
    };

    const goToPage = (page) => {
        changeStateCallback(STATE_CHANGE_TYPE.page, {
            action: MODIFY_PAGE_ACTION.newPage,
            requestedPage: page,
        });
    };

    // File functions
    const openFile = () => {
        inputFile.current.click();
    };

    const loadFile = (e) => {
        loadFileCallback(e.target.files[0]);
    };

    // Modal Functions
    const getModalClass = () => {
        return (THEME_STATES.LIGHT === theme)?"modal-light":"modal-dark";
    };

    const saveModalChanges = (e) => {
        // TODO Can't backspace 0 from the number input
        // TODO What is the maximum number of events monaco can support?
        e.preventDefault();
        handleCloseSettings();
        changeStateCallback(STATE_CHANGE_TYPE.pageSize, {pageSize: eventsPerPage});
        localStorage.setItem("pageSize", String(eventsPerPage));
    };

    const closeModal = () => {
        handleCloseSettings();
    };

    const openModal = () => {
        handleShowSettings();
        setEventsPerPage(logFileState.pageSize);
    };

    const getThemeIcon = () => {
        if (THEME_STATES.LIGHT === theme) {
            return (
                <Moon className="cursor-pointer" title="Set Light Mode"
                    onClick={() => switchTheme(THEME_STATES.DARK)}/>
            );
        } else if (THEME_STATES.DARK === theme) {
            return (
                <Sun className="cursor-pointer" title="Set Dark Mode"
                    onClick={() => switchTheme(THEME_STATES.LIGHT)}/>
            );
        }
    };

    const getPageNav = () => {
        return (
            <>
                <div className="menu-item menu-item-btn" onClick={goToFirstPage}>
                    <ChevronDoubleLeft title="First Page"/>
                </div>
                <div className="menu-item menu-item-btn" onClick={goToPrevPage}>
                    <ChevronLeft title="Previous Page"/>
                </div>
                <div className="menu-item">
                    <EditableInput value={logFileState.page} minValue={1}
                        maxValue={logFileState.pages} onChangeCallback={goToPage}/>
                    <span className="mx-1"> of</span>
                    <span className="mx-1"> {logFileState.pages}</span>
                </div>
                <div className="menu-item menu-item-btn" onClick={goToNextPage}>
                    <ChevronRight title="Next Page"/>
                </div>
                <div className="menu-item menu-item-btn" onClick={goToLastPage}>
                    <ChevronDoubleRight title="Last Page"/>
                </div>
            </>
        );
    };

    const loadingBarHeight = "3px";
    const getLoadingBar = () => {
        return (loadingLogs)
            ?<ProgressBar animated now={100} style={{height: loadingBarHeight}}/>
            :<div style={{height: loadingBarHeight}} className="w-100" />;
    };

    const downloadBlob = (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileMetaData.name.split(".")[0] + ".log";
        document.body.appendChild(link);
        link.dispatchEvent(
            new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window,
            })
        );
        document.body.removeChild(link);
    };

    const BlobAppender = function () {
        let blob = new Blob([], {type: "text"});
        this.append = function (src) {
            blob = new Blob([blob, src], {type: "text"});
        };
        this.getBlob = function () {
            return blob;
        };
    };

    const downloadWorker = useRef(null);

    const download = async (e) => {
        prepareDownloadCallback();
        setDownloadingMessage("Decoding pages to database...");
        setIsDownloading(true);
        if (downloadWorker.current) {
            downloadWorker.current.terminate();
        }

        const worker = new Worker(new URL("../../services/downloadWorker.js", import.meta.url));
        downloadWorker.current = worker;

        worker.postMessage({
            code: DOWNLOAD_WORKER_ACTION.initialize,
            name: fileMetaData.name,
        });

        let page = 1;
        const blob = new BlobAppender();
        worker.onmessage = (e) => {
            const msg = e.data;
            switch (msg.code) {
                case DOWNLOAD_WORKER_ACTION.pageData:
                    blob.append(msg.data);
                    console.debug(`Added page ${msg.page} to stream.`);
                    if (page <= logFileState.pages) {
                        setProgress((page/logFileState.pages) * 100);
                        worker.postMessage({
                            code: DOWNLOAD_WORKER_ACTION.pageData,
                            page: page++,
                        });
                    } else {
                        setIsDownloading(false);
                        downloadBlob(blob.getBlob());
                    }
                    break;
                case DOWNLOAD_WORKER_ACTION.error:
                    console.error(msg.error);
                    break;
                case DOWNLOAD_WORKER_ACTION.progress:
                    const progress = msg.count/logFileState.pages;
                    setProgress(progress*100);

                    if (1 !== progress) {
                        setTimeout(() => {
                            worker.postMessage({
                                code: DOWNLOAD_WORKER_ACTION.progress
                            });
                        }, 100);
                    } else {
                        setDownloadingMessage("Adding logs to stream...");
                        setProgress(0);
                        worker.postMessage({
                            code: DOWNLOAD_WORKER_ACTION.pageData,
                            page: page++,
                        });
                    }
                    break;
                default:
                    break;
            }
        };

        worker.postMessage({
            code: DOWNLOAD_WORKER_ACTION.progress
        });
    };

    // TODO make file icon a button to open modal with file info
    // TODO Move modals into their own component
    return (
        <>
            <div className="viewer-header" data-theme={theme}>
                <div style={{height: loadingBarHeight}} className="w-100" />
                <div className="viewer-header-menu-container">
                    <div className="menu-left">
                        <div className="menu-item" title={fileMetaData.name}>
                            <FileText className="mx-2"/>
                            <span className="d-none d-lg-block">{fileMetaData.name}</span>
                        </div>
                    </div>
                    <div className="menu-right">
                        {getPageNav()}
                        <div className="menu-divider"></div>
                        <div className="menu-item menu-item-btn" onClick={openModal}>
                            <Gear/>
                        </div>
                        <div className="menu-divider"></div>
                        <div className="menu-item menu-item-btn" onClick={openFile}
                            title="Open File (or Drag and Drop File)">
                            <Folder/>
                        </div>
                        <input type='file' id='file' onChange={loadFile} ref={inputFile}
                            style={{display: "none"}}/>
                        <div className="menu-divider"></div>
                        <div className="menu-item menu-item-btn" onClick={handleshowDownload}
                            title="Download File">
                            <Download/>
                        </div>
                        <div className="menu-divider"></div>
                        <div className="menu-item menu-item-btn" onClick={handleShowHelp}
                            title="Show Help">
                            <Keyboard/>
                        </div>
                    </div>
                </div>
                {getLoadingBar()}
            </div>

            <Modal show={showSettings} className="border-0" onHide={handleCloseSettings}
                contentClassName={getModalClass()}>
                <Modal.Header className="modal-background border-0" >
                    <div className="float-left">
                        App Settings
                    </div>
                    <div className="float-right">
                        {getThemeIcon()}
                    </div>
                </Modal.Header>
                <Modal.Body className="modal-background p-3 pt-1" >
                    <label className="mb-2">Log Events per Page</label>
                    <Form onSubmit={saveModalChanges}>
                        <Form.Control type="number"
                            value={eventsPerPage}
                            onChange={(e) => setEventsPerPage(Number(e.target.value))}
                            className="input-sm num-event-input" />
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-background border-0" >
                    <Button className="btn-sm" variant="success" onClick={saveModalChanges}>
                        Save Changes
                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>



            <Modal show={showDownload} className="border-0" onHide={handleCloseDownload}
                contentClassName={getModalClass()}>
                <Modal.Header className="modal-background border-0" >
                    <div className="float-left">
                        Download Modal
                    </div>
                    <div className="float-right">
                        {getThemeIcon()}
                    </div>
                </Modal.Header>
                <Modal.Body className="modal-background p-3 pt-1" >
                    <Row className="px-3">
                        {!isDownloading &&
                            < Button className="btn-sm" variant="secondary" onClick={download}>
                                Download Uncompressed Log
                            </Button>
                        }

                        {isDownloading &&
                            <Row className="m-0 p-0">
                                <div className="p-0 m-0 mb-2" style={{fontSize: "13px"}}>
                                    <div className="p-0" style={{float: "left"}}>
                                        {downloadingMessage}
                                    </div>
                                    <div className="p-0" style={{float: "right"}}>
                                        {progress.toFixed(2)} %
                                    </div>
                                </div>
                                <ProgressBar animated now={progress} style={{height: "10px"}}
                                    className="p-0 border-0 rounded-0"/>
                            </Row>
                        }
                    </Row>
                </Modal.Body>
                <Modal.Footer className="modal-background border-0" >
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseDownload}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={showHelp} className="help-modal border-0" onHide={handleCloseHelp}
                contentClassName={getModalClass()} data-theme={theme}>
                <Modal.Header className="modal-background" >
                    <div className="float-left">
                        Keyboard Shortcuts
                    </div>
                </Modal.Header>
                <Modal.Body className="modal-background p-3 pt-2" >
                    <Table borderless style={{fontSize: "15px"}} >
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Windows</th>
                                <th>macOS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Focus on Editor</td>
                                <td>
                                    <kbd>`</kbd>
                                </td>
                                <td>
                                    <kbd>`</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>Next Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>]</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>]</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>Prev Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>[</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>[</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>First Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>,</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>,</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>Last Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>.</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>.</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>Top of Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>U</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>U</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>End of Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>I</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>I</kbd>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer className="modal-background" >
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseHelp}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
