// The MIT License

// Copyright 2020 Daniel Diment Rodríguez https://dandimrod.dev

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Class that represents a single IndexSQL database
 * @constructor
 * @param  {String} dbName - The name of the database you want to open.
 * @param {userOptions} userOptions - Options for the database
 */
function IndexSQL(dbName, userOptions) {
    let defaultOptions = {
        worker: true,
        encrypt: false,
        db: "indexdb", // localstorage none
        fallback: true,
        backup: undefined,
        cache: undefined,
    }
    let options = { ...defaultOptions, ...userOptions };
    let db = {};

    //Choosing technology for the database
    if (window.indexedDB && options.db === "indexdb") {
        db.tech = "indexdb";
    } else {
        if ((() => {
            try {
                //This checks if localStorage works
                localStorage.setItem("test", "test");
                localStorage.removeItem("test");
                return true;
            } catch (e) {
                return false;
            }
        })() && ((options.db === "indexdb" && options.fallback) || options.db === "localstorage")) {
            db.tech = "localstorage";
        } else {
            if (((options.db === "localstorage" || options.db === "indexdb") && options.fallback) || options.db === "none") {
                db.tech = "none";
            } else {
                if (options.db === "server") {
                    db.tech = "server";
                } else {
                    console.warn("No database tech supported");
                    return this;
                }
            }
        }
    }
    db.server = function (dbName, tech, options) {

        let dbTechs = {
            "indexdb": {
                init: function () {
                    let requestDB = indexedDB.open("IndexSQL", 1);
                    requestDB.onerror = function (event) {
                        log.warn("Database error: " + event.target.errorCode);
                    };
                    requestDB.onupgradeneeded = function (event) {
                        db = event.target.result;
                        let store = db.createObjectStore("databases", { keypath: "name" });
                    };
                },
                save: function (data) {
                    let requestDB = indexedDB.open("IndexSQL", 1);
                    requestDB.onerror = function (event) {
                        log.warn("Database error: " + event.target.errorCode);
                    };
                    requestDB.onsuccess = function (event) {
                        let db = event.target.result;
                        let transaction = db.transaction(["databases"], "readwrite");
                        transaction.onerror = function (event) {
                            console.warn("Database error: " + event.target.errorCode);
                        };
                        transaction.oncomplete = function (event) {
                            //SAVED
                        };
                        var objectStore = transaction.objectStore("databases");
                        objectStore.put({ data }, dbName)
                        //baker.compress(db.exportDb()).then((result)=>{objectStore.put({ data: result }, dbName);})
                    };
                },
                load: function () {
                    return new Promise((resolve, reject) => {
                        let requestDB = indexedDB.open("IndexSQL", 1);
                        requestDB.onerror = function (event) {
                            log.warn("Database error: " + event.target.errorCode);
                        };
                        requestDB.onsuccess = function (event) {
                            let db = event.target.result;
                            let transaction = db.transaction(["databases"], "readonly");
                            transaction.onerror = function (event) {
                                console.warn("Database error: " + event.target.errorCode);
                            };
                            transaction.oncomplete = function (event) {
                                if (request.result) {
                                    //baker.decompress(request.result.data).then((result)=>{data = new Database(result,options)});
                                    resolve(request.result.data);
                                }
                                else {
                                    reject();
                                }
                            };
                            var objectStore = transaction.objectStore("databases");
                            var request = objectStore.get(dbName);
                        };
                    })

                },
                drop: function () {
                    return new Promise((resolve) => {
                        let requestDB = indexedDB.open("IndexSQL", 1);
                        requestDB.onerror = function (event) {
                            log.warn("Database error: " + event.target.errorCode);
                        };
                        requestDB.onsuccess = function (event) {
                            let db = event.target.result;
                            let transaction = db.transaction(["databases"], "readwrite");
                            transaction.onerror = function (event) {
                                console.warn("Database error: " + event.target.errorCode);
                            };
                            transaction.oncomplete = function (event) {
                                resolve();
                            };
                            var objectStore = transaction.objectStore("databases");
                            objectStore.delete(dbName);
                        };
                    })
                }
            },
            "localstorage": {
                init: function () {
                },
                load: function () {
                    return new Promise((resolve, reject) => {
                        let db = localStorage.getItem(dbName);
                        if (db !== null) {
                            resolve(db)
                        } else {
                            reject();
                        }
                    })

                },
                save: function (data) {
                    localStorage.setItem(dbName, data)
                },
                drop: function () {
                    return new Promise((resolve) => {
                        localStorage.removeItem(dbName);
                        resolve();
                    })
                }
            },
            "none": {
                db: "",
                init: function () {
                },
                load: function () {
                    return new Promise((resolve, reject) => {
                        if (this.db !== "") {
                            resolve(this.db);
                        }
                        else {
                            reject();
                        }
                    })
                },
                save: function (data) {
                    db = data;
                },
                drop: function () {
                    return new Promise((resolve) => {
                        this.db = "";
                        resolve();
                    })
                }
            }
        }
        let dbUtils = function (tech) {
            let databaseTech = dbTechs[tech]
            let resultTech = {
                loaded: false,
                init: function () {
                    databaseTech.init();
                    this.load();
                },
                save: async function () {
                    let data = await db.exportDb();
                    databaseTech.save(data);
                },
                load: function () {
                    databaseTech.load().then((result) => {
                        db = new Database(result, options);
                    }).catch(() => {
                        db = new Database(undefined, options);
                        this.save();
                    })
                },
                drop: function () {
                    databaseTech.drop().then();
                }
            }
            resultTech.init();
            return resultTech;
        }(tech);

        function Database(database, options) {
            function Baker(secret) {
                //Credits to https://gist.github.com/rafaelsq/5af573af7e2d763869e2f4cce0a8357a
                const hexToBuf = hex => {
                    for (var bytes = [], c = 0; c < hex.length; c += 2)
                        bytes.push(parseInt(hex.substr(c, 2), 16));
                    return new Uint8Array(bytes);
                };

                const bufToHex = buf => {
                    var byteArray = new Uint8Array(buf);
                    var hexString = "";
                    var nextHexByte;

                    for (var i = 0; i < byteArray.byteLength; i++) {
                        nextHexByte = byteArray[i].toString(16);
                        if (nextHexByte.length < 2) {
                            nextHexByte = "0" + nextHexByte;
                        }
                        hexString += nextHexByte;
                    }
                    return hexString;
                };

                const strToBuf = str => (new TextEncoder().encode(str));
                const bufToStr = str => (new TextDecoder().decode(str));

                // Encrypt
                const encrypt = (data, key, iv, mode) =>
                    crypto.subtle.importKey("raw", key, { name: mode }, true, ["encrypt", "decrypt"])
                        .then(bufKey => crypto.subtle.encrypt({ name: mode, iv }, bufKey, data))

                // Decrypt
                const decrypt = (data, key, iv, mode) =>
                    crypto.subtle.importKey("raw", key, { name: mode }, true, ["encrypt", "decrypt"])
                        .then(bufKey => crypto.subtle.decrypt({ name: mode, iv }, bufKey, data))

                // PBKDF2
                const pbkdf2 = (password, salt, iterations, hash, mode) =>
                    crypto.subtle.importKey("raw", password, { name: "PBKDF2" }, false, ["deriveKey"])
                        .then(baseKey => crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations, hash }, baseKey, { "name": mode, "length": 256 }, true, ["encrypt", "decrypt"]))
                        .then(key => crypto.subtle.exportKey("raw", key))

                const encStr = async (data, password) => {
                    const salt = crypto.getRandomValues(new Uint8Array(16))
                    const iv = crypto.getRandomValues(new Uint8Array(16))
                    const iterations = 20000
                    const hash = 'SHA-256'
                    const mode = 'AES-GCM'

                    const keyBuf = await pbkdf2(strToBuf(password), salt, iterations, hash, mode);
                    const buf = await encrypt(strToBuf(data), keyBuf, iv, mode);
                    return btoa(
                        JSON.stringify({
                            hash,
                            mode,
                            iterations,
                            salt: bufToHex(salt),
                            iv: bufToHex(iv),
                            data: bufToHex(buf),
                        }));
                }

                const decStr = async (raw, password) => {
                    const {
                        salt, iterations, hash, mode, iv, data,
                    } = JSON.parse(atob(raw))

                    const key = await pbkdf2(strToBuf(password), hexToBuf(salt), iterations, hash, mode);
                    const buf = await decrypt(hexToBuf(data), key, hexToBuf(iv), mode);
                    return bufToStr(buf);
                }
                function lzw_encode(s) {
                    var dict = {};
                    var data = (s + "").split("");
                    var out = [];
                    var currChar;
                    var phrase = data[0];
                    var code = 256;
                    for (var i = 1; i < data.length; i++) {
                        currChar = data[i];
                        if (dict[phrase + currChar] != null) {
                            phrase += currChar;
                        }
                        else {
                            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                            dict[phrase + currChar] = code;
                            code++;
                            phrase = currChar;
                        }
                    }
                    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                    for (var i = 0; i < out.length; i++) {
                        out[i] = String.fromCharCode(out[i]);
                    }
                    return out.join("");
                }
                // Decompress an LZW-encoded string
                function lzw_decode(s) {
                    var dict = {};
                    var data = (s + "").split("");
                    var currChar = data[0];
                    var oldPhrase = currChar;
                    var out = [currChar];
                    var code = 256;
                    var phrase;
                    for (var i = 1; i < data.length; i++) {
                        var currCode = data[i].charCodeAt(0);
                        if (currCode < 256) {
                            phrase = data[i];
                        }
                        else {
                            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                        }
                        out.push(phrase);
                        currChar = phrase.charAt(0);
                        dict[code] = oldPhrase + currChar;
                        code++;
                        oldPhrase = phrase;
                    }
                    return out.join("");
                }
                let compress;
                let decompress;
                if (secret) {
                    compress = async function (data) {
                        return await encStr(data, secret);
                    }
                    decompress = async function (data) {
                        try{
                            return await decStr(data, secret);
                        }catch(err){
                            postMessage({badPassword:true})
                            throw "INDEXSQL ERROR: Bad Password"
                        }
                    }
                } else {
                    compress = async function (data) {
                        return lzw_encode(data)
                    }
                    decompress = async function (data) {
                        return lzw_decode(data)
                    }
                }

                return { compress, decompress }
            }
            function commit() {
                if (!transaction) {
                    if(options.backup){
                        returnDb.exportDb().then((data)=>{
                            postMessage({backup:data})
                        })
                    }
                    dbUtils.save();
                }
            }
            function checkTransaction() {
                if (transaction && errorOnTransaction) {
                    return { error: "Transaction Failed" }
                }
            }
            function endedOnError() {
                if (transaction) {
                    errorOnTransaction = true;
                }
            }
            let db;
            let transaction;
            let errorOnTransaction = false;
            let baker = new Baker(options.encrypt)
            if (!database) {
                db = {
                    //tables
                    t: {},
                    //metadata
                    m: {
                        //cachedCalls
                        c: []
                    }
                }
                dbUtils.loaded = true;
            } else {
                baker.decompress(database).then((data) => {
                    db = JSON.parse(data);
                    dbUtils.loaded = true;
                })
            }
            let returnDb= {
                exportDb: async function () {
                    return await baker.compress(JSON.stringify(db));
                },
                updateOptions:function(newOptions){
                    options={options,...newOptions}
                    baker = new Baker(options.encrypt)
                    commit()
                    return {message:"Options updated"}
                },
                tables: {
                    getTables: function () {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                        return { result: Object.keys(db.t) };
                    },
                    createTable: function (name, columns) {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                        if (db.t[name]) {
                            endedOnError();
                            return { error: "Table " + name + " already exists" };
                        }
                        let table = {
                            //values
                            v: {},
                            //columns
                            c: {},
                            //parents
                            p: [],
                            //decendants
                            d: [],
                            //key
                            k: []
                        }
                        if (columns.keys.primary.length !== 0) {
                            let error = false;
                            columns.keys.primary.forEach((key) => { if (!columns.cols[key]) { error = key } })
                            if (error) {
                                endedOnError();
                                return { error: "The table does not contain the primary key: " + error }
                            }
                            table.key = columns.keys.primary;
                        }
                        if (columns.keys.foreign.length !== 0) {
                            let error = false;
                            columns.keys.foreign.forEach((key) => { if (!columns.cols[key.col]) { error = key.col } })
                            if (error) {
                                endedOnError();
                                return { error: "The table does not contain the foreign key: " + error }
                            }
                            table.key = columns.keys.primary;
                        }
                        table.c = columns.col;
                        db.t[name] = table;
                        commit();
                        return { message: "Table " + name + " created" };
                    },
                    deleteTable: function (name) {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                        if(!db.t[name]){
                            return {warn:"Table "+name+" does not exist"};
                        }
                        delete db.t[name];
                        for (const tableName in db.t) {
                            if (db.t.hasOwnProperty(tableName)) {
                                const table = db.t[tableName];
                                table.p=table.p.filter((element)=>element.refTable!==name);
                                table.d=table.d.filter((element)=>element.refTable!==name);
                            }
                        }
                        commit()
                        return {message:"Table "+name+" was dropped succesfully"};
                    },
                    alterTable: function () {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                    }
                },
                data: {
                    getData: function (table) {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                    },
                    createData: function (table) {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                    },
                    deleteData: function (table) {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                    },
                    alterData: function (table) {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                    }
                },
                utils: {
                    startTransaction: function () {
                        if (checkTransaction()) {
                            return checkTransaction();
                        }
                        if (transaction) {
                            return { warn: "Already on a transaction" }
                        } else {
                            transaction = JSON.parse(JSON.stringify(db));
                            return { message: "Starting Transaction" }
                        }
                    },
                    endTransaction: function () {
                        if (!transaction) {
                            return { error: "Not in a transaction" }
                        } else {
                            if (errorOnTransaction) {
                                db = JSON.parse(JSON.stringify(transaction));
                                transaction = undefined;
                                errorOnTransaction = false;
                                return { message: "Rolled back transaction sucessfully" }
                            } else {
                                transaction = undefined;
                                commit();
                                return { message: "Transaction completed" }
                            }
                        }
                    }
                }
            }
            return returnDb;
        }
        let db;

        let IndexSQLParser = {
            "parse": function (text, id) {
                if (dbUtils.loaded) {
                    postMessage({ id, response: this.parseText(text) });
                }
                else {
                    setTimeout(() => {
                        this.parse(text, id);
                    }, 500);
                }
            },
            "parseText": function (text) {
                //Delete all comments
                text = text.replace(/(?:\/\*(?:.|\n)*?\*\/|--.*)/g, "");

                let lines = text.split(";");
                lines = lines.map((line) => { return line.replace(/\n/g, " ").trim() });
                lines = lines.filter((line) => { return line.trim().length !== 0 })
                let result = lines.map((line) => {
                    return this.parseCommand(line);
                })
                return result;
            },
            "parseCommand": function (line) {
                let result;
                let queryArray = line.split(/\s+/g);
                if (this.commands[queryArray[0].toLowerCase()] && queryArray[0].toLowerCase()!=="utils") {
                    result = this.commands[queryArray[0].toLowerCase()](line);
                } else {
                    result = { "error": "Operation not supported" };
                }
                return result;
            },
            "commands": {
                "select": function (...query) {
                    return { error: "operation not supported" };
                    try {
                        let distint;
                        if (query[0].toLowerCase === "distint") {
                            distint = true;
                            query = query.slice(1);
                        }
                        let spittedQuery = IndexSQLParser.utils.spitter(query, ["from", ["where", "order by"]], "columns");
                        if (spittedQuery.from.length !== 1 || spittedQuery.columns.length === 0) {
                            return { "error": "Query malformed" };
                        }
                        let table = IndexSQLParser.utils.getTable(spittedQuery.from[0]);
                        let columns = IndexSQLParser.utils.getTable(table, spittedQuery.columns);
                    } catch (err) {
                        return { "error": err }
                    }
                },
                "insert": function (query){
                    return { "error": "Query malformed" };
                    let parsedQuery = /^insert\s+into\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+')\s+(?:\((.*?)\)\s+)?values\s+\((.*)\)\s*$/i.exec(query);
                    if(parsedQuery === null){
                        return { "error": "Query malformed" };
                    }
                    let columns;
                    if(parsedQuery[2]){
                        columns=this.utils.extractColumnsInsert(parsedQuery[2])
                        if(columns.error){
                            return columns;
                        }
                    }
                    
                },
                "create": function (query) {
                    let parsedQuery = /^create\s+table\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+')\s+\(\s*(.*?)\s*\)$/i.exec(query);
                    if (parsedQuery === null) {
                        return { "error": "Query malformed" };
                    }
                    let extractedColumns = this.utils.extractColumnsCreate(parsedQuery[2]);
                    if (extractedColumns.error) {
                        return extractedColumns;
                    }
                    return db.tables.createTable(this.utils.getTable(parsedQuery[1]), extractedColumns);
                },
                "drop": function (query) {
                    let parsedQuery = /^drop\s+table\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+')\s*$/i.exec(query);
                    if (parsedQuery === null) {
                        return { "error": "Query malformed" };
                    }
                    return db.tables.deleteTable(this.utils.getTable(parsedQuery[1]));
                },
                "show": function (query) {
                    let parsedQuery = /show\s+tables/i.exec(query);
                    if (parsedQuery === null) {
                        return { "error": "Query malformed" };
                    }
                    return db.tables.getTables()
                },
                "start": function (query) {
                    let parsedQuery = /start\s+transaction/i.exec(query);
                    if (parsedQuery === null) {
                        return { "error": "Query malformed" };
                    }
                    return db.utils.startTransaction();
                },
                "end": function (query) {
                    let parsedQuery = /end\s+transaction/i.exec(query);
                    if (parsedQuery === null) {
                        return { "error": "Query malformed" };
                    }
                    return db.utils.endTransaction();
                },
                "utils": {
                    "spitter": function (query, separators, first = "") {
                        function checkSeparator(separator, value, index) {
                            function checkSingleSeparator(separator) {
                                if (separator.includes(" ")) {
                                    if (separator.split(" ")[0] === element.toLowerCase()) {
                                        let multipleSeparators = separator.split(" ");
                                        let fits = true;
                                        for (let index2 = 1; index2 < multipleSeparators.length; index2++) {
                                            const element = multipleSeparators[index2];
                                            const element2 = query[index + index2]
                                            if (element !== element2.toLowerCase()) {
                                                fits = false;
                                                break;
                                            }
                                        }
                                        if (fits) {
                                            return { separator: separator, newIndex: index + multipleSeparators.length }
                                        }
                                    }
                                } else {
                                    if (separator === value.toLowerCase()) {
                                        return { separator: separator };
                                    }
                                }
                                return false;
                            }
                            if (Array.isArray(separator)) {
                                for (let index2 = 0; index2 < separator.length; index2++) {
                                    const newSeparator = separator[index2];
                                    let check = checkSingleSeparator(newSeparator);
                                    if (check) {
                                        return check;
                                    }
                                }
                                if (separators[1]) {
                                    let nextSeparator = checkSeparator(separators[1], value, index);
                                    if (nextSeparator) {
                                        nextSeparator.trim = true;
                                        return nextSeparator;
                                    }
                                }
                            } else {
                                let nextSeparator = checkSeparator(separator, value, index);
                                if (nextSeparator) {
                                    nextSeparator.trim = true;
                                    return nextSeparator;
                                } else {
                                    return false;
                                }
                            }
                        }
                        let result = {};
                        result[first] = false;
                        let current = first;
                        separators.forEach(element => {
                            if (Array.isArray(element)) {
                                element.forEach((element) => {
                                    result[element] = false;
                                })
                            } else {
                                result[element] = false;
                            }
                        });
                        for (let index = 0; index < query.length; index++) {
                            const element = query[index];
                            let separator = checkSeparator(separators[0], element, index);
                            if (separator) {
                                current = separator.separator;
                                result[current] = true;
                                if (separator.trim) {
                                    separators = separators.slice(1);
                                }
                                if (separator.newIndex) {
                                    index = newIndex;
                                }
                            } else {
                                if (result[current] === true) {
                                    result[current] = [];
                                }
                                result[current].push(element);
                            }
                        }
                        return result;
                    },
                    "generateQueryArray": function (query) {
                        let splittedQuery = query.match(/[a-zA-Z0-9_]+|"[^"]+"|'[^']+'|[^a-zA-Z0-9_"' ]{1}/gm);
                        splittedQuery = splittedQuery.map((element) => {
                            if (element.startsWith('"') || element.startsWith("'")) {
                                return element.slice(1, -1);
                            } else {
                                return element;
                            }
                        })
                        return splittedQuery;
                    },
                    "getColumns": function (table, columns) {
                        let allColumns = [];
                        let buffer = [];
                        columns.forEach((element) => {
                            if (element === ",") {
                                allColumns.push(buffer);
                                buffer = [];
                            } else {
                                buffer.push(element)
                            }
                        })
                        allColumns.push(buffer);
                        return this.getColumnData(table, column);
                    },
                    "getColumnData": function (table, column) {
                        let result = [];
                        for (let index = 0; index < allColumns.length; index++) {
                            const column = allColumns[index];
                            switch (column[0].toLowerCase()) {
                                case "min":
                                    result.push({ min: column[2] })
                                    break;
                                case "max":
                                    result.push({ max: column[2] })
                                    break;
                                case "count":
                                    result.push({ count: column[2] })
                                    break;
                                case "avg":
                                    result.push({ avg: column[2] })
                                    break;
                                case "sum":
                                    result.push({ sum: column[2] })
                                    break;
                                case "*":
                                    break;
                                default:
                                    break;
                            }
                        }
                        return result;
    
                    },
                    "getTable": function (table) {
                        table=table.trim();
                        if(table.startsWith('"')||table.startsWith("'")){
                            table=table.slice(1, -1);
                        }
                        return table;
                    },
                    "extractColumnsCreate": function (parameters) {
                        let result = { keys: { primary: [], foreign: [] }, cols: {} };
                        let parametersList = parameters.split(",");
                        parametersList = parametersList.map(element => element.trim());
                        let error;
                        parametersList.some((parameterString) => {
                            if (/\s+KEY\s+/i.test(parameterString)) {
                                let primaryParameters = /^PRIMARY\s+KEY\s+\((.*)\)$/i.exec(parameterString);
                                if (primaryParameters !== null) {
                                    primaryParameters.map(element => element.trim());
                                    if (primaryParameters[1].includes(",")) {
                                        primaryParameters[1].split(",").forEach(parameter => result.keys.primary.push(parameter.trim()))
                                    } else {
                                        result.keys.primary.push(primaryParameters[1]);
                                    }
                                } else {
                                    let foreingParameters = /^FOREIGN\s+KEY\s+\((.*?)\)\s*REFERENCES\s+(.*?)\((.*?)\)$/i.exec(parameterString);
                                    if (foreingParameters !== null) {
                                        foreingParameters.map(element => element.trim());
                                        result.keys.foreign.push({ col: foreingParameters[1], refTable: foreingParameters[2], refCol: foreingParameters[3] })
                                    } else {
                                        error = "Malformed query";
                                        return true;
                                    }
                                }
                            } else {
                                let parametersBreak = /^(.*?)\s+(.*?\(.*?\)|.*?)(?:\s+(.+?))?$/i.exec(parameterString);
                                if (parametersBreak !== null) {
                                    let column = {
                                        constraints: []
                                    }
                                    let datatype = this.extractDatatype(parametersBreak[2]);
                                    if (datatype.error) {
                                        error = datatype.error;
                                        return true;
                                    }
                                    column.type = datatype;
                                    //TODO:CONSTRAINTS
                                    result.cols[parametersBreak[1]] = column;
                                } else {
                                    error = "Malformed query"
                                    return true;
                                }
    
                            }
                        })
                        if (error) {
                            return { error }
                        }
                        return result;
                    },
                    "extractDatatype": function (datatype) {
                        datatype = datatype.toUpperCase();
                        if (datatype.includes("CHAR")) {
                            return "STRING";
                        }
                        if (datatype.includes("BINARY")) {
                            return "STRING";
                        }
                        if (datatype.includes("TEXT")) {
                            return "STRING";
                        }
                        if (datatype.includes("BLOB")) {
                            return "STRING";
                        }
                        //NUMBER
                        if (datatype.includes("BIT")) {
                            return "NUMBER";
                        }
                        if (datatype.includes("INT")) {
                            return "NUMBER";
                        }
                        if (datatype.includes("FLOAT")) {
                            return "NUMBER";
                        }
                        if (datatype.includes("DOUBLE")) {
                            return "NUMBER";
                        }
                        if (datatype.includes("DEC")) {
                            return "NUMBER";
                        }
                        //BOOLEAN
                        if (datatype.includes("BOOL")) {
                            return "BOOLEAN";
                        }
                        return datatype;
                    }
                }
            },
        };

        function messageHandler(e) {
            if (e.data.drop) {
                dbUtils.drop();
                return;
            }
            if (e.data.backup) {
                postMessage({ backup: JSON.stringify(data) });
                return;
            }
            if (e.data.restore) {
                data = JSON.parse(e.data.restore);
                dbUtils.save();
                return;
            }
            if(e.data.updateOptions){
                let result=db.updateOptions(e.data.updateOptions);
                result.id=e.data.id;
                postMessage(result)
                return;
            }
            IndexSQLParser.parse(e.data.querys, e.data.id);
        }
        //This only works if we are on no worker mode;
        'start no worker'
        let returnData = {
            onmessage, postMessage: function (e, ...args) {
                messageHandler({ data: e }, ...args);
            }
        }
        function postMessage(e, ...args) {
            returnData.onmessage({ data: e }, ...args);
        }
        return returnData;
    }
    db.id = 0;
    db.callbacks = [];
    db.worker;
    //Initalization of worker
    if (typeof (Worker) !== "undefined" && options.worker) {
        db.worker = new Worker(URL.createObjectURL(new Blob([`( ${db.server.toString().split("'start no worker'")[0]}
        onmessage = messageHandler;
        })("${dbName}", "${db.tech}",${JSON.stringify(options,(data,val)=>typeof val === "function"?val.toString() : val)})`], { type: 'text/javascript' })));
    } else {
        db.worker = db.server(dbName, db.tech, options);
    }
    db.worker.onmessage = function (e) {
        if(e.data.badPassword){
            if(options.worker){
                db.worker.terminate()
            }
            db.worker={postMessage:(e)=>{return {error:"Incorrect password"}}}
        }else{
            if(e.data.backup){
                options.backup(e.data.backup)
            }else{
                db.callbacks[e.data.id](e.data.response);
                db.callbacks[e.data.id] = undefined;
            }
        }
    };
    /**
     * The headers of a result table
     * @typedef {Object} tableResultHeader
     * @property {String} name - Name of the header.
     * @property {String} datatype - The datatype of the header.
     * @property {string} constraints - The constraints of the header, separed by commas ",".
     */
    /**
     * The result table of a query.
     * @typedef {Object} tableResult
     * @property {tableResultHeader[]} header - It is a list of the headers of this table and it's properties.
     * @property {Array[]} values - It is a list of the rows returned by the query, it consists of a list of the values with the same order as the header.
     */
    /**
     * The result of a IndexSQL query. It will contain at least one of these properties.
     * @typedef {Object} queryResult
     * @property {String} [message] - A message, it usually means that the query has been executed sucessfully.
     * @property {String} [warn] - A warn, it means an error was detected, but it won't stop a transaction. Example: Dropping a table that does not exist.
     * @property {String} [error] - An error, it means that the query was erroneus, it will stop a transaction.
     * @property {tableResult} [result] - It represents a table generated as a result of a query.
     */
    /**
     * Callback for queries execution.
     *
     * @callback dbQueryCallback
     * @param {queryResult[]} results - An array with the results of the queries.
     */
    /**
     * It executes several IndexSQL queries.
     *
     * @param {String} query - A string containing the queries you want to execute, every query has to finish with a semicolon ";".
     * For additional information about the use of queries visit https://dandimrod.github.io/IndexSQL/docs/#SQL-syntax
     * @param {dbQueryCallback} callback - Callback with the response after the queries are executed.
     */
    function execute(query, callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ querys: query, id: db.id });
    }
    /**
     * Callback for backup execution.
     *
     * @callback dbBackupCallback
     * @param {String} backup - The backup of the whole database.
     */
    /**
     * It backs up the database by returning the string that contanins the database.
     *
     * @param {dbBackupCallback} callback - Callback with the backup.
     */
    function manualBackup(callback) {
        db.callbacks[db.id] = callback;
        db.id++;
        db.worker.postMessage({ manualBackup: true, id: db.id });
    }
    /**
     * It restores an old backup of the database.
     * If the database has been encrypted it will need the 
     *
     * @param {String} backup - The backup of the whole database.
     */
    function manualRestore(backup, callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ restore: backup, id: db.id });
    }
    function startBackups(backupOptions, callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        options.backup=backupOptions;
        db.worker.postMessage({ updateOptions: {backupOptions}, id: db.id });
    }
    function encrypt(password, callback) {
        db.id++;
        db.callbacks[db.id] = callback;
        db.worker.postMessage({ updateOptions: {encrypt:password}, id: db.id });
    }
    let result = { execute, manualBackup, manualRestore, startBackups, encrypt };

    let promise = {};
    //PROMISE CALLS CONSTRUCTOR
    for (const functionData in result) {
        if (result.hasOwnProperty(functionData)) {
            const functionExecutable = result[functionData];
            promise[functionData] = function (...args) {
                return new Promise((resolve, reject) => {
                    try {
                        args.push((result) => {
                            resolve(result);
                        })
                        functionExecutable(...args);
                    } catch (err) {
                        reject(err);
                    }
                })
            }
        }
    }
    result.promise = promise;
    return result;
}