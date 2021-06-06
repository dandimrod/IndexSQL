(function(){
    //https://github.com/shaunpersad/sql-where-parser/blob/master/sql-where-parser.min.js
    !function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.SqlWhereParser=t()}}(function(){var t;return function t(e,r,n){function o(s,u){if(!r[s]){if(!e[s]){var c="function"==typeof require&&require;if(!u&&c)return c(s,!0);if(i)return i(s,!0);var a=new Error("Cannot find module '"+s+"'");throw a.code="MODULE_NOT_FOUND",a}var f=r[s]={exports:{}};e[s][0].call(f.exports,function(t){var r=e[s][1][t];return o(r?r:t)},f,f.exports,t,e,r,n)}return r[s].exports}for(var i="function"==typeof require&&require,s=0;s<n.length;s++)o(n[s]);return o}({1:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},s=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),u=t("es6-symbol"),c=t("tokenize-this"),a=u("-"),f=1,l=2,p=3,h=o({},a,f),y=function(){function t(e,r,o){n(this,t),this.value=e,this.type=r,this.precedence=o}return s(t,[{key:"toJSON",value:function(){return this.value}},{key:"toString",value:function(){return""+this.value}}]),t}(),d=function(){function t(e){var r=this;n(this,t),e||(e={}),e=Object.assign({},this.constructor.defaultConfig,e),this.tokenizer=new c(e.tokenizer),this.operators={},e.operators.forEach(function(t,e){Object.keys(t).concat(Object.getOwnPropertySymbols(t)).forEach(function(n){r.operators[n]=new y(n,t[n],e)})})}return s(t,[{key:"parse",value:function(t,e){var r=this,n=[],o=[],i=void 0,s=0,u=!1;for(e||(e=this.defaultEvaluator),this.tokenizer.tokenize("("+t+")",function(t,c){if(s++,"string"!=typeof t||c)o.push(t),u=!1;else{var f=t.toUpperCase();if(r.operators[f]){if("BETWEEN"===i&&"AND"===f)return void(i="AND");for("-"!==f||1!==s&&!u||(f=a);n[n.length-1]&&"("!==n[n.length-1]&&r.operatorPrecedenceFromValues(f,n[n.length-1]);){for(var l=r.operators[n.pop()],p=[],h=l.type;h--;)p.unshift(o.pop());o.push(e(l.value,p))}n.push(f),i=f,u=!0}else if("("===t)n.push(t),u=!0;else if(")"===t){for(;n.length&&"("!==n[n.length-1];){for(var y=r.operators[n.pop()],d=[],m=y.type;m--;)d.unshift(o.pop());o.push(e(y.value,d))}if(!n.length)throw new SyntaxError("Unmatched parenthesis.");n.pop(),u=!1}else o.push(t),u=!1}});n.length;){var c=n.pop();if("("===c)throw new SyntaxError("Unmatched parenthesis.");for(var f=this.operators[c],l=[],p=f.type;p--;)l.unshift(o.pop());o.push(e(f.value,l))}if(o.length>1)throw new SyntaxError("Could not reduce to a single expression.");return o[0]}},{key:"toArray",value:function(t){var e=this,r=[],n=0,o=void 0,i=[];for(this.tokenizer.tokenize("("+t+")",function(t,s){switch(n++,t){case"(":i.push(r.length);break;case")":for(var u=i.pop(),c=r.splice(u,r.length);c&&c.constructor===Array&&1===c.length;)c=c[0];r.push(c);break;case"":break;case",":break;default:var f=null;s||(f=e.getOperator(t),"-"===t&&(1===n||"("===o||o&&o.constructor===y)&&(f=e.getOperator(a))),r.push(f?f:t)}o=t});r&&r.constructor===Array&&1===r.length;)r=r[0];return r}},{key:"operatorPrecedenceFromValues",value:function(t,e){return this.operators[e].precedence<=this.operators[t].precedence}},{key:"getOperator",value:function(t){return"string"==typeof t?this.operators[t.toUpperCase()]:"symbol"===("undefined"==typeof t?"undefined":i(t))?this.operators[t]:null}},{key:"defaultEvaluator",value:function(t,e){return t===a&&(t="-"),","===t?[].concat(e[0],e[1]):o({},t,e)}}],[{key:"defaultConfig",get:function(){return{operators:[{"!":f},h,{"^":l},{"*":l,"/":l,"%":l},{"+":l,"-":l},{"=":l,"<":l,">":l,"<=":l,">=":l,"!=":l},{",":l},{NOT:f},{BETWEEN:p,IN:l,IS:l,LIKE:l},{AND:l},{OR:l}],tokenizer:{shouldTokenize:["(",")",",","*","/","%","+","-","=","!=","!","<",">","<=",">=","^"],shouldMatch:['"',"'","`"],shouldDelimitBy:[" ","\n","\r","\t"]}}}},{key:"Operator",get:function(){return y}},{key:"OPERATOR_UNARY_MINUS",get:function(){return a}}]),t}();e.exports=d},{"es6-symbol":2,"tokenize-this":20}],2:[function(t,e,r){"use strict";e.exports=t("./is-implemented")()?Symbol:t("./polyfill")},{"./is-implemented":3,"./polyfill":18}],3:[function(t,e,r){"use strict";var n={object:!0,symbol:!0};e.exports=function(){var t;if("function"!=typeof Symbol)return!1;t=Symbol("test symbol");try{String(t)}catch(t){return!1}return!!n[typeof Symbol.iterator]&&(!!n[typeof Symbol.toPrimitive]&&!!n[typeof Symbol.toStringTag])}},{}],4:[function(t,e,r){"use strict";e.exports=function(t){return!!t&&("symbol"==typeof t||!!t.constructor&&("Symbol"===t.constructor.name&&"Symbol"===t[t.constructor.toStringTag]))}},{}],5:[function(t,e,r){"use strict";var n,o=t("es5-ext/object/assign"),i=t("es5-ext/object/normalize-options"),s=t("es5-ext/object/is-callable"),u=t("es5-ext/string/#/contains");n=e.exports=function(t,e){var r,n,s,c,a;return arguments.length<2||"string"!=typeof t?(c=e,e=t,t=null):c=arguments[2],null==t?(r=s=!0,n=!1):(r=u.call(t,"c"),n=u.call(t,"e"),s=u.call(t,"w")),a={value:e,configurable:r,enumerable:n,writable:s},c?o(i(c),a):a},n.gs=function(t,e,r){var n,c,a,f;return"string"!=typeof t?(a=r,r=e,e=t,t=null):a=arguments[3],null==e?e=void 0:s(e)?null==r?r=void 0:s(r)||(a=r,r=void 0):(a=e,e=r=void 0),null==t?(n=!0,c=!1):(n=u.call(t,"c"),c=u.call(t,"e")),f={get:e,set:r,configurable:n,enumerable:c},a?o(i(a),f):f}},{"es5-ext/object/assign":6,"es5-ext/object/is-callable":9,"es5-ext/object/normalize-options":13,"es5-ext/string/#/contains":15}],6:[function(t,e,r){"use strict";e.exports=t("./is-implemented")()?Object.assign:t("./shim")},{"./is-implemented":7,"./shim":8}],7:[function(t,e,r){"use strict";e.exports=function(){var t,e=Object.assign;return"function"==typeof e&&(t={foo:"raz"},e(t,{bar:"dwa"},{trzy:"trzy"}),t.foo+t.bar+t.trzy==="razdwatrzy")}},{}],8:[function(t,e,r){"use strict";var n=t("../keys"),o=t("../valid-value"),i=Math.max;e.exports=function(t,e){var r,s,u,c=i(arguments.length,2);for(t=Object(o(t)),u=function(n){try{t[n]=e[n]}catch(t){r||(r=t)}},s=1;s<c;++s)e=arguments[s],n(e).forEach(u);if(void 0!==r)throw r;return t}},{"../keys":10,"../valid-value":14}],9:[function(t,e,r){"use strict";e.exports=function(t){return"function"==typeof t}},{}],10:[function(t,e,r){"use strict";e.exports=t("./is-implemented")()?Object.keys:t("./shim")},{"./is-implemented":11,"./shim":12}],11:[function(t,e,r){"use strict";e.exports=function(){try{return Object.keys("primitive"),!0}catch(t){return!1}}},{}],12:[function(t,e,r){"use strict";var n=Object.keys;e.exports=function(t){return n(null==t?t:Object(t))}},{}],13:[function(t,e,r){"use strict";var n=Array.prototype.forEach,o=Object.create,i=function(t,e){var r;for(r in t)e[r]=t[r]};e.exports=function(t){var e=o(null);return n.call(arguments,function(t){null!=t&&i(Object(t),e)}),e}},{}],14:[function(t,e,r){"use strict";e.exports=function(t){if(null==t)throw new TypeError("Cannot use null or undefined");return t}},{}],15:[function(t,e,r){"use strict";e.exports=t("./is-implemented")()?String.prototype.contains:t("./shim")},{"./is-implemented":16,"./shim":17}],16:[function(t,e,r){"use strict";var n="razdwatrzy";e.exports=function(){return"function"==typeof n.contains&&(n.contains("dwa")===!0&&n.contains("foo")===!1)}},{}],17:[function(t,e,r){"use strict";var n=String.prototype.indexOf;e.exports=function(t){return n.call(this,t,arguments[1])>-1}},{}],18:[function(t,e,r){"use strict";var n,o,i,s,u=t("d"),c=t("./validate-symbol"),a=Object.create,f=Object.defineProperties,l=Object.defineProperty,p=Object.prototype,h=a(null);if("function"==typeof Symbol){n=Symbol;try{String(n()),s=!0}catch(t){}}var y=function(){var t=a(null);return function(e){for(var r,n,o=0;t[e+(o||"")];)++o;return e+=o||"",t[e]=!0,r="@@"+e,l(p,r,u.gs(null,function(t){n||(n=!0,l(this,r,u(t)),n=!1)})),r}}();i=function(t){if(this instanceof i)throw new TypeError("TypeError: Symbol is not a constructor");return o(t)},e.exports=o=function t(e){var r;if(this instanceof t)throw new TypeError("TypeError: Symbol is not a constructor");return s?n(e):(r=a(i.prototype),e=void 0===e?"":String(e),f(r,{__description__:u("",e),__name__:u("",y(e))}))},f(o,{for:u(function(t){return h[t]?h[t]:h[t]=o(String(t))}),keyFor:u(function(t){var e;c(t);for(e in h)if(h[e]===t)return e}),hasInstance:u("",n&&n.hasInstance||o("hasInstance")),isConcatSpreadable:u("",n&&n.isConcatSpreadable||o("isConcatSpreadable")),iterator:u("",n&&n.iterator||o("iterator")),match:u("",n&&n.match||o("match")),replace:u("",n&&n.replace||o("replace")),search:u("",n&&n.search||o("search")),species:u("",n&&n.species||o("species")),split:u("",n&&n.split||o("split")),toPrimitive:u("",n&&n.toPrimitive||o("toPrimitive")),toStringTag:u("",n&&n.toStringTag||o("toStringTag")),unscopables:u("",n&&n.unscopables||o("unscopables"))}),f(i.prototype,{constructor:u(o),toString:u("",function(){return this.__name__})}),f(o.prototype,{toString:u(function(){return"Symbol ("+c(this).__description__+")"}),valueOf:u(function(){return c(this)})}),l(o.prototype,o.toPrimitive,u("",function(){var t=c(this);return"symbol"==typeof t?t:t.toString()})),l(o.prototype,o.toStringTag,u("c","Symbol")),l(i.prototype,o.toStringTag,u("c",o.prototype[o.toStringTag])),l(i.prototype,o.toPrimitive,u("c",o.prototype[o.toPrimitive]))},{"./validate-symbol":19,d:5}],19:[function(t,e,r){"use strict";var n=t("./is-symbol");e.exports=function(t){if(!n(t))throw new TypeError(t+" is not a symbol");return t}},{"./is-symbol":4}],20:[function(e,r,n){(function(o){!function(e){if("object"==typeof n&&"undefined"!=typeof r)r.exports=e();else if("function"==typeof t&&t.amd)t([],e);else{var i;i="undefined"!=typeof window?window:"undefined"!=typeof o?o:"undefined"!=typeof self?self:this,i.TokenizeThis=e()}}(function(){return function t(r,n,o){function i(u,c){if(!n[u]){if(!r[u]){var a="function"==typeof e&&e;if(!c&&a)return a(u,!0);if(s)return s(u,!0);var f=new Error("Cannot find module '"+u+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[u]={exports:{}};r[u][0].call(l.exports,function(t){var e=r[u][1][t];return i(e?e:t)},l,l.exports,t,r,n,o)}return n[u].exports}for(var s="function"==typeof e&&e,u=0;u<o.length;u++)i(o[u]);return i}({1:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i="modeNone",s="modeDefault",u="modeMatch",c=function(t,e){return t.length>e.length?-1:t.length<e.length?1:0},a=function(){function t(e,r,o){n(this,t),this.factory=e,this.str=r,this.forEachToken=o,this.previousChr="",this.toMatch="",this.currentToken="",this.modeStack=[i]}return o(t,[{key:"getCurrentMode",value:function(){return this.modeStack[this.modeStack.length-1]}},{key:"setCurrentMode",value:function(t){return this.modeStack.push(t)}},{key:"completeCurrentMode",value:function(){var t=this.getCurrentMode();return t===s&&this.pushDefaultModeTokenizables(),(t===u&&""===this.currentToken||""!==this.currentToken)&&this.push(this.currentToken),this.currentToken="",this.modeStack.pop()}},{key:"push",value:function(t){var e="";if(this.factory.convertLiterals&&this.getCurrentMode()!==u)switch(t.toLowerCase()){case"null":t=null;break;case"true":t=!0;break;case"false":t=!1;break;default:isFinite(t)&&(t=Number(t))}else e=this.toMatch;this.forEachToken&&this.forEachToken(t,e)}},{key:"tokenize",value:function(){for(var t=0;t<this.str.length;)this.consume(this.str.charAt(t++));for(;this.getCurrentMode()!==i;)this.completeCurrentMode()}},{key:"consume",value:function(t){this[this.getCurrentMode()](t),this.previousChr=t}},{key:i,value:function(t){return this.factory.matchMap[t]?(this.setCurrentMode(u),void(this.toMatch=t)):(this.setCurrentMode(s),this.consume(t))}},{key:s,value:function(t){return this.factory.delimiterMap[t]?this.completeCurrentMode():this.factory.matchMap[t]?(this.completeCurrentMode(),this.consume(t)):(this.currentToken+=t,this.currentToken)}},{key:"pushDefaultModeTokenizables",value:function(){for(var t=0,e=1/0,r=null;this.currentToken&&t<this.factory.tokenizeList.length;){var n=this.factory.tokenizeList[t++],o=this.currentToken.indexOf(n);o!==-1&&o<e&&(e=o,r=n)}if(r)return e>0&&this.push(this.currentToken.substring(0,e)),e!==-1?(this.push(r),this.currentToken=this.currentToken.substring(e+r.length),this.pushDefaultModeTokenizables()):void 0}},{key:u,value:function(t){if(t===this.toMatch){if(this.previousChr!==this.factory.escapeCharacter)return this.completeCurrentMode();this.currentToken=this.currentToken.substring(0,this.currentToken.length-1)}return this.currentToken+=t,this.currentToken}}]),t}(),f=function(){function t(e){var r=this;n(this,t),e||(e={}),e=Object.assign({},this.constructor.defaultConfig,e),this.convertLiterals=e.convertLiterals,this.escapeCharacter=e.escapeCharacter,this.tokenizeList=[],this.tokenizeMap={},this.matchList=[],this.matchMap={},this.delimiterList=[],this.delimiterMap={},e.shouldTokenize.sort(c).forEach(function(t){r.tokenizeMap[t]||(r.tokenizeList.push(t),r.tokenizeMap[t]=t)}),e.shouldMatch.forEach(function(t){r.matchMap[t]||(r.matchList.push(t),r.matchMap[t]=t)}),e.shouldDelimitBy.forEach(function(t){r.delimiterMap[t]||(r.delimiterList.push(t),r.delimiterMap[t]=t)})}return o(t,[{key:"tokenize",value:function(t,e){var r=new a(this,t,e);return r.tokenize()}}],[{key:"defaultConfig",get:function(){return{shouldTokenize:["(",")",",","*","/","%","+","-","=","!=","!","<",">","<=",">=","^"],shouldMatch:['"',"'","`"],shouldDelimitBy:[" ","\n","\r","\t"],convertLiterals:!0,escapeCharacter:"\\"}}}]),t}();e.exports=f},{}]},{},[1])(1)})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)});
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
            try{
                let queryArray = line.split(/\s+/g);
                if(queryArray[0].toLowerCase()!=="end"){
                    if (db.utils.checkTransaction()) {
                        return db.utils.checkTransaction();
                    }
                }
                if (this.commands[queryArray[0].toLowerCase()] && queryArray[0].toLowerCase()!=="utils") {
                    result = this.commands[queryArray[0].toLowerCase()](line);
                } else {
                    result = { "error": "Operation not supported" };
                }
            }catch(error){
                debugger;
                result={ error:"Unexpected error"}
            }
            if(result.error){
                db.utils.sendError();
            }
            return result;
        },
        "commands": {
            //Post query processing
            //In database join processing
            "select": function (query) {
                debugger;
                let parsedQuery= /^select\s+(distint\s+)?(.*)\s+?from\s+(.*)$/i.exec(query)
                if (parsedQuery === null) {
                    return { "error": "Query malformed" };
                }
                let distint=!!parsedQuery[1];
                let columnList=parsedQuery[2].trim()==="*"?true:parsedQuery[2].split(",").map(this.utils.columnParserSelect);
                let params=this.utils.splitter(parsedQuery[3], ["order by", "join", "where", "limit", "offset"], "from");
                if(params["from"]){
                    params["from"]=this.utils.trimString(params["from"]);
                }else{
                    return {error:"No table detected"}
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
                    params["join"]=this.utils.join(params["join"])
                }
                if(params["where"]){
                    params["where"]=this.utils.where(params["where"].trim(),params["from"],params["join"]);
                }
                if(params["limit"]){
                    params["limit"]=new Number(params["limit"].trim());
                }
                if(params["offset"]){
                    params["offset"]=new Number(params["offset"].trim());
                }
                let queryResult=db.data.getData(params["from"],params["where"],params["join"]);
                if(queryResult.error){
                    return queryResult;
                }
                queryResult.result=Object.values(queryResult.result);
                queryResult.result=queryResult.result.map((values)=>{
                    let result={}
                    columnList.forEach((column)=>{
                        switch (column.type) {
                            case "column":
                                result[column.column]=values[column.column]
                                break;
                            case "compound":
                                if(column.table===params["from"]){
                                    result[column.column]=values[column.column]
                                }else{
                                    let myJoin=params["join"].find((join)=>join.foreingTable===column.table);
                                    result[myJoin.column+"."+column.column]=values[myJoin.column][myJoin.foreingColumn];
                                }
                                break;
                            case "function":
                                switch (column.exec.toLowerCase()) {
                                    case "count":
                                       result[column.exec+"("+column.column+")"] = queryResult.result.length;
                                    break;
                                    case "avg":
                                		result[column.exec+"("+column.column+")"] = queryResult.result.reduce((ac,col)=>ac+col[column.column])/queryResult.result.length;
                                    break;
                                    case "sum":
										result[column.exec+"("+column.column+")"] = queryResult.result.reduce((ac,col)=>ac+col[column.column]);
                                    break;
                                    case "min":
                                        result[column.exec+"("+column.column+")"] = Math.min.apply(Math, queryResult.result.map(col=>col[column.column]));
                                    break;
                                    case "max":
                                        result[column.exec+"("+column.column+")"] = Math.max.apply(Math, queryResult.result.map(col=>col[column.column]));
                                    break;
                                }
                                break;
                        }
                    })
                    return result;
                })
				if(distint){
					queryResult.result=queryResult.result.filter((v,i,a)=>a.findIndex(t=>(JSON.stringify(t) === JSON.stringify(v)))===i)
				}
                if(params["order by"]){
					queryResult.result=queryResult.result.sort((a,b)=>{
                        let result=0;
                        for (let index = 0; index < params["order by"].length; index++) {
                            const order = params["order by"][index];
                            switch(typeof a[order.column]){
                                case "string":
                                    result=a[order.column].localeCompare(b[order.column]);
                                    break;
                                case "number":
                                    result=a[order.column]-b[order.column];
                                    break;
                                case "boolean":
                                    result=(a[order.column] === b[order.column])? 0 : a[order.column]? -1 : 1;
                                    break;
                            }
                            if(order.desc){
                                result=-result;
                            }
                            if(result!==0){
                                break;
                            }
                        }
                        return result;
                    })
                }
                if(!isNaN(params["limit"])){
                    if(!isNaN(params["offset"])){
                        queryResult.result=queryResult.result.slice(params["offset"],params["limit"]+params["offset"]);
                    }else{
                        queryResult.result=queryResult.result.slice(0,params["limit"]);
                    }
                }
                
                return queryResult;
            },
            "insert": function (query){
                debugger;
                let parsedQuery = /^insert\s+into\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`|)\s+(?:\((.*?)\)\s+)?values\s+\((.*)\)\s*$/i.exec(query);
                if(parsedQuery === null){
                    return { "error": "Query malformed" };
                }
                let table=this.utils.trimString(parsedQuery[1]);
                let columns;
                let values;
                let result={};
                if(parsedQuery[2]){
                    columns=parsedQuery[2].trim().split(",").map(column=>this.utils.trimString(column));
                }else{
                    let tableData=db.tables.getTable(table);
                    if(tableData.error){
                        return tableData;
                    }
                    columns=Object.keys(tableData.columns);
                }
                values=parsedQuery[3].trim().split(",").map(this.utils.extractValues);
                try{
                    columns.forEach((column,index)=>result[column]=values[index]);
                }catch(error){
                    return {"error":"Not enough values for columns"};
                }
                return db.data.createData(table,result);
            },
            //TODO
            "update":function(query){
                let parsedQuery= /^update\s+([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`|)\s+set\s+(.*)$/i.exec(query)
                if (parsedQuery === null) {
                    return { "error": "Query malformed" };
                }
                let table=this.utils.trimString(parsedQuery[1]);
                let params=this.utils.splitter(parsedQuery[2], ["join", "where"], "set");
                if(params["set"]){
                    let result={};
                    params["set"].split(",").forEach((set)=>{
                        let parsedSet=/^([a-zA-Z0-9_]+|"[^"]+"|'[^']+'|`[^`]+`|)\s*=\s*(.*)$/.exec(set);
                        let key=this.utils.trimString(parsedSet[1]);
                        let value=this.utils.extractValues(parsedSet[2]);
                        result[key]=value;
                    })
                    params["set"]=result;
                }else{
                    return { "error": "Query malformed" };
                }
                if(params["join"]){
                    params["join"]=this.utils.join(params["join"])
                }
                if(params["where"]){
                    params["where"]=this.utils.where(params["where"].trim(),params["from"],params["join"]);
                }
                return db.data.updateData(table,params["set"],params["where"],params["join"]);
            },
            "delete":function(query){
                let parsedQuery= /^delete\s+from\s+(.*)$/gmi.exec(query);
                if (parsedQuery === null) {
                    return { "error": "Query malformed" };
                }
                let params=this.utils.splitter(parsedQuery[1], ["join", "where"], "from");
                if(params["from"]){
                    params["from"]=this.utils.trimString(params["from"]);
                }else{
                    return {error:"No table detected"}
                }
                if(params["join"]){
                    params["join"]=this.utils.join(params["join"])
                }
                if(params["where"]){
                    params["where"]=this.utils.where(params["where"].trim(),params["from"],params["join"]);
                }
                return db.data.deleteData(params["from"],params["where"],params["join"]);
            },
            //NEEDS REVIEW
            "create": function (query) {
                debugger;
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
                        result[start[start.length-1][0]]=query.substring(start[start.length-1][0].length+start[start.length-1][1],query.length);
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
                "columnParserSelect":function(column){
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
                "extractColumnsCreate": function (parameters) {
                    let result = { keys: { primary: [], foreign: [] }, columns: {} };
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
                                result.columns[parametersBreak[1]] = column;
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
                "extractValues":function(value){
                    value=value.trim();
                    if(value.toLowerCase()==="true"){
                        return true;
                    }
                    if(value.toLowerCase()==="false"){
                        return false;
                    }
                    if(value.toLowerCase()==="null"){
                        return null;
                    }
                    if(!isNaN(value)){
                        return new Number(value);
                    }
                    return this.utils.trimString(value);
                },
                "join":function(joinString){
                    let stringSearcher='([a-zA-Z0-9_]+|"[^"]+"|\'[^\']+\'|`[^`]+`)';
                    let formatedJoin=new RegExp(`^${stringSearcher}\\s+on\\s+${stringSearcher}.${stringSearcher}\\s*=\\s*${stringSearcher}.${stringSearcher}$`,"i").exec(joinString.trim());
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
                    return [{foreingTable,foreingColumn,column}];
                },
                "where":function(where,tableName,joins){
                    debugger;
                    const parser = new SqlWhereParser();
                    let parsed=parser.parse(tokenize(where));
                    function tokenize(string){
                        let regexString='[^"\'`]+|"[^"]+"|\'[^\']+\'|`[^`]`+';
                        let tokenizedString=string.match(new RegExp(regexString,"gi"));
                        tokenizedString=tokenizedString.map((token)=>{
                            if(token.startsWith('"')){
                                return `"'${token.slice(1, -1).replace(/'/gi,"\\'")}'"`;
                            }
                            if(token.startsWith("'")||token.startsWith("`")){
                                return `'"${token.slice(1, -1).replace(/"/gi,'\\"')}"'`;
                            }
                            return token
                        });
                        return tokenizedString.join("");
                    }
                    function toJs(data){
                        if(data["!"]){
                            return `!(${toJs(data["!"][0])})`;
                        }
                        else if(data["NOT"]){
                            return `!(${toJs(data["NOT"][0])})`;
                        }
                        else if(data["-"]){
                            if(data["-"][1]){
                                let operator="-"
                                return `(${toJs(data[operator][0])})${operator}(${toJs(data[operator][1])})`
                            }else{
                                return `(-(${data["-"][0]}))`
                            }
                        }
                        else if(["^","*","/","%","+","<",">","<=",">="].find(op=>data[op])){
                            let operator=["^","*","/","%","+","-","<",">","<=",">="].find(op=>data[op]);
                            return `(${toJs(data[operator][0])})${operator}(${toJs(data[operator][1])})`
                        }
                        else if(data["="]){
                            return `(${toJs(data["="][0])})===(${toJs(data["="][1])})`;
                        }
                        else if(data["!="]){
                            return `(${toJs(data["!="][0])})!==(${toJs(data["!="][1])})`;
                        }
                        else if(data["AND"]){
                            return `(${toJs(data["AND"][0])})&&(${toJs(data["AND"][1])})`;
                        }
                        else if( data["OR"]){
                            return `(${toJs(data["OR"][0])})||(${toJs(data["OR"][1])})`;
                        }
                        else if(data["BETWEEN"]){
                            let column=data["BETWEEN"][0];
                            let not="";
                            if(data["BETWEEN"][0]["NOT"]){
                                not="!"
                                column=data["BETWEEN"][0]["NOT"][0];
                            }
                            return `${not}((${toJs(column)}<${data["BETWEEN"][1]})&&(${toJs(column)}>${data["BETWEEN"][2]}))`;
                        }
                        else if(data["LIKE"]){
                            debugger;
                            let comparator=data["LIKE"][1];
                            comparator=comparator.slice(1,-1);
                            comparator=comparator.replace(/([[\\^$.|?*+()\]])/gi,"\\$1");
                            comparator=comparator.replace(/%/gi,".*");
                            comparator=comparator.replace(/_/gi,".");
                            comparator="^"+comparator+"$";
                            let column=data["LIKE"][0];
                            let not="";
                            if(data["LIKE"][0]["NOT"]){
                                not="!"
                                column=data["LIKE"][0]["NOT"][0];
                            }
                            return `${not}(/${comparator}/.test(${column}))`;
                        }
                        else if(data["IN"]){
                            return '';
                        }
                        else{
                            if(typeof data==="string"){
                                let parsedColumns=/^([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`)\.([^"'`\s.]+|"[^"]+"|'[^']+'|`[^`]+`)$/.exec(data);
                                if(parsedColumns!==null){
                                    let parsedTable=this.utils.trimString(parsedColumns[1]);
                                    let parsedColumn=this.utils.trimString(parsedColumns[2]);
                                    if(parsedTable===tableName){
                                        return `data.${parsedColumn}`
                                    }else{
                                        let ourJoin=joins.find(join=>join.foreingTable===parsedTable);
                                        if(!ourJoin){
                                            return `data.${parsedColumn}` 
                                        }else{
                                            return `data.${ourJoin.column}.${parsedColumn}`
                                        }
                                    }
                                }else{
                                    if (data.startsWith('"') || data.startsWith("'") || data.startsWith("`")) {
                                        return data;
                                    }else{
                                        return `data.${data}`
                                    }
                                }
                            }else{
                                return data;
                            }
                        }
                    }
                    let js=toJs(parsed);
                    return js;
                }
            }
        },
    };
    parserModules["sql"]=function(text){
        return IndexSQLParser.parseText(text);
    }
})()