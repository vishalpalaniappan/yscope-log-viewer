import Database from "./decoder/Database";
import DOWNLOAD_WORKER_ACTION from "./DOWNLOAD_WORKER_ACTION";
let db = null;

onmessage = function (e) {
    const msg = e.data;

    switch (msg.code) {
        case DOWNLOAD_WORKER_ACTION.initialize:
            db = new Database(e.data.name);
            break;
        case DOWNLOAD_WORKER_ACTION.progress:
            db.getNumberOfPages().then((count) => {
                postMessage({
                    code: DOWNLOAD_WORKER_ACTION.progress,
                    count: count,
                });
            }).catch((e) => {
                postMessage({
                    code: DOWNLOAD_WORKER_ACTION.error,
                    error: new Error(e.reason),
                });
            });
            break;
        case DOWNLOAD_WORKER_ACTION.pageData:
            db.getPage(e.data.page).then((data) => {
                if (undefined === data) {
                    postMessage({
                        code: DOWNLOAD_WORKER_ACTION.error,
                        error: new Error("Page data was not loaded."),
                    });
                } else {
                    postMessage({
                        code: DOWNLOAD_WORKER_ACTION.pageData,
                        data: data.data,
                        page: e.data.page,
                    });
                }
            }).catch((e) => {
                postMessage({
                    code: DOWNLOAD_WORKER_ACTION.error,
                    error: new Error(e.reason),
                });
            });
            break;
        default:
            break;
    }
};
