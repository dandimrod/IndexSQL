/**
 * The MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

 /**
  * 
  * @param {*} dbName 
  * @param {*} options 
  */
function IndexSQL(dbName){
    let db={};
    let requestDB = indexedDB.open("IndexSQL",1);
    requestDB.onerror = function(event) {
        log.warn("Database error: " + event.target.errorCode);
    };
    requestDB.onupgradeneeded = function(event) {
        db = event.target.result;
        let store = db.createObjectStore("databases", { keypath : "name"  });
    };
    db.server=function(){
        debugger;
        let data={};
        var DBUtils={
            name:"",
            loaded:false,
            transaction:false,
            save:function(){
                let requestDB = indexedDB.open("IndexSQL",1);
                requestDB.onerror = function(event) {
                    log.warn("Database error: " + event.target.errorCode);
                };
                requestDB.onsuccess=function(event){
                    let db=event.target.result;
                    let transaction = db.transaction(["databases"], "readwrite");
                    
                    transaction.onerror = function(event) {
                        console.warn("Database error: " + event.target.errorCode);
                    };
            
                    transaction.oncomplete = function(event) {
                        //SAVED
                    };
                    
                    var objectStore = transaction.objectStore("databases");
                    var request = objectStore.put({data:JSON.stringify(data)},DBUtils.name);
                }
            },
            load:function(){
                let requestDB = indexedDB.open("IndexSQL",1);
                requestDB.onerror = function(event) {
                    log.warn("Database error: " + event.target.errorCode);
                };
                requestDB.onsuccess=function(event){
                    let db=event.target.result;
                    let transaction = db.transaction(["databases"], "readonly");
                  
                    transaction.onerror = function(event) {
                        console.warn("Database error: " + event.target.errorCode);
                    };
            
                    transaction.oncomplete = function(event) {
                        if(request.result){
                            data=JSON.parse(request.result.data);
                        }else{
                            DBUtils.save();
                        }
                        DBUtils.loaded=true;
                    };
                    
                    var objectStore = transaction.objectStore("databases");
                    var request = objectStore.get(DBUtils.name);
                }
            },
            drop:function(){
                let requestDB = indexedDB.open("IndexSQL",1);
                requestDB.onerror = function(event) {
                    log.warn("Database error: " + event.target.errorCode);
                };
                requestDB.onsuccess=function(event){
                    let db=event.target.result;
                    let transaction = db.transaction(["databases"], "readwrite");
                
                    transaction.onerror = function(event) {
                        console.warn("Database error: " + event.target.errorCode);
                    };
            
                    transaction.oncomplete = function(event) {
                        console.log("Database "+DBUtils.name+" has been dropped")
                        postMessage({end:true});
                    };
                    
                    var objectStore = transaction.objectStore("databases");
                    var request = objectStore.delete(DBUtils.name);
                }
            }
        };
        var SQLParser={
            parse:function(querys,id){
                if(DBUtils.loaded){
                    postMessage({id,response:SQLParser.parseAll(querys)});
                }else{
                    setTimeout(function(querys,id){
                        return function(){
                            SQLParser.parse(querys,id)
                        };
                    }(querys,id),500);
                }
            },
            parseAll:function(querys){
                querys=querys.split(";");
                let response=[];
                for (let index = 0; index < querys.length-1; index++) {
                    const query = querys[index];
                    response[index]=this.parser(query);
                    if(DBUtils.transaction){
                        if(response[index].error){
                            response[index].error=response[index].error+". Transaction cancelled";
                            break;
                        }
                    }
                }
                return response;
            },
            parser:function(query){
                query=query.replace(/(\r\n|\n|\r)/gm," ").trim();
                let operation=query.split(" ")[0].toUpperCase();
                switch (operation) {
                    case "SELECT":
                        return this.select(query);
                    case "INSERT":
                        return this.insert(query);
                    case "CREATE":
                        return this.create(query);
                    case "DROP":
                        return this.drop(query);
                    case "TRUNCATE":
                        return this.trucate(query);
                    case "START":
                        return this.start(query);
                    case "END":
                        return this.end(query);
                    default:
                        return {error:"Not supported operation"};
                }
            },
            select:function(query){
                let from=function(fromStatement){
                    let keywords=["WHERE","ORDER"];
                    let macthes={};
                    let dividedFrom=fromStatement.split(" ");
                    let lastMatch="FROM";
                    for (let index = 0; index < dividedFrom.length; index++) {
                        const element = dividedFrom[index];
                        if(keywords.includes(element.toUpperCase())){
                            lastMatch=element.toUpperCase();
                        }else{
                            macthes[lastMatch]=macthes[lastMatch]+" "+element;
                        }
                    }
                    keywords.order=keywords.order.substring(3);
                    return keywords;
                }
                let selectRegex=/^SELECT\s*(?<distint>DISTINCT)?\s*(?<columns>.*)\s*FROM(?<from>.*)$/gmi;
                let macthes=selectRegex.exec(query).groups;
                matches={...from(macthes.from), ...matches};
                let table = data.find(function(a){
                    return macthes.from===a.split(";")[0];
                });
                if(save.where){
                    
                }
                if(table===undefined){
                    return {error:"Table not found"};
                }
                
            },
            insert:function(query){
                let insertRegex=/^INSERT\s*INTO\s*(?<tableName>\w*)\s*(?:\((?<columns>.*)\))?\s*VALUES\s*\((?<values>.*)\)\s*$/gmi;
                let matches=insertRegex.exec(query);
                if(matches===null){
                    return {error:"Not supported operation"};
                }
                matches = matches.groups;
                let table = tables.find(data,matches.tableName);
                if(!table){
                    return {error:"This table doesn't exists"};
                }
                let columnOrder=[];
                if(matches.colums){
                    let columns=matches.columns.split(",");
                    columns.forEach(element => {
                        columnOrder.push(element.trim());
                    });
                }else{
                    for (const key in table) {
                        if (table.hasOwnProperty(key)) {
                            const element = table[key];
                            columnOrder[element.split(";")[1]]=element.split(";")[0]
                        }
                    }
                }
                let values=matches.values.split(",");
                for (let index = 0; index < values.length; index++) {
                    const element = values[index];
                    values[index]=element.trim();
                }
                let result=tables.insert(matches.tableName,table,values,columnOrder);
                if(result.error){
                    return result;
                }
                if(!DBUtils.transaction){
                    DBUtils.save();
                }
                return result;
            },
            create:function(query){
                function getParameters(parameters){
                    //DELETE PARENTHESIS
                    parameters=parameters.slice(1,-1);
                    let result={constraints:[],parameters:[]};
                    let inlineConstraints=["NOT_NULL","UNIQUE","DEFAULT","AUTO_INCREMENT","CHECK"];
                    let datatypes=["STRING","NUMBER","BOOLEAN"]
                    let parametersBreak=parameters.split(",");
                    for (let index = 0; index < parametersBreak.length; index++) {
                        const parameterString = parametersBreak[index].trim();
                        if(parameterString.toUpperCase().includes("KEY")){
                            if(parameterString.toUpperCase().includes("PRIMARY")){
                                let primaryRegex=/^PRIMARY KEY \((?<varName>.*)\)$/gmi;
                                let key=primaryRegex.exec(parameterString).groups["varName"];
                                if(result.parameters.find(function(a){return a.name===key&&a.datatype==="NUMBER"})){
                                    result.constraints.push(parameterString);
                                }else{
                                    return {error:"PRIMARY KEY does not exist"};
                                }
                            }else{
                                let foreingRegex=/^^FOREIGN KEY \((?<varName>.*)\) REFERENCES (?<referTable>.*)\((?<referName>.*)\)$/gmi;
                                let groups=foreingRegex.exec(parameterString).groups;
                                if(!result.parameters.find(function(a){return a.name===groups["varName"]&&a.datatype==="NUMBER"})){
                                    return {error:"FOREIGN KEY does not exist"};
                                }
                                if(!tables.find(tables.find(data,groups["referTable"]),groups["referName"])){
                                    return {error:"FOREIGN KEY does not exist in foreign table"};
                                }
                                result.constraints.push(parameterString);
                            }
                        }else{
                            let parameterBreak=parameterString.split(" ");
                            let parameter={
                                name:parameterBreak[0]
                            };
                            if(datatypes.includes(parameterBreak[1].toUpperCase())){
                                parameter.datatype=parameterBreak[1].toUpperCase();
                            }else{
                                return {error:"Parameter "+parameterBreak[0]+" has a non valid datatype"}
                            }
                            for (let index = 2; index < parameterBreak.length; index++) {
                                parameter.constraints="";
                                const element = parameterBreak[index];
                                if(inlineConstraints.includes(element.toUpperCase())){
                                    switch (element.toUpperCase()) {
                                        case "NOT_NULL":
                                            parameter.constraints=parameter.constraints+"NOT NULL,"
                                            break;

                                        case "UNIQUE":
                                            parameter.constraints=parameter.constraints+"UNIQUE,"
                                            break;
                                        case "AUTO_INCREMENT":
                                            if(parameter.datatype!=="NUMBER"){
                                                return {error:"The parameter "+parameter.name+" is set to AUTO_INCREMENT but is not type NUMBER"};
                                            }
                                            parameter.constraints=parameter.constraints+"AUTO_INCREMENT,"
                                            break;
                                        case "DEFAULT":
                                            let defaultCase=[];
                                            for (let index2 = index; index2 < parameterBreak.length; index2++) {
                                                const element = parameterBreak[index2];
                                                if(inlineConstraints.includes(element.toUpperCase())){
                                                    break;
                                                }else{
                                                    defaultCase.push(element);
                                                }
                                            }
                                            parameter.constraints=parameter.constraints+"DEFAULT "+defaultCase.join(" ")+","
                                            break;
                                        case "CHECK":
                                            let checkCase=[];
                                            for (let index2 = index; index2 < parameterBreak.length; index2++) {
                                                const element = parameterBreak[index2];
                                                if(inlineConstraints.includes(element.toUpperCase())){
                                                    break;
                                                }else{
                                                    checkCase.push(element);
                                                }
                                            }
                                            parameter.constraints=parameter.constraints+"CHECK "+checkCase.join(" ")+","
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                            result.parameters.push(parameter);
                        }
                    }
                    return result;
                }
                let createRegex=/^CREATE\s*TABLE\s*(?<tableName>\w*)\s*(?:(?<parameters>\(.*\))|(?:AS (?<selectCopy>.*)))$/gmi;
                let matches = createRegex.exec(query);
                if(matches===null){
                    return {error:"Not supported operation"};
                }
                matches = matches.groups;
                let table;
                if(tables.find(data,matches.tableName)){
                    return {message:"This table already exists"}
                }
                if(matches.parameters){
                    let parameters=getParameters(matches.parameters);
                    if(parameters.error){
                        return parameters;
                    }
                    table=new Table(parameters.parameters);
                    if(table.error){
                        return table;
                    }
                    data[matches.tableName+";"+parameters.constraints.join(",")]=table;
                }else{

                }
                if(!DBUtils.transaction){
                    DBUtils.save();
                }
                return{message:"Table created"}
            },
            drop:function(query){
                let dropRegex=/^DROP\s*TABLE\s*(?<tableName>\w*)\s*$/gmi;
                let matches=dropRegex.exec(query);
                if(matches===null){
                    return {error:"Not supported operation"};
                }
                matches = matches.groups;
                if(!tables.find(data,matches.tableName)){
                    return {message:"This table doesn't exists"}
                }
                delete data[tables.finder(data,matches.tableName)];
                if(!DBUtils.transaction){
                    DBUtils.save();
                }
                return{message:"Table dropped"}
            },
            trucate:function(query){
                let truncateRegex=/^TRUNCATE\s*TABLE\s*(?<tableName>\w*)\s*$/gmi;
                let matches=truncateRegex.exec(query);
                if(matches===null){
                    return {error:"Not supported operation"};
                }
                matches = matches.groups;
                if(!tables.find(data,matches.tableName)){
                    return {message:"This table doesn't exists"}
                }
                let table=tables.find(data,matches.tableName);
                for (let index = 0; index < table.length; index++) {
                    const element = table[index];
                    element=[];
                }
                if(!DBUtils.transaction){
                    DBUtils.save();
                }
                return{message:"Table truncated"}
            },
            start:function(query){
                let startRegex=/^START\s*TRANSACTION\s*$/gmi;
                let matches = startRegex.compile(query);
                if(matches){
                    DBUtils.transaction=true;
                    return {message:"Transaction starts"};
                }else{
                    return {error:"Not supported operation"};
                }
            },
            end:function(query){
                let endRegex=/^END\s*TRANSACTION\s*$/gmi;
                let matches = endRegex.compile(query);
                if(matches){
                    DBUtils.transaction=false;
                    DBUtils.save();
                    return {message:"Transaction ends"};
                }else{
                    return {error:"Not supported operation"};
                }
            }


        };
        function Table(variables){
            let table={};
            for (let index = 0; index < variables.length; index++) {
                const element = variables[index];
                if(!tables.find(table,element.name)){
                    if(element.constraints){
                        table[element.name+";"+index+";"+element.datatype+";"+element.constraints]={};
                    }else{
                        table[element.name+";"+index+";"+element.datatype]={};
                    }
                }else{
                    return {error:"Variable already exists"};
                }
            }
            return table;
        }
        var tables={
            find:function(container,search){
                for (const key in container) {
                    if (container.hasOwnProperty(key)) {
                        const element = container[key];
                        if(key.split(";")[0]===search){
                            return element;
                        }
                    }
                }
                return undefined;
            },
            finder:function(container,search){
                for (const key in container) {
                    if (container.hasOwnProperty(key)) {
                        const element = container[key];
                        if(key.split(";")[0]===search){
                            return key;
                        }
                    }
                }
                return undefined;
            },
            findColumn:function(table,column){
                for (const key in table) {
                    if (table.hasOwnProperty(key)) {
                        const element = table[key];
                        if(key.split(";")[0]===column){
                            return element;
                        }
                    }
                }
                return undefined;
            },
            insert:function(tableName,table,values,order){
                let tableData=tables.finder(data,tableName);
                let insertData=[];
                // This generates the data to insert and applies the constraits
                for (const key in table) {
                    if (table.hasOwnProperty(key)) {
                        const column = table[key];
                        let columnName=key.split(";")[0];
                        let index=order.indexOf(columnName);
                        let datatype=key.split(";")[2];
                        if(index){
                            //the insert contains the column

                        }else{
                            //the insert doesn't contain the column

                        }
                    }
                }
            }
        };
        function createDB(name){
            DBUtils.name=name;
            DBUtils.load();
        }
        function messageHandler(e){
            if(e.data.drop){
                DBUtils.drop();
            }else{
                SQLParser.parse(e.data.querys,e.data.id);
            }
        }
        onmessage=messageHandler;
    };
    db.id=0;
    db.callbacks=[];
    if(window.indexedDB){
        if(typeof(Worker) !== "undefined"){
            db.worker=new Worker(URL.createObjectURL(new Blob(["("+db.server.toString().slice(0,-1)+"createDB('"+dbName+"');})()"], {type: 'text/javascript'})));
            db.worker.onmessage=function(e){
                if(e.data.end){
                    db.worker.stop();
                    db.end=true;
                }
                db.callbacks[e.data.id](e.data.response);
                db.callbacks[e.data.id]=undefined;
            }
            db.query=function(query,callback){
                if(db.end){
                    console.warn("This database has been dropped already");
                    return;
                }
                db.worker.postMessage({querys:query,id:db.id});
                db.callbacks[db.id]=callback;
                db.id++;
            }
            db.drop=function(){
                if(db.end){
                    console.warn("This database has been dropped already");
                    return;
                }
                db.worker.postMessage({drop:true});
            }
        }else{
            console.warn("Browser does not support Web Workers");
            return this;
        }
    }else{
        console.warn("Browser does not support indexDB")
        return this;
    }
    this.execute=db.query;
    this.drop=db.drop;
    return this;
}