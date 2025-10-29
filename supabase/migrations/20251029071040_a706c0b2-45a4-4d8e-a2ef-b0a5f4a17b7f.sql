-- Create table for X profile and X402 mail invite requests
create table public.x_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('x_profile', 'x402_mail')),
  email text not null,
  name text,
  company text,
  message text,
  twitter_handle text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  status text not null default 'pending' check (status in ('pending', 'contacted', 'approved', 'rejected'))
);

-- Enable RLS
alter table public.x_requests enable row level security;

-- Allow anyone to submit requests
create policy "Anyone can submit X requests"
  on public.x_requests
  for insert
  with check (true);

-- Allow admins to view and manage all requests
create policy "Admins can view X requests"
  on public.x_requests
  for select
  using ((auth.jwt() ->> 'email') = any(array['artolaya@gmail.com', 'michael@dexterlearning.com']));

create policy "Admins can update X requests"
  on public.x_requests
  for update
  using ((auth.jwt() ->> 'email') = any(array['artolaya@gmail.com', 'michael@dexterlearning.com']));

create policy "Admins can delete X requests"
  on public.x_requests
  for delete
  using ((auth.jwt() ->> 'email') = any(array['artolaya@gmail.com', 'michael@dexterlearning.com']));

-- Create index for faster queries
create index idx_x_requests_type on public.x_requests(request_type);
create index idx_x_requests_status on public.x_requests(status);
create index idx_x_requests_created_at on public.x_requests(created_at desc);