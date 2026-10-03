UPDATE users SET role='MEMBER' WHERE role='ADMIN' AND NOT (locked_admin=1 AND username IN ('malak','shahy'));
--> statement-breakpoint
CREATE TRIGGER only_fixed_admin_insert BEFORE INSERT ON users WHEN NEW.role='ADMIN' AND NOT (NEW.locked_admin=1 AND NEW.username IN ('malak','shahy')) BEGIN SELECT RAISE(ABORT,'Only Malak and Shahy can be Admins'); END;
--> statement-breakpoint
CREATE TRIGGER only_fixed_admin_update BEFORE UPDATE ON users WHEN (NEW.role='ADMIN' AND NOT (NEW.locked_admin=1 AND NEW.username IN ('malak','shahy'))) OR (OLD.locked_admin=1 AND (NEW.role!='ADMIN' OR NEW.active!=1 OR NEW.username!=OLD.username OR NEW.locked_admin!=1)) BEGIN SELECT RAISE(ABORT,'Protected Admin role'); END;
