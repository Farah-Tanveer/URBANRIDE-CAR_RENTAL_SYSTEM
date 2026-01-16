-----------------------------------------------------------
-- ALTER Vehicle Table to Add Category Field
-- Run this before updating DML.sql
-----------------------------------------------------------

ALTER TABLE Vehicle ADD Category VARCHAR2(20) DEFAULT 'ECONOMY'
    CHECK (Category IN ('ECONOMY', 'SUV', 'LUXURY'));

COMMENT ON COLUMN Vehicle.Category IS 'Vehicle category: ECONOMY, SUV, or LUXURY';

COMMIT;
