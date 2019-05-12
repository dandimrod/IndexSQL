IndexSQL is a tool that helps with the use of IndexedDB by making it SQL like. Its use is as simple as:

    var indexSQL=new IndexSQL("demo");
    indexSQL.execute("CREATE TABLE test ( column1 STRING, column2 BOOLEAN, column3 NUMBER);",
        function(result){
            //DO SOMETHING
        }
    );

For more information, please check our [documentation](dandimrod.github.io/docs/index.html).  
You can also check a living [demo](dandimrod.github.io/demo.html)