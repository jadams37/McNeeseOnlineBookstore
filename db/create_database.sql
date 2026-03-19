SELECT 'CREATE DATABASE mcneese_bookstore'
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_database
    WHERE datname = 'mcneese_bookstore'
)\gexec
