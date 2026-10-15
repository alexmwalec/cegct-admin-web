
CREATE TABLE IF NOT EXISTS report_sequences (
  report_date DATE PRIMARY KEY,
  last_number INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Preserve the current counter if this migration is run again.
INSERT INTO report_sequences (report_date, last_number)
SELECT STR_TO_DATE(LEFT(id, 10), '%d-%m-%Y') AS report_date,
       MAX(CAST(SUBSTRING_INDEX(id, 'ID', -1) AS UNSIGNED)) AS last_number
FROM reports
WHERE id REGEXP '^[0-9]{2}-[0-9]{2}-[0-9]{4}-ID[0-9]+$'
GROUP BY STR_TO_DATE(LEFT(id, 10), '%d-%m-%Y')
ON DUPLICATE KEY UPDATE last_number = GREATEST(last_number, VALUES(last_number));