--
-- PostgreSQL database dump
--

-- Dumped from database version 13.9 (Debian 13.9-0+deb11u1)
-- Dumped by pg_dump version 13.9 (Debian 13.9-0+deb11u1)
grant usage on schema public to ssb;
grant create on schema public to ssb;



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';


--
-- Name: message; Type: TABLE; Schema: public; Owner: ssb
--

CREATE TABLE public.message (
    message jsonb,
    received_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.message OWNER TO ssb;

--
-- Name: key_idx; Type: INDEX; Schema: public; Owner: ssb
--

CREATE UNIQUE INDEX key_idx ON public.message USING btree (((message ->> 'key'::text)));


--
-- Name: root; Type: TABLE; Schema: public; Owner: ssb
--

CREATE TABLE public.root (
    key VARCHAR(255),
    updated_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ap_keypair (
    handle VARCHAR(255) PRIMARY KEY,
    public_key TEXT NOT NULL,
    private_key TEXT NOT NULL
);


ALTER TABLE public.root OWNER TO ssb;

--
-- PostgreSQL database dump complete
--


