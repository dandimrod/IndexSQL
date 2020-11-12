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
            "select": function (query) {
                //debugger;
                let parsedQuery= /^select\s+(distint\s+)?(.*)\s+?from\s+(.*)$/gmi.exec(query)
                if (parsedQuery === null) {
                    return { "error": "Query malformed" };
                }
                let distint=!!parsedQuery[1];
                let columnList=parsedQuery[2].trim()==="*"?true:parsedQuery[2].split(",").map(this.utils.columnParserSelect);
                let params=this.utils.splitter(parsedQuery[3], ["where", "order by", "join", "limit", "offset"], "from");
                if(params["from"]){
                    params["from"]=this.utils.trimString(params["from"]);
                }else{
                    return {error:"No table detected"}
                }
                if(params["where"]){
                    params["where"]=this.utils.where(params["where"].trim());
                }
                if(params["order by"]){
                    params["order by"]=params["order by"].split(",").map((column)=>{
                        column=column.trim();
                        if(column.match(/desc$/i)){
                            return {desc:true,column:this.utils.columnParserSelect(column.slice(0,-4).trim())}
                        }
                        if(column.match(/asc$/i)){
                            return {desc:false,column:this.utils.columnParserSelect(column.slice(0,-3).trim())}
                        }
                        return {desc:true,column:this.utils.columnParserSelect(column)}
                    });
                }
                if(params["join"]){
                    let stringSearcher='([a-zA-Z0-9_]+|"[^"]+"|\'[^\']+\'|`[^`]+`)';
                    let formatedJoin=new RegExp(`^${stringSearcher}\\s+on\\s+${stringSearcher}.${stringSearcher}\\s*=\\s*${stringSearcher}.${stringSearcher}$`,"i").exec(params["join"].trim());
                    if(formatedJoin===null){
                        return {error: "Malformed join"}
                    }
                    let foreingTable=this.utils.trimString(formatedJoin[1]);
                    let foreingColumn;
                    let column;
                    if(foreingTable===this.utils.trimString(formatedJoin[2])){
                        foreingColumn=this.utils.trimString(formatedJoin[3]);
                        column=this.utils.trimString(formatedJoin[5]);
                    }else{
                        if(foreingTable===this.utils.trimString(formatedJoin[4])){
                            foreingColumn=this.utils.trimString(formatedJoin[5]);
                            column=this.utils.trimString(formatedJoin[3]);
                        }else{
                            return {error: "Malformed join"}
                        }
                    }
                    params["join"]=[{foreingTable,foreingColumn,column}];
                }
                if(params["limit"]){
                    params["limit"]=new Number(params["limit"].trim());
                }
                if(params["offset"]){
                    params["offset"]=new Number(params["offset"].trim());
                }
                let result=db.data.getData(params["from"],params["join"],params["where"]);
                if(result.error){
                    return result;
                }
                return result;
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
                let parsedQuery = /^create\s+table\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`)\s+\(\s*(.*?)\s*\)$/i.exec(query);
                if (parsedQuery === null) {
                    return { "error": "Query malformed" };
                }
                let extractedColumns = this.utils.extractColumnsCreate(parsedQuery[2]);
                if (extractedColumns.error) {
                    return extractedColumns;
                }
                return db.tables.createTable(this.utils.trimString(parsedQuery[1]), extractedColumns);
            },
            "drop": function (query) {
                let parsedQuery = /^drop\s+table\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`)\s*$/i.exec(query);
                if (parsedQuery === null) {
                    return { "error": "Query malformed" };
                }
                return db.tables.deleteTable(this.utils.trimString(parsedQuery[1]));
            },
            "show": function (query) {
                let parsedQuery = /^show\s+(?:(tables)|columns\s+from\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`))$/i.exec(query);
                if (parsedQuery === null) {
                    return { "error": "Query malformed" };
                }
                if(parsedQuery[1]){
                    return db.tables.getTables();
                }
                if(parsedQuery[2]){
                    return db.tables.getTable(this.utils.trimString(parsedQuery[2]));
                }
                return { "error": "Query malformed" };
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
                "splitter": function (query, separators, first = "") {
                    let result = {};
                    result[first] = false;
                    let current = first;
                    let start=[]
                    separators.forEach((separator)=>{
                        result[separator]=false;
                        start.push([separator,query.search(new RegExp(separator,"i"))]);
                    })
                    start=start.sort((a,b)=>{return a[1]-b[1]});
                    start=start.filter(separator=>separator[1]!==-1);
                    start.forEach((separator,index)=>{
                        if(index==0){
                            if(separator[1]!==0){
                                result[first]=query.substring(0,separator[1]);
                            }
                        }else{
                            result[start[index-1][0]]=query.substring(start[index-1][0].length+start[index-1][1],separator[1])
                        }
                        
                    })
                    if(start.length==0){
                        result[first]=query;
                    }else{
                        result[start[start.length-1][0]]=query.substring(start[start.length-1][0].length+start[start.length-1][1],query.length-1);
                    }
                    return result;
                },
                "trimString":function (element) {
                    element=element.trim();
                    if (element.startsWith('"') || element.startsWith("'") || element.startsWith("`")) {
                        return element.slice(1, -1);
                    } else {
                        return element;
                    }
                },
                "columnParserSelect":(column)=>{
                    let parsedColumn=/^((.*)\(\s*([^"'`\s]+|"[^"]+"|'[^']+'|`[^`]+`)\s*\))|(([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`)\.([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`))|([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`)$/i.exec(column.trim());
                    if(parsedColumn[1]){
                        return {type:"function",exec:parsedColumn[2],column:parsedColumn[3]};
                    }
                    if(parsedColumn[4]){
                        return {type:"compound",table:parsedColumn[5],column:parsedColumn[6]};
                    }
                    if(parsedColumn[7]){
                        return {type:"column",column:parsedColumn[7]};
                    }
                    return {};
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
                },
                "where":function(where){
                    return "";
                }
            }
        },
    };
    parserModules["sql"]=function(text){
        return IndexSQLParser.parseText(text);
    }
})()