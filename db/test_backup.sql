--
-- PostgreSQL database dump
--

\restrict JdFX8UWIlufLLiNaBz9ci0sPLbyol1KjfNpOAZ2ZI2oPA4eKQFOcg1jTUjdrWIv

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.product DROP CONSTRAINT IF EXISTS product_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_item DROP CONSTRAINT IF EXISTS order_item_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_item DROP CONSTRAINT IF EXISTS order_item_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart DROP CONSTRAINT IF EXISTS cart_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_item DROP CONSTRAINT IF EXISTS cart_item_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_item DROP CONSTRAINT IF EXISTS cart_item_cart_id_fkey;
DROP TRIGGER IF EXISTS trg_users_account_updated_at ON public.users_account;
DROP TRIGGER IF EXISTS trg_product_updated_at ON public.product;
DROP TRIGGER IF EXISTS trg_cart_updated_at ON public.cart;
DROP INDEX IF EXISTS public.idx_product_title;
DROP INDEX IF EXISTS public.idx_product_isbn;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_order_item_product_id;
DROP INDEX IF EXISTS public.idx_order_item_order_id;
ALTER TABLE IF EXISTS ONLY public.users_account DROP CONSTRAINT IF EXISTS users_account_username_key;
ALTER TABLE IF EXISTS ONLY public.users_account DROP CONSTRAINT IF EXISTS users_account_pkey;
ALTER TABLE IF EXISTS ONLY public.users_account DROP CONSTRAINT IF EXISTS users_account_email_key;
ALTER TABLE IF EXISTS ONLY public.product DROP CONSTRAINT IF EXISTS product_sku_key;
ALTER TABLE IF EXISTS ONLY public.product DROP CONSTRAINT IF EXISTS product_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_item DROP CONSTRAINT IF EXISTS order_item_pkey;
ALTER TABLE IF EXISTS ONLY public.order_item DROP CONSTRAINT IF EXISTS order_item_order_id_product_id_key;
ALTER TABLE IF EXISTS ONLY public.category DROP CONSTRAINT IF EXISTS category_pkey;
ALTER TABLE IF EXISTS ONLY public.category DROP CONSTRAINT IF EXISTS category_name_key;
ALTER TABLE IF EXISTS ONLY public.cart DROP CONSTRAINT IF EXISTS cart_user_id_key;
ALTER TABLE IF EXISTS ONLY public.cart DROP CONSTRAINT IF EXISTS cart_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_item DROP CONSTRAINT IF EXISTS cart_item_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_item DROP CONSTRAINT IF EXISTS cart_item_cart_id_product_id_key;
DROP TABLE IF EXISTS public.users_account;
DROP TABLE IF EXISTS public.product;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_item;
DROP TABLE IF EXISTS public.category;
DROP TABLE IF EXISTS public.cart_item;
DROP TABLE IF EXISTS public.cart;
DROP FUNCTION IF EXISTS public.touch_updated_at();
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart (
    cart_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cart_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_item (
    cart_item_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT cart_item_quantity_check CHECK ((quantity > 0))
);


--
-- Name: category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category (
    category_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_item (
    order_item_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    line_total numeric(10,2) NOT NULL,
    CONSTRAINT order_item_line_total_check CHECK ((line_total >= (0)::numeric)),
    CONSTRAINT order_item_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_item_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    order_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    ordered_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'shipped'::text, 'cancelled'::text, 'refunded'::text]))),
    CONSTRAINT orders_subtotal_check CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT orders_tax_amount_check CHECK ((tax_amount >= (0)::numeric)),
    CONSTRAINT orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    product_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sku text NOT NULL,
    isbn text,
    title text NOT NULL,
    author text,
    publisher text,
    edition text,
    category_id uuid,
    condition text DEFAULT 'new'::text NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity_in_stock integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_condition_check CHECK ((condition = ANY (ARRAY['new'::text, 'used'::text, 'rental'::text]))),
    CONSTRAINT product_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT product_quantity_in_stock_check CHECK ((quantity_in_stock >= 0))
);


