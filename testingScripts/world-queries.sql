select distinct Language from countrylanguage;
Insert into countrylanguage VAlues ("ESP","Andalú",false,100);
select * from countrylanguage where CountryCode="ESP";
update countrylanguage set IsOfficial=true where Language="Andalú";
