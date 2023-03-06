import Dexie from "dexie";

/**
 * Database class that wraps all indexddb functions.
 *
 */
class Database extends Dexie {
    /**
     * Initializes the database connection.
     *
     * @param {string} fileName Name of database.
     */
    constructor  (fileName) {
        super(fileName);
        this.initialize();
    }

    initialize () {
        this.version(1).stores({
            logData: "page",
        });
        this.logData = this.table("logData");
    }

    getPage (page) {
        return new Promise(async (resolve, reject) => {
            this.logData.get({page: page}).then((data) => {
                resolve(data);
            }).catch((reason) => {
                console.log(reason);
                reject(new Error(reason));
            });
        });
    }

    async addPage (page, data) {
        return new Promise(async (resolve, reject) => {
            this.logData.add(
                {
                    page: page,
                    data: data,
                }
            ).then((data) => {
                resolve(true);
            }).catch((e) => {
                reject(new Error(e));
            });
        });
    }


    async getNumberOfPages (page, data) {
        return new Promise(async (resolve, reject) => {
            this.logData.count().then((number) => {
                resolve(number);
            }).catch((e) => {
                reject(new Error(e));
            });
        });
    }
}

export default Database;
