-- Apply only after reviewing the existing workspace schema.
-- PostgreSQL equivalent of drizzle/0001 and drizzle/0002.
CREATE UNIQUE INDEX IF NOT EXISTS documents_family_version ON workspace.documents(family_id, version);

CREATE OR REPLACE FUNCTION workspace.enforce_fixed_admins()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.role = 'ADMIN' AND NOT (NEW.locked_admin = 1 AND NEW.username IN ('malak','shahy')) THEN
    RAISE EXCEPTION 'Only Malak and Shahy can be Admins';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.locked_admin = 1 AND
    (NEW.role != 'ADMIN' OR NEW.active != 1 OR NEW.username != OLD.username OR NEW.locked_admin != 1) THEN
    RAISE EXCEPTION 'Protected Admin role';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION workspace.enforce_fixed_admins() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS only_fixed_admin_insert ON workspace.users;
CREATE TRIGGER only_fixed_admin_insert BEFORE INSERT ON workspace.users
FOR EACH ROW EXECUTE FUNCTION workspace.enforce_fixed_admins();

DROP TRIGGER IF EXISTS only_fixed_admin_update ON workspace.users;
CREATE TRIGGER only_fixed_admin_update BEFORE UPDATE ON workspace.users
FOR EACH ROW EXECUTE FUNCTION workspace.enforce_fixed_admins();
