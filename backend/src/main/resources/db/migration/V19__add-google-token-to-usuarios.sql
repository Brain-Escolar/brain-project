ALTER TABLE usuarios ADD COLUMN google_access_token VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN google_refresh_token VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN google_token_expiracao TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN google_id VARCHAR(64);
