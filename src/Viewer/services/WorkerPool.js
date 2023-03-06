class WorkerPool {
    constructor () {
        this.queue = [];
        this._workerCount = 0;
        this._maxNumOfWorkers = 8;
    }

    processQueue () {
        if (this.queue.length > 0) {
            if (this._workerCount < this._maxNumOfWorkers) {
                const task = this.queue.shift();
                const worker = new Worker((new URL("./decodeWorker.js", import.meta.url)));
                this._workerCount++;
                console.debug(`Started worker to load page ${task[1]}`);
                const buf = task[3];
                worker.postMessage({buffer: buf}, [buf]);
                worker.postMessage({
                    dbName: task[0],
                    page: task[1],
                    logEvents: task[2],
                });
                worker.onmessage = (e) => {
                    worker.terminate();
                    this._workerCount--;
                    this.processQueue();
                };
            }
        }
    }

    assignTask (task) {
        this.queue.push(task);
        this.processQueue();
    }
}

export default WorkerPool;
