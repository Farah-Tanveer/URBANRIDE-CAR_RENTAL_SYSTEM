-----------------------------------------------------------
-- App user auth table and sequence
-----------------------------------------------------------

CREATE TABLE AppUser (
    ID NUMBER(10) PRIMARY KEY,
    FullName VARCHAR2(120) NOT NULL,
    Email VARCHAR2(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR2(200) NOT NULL,
    Phone VARCHAR2(30),
    CreatedAt DATE DEFAULT SYSDATE
);

CREATE SEQUENCE appuser_seq START WITH 1001 INCREMENT BY 1 NOCACHE;
