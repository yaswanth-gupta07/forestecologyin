-- Run in Supabase SQL Editor after supabase-migration-v2.sql
-- Adds structured fields for collaborator cards (title + address).

alter table collaborators add column if not exists title text not null default '';
alter table collaborators add column if not exists address text not null default '';
