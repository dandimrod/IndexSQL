START TRANSACTION;
DROP TABLE Persons;
DROP TABLE Orders;
CREATE TABLE Persons (
    PersonID number NOT_NULL AUTO_INCREMENT,
	Name string NOT_NULL,
	IsMale boolean NOT_NULL,
    PRIMARY KEY (PersonID)
);
CREATE TABLE Orders (
    OrderID number NOT_NULL AUTO_INCREMENT,
    OrderNumber number NOT_NULL,
    PersonID number,
    PRIMARY KEY (OrderID),
    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
);
INSERT INTO Persons (Name, IsMale)
	VALUES ("pipo", true);
INSERT INTO Persons (Name, IsMale)
	VALUES ("pepa", false);
INSERT INTO Orders (OrderNumber, PersonID) 
	VALUES (1,0);
SELECT Name FROM Persons;
Select * from Persons where Name="pipo";
SELECT * FROM Persons WHERE IsMale=false;
SELECT * FROM Persons Where PersonID=0;
Select * from Persons where Name="pipo" OR IsMale=false;
Select * from Persons where Name="pipo" AND IsMale=false;
Select * from Persons where NOT( Name="pipo" AND IsMale=false);
UPDATE Persons SET IsMale=false;
SELECT * FROM Persons;
UPDATE Persons SET IsMale=true WHERE Name="pipo";
SELECT * FROM Persons;
DELETE FROM Orders;
SELECT * FROM Orders;
DELETE FROM Persons WHERE IsMale=false;
SELECT * FROM Persons;
END TRANSACTION;