--
-- Name: users_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_account (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    physical_address text,
    phone_number text,
    role text DEFAULT 'student'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_account_role_check CHECK ((role = ANY (ARRAY['student'::text, 'admin'::text, 'staff'::text])))
);


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart (cart_id, user_id, created_at, updated_at) FROM stdin;
a0045e99-db64-4b02-a959-342517a6b0de	2a1266c0-6d01-44ab-9df4-2121461fd85f	2026-04-02 05:10:55.402219-05	2026-04-02 05:10:55.402219-05
\.


--
-- Data for Name: cart_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_item (cart_item_id, cart_id, product_id, quantity) FROM stdin;
19d82854-377e-469a-a8a2-01c9fa7b2e42	a0045e99-db64-4b02-a959-342517a6b0de	0b90841b-c69f-4ec5-83db-ec3f1f24b843	1
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.category (category_id, name, created_at) FROM stdin;
5efc1791-43bc-41c2-b5fd-5d189822ebe5	Books	2026-04-02 04:50:13.668582-05
262ccfad-5eb9-4686-a805-d7bff23cbf9d	Rentals	2026-04-02 04:50:13.668582-05
dde1196f-f3a2-4500-902e-1df333b897a6	Apparel	2026-04-02 04:50:13.668582-05
d8d5440a-89d5-4802-b04e-2810a0a9889f	Electronics	2026-04-02 04:50:13.668582-05
97de4103-26ae-4853-9511-ea1e87a81889	Supplies	2026-04-02 04:50:13.668582-05
\.


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_item (order_item_id, order_id, product_id, quantity, unit_price, line_total) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (order_id, user_id, status, subtotal, tax_amount, total_amount, ordered_at) FROM stdin;
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product (product_id, sku, isbn, title, author, publisher, edition, category_id, condition, price, quantity_in_stock, is_active, created_at, updated_at) FROM stdin;
ba4a04c2-3112-47c0-a166-a2000d112633	BK001	978-0-123456-78-9	Introduction to Computer Science	John Doe	Tech Press	1st	5efc1791-43bc-41c2-b5fd-5d189822ebe5	new	89.99	50	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
0d979f92-76f9-4061-a979-9acbb438e6f7	BK002	978-0-987654-32-1	Calculus I	Jane Smith	Math Publishers	2nd	5efc1791-43bc-41c2-b5fd-5d189822ebe5	new	120.00	30	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
0b90841b-c69f-4ec5-83db-ec3f1f24b843	BK003	978-1-234567-89-0	Biology 101	Dr. Green	Science Books	3rd	5efc1791-43bc-41c2-b5fd-5d189822ebe5	used	75.50	20	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
9009a50a-5164-4a95-871d-285365f8dee0	BK004	978-0-111111-11-1	English Literature	Prof. Words	Literary Press	1st	5efc1791-43bc-41c2-b5fd-5d189822ebe5	new	65.00	40	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
ebd72228-146b-41f4-add7-44dd768f535b	RN001	978-0-222222-22-2	Advanced Physics	Dr. Quantum	Physics Inc	4th	262ccfad-5eb9-4686-a805-d7bff23cbf9d	rental	45.00	15	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
f339f1a4-cd5f-4a97-b3ce-0daa9fd86ae2	RN002	978-0-333333-33-3	Chemistry Lab Manual	Lab Master	Chem Corp	2nd	262ccfad-5eb9-4686-a805-d7bff23cbf9d	rental	35.00	25	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
6332189f-b84e-4b88-8f16-0316597c0cb4	AP001	\N	McNeese University Hoodie	\N	Campus Store	\N	dde1196f-f3a2-4500-902e-1df333b897a6	new	49.99	100	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
ffc7c9e5-c1e3-4240-bb94-f6cb4434a333	AP002	\N	McNeese Baseball Cap	\N	Campus Store	\N	dde1196f-f3a2-4500-902e-1df333b897a6	new	24.99	75	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
1375872f-601f-4d53-9814-375be8ec0d84	EL001	\N	Scientific Calculator	Texas Instruments	TI	TI-84 Plus	d8d5440a-89d5-4802-b04e-2810a0a9889f	new	129.99	20	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
3e92b5e0-b284-497d-9c03-a38ce364d836	EL002	\N	Wireless Headphones	AudioTech	AudioTech	Model X1	d8d5440a-89d5-4802-b04e-2810a0a9889f	new	89.99	30	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
51ad8bb3-688e-46f7-82a6-ba9c5fce283f	SP001	\N	Blue Pens (Pack of 12)	Office Depot	Office Depot	\N	97de4103-26ae-4853-9511-ea1e87a81889	new	5.99	200	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
8e7f2431-0a5e-4e8f-8fa0-af193dc5e45b	SP002	\N	Notebook (100 pages)	Staples	Staples	\N	97de4103-26ae-4853-9511-ea1e87a81889	new	3.49	150	t	2026-04-02 04:50:13.676679-05	2026-04-02 04:50:13.676679-05
\.


