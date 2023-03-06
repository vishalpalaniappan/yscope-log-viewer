import {DataInputStream, DataInputStreamEOFError} from "./decoder/DataInputStream";
import FourByteClpIrStreamReader from "./decoder/FourByteClpIrStreamReader";
import ResizableUint8Array from "./decoder/ResizableUint8Array";
import Database from "./decoder/Database";

let buffer;

const decodePage = async (dbName, page, inputStream, logEvents) => {

    const dataInputStream = new DataInputStream(inputStream);
    const _outputResizableBuffer = new ResizableUint8Array(511000000);
    const _irStreamReader = new FourByteClpIrStreamReader(dataInputStream, null);

    const _availableVerbosityIndexes = new Set();
    const _logEventMetadata = [];
    for (let i = 0; i < logEvents.length; i++) {
        const event = logEvents[i];
        const decoder = _irStreamReader._streamProtocolDecoder;

        // Set the timestamp before decoding the message.
        // If it is first message, use timestamp in metadata.
        if (event.mappedIndex === 0) {
            decoder._reset();
        } else {
            decoder._setTimestamp(logEvents[i].prevTimestamp);
        }

        try {
            _irStreamReader.readAndDecodeLogEvent(
                _outputResizableBuffer,
                _logEventMetadata
            );
            const lastEvent = _logEventMetadata[_logEventMetadata.length - 1];
            _availableVerbosityIndexes.add(lastEvent["verbosityIx"]);
            lastEvent.mappedIndex = event.mappedIndex;
        } catch (error) {
            // Ignore EOF errors since we should still be able
            // to print the decoded messages
            if (error instanceof DataInputStreamEOFError) {
                // TODO Give visual indication that the stream is truncated
                console.error("Stream truncated.");
            } else {
                console.log("random error");
                throw error;
            }
        }
    }

    // Decode the text and set the available verbosities
    const _textDecoder = new TextDecoder();
    const logs = _textDecoder.decode(_outputResizableBuffer.getUint8Array());

    let _minAvailableVerbosityIx = 1;
    for (const verbosityIx of _availableVerbosityIndexes) {
        if (verbosityIx < _minAvailableVerbosityIx) {
            _minAvailableVerbosityIx = verbosityIx;
        }
    }
    const _displayedMinVerbosityIx = _minAvailableVerbosityIx;
    const _logs = logs.trim();


    const db = new Database(dbName);
    db.addPage(page, _logs).then((e) => {
        console.debug(`Finished decoding page ${page} to database.`);
        postMessage(true);
    }).catch((e) => {
        console.debug(e.toString());
        // console.debug(`Error decoding page ${page} to database.`);
        postMessage(false);
    });
};

onmessage = (e) => {

    if (e.data.buffer) {
        buffer = e.data.buffer;
    } else {
        decodePage(e.data.dbName, e.data.page, buffer, e.data.logEvents);
    }
};
