
-- Drop the foreign key constraint that's causing the violation
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_user_id_fkey";