--
-- Data for Name: users_account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users_account (user_id, email, username, password_hash, first_name, last_name, physical_address, phone_number, role, is_active, created_at, updated_at) FROM stdin;
2a1266c0-6d01-44ab-9df4-2121461fd85f	east.christian0@gmail.com	east.christian	$2a$12$j1M3CTMP6PsixBKhrCdoHuPHL3KH1VP/0hQrDeG09dZiZ6CZQ8SKi	Christian	East	123 Campus Dr	1234567890	student	t	2026-04-02 04:41:06.82682-05	2026-04-02 04:41:06.82682-05
\.


--
-- Name: cart_item cart_item_cart_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_cart_id_product_id_key UNIQUE (cart_id, product_id);


--
-- Name: cart_item cart_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_pkey PRIMARY KEY (cart_item_id);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (cart_id);


--
-- Name: cart cart_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_key UNIQUE (user_id);


--
-- Name: category category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_name_key UNIQUE (name);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- Name: order_item order_item_order_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_product_id_key UNIQUE (order_id, product_id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (order_item_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (product_id);


--
-- Name: product product_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_sku_key UNIQUE (sku);


--
-- Name: users_account users_account_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_account
    ADD CONSTRAINT users_account_email_key UNIQUE (email);


--
-- Name: users_account users_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_account
    ADD CONSTRAINT users_account_pkey PRIMARY KEY (user_id);


--
-- Name: users_account users_account_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_account
    ADD CONSTRAINT users_account_username_key UNIQUE (username);


--
-- Name: idx_order_item_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_item_order_id ON public.order_item USING btree (order_id);


--
-- Name: idx_order_item_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_item_product_id ON public.order_item USING btree (product_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_product_isbn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_isbn ON public.product USING btree (isbn);


--
-- Name: idx_product_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_title ON public.product USING btree (title);


--
-- Name: cart trg_cart_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cart_updated_at BEFORE UPDATE ON public.cart FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: product trg_product_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_product_updated_at BEFORE UPDATE ON public.product FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: users_account trg_users_account_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_account_updated_at BEFORE UPDATE ON public.users_account FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: cart_item cart_item_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(cart_id) ON DELETE CASCADE;


--
-- Name: cart_item cart_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id) ON DELETE CASCADE;


--
-- Name: cart cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_account(user_id) ON DELETE CASCADE;


--
-- Name: order_item order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: order_item order_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id) ON DELETE RESTRICT;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_account(user_id) ON DELETE RESTRICT;


--
-- Name: product product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict JdFX8UWIlufLLiNaBz9ci0sPLbyol1KjfNpOAZ2ZI2oPA4eKQFOcg1jTUjdrWIv

