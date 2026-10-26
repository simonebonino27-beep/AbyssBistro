-- Abyss Bistro: database online (giocatori, classifica della sfida del giorno, brigate e chat di brigata).
-- Incolla tutto in Supabase > SQL Editor > New query e premi Run. Si può rilanciare senza problemi.
-- Il PvP in diretta usa Realtime (Broadcast e Presence) e non ha bisogno di tabelle.

create table if not exists public.players (
  id text primary key check (char_length(id) between 6 and 12),
  secret text not null,
  name text not null check (char_length(name) between 1 and 16),
  lvl int not null default 1,
  trophies int not null default 0,
  wins int not null default 0,
  clan_id bigint,
  last_seen timestamptz not null default now()
);
create index if not exists players_clan on public.players (clan_id);
create index if not exists players_name on public.players (lower(name));

create table if not exists public.clans (
  id bigint generated always as identity primary key,
  tag text unique not null,
  name text not null check (char_length(name) between 2 and 20),
  owner text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_scores (
  day int not null,
  player_id text not null references public.players (id) on delete cascade,
  score int not null,
  primary key (day, player_id)
);

create table if not exists public.clan_msgs (
  id bigint generated always as identity primary key,
  clan_id bigint not null references public.clans (id) on delete cascade,
  player_id text not null,
  name text not null,
  body text not null check (char_length(body) between 1 and 200),
  at timestamptz not null default now()
);
create index if not exists clan_msgs_clan on public.clan_msgs (clan_id, id desc);

-- Lettura libera (tranne il segreto dei giocatori), scrittura solo dalle funzioni qui sotto.
alter table public.players enable row level security;
alter table public.clans enable row level security;
alter table public.daily_scores enable row level security;
alter table public.clan_msgs enable row level security;

drop policy if exists "ab read" on public.players;
drop policy if exists "ab read" on public.clans;
drop policy if exists "ab read" on public.daily_scores;
drop policy if exists "ab read" on public.clan_msgs;
create policy "ab read" on public.players for select to anon, authenticated using (true);
create policy "ab read" on public.clans for select to anon, authenticated using (true);
create policy "ab read" on public.daily_scores for select to anon, authenticated using (true);
create policy "ab read" on public.clan_msgs for select to anon, authenticated using (true);

revoke all on public.players, public.clans, public.daily_scores, public.clan_msgs from anon, authenticated;
grant select (id, name, lvl, trophies, wins, clan_id, last_seen) on public.players to anon, authenticated;
grant select on public.clans, public.daily_scores, public.clan_msgs to anon, authenticated;

create or replace view public.clan_board as
  select c.id, c.tag, c.name, count(p.id)::int as members, coalesce(sum(p.trophies), 0)::int as trophies
  from public.clans c left join public.players p on p.clan_id = c.id
  group by c.id;
grant select on public.clan_board to anon, authenticated;

-- Controlla che chi scrive sia davvero quel giocatore (il segreto resta solo sul suo telefono).
create or replace function public.ab_ok(p_id text, p_secret text) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from players where id = p_id and secret = p_secret)
$$;

create or replace function public.ab_sync(p_id text, p_secret text, p_name text, p_lvl int, p_trophies int, p_wins int)
returns bigint language plpgsql security definer set search_path = public as $$
declare cid bigint;
begin
  insert into players (id, secret, name, lvl, trophies, wins, last_seen)
  values (p_id, p_secret, left(coalesce(nullif(trim(p_name), ''), 'Chef'), 16), greatest(1, least(p_lvl, 999)), greatest(0, least(p_trophies, 100000)), greatest(0, p_wins), now())
  on conflict (id) do update set name = excluded.name, lvl = excluded.lvl, trophies = excluded.trophies, wins = excluded.wins, last_seen = now()
  where players.secret = p_secret;
  select clan_id into cid from players where id = p_id and secret = p_secret;
  return cid;
end $$;

create or replace function public.ab_daily(p_id text, p_secret text, p_day int, p_score int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not ab_ok(p_id, p_secret) then raise exception 'not allowed'; end if;
  insert into daily_scores (day, player_id, score) values (p_day, p_id, greatest(0, least(p_score, 10000000)))
  on conflict (day, player_id) do update set score = greatest(daily_scores.score, excluded.score);
end $$;

create or replace function public.ab_clan_create(p_id text, p_secret text, p_name text)
returns bigint language plpgsql security definer set search_path = public as $$
declare cid bigint; t text;
begin
  if not ab_ok(p_id, p_secret) then raise exception 'not allowed'; end if;
  loop
    t := upper(substr(translate(md5(random()::text), '01', 'XY'), 1, 5));
    exit when not exists (select 1 from clans where tag = t);
  end loop;
  insert into clans (tag, name, owner) values (t, left(trim(p_name), 20), p_id) returning id into cid;
  update players set clan_id = cid where id = p_id;
  return cid;
end $$;

create or replace function public.ab_clan_join(p_id text, p_secret text, p_tag text)
returns bigint language plpgsql security definer set search_path = public as $$
declare cid bigint;
begin
  if not ab_ok(p_id, p_secret) then raise exception 'not allowed'; end if;
  select id into cid from clans where tag = upper(trim(p_tag));
  if cid is null then raise exception 'brigata non trovata'; end if;
  if (select count(*) from players where clan_id = cid) >= 30 then raise exception 'brigata piena'; end if;
  update players set clan_id = cid where id = p_id;
  return cid;
end $$;

create or replace function public.ab_clan_leave(p_id text, p_secret text)
returns void language plpgsql security definer set search_path = public as $$
declare cid bigint;
begin
  if not ab_ok(p_id, p_secret) then raise exception 'not allowed'; end if;
  select clan_id into cid from players where id = p_id;
  update players set clan_id = null where id = p_id;
  if cid is not null and not exists (select 1 from players where clan_id = cid) then delete from clans where id = cid; end if;
end $$;

create or replace function public.ab_clan_say(p_id text, p_secret text, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare cid bigint; n text;
begin
  if not ab_ok(p_id, p_secret) then raise exception 'not allowed'; end if;
  select clan_id, name into cid, n from players where id = p_id;
  if cid is null then raise exception 'non sei in una brigata'; end if;
  insert into clan_msgs (clan_id, player_id, name, body) values (cid, p_id, n, left(trim(p_body), 200));
  delete from clan_msgs where clan_id = cid and id < (select min(id) from (select id from clan_msgs where clan_id = cid order by id desc limit 100) x);
end $$;

revoke all on function public.ab_ok(text, text) from public, anon, authenticated;
grant execute on function public.ab_sync(text, text, text, int, int, int) to anon, authenticated;
grant execute on function public.ab_daily(text, text, int, int) to anon, authenticated;
grant execute on function public.ab_clan_create(text, text, text) to anon, authenticated;
grant execute on function public.ab_clan_join(text, text, text) to anon, authenticated;
grant execute on function public.ab_clan_leave(text, text) to anon, authenticated;
grant execute on function public.ab_clan_say(text, text, text) to anon, authenticated;
