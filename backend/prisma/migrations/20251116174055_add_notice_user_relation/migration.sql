-- First, add the column as nullable
ALTER TABLE "Notice" ADD COLUMN "userId" INTEGER;

-- Find an admin user or create one if none exists
DO $$
DECLARE
    admin_id INTEGER;
BEGIN
    -- Try to find a secretary user
    SELECT id INTO admin_id FROM "User" WHERE role = 'SECRETARY' LIMIT 1;
    
    -- If no secretary user found, create one
    IF admin_id IS NULL THEN
        INSERT INTO "User" ("email", "name", "role", "createdAt") 
        VALUES ('secretary@example.com', 'System Secretary', 'SECRETARY', NOW())
        RETURNING id INTO admin_id;
    END IF;
    
    -- Update all existing notices to be owned by the admin
    UPDATE "Notice" SET "userId" = admin_id WHERE "userId" IS NULL;
END $$;

-- Now alter the column to be NOT NULL
ALTER TABLE "Notice" ALTER COLUMN "userId" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;
