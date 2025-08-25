-- Index creation statements

create index IF not exists idx_profiles_email on public.profiles using btree (email) TABLESPACE pg_default;
create index IF not exists idx_profiles_prn on public.profiles using btree (prn) TABLESPACE pg_default;
create index IF not exists idx_profiles_user_type on public.profiles using btree (user_type) TABLESPACE pg_default;
create index IF not exists idx_profiles_role on public.profiles using btree (role) TABLESPACE pg_default;
create index IF not exists idx_profiles_role_id on public.profiles using btree (role, id) TABLESPACE pg_default;
create index IF not exists idx_profiles_gender on public.profiles using btree (gender) TABLESPACE pg_default;
create index IF not exists idx_profiles_created_at on public.profiles using btree (created_at) TABLESPACE pg_default;
create index IF not exists idx_profiles_gender_user_type on public.profiles using btree (gender, user_type) TABLESPACE pg_default;
create index IF not exists idx_profiles_user_type_created on public.profiles using btree (user_type, created_at) TABLESPACE pg_default;
create index IF not exists idx_profiles_gender_created on public.profiles using btree (gender, created_at) TABLESPACE pg_default;
create index IF not exists idx_profiles_names on public.profiles using btree (first_name, last_name) TABLESPACE pg_default;

create index IF not exists idx_sports_is_active on public.sports using btree (is_active) TABLESPACE pg_default;
create index IF not exists idx_sports_active_name on public.sports using btree (is_active, name) TABLESPACE pg_default;
create index IF not exists idx_sports_name on public.sports using btree (name) TABLESPACE pg_default;
create index IF not exists idx_sports_seat_limit on public.sports using btree (seat_limit) TABLESPACE pg_default;
create index IF not exists idx_sports_created_at on public.sports using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_slots_sport_id_is_active on public.slots using btree (sport_id, is_active) TABLESPACE pg_default;
create index IF not exists idx_slots_sport_gender on public.slots using btree (sport_id, gender) TABLESPACE pg_default;
create index IF not exists idx_slots_start_time on public.slots using btree (start_time) TABLESPACE pg_default;
create index IF not exists idx_slots_end_time on public.slots using btree (end_time) TABLESPACE pg_default;
create index IF not exists idx_slots_allowed_user_type on public.slots using btree (allowed_user_type) TABLESPACE pg_default;
create index IF not exists idx_slots_time_range on public.slots using btree (start_time, end_time) TABLESPACE pg_default;
create index IF not exists idx_slots_access_control on public.slots using btree (sport_id, is_active, gender, allowed_user_type) TABLESPACE pg_default;
create index IF not exists idx_slots_gender_user_type on public.slots using btree (gender, allowed_user_type) TABLESPACE pg_default;
create index IF not exists idx_slots_sport_time_sorted on public.slots using btree (sport_id, start_time) TABLESPACE pg_default;
create index IF not exists idx_slots_admin_queries on public.slots using btree (is_active, start_time, sport_id) TABLESPACE pg_default;

create index IF not exists idx_bookings_user_id on public.bookings using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_bookings_status on public.bookings using btree (status) TABLESPACE pg_default;
create index IF not exists idx_bookings_booking_date on public.bookings using btree (booking_date) TABLESPACE pg_default;
create index IF not exists idx_bookings_checked_in_at on public.bookings using btree (checked_in_at) TABLESPACE pg_default;
create index IF not exists idx_bookings_checked_out_at on public.bookings using btree (checked_out_at) TABLESPACE pg_default;
create index IF not exists idx_bookings_user_sport_date on public.bookings using btree (user_id, sport_id, booking_date) TABLESPACE pg_default;
create index IF not exists idx_bookings_sport_profiles_composite on public.bookings using btree (sport_id, status, booking_date, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_bookings_slot_date_seat on public.bookings using btree (slot_id, booking_date, seat_number) TABLESPACE pg_default;
create index IF not exists idx_bookings_sport_slot_date_status on public.bookings using btree (sport_id, slot_id, booking_date, status) TABLESPACE pg_default;
create index IF not exists idx_bookings_user_date_created on public.bookings using btree (user_id, booking_date desc, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_bookings_slot_id_status on public.bookings using btree (slot_id, status) TABLESPACE pg_default;
create index IF not exists idx_bookings_trends_analysis on public.bookings using btree (created_at, status, sport_id) TABLESPACE pg_default;

create index IF not exists idx_bookings_history_user_sport_date on public.bookings_history using btree (user_id, sport_id, booking_date) TABLESPACE pg_default;
create index IF not exists idx_bookings_history_created_at_desc on public.bookings_history using btree (created_at desc) TABLESPACE pg_default;
create index IF not exists idx_bookings_history_status on public.bookings_history using btree (status) TABLESPACE pg_default;
create index IF not exists idx_bookings_history_sport_id on public.bookings_history using btree (sport_id) TABLESPACE pg_default;
create index IF not exists idx_bookings_history_booking_date on public.bookings_history using btree (booking_date) TABLESPACE pg_default;
create index IF not exists idx_bookings_history_sport_status_created on public.bookings_history using btree (sport_id, status, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_bookings_history_date_status_created on public.bookings_history using btree (booking_date, status, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_bookings_history_user_created on public.bookings_history using btree (user_id, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_bookings_history_slot_date on public.bookings_history using btree (slot_id, booking_date) TABLESPACE pg_default;

create index IF not exists idx_notifications_is_active on public.notifications using btree (is_active) TABLESPACE pg_default;
create index IF not exists idx_notifications_active_created on public.notifications using btree (is_active, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_notifications_type on public.notifications using btree (type) TABLESPACE pg_default;

create index IF not exists idx_user_feedback_profile_id on public.user_feedback using btree (profile_id) TABLESPACE pg_default;
create index IF not exists idx_user_feedback_created_at on public.user_feedback using btree (created_at desc) TABLESPACE pg_default;
create index IF not exists idx_user_feedback_user_prn on public.user_feedback using btree (user_prn) TABLESPACE pg_default;
create index IF not exists idx_user_feedback_email on public.user_feedback using btree (email) TABLESPACE pg_default;
create index IF not exists idx_user_feedback_note_text on public.user_feedback using gin (to_tsvector('english'::regconfig, note)) TABLESPACE pg_default;
create index IF not exists idx_user_feedback_profile_created on public.user_feedback using btree (profile_id, created_at desc) TABLESPACE pg_default;
