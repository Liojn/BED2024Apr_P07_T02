/*User table created, for link to Event and others respectively*/
CREATE TABLE Users (
  UserID INT PRIMARY KEY IDENTITY(1,1),
  Username NVARCHAR(255) NOT NULL UNIQUE,  
  Email NVARCHAR(255) NOT NULL UNIQUE,
  Password NVARCHAR(255) NOT NULL,
);


CREATE TABLE Events (
  EventID INT PRIMARY KEY IDENTITY(1,1),  -- Auto-incrementing integer as primary key
  EventName VARCHAR(255) NOT NULL,       
  EventDate DATE NOT NULL,                
  StartTime DATETIME NOT NULL,             
  EndTime DATETIME NOT NULL,               
  Location VARCHAR(255),                   -- Location of the event
  Description VARCHAR(500),                -- Detailed description of the event 
  CreatedByUserID INT FOREIGN KEY REFERENCES Users(UserID),
   CONSTRAINT chk_EndTimeAfterStartTime CHECK (StartTime <= EndTime)  -- Optional check constraint
);