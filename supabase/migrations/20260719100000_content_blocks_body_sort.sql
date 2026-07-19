-- ============================================================
-- 스테이 압해: content_blocks 확장 — 랜딩 페이지 연동용
-- 랜딩 카드에 표시할 설명 문구(body)와 노출 순서(sort_order)를 추가한다.
-- ============================================================

alter table public.content_blocks
  add column if not exists body text,
  add column if not exists sort_order int not null default 0;
