(function(){
    let IndexSQLParser = {
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
    parserModules["sql"]=function(text){
        return IndexSQLParser.parseText(text);
    }
})()