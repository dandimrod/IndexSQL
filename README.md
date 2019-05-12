IndexSQL is a tool that helps with the use of IndexedDB by making it SQL like. Its use is as simple as:

    var indexSQL=new IndexSQL("demo");
    indexSQL.execute("CREATE TABLE test (column1 STRING, column2 BOOLEAN, column3 NUMBER);",
        function(result){
            //DO SOMETHING
        }
    );

To add it into your webpage you can use:  
    <script src="https://dandimrod.github.io/IndexSQL/src/IndexSQL.min.js" type="​​application/javascript"></script>

For more information, please check our [documentation](https://dandimrod.github.io/IndexSQL/docs).  
You can also check a living [demo](https://dandimrod.github.io/IndexSQL/demo.html).