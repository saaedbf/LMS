--
-- PostgreSQL database dump
--

\restrict Wp9jyQNyky31knILwFLyuvYhfEoM3qsB6Xpl9ZoYiDMtty16JXKa4fsXxFks61t

-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 17.10 (Debian 17.10-1.pgdg13+1)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AbsenceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AbsenceType" AS ENUM (
    'UNKNOWN',
    'EXCUSED',
    'UNEXCUSED'
);


ALTER TYPE public."AbsenceType" OWNER TO postgres;

--
-- Name: SchoolRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SchoolRole" AS ENUM (
    'MANAGER',
    'DEPUTY',
    'TEACHER',
    'STUDENT'
);


ALTER TYPE public."SchoolRole" OWNER TO postgres;

--
-- Name: SchoolType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SchoolType" AS ENUM (
    'Dolati',
    'GheireDolati'
);


ALTER TYPE public."SchoolType" OWNER TO postgres;

--
-- Name: Sex; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Sex" AS ENUM (
    'Boy',
    'Girl',
    'Mixed'
);


ALTER TYPE public."Sex" OWNER TO postgres;

--
-- Name: SystemRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SystemRole" AS ENUM (
    'MASTER',
    'USER'
);


ALTER TYPE public."SystemRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: DoreTahsili; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DoreTahsili" (
    id integer NOT NULL,
    title text NOT NULL
);


ALTER TABLE public."DoreTahsili" OWNER TO postgres;

--
-- Name: Paye; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Paye" (
    id integer NOT NULL,
    title text NOT NULL
);


ALTER TABLE public."Paye" OWNER TO postgres;

--
-- Name: ReshtehTadris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReshtehTadris" (
    id text NOT NULL,
    title text NOT NULL
);


ALTER TABLE public."ReshtehTadris" OWNER TO postgres;

--
-- Name: ReshtehTahsili; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReshtehTahsili" (
    id integer NOT NULL,
    title text NOT NULL
);


ALTER TABLE public."ReshtehTahsili" OWNER TO postgres;

--
-- Name: _DoreTahsiliToPaye; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_DoreTahsiliToPaye" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_DoreTahsiliToPaye" OWNER TO postgres;

--
-- Name: _DoreTahsiliToReshtehTahsili; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_DoreTahsiliToReshtehTahsili" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_DoreTahsiliToReshtehTahsili" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: academic_year; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academic_year (
    id integer NOT NULL,
    title text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.academic_year OWNER TO postgres;

--
-- Name: academic_year_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academic_year_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academic_year_id_seq OWNER TO postgres;

--
-- Name: academic_year_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academic_year_id_seq OWNED BY public.academic_year.id;


--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id text NOT NULL,
    "providerId" text NOT NULL,
    "accountId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    scope text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    password text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: class_course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_course (
    id text NOT NULL,
    "klassId" text NOT NULL,
    "darsPayeReshtehId" text NOT NULL,
    "teacherId" text,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.class_course OWNER TO postgres;

--
-- Name: dars_paye_reshteh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dars_paye_reshteh (
    id text NOT NULL,
    units integer DEFAULT 1 NOT NULL,
    "reshtehTahsiliId" integer NOT NULL,
    "payeId" integer NOT NULL,
    "reshtehTadrisId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dars_paye_reshteh OWNER TO postgres;

--
-- Name: klass; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.klass (
    id text NOT NULL,
    title text NOT NULL,
    "schoolId" integer NOT NULL,
    "academicYearId" integer NOT NULL,
    "payeId" integer NOT NULL,
    "reshtehTahsiliId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.klass OWNER TO postgres;

--
-- Name: ostans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ostans (
    id integer NOT NULL,
    title text NOT NULL
);


ALTER TABLE public.ostans OWNER TO postgres;

--
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regions (
    id integer NOT NULL,
    title text NOT NULL,
    "ostanId" integer NOT NULL
);


ALTER TABLE public.regions OWNER TO postgres;

--
-- Name: school; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school (
    id integer NOT NULL,
    title text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "doreTahsiliId" integer DEFAULT 1 NOT NULL,
    "modirName" text DEFAULT ''::text NOT NULL,
    "schoolType" public."SchoolType" DEFAULT 'Dolati'::public."SchoolType" NOT NULL,
    sex public."Sex" DEFAULT 'Boy'::public."Sex" NOT NULL,
    "subTitle" text
);


ALTER TABLE public.school OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    id text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "activeAssignmentId" integer
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "nationalCode" text NOT NULL,
    phone text NOT NULL,
    address text,
    "fatherName" text,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student OWNER TO postgres;

--
-- Name: student_absence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_absence (
    id text NOT NULL,
    "studentEnrollmentId" text NOT NULL,
    date date NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "absenceType" public."AbsenceType" DEFAULT 'UNKNOWN'::public."AbsenceType" NOT NULL,
    reason text,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_absence OWNER TO postgres;

--
-- Name: student_disciplinary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_disciplinary (
    id text NOT NULL,
    "studentEnrollmentId" text NOT NULL,
    date date NOT NULL,
    "startTime" text NOT NULL,
    reason text NOT NULL,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_disciplinary OWNER TO postgres;

--
-- Name: student_enrollment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_enrollment (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "schoolId" integer NOT NULL,
    "academicYearId" integer NOT NULL,
    "payeId" integer NOT NULL,
    "reshtehTahsiliId" integer NOT NULL,
    "klassId" text NOT NULL,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_enrollment OWNER TO postgres;

--
-- Name: teacher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "nationalCode" text NOT NULL,
    "personnelCode" text,
    phone text NOT NULL,
    address text,
    "lastEditedByUsername" text,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teacher OWNER TO postgres;

--
-- Name: teacher_assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_assignment (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "schoolId" integer NOT NULL,
    "academicYearId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teacher_assignment OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    email text,
    name text,
    "firstName" text,
    "lastName" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "systemRole" public."SystemRole" DEFAULT 'USER'::public."SystemRole" NOT NULL,
    "banExpires" timestamp(3) without time zone,
    "banReason" text,
    banned boolean DEFAULT false,
    role text DEFAULT 'user'::text
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_assignment (
    id integer NOT NULL,
    "userId" text NOT NULL,
    "schoolId" integer NOT NULL,
    "academicYearId" integer NOT NULL,
    role public."SchoolRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_assignment OWNER TO postgres;

--
-- Name: user_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_assignment_id_seq OWNER TO postgres;

--
-- Name: user_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_assignment_id_seq OWNED BY public.user_assignment.id;


--
-- Name: academic_year id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_year ALTER COLUMN id SET DEFAULT nextval('public.academic_year_id_seq'::regclass);


--
-- Name: user_assignment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_assignment ALTER COLUMN id SET DEFAULT nextval('public.user_assignment_id_seq'::regclass);


--
-- Data for Name: DoreTahsili; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DoreTahsili" (id, title) FROM stdin;
1	ابتدایی
\.


--
-- Data for Name: Paye; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Paye" (id, title) FROM stdin;
1	اول
2	دوم
3	سوم
12	دوازدهم
\.


--
-- Data for Name: ReshtehTadris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReshtehTadris" (id, title) FROM stdin;
a4eacae1-24b6-4de3-ba55-997355cc1e36	ریاضی
b08cc6e3-bedb-45a7-b0e4-e57c10d2633e	فارسی
\.


--
-- Data for Name: ReshtehTahsili; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReshtehTahsili" (id, title) FROM stdin;
1	ابتدایی
2	متوسطه اول
3	برق
\.


--
-- Data for Name: _DoreTahsiliToPaye; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_DoreTahsiliToPaye" ("A", "B") FROM stdin;
1	1
1	2
\.


--
-- Data for Name: _DoreTahsiliToReshtehTahsili; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_DoreTahsiliToReshtehTahsili" ("A", "B") FROM stdin;
1	3
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4d1e7e77-04d2-4888-9752-430b87f9c4d8	3b7ef70e7e7135ee405264c8c3edf0e87e3b168f9e724ff5715345bd81e20f6c	2026-07-24 07:50:18.917966+00	20260217134150_first	\N	\N	2026-07-24 07:50:18.90804+00	1
688318b6-d056-4bde-b4c0-179685f80013	f298fd937fd015b7a3b4c3a285bd2955092e0e64f917dfdde2b59f19800accdb	2026-07-24 07:50:18.929361+00	20260707115526_reshteh_tahsili	\N	\N	2026-07-24 07:50:18.920509+00	1
fb2d8b5e-e952-4cee-965a-743fea9df45e	961625d7b5ad31569ee268778da9199c601e039cd904c757ee8d3ccaee5c73a7	2026-07-31 05:49:13.036285+00	20260731054912_rbac_context_user_assignment2	\N	\N	2026-07-31 05:49:12.986144+00	1
3b3b36d0-f78b-46d2-8e88-ed8946e99852	67232b822bbf8eb02981204124383300845adccb31125ffea5dd7553b16a06da	2026-07-24 07:50:18.940143+00	20260709053418_ostan	\N	\N	2026-07-24 07:50:18.932005+00	1
962006c4-c6a3-4e93-9d38-b8c46ac6218f	4b217c76c73e8ceba99d0d9859c0d0c4ba4abcafef8895d6a05c5b84472e1e02	2026-07-24 07:50:18.949628+00	20260709073953_reshteh_tadris	\N	\N	2026-07-24 07:50:18.942584+00	1
01672d95-54d8-47e1-816e-ca62a0c01df5	8ceaccb9125d2b0c8cd04c17ad7fd00622036e387be4103218e94eb62586000b	2026-07-24 07:50:18.958111+00	20260709074924_rehte2	\N	\N	2026-07-24 07:50:18.9513+00	1
7c11bddf-3457-403d-9d6c-51d95f2aeb3e	ed79fdb41dafcfc5cfbd6bed1f5d7bdaf46477dc000a76b9a4e4441a6cf448cf	2026-08-03 08:12:01.892797+00	20260803081201_dore_reshte	\N	\N	2026-08-03 08:12:01.882717+00	1
d1097547-8ae5-4737-8f07-2b04b58d4c3f	bc2e339e2d243f77699cfd965829e92e5118aff8f2b2e4f556ee2c6abdcd7470	2026-07-24 07:50:18.972583+00	20260709115746_region	\N	\N	2026-07-24 07:50:18.961373+00	1
b2293b23-aaca-4af1-a7fb-ae1ae3a59fcc	280ca73128eb6000795b44c172fc378a48c64c33d1b052a58a16ebbacb3ec934	2026-07-24 07:50:18.983492+00	20260718054046_init_user	\N	\N	2026-07-24 07:50:18.974603+00	1
cf1a5f8d-bc45-4f6a-b7d9-bdb80ad5fde4	b795297109632e81f7c6a2bcc5ff49b23bff2378df55c073919490a367f7aeb4	2026-08-23 08:21:42.736931+00	20260823082142_std3	\N	\N	2026-08-23 08:21:42.726924+00	1
7665d4ef-128a-4710-b3f6-faac79619188	e8970b183f59540826c7add4338e74afa5fb5f61d9574f294f303dce158b3cda	2026-07-24 07:50:18.998001+00	20260723094258_user2	\N	\N	2026-07-24 07:50:18.985495+00	1
7b0b854b-4991-47e2-9274-de9fb22f7ee7	bd6fa64b10ae44e8f2edf01d7bcba3b2fc6a499312f63eb97bfcb439a98cdfa0	2026-08-03 08:53:18.291507+00	20260803085318_school	\N	\N	2026-08-03 08:53:18.283102+00	1
d8888189-5737-437b-9ede-df7349fa39a1	6534403d12ab9de63cd5217b563ffd3d79420124230e519cfd977d6d24cdbd61	2026-07-24 07:50:19.011524+00	20260724033318_user4	\N	\N	2026-07-24 07:50:18.999794+00	1
aff050eb-8d38-450c-97fe-1c7b4c18e7fa	6a261ed58b8947f351c475f871bdf377052020cd958bd2c8c91c5b17e1163e98	2026-07-24 07:50:19.019757+00	20260724040533_user5	\N	\N	2026-07-24 07:50:19.013502+00	1
45ab17f2-9e67-494a-adaa-6e9cded53898	91eddf75d2a9838744bc4496dbda2da8faa7f50cf60a7c06a5cb4b673c292003	2026-07-24 07:50:28.002505+00	20260724075027_user5	\N	\N	2026-07-24 07:50:27.987119+00	1
713ed515-c73a-40e4-b6da-793994e90fac	76fe575c3f71fe8ea66a40f38a967ab838b173bfd11ae9ea799acdcd71bdcff8	2026-08-03 09:05:37.173532+00	20260803090537_mixed	\N	\N	2026-08-03 09:05:37.164518+00	1
fadda9fa-46dc-4674-9e25-86db95504a2a	57a05d26a84ea305a8077de029d41c0a8501019b5a2a92ee34259912afcc9ffa	2026-07-25 05:45:27.210631+00	20260725054527_paye	\N	\N	2026-07-25 05:45:27.202172+00	1
4d57ec3b-4a95-499b-a7d1-02044e441584	7bbbbc4bb03bd09d51651a2757f70444f3dc56877b55396f4c5cfc79a8b16695	2026-07-25 06:21:21.817495+00	20260725062121_init_doreh_paye_relation	\N	\N	2026-07-25 06:21:21.810363+00	1
3a7bae59-da00-4fe3-b67a-8025edcd941d	3f5ee409c40fa107d8a50a6e44c253d7f469080fab388f54e5027f8f98cac341	2026-07-31 05:38:48.941944+00	20260731053848_rbac_context_user_assignment	\N	\N	2026-07-31 05:38:48.865759+00	1
4b0386e7-149d-41c6-95d8-2879a2743805	9481a63b12a2b58e28183bdccb8b10855091aee0a4d9f0ed29ceef543b5d2ab8	2026-08-03 09:06:25.453196+00	20260803090625_mixed2	\N	\N	2026-08-03 09:06:25.442951+00	1
8efc8ae3-cbf6-471f-bf57-87351277c5d7	5d20b8b6c83f8aad9d85517dde012119b2f0ed683e78ce2b20fab2c8a205af21	2026-08-29 06:18:42.685338+00	20260829061842_teacher	\N	\N	2026-08-29 06:18:42.645713+00	1
cb3176b3-f171-411a-aeb6-c05923b2cd10	dc200d4d4ceba613afe65db3f3b2ffbfaf16f307ec52090636bcf69a490f6097	2026-08-04 06:26:46.417247+00	20260804062646_darspayereshte	\N	\N	2026-08-04 06:26:46.400974+00	1
9e39c609-3cd8-4e2c-a1f7-0e2f02830a91	3a07d5e58bbb53be58508e65000f659acbae8e04b7546f12abe000f1bca132b6	2026-08-04 09:02:21.785408+00	20260804090221_klass	\N	\N	2026-08-04 09:02:21.77003+00	1
c0f20db1-0b10-4909-908d-3f66330f2a23	1e59d7d8d0708a3b02ffb1a9c7d362e2182b7b50d96cda94c6508c8d5535b713	2026-08-17 15:59:00.830863+00	20260817155900_student	\N	\N	2026-08-17 15:59:00.812662+00	1
1f12e33a-ed66-4523-876c-649580b3be15	53e66ac41e31e3826766a9403cd088096e529512f91ada683404820e507ab811	2026-08-31 05:32:25.985907+00	20260831053225_abcense	\N	\N	2026-08-31 05:32:25.940158+00	1
6ea67267-36fe-4c1d-a6ad-8a0b7f4f169c	0f5af86d4d219cfdfab4988e92a4d973d91c21692f7532d1dc4ad805ad509254	2026-08-23 08:07:50.754+00	20260823080750_add_admin_plugin_fields_to_user	\N	\N	2026-08-23 08:07:50.724701+00	1
2c020468-5a3b-42dd-a087-382471ef3160	59cac334bf1371c825dfe805790a641e98755a2c16dc65ef27eef3e54be3561f	2026-09-01 03:43:58.185398+00	20260901034358_disciplinary	\N	\N	2026-09-01 03:43:58.175274+00	1
\.


--
-- Data for Name: academic_year; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academic_year (id, title, "isActive", "createdAt", "updatedAt") FROM stdin;
1	1403-1404	t	2026-07-31 05:51:52.082	2026-07-31 05:51:52.082
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, "providerId", "accountId", "userId", "accessToken", "refreshToken", "idToken", scope, "accessTokenExpiresAt", "refreshTokenExpiresAt", password, "createdAt", "updatedAt") FROM stdin;
c27p00QHbtws4OC4fNdu9ZJuOkk9Ctdn	credential	3Ah73bL7B6l7IR4jxTm0iR1lbsibZoIJ	3Ah73bL7B6l7IR4jxTm0iR1lbsibZoIJ	\N	\N	\N	\N	\N	\N	35fa31ab47f89b17efae9e61adb9b4fe:770b31eeedb59bca93807604e7025121652291d8488b3a1571a31424bdb1a2fd3aceeaebb079290fa5e5803236b2292b38347377ebe2f8e3e088f714a24a3529	2026-07-31 07:37:51.74	2026-08-03 07:29:37.593
OWhXiAaEwXlYgDrzGvW3X3YaJ0ne7XW5	credential	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	\N	\N	\N	\N	\N	\N	23f76f2859631895d19da75e625bb9c6:af64b4e296e731c386b42ed482c174ed407eae3309bc642e512d937979289b3e73ab23d24baa960a7a6b6d8e3d08cecad4a545d117690f903e8f1e946add4008	2026-08-03 16:15:20.595	2026-08-03 16:15:20.595
X95EtuMUe6BiQBSK2ctNQf4RfQmDSoVX	credential	2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	\N	\N	\N	\N	\N	\N	36d61dd3c6117983977a0d1cd0b333e2:68e87deba9989f64785c81ee23efe7425dbfb2cb50f122992fbd0fa6727639da41962b340ff62d151cb20fd97c511b34c4c365f5dc4cf909b7934fad5f2b2f9e	2026-08-23 08:08:53.178	2026-08-24 07:13:53.335
yjT01KygpntZxtTztzO09mCd61xaTnfQ	credential	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	\N	\N	\N	\N	\N	\N	e37c274baa8b50cc3794ac65e4738ff6:757dcfc55b49e85444b2969229f783ef41fe1992fc376ea550ea1d8217766bf840f82bf3d4648e438fe853a2ff3facbb49cd5ce3fb996a2b4673fe589aa6fa36	2026-08-29 07:57:27.454	2026-08-29 07:57:27.454
\.


--
-- Data for Name: class_course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class_course (id, "klassId", "darsPayeReshtehId", "teacherId", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dars_paye_reshteh; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dars_paye_reshteh (id, units, "reshtehTahsiliId", "payeId", "reshtehTadrisId", "createdAt", "updatedAt") FROM stdin;
f1100b67-a895-4f0a-8ccd-b77418f30b8e	1	3	2	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-08-04 06:49:21.55	2026-08-04 06:49:21.55
df2bc11f-9d68-474e-8bf1-cd7279dfe179	2	3	1	b08cc6e3-bedb-45a7-b0e4-e57c10d2633e	2026-08-04 06:49:49.81	2026-08-04 06:49:49.81
550beea9-2b35-48ad-a4c3-8f2ebfa5822f	2	3	2	b08cc6e3-bedb-45a7-b0e4-e57c10d2633e	2026-08-04 07:05:30.836	2026-08-04 07:05:30.836
5fd911b5-e436-4c41-9402-f17d2f7f4b01	1	1	3	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-08-04 07:06:03.825	2026-08-04 07:06:03.825
\.


--
-- Data for Name: klass; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.klass (id, title, "schoolId", "academicYearId", "payeId", "reshtehTahsiliId", "createdAt", "updatedAt") FROM stdin;
b652dc64-00bd-41d5-b53c-92e3882881a8	102	55733897	1	1	3	2026-08-04 09:09:14.755	2026-08-04 09:09:14.755
7f402316-6169-4978-96b7-adec0396ee6c	107	55733897	1	1	3	2026-08-04 09:13:41.482	2026-08-04 09:13:41.482
8c1188f5-8191-4515-8ce5-5b5b677743ec	108	55733897	1	1	3	2026-08-24 06:18:51.007	2026-08-24 06:18:51.007
\.


--
-- Data for Name: ostans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ostans (id, title) FROM stdin;
16	خراسان رضوی
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.regions (id, title, "ostanId") FROM stdin;
\.


--
-- Data for Name: school; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.school (id, title, "isActive", "createdAt", "updatedAt", "doreTahsiliId", "modirName", "schoolType", sex, "subTitle") FROM stdin;
55733897	کاخکی	t	2026-08-03 16:15:20.282	2026-08-03 16:15:20.282	1	کمال شمس آرا	Dolati	Boy	پیشتاز
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (id, token, "expiresAt", "ipAddress", "userAgent", "userId", "createdAt", "updatedAt", "activeAssignmentId") FROM stdin;
ZD6o80X16hoUIsup4WUQstgf2iZPWAS0	ZvXIJ5x3uQTU1eU7z1GHwQ00JrX0qNCh	2026-08-30 08:08:53.186			2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	2026-08-23 08:08:53.186	2026-08-23 08:08:53.186	\N
bWTxqH0QLOgB5OSXp06gMaM943E2bnyt	qstWq4C13CIiMwlcckxjrsMb20Ro9jIb	2026-08-10 16:15:20.609			xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-03 16:15:20.609	2026-08-03 16:15:20.609	\N
f5z80TKOjdpkOgqp13AuhMN4n2p4TMeB	u7e9S7sdvLdo1QT9YjMLMFNuNZB7nnE5	2026-08-17 07:16:07.91	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-04 09:08:20.128	2026-08-10 07:16:07.91	4
M1jQD8Xey5IeROoqyW00VHGtPuFEqf2I	B3Du3F18HIJ7psnTcLCZ062fgVMNixKM	2026-08-17 07:16:28.387	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	3Ah73bL7B6l7IR4jxTm0iR1lbsibZoIJ	2026-08-10 07:16:28.398	2026-08-10 07:16:28.398	\N
pbmEfI7NUzozIxjvz1vvQKuIcDlAMtNY	bYRDGhXuAhVZMESuKJmLwVSEgmxpPToz	2026-08-24 16:32:36.797	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-17 16:32:36.802	2026-08-17 16:32:43.72	4
y1Ili9q8qiPUWNOpvWHRcCgXhg6OHfbE	Plfu8jQPEMBZ35Hk2n9lcYjke8L5hWb2	2026-08-31 06:46:47.814	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-24 06:46:47.824	2026-08-24 06:47:01.849	4
wie1hRQ8UetykqOy6YUowYp3XN61cLDz	nv2h77nMGFedDmnAR2lSRH4ekMurM71U	2026-09-05 07:57:27.466			zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	2026-08-29 07:57:27.467	2026-08-29 07:57:27.467	\N
dx6q1K8Ygyit1q1hiuqx9NZeqoTiLqpi	JUwLIIvgstk8lG6mpM4I61EvOPUDqZhQ	2026-09-08 07:17:15.264	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-29 07:53:01.885	2026-09-01 07:17:15.264	4
\.


--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student (id, "firstName", "lastName", "nationalCode", phone, address, "fatherName", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmsxggqmq0000wp0oa4ut0pkl	بهراد	باقری	0912345678	09365798460	\N	مرتضي	55733897@lms.local	2026-08-17 16:35:54.194	2026-08-17 20:14:47.11
cmt10zy8r0006wp0os73sc758	سعید	باقری	0934399220	09365798460	\N	رضا	55733897@lms.local	2026-08-20 04:34:01.367	2026-08-20 04:35:05.621
cmsxobaul0003wp0oz5dx7i83	علی	تقی	0926487981	09154239340	\N	رضا2	55733897@lms.local	2026-08-17 20:15:37.39	2026-08-20 06:07:23.992
cmt123wpl0009wp0obivfkwgf	علی	دایی	0987654321	09373081612	\N	رضا	55733897@lms.local	2026-08-20 05:05:05.624	2026-08-20 06:16:01.544
cmt5j11ft0001qoby5wdoc6ec	تست	تست	0999999999	09365798461	\N	تست	55733897@lms.local	2026-08-23 08:09:49.962	2026-08-23 08:09:49.962
\.


--
-- Data for Name: student_absence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_absence (id, "studentEnrollmentId", date, "startTime", "endTime", "absenceType", reason, "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmtgvrwao0004xrkunh3mz7dk	cmt10zzyo0008wp0ote6m30lc	2026-08-31	07:30	09:00	EXCUSED	دعوا	\N	2026-08-31 06:52:06.337	2026-08-31 06:52:50.566
cmtgvrwa50002xrkuy7jg3glf	cmsxoa8tk0002wp0ogqqae61b	2026-08-31	07:30	09:00	EXCUSED	ss	\N	2026-08-31 06:52:06.317	2026-08-31 11:16:02.194
cmtgw5zre0007xrkusz656dpv	cmt5j12a90003qobyx6kl3oll	2026-08-31	07:30	09:00	EXCUSED	aaa	\N	2026-08-31 07:03:04.01	2026-08-31 11:23:16.948
cmth5ifxp000dxrkugr1w888m	cmsxoa8tk0002wp0ogqqae61b	2026-08-05	09:08	12:03	UNKNOWN	\N	\N	2026-08-31 11:24:41.389	2026-08-31 11:52:48.146
cmticctwk0007tu2i3xjhmw90	cmsxoa8tk0002wp0ogqqae61b	2026-08-31	09:32	10:00	UNKNOWN	\N	\N	2026-09-01 07:24:03.044	2026-09-01 07:24:03.044
cmticctww0009tu2i55rxjahp	cmt123yos000bwp0odvo10pex	2026-08-31	09:32	10:00	UNKNOWN	\N	\N	2026-09-01 07:24:03.057	2026-09-01 07:24:03.057
cmth65eeq000gxrku2sx34w48	cmsxoa8tk0002wp0ogqqae61b	2026-08-26	07:30	09:59	EXCUSED	ارا	\N	2026-08-31 11:42:32.498	2026-09-01 07:24:23.919
cmticm28k000ftu2i9nyajkcb	cmt5j12a90003qobyx6kl3oll	2026-09-01	07:30	09:00	UNKNOWN	\N	\N	2026-09-01 07:31:13.748	2026-09-01 07:31:13.748
\.


--
-- Data for Name: student_disciplinary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_disciplinary (id, "studentEnrollmentId", date, "startTime", reason, "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmtic54bz0002tu2ievm7niwr	cmsxoa8tk0002wp0ogqqae61b	2026-09-01	07:30	دعوا	\N	2026-09-01 07:18:03.311	2026-09-01 07:18:03.311
cmtic54cr0004tu2iabxdvfuv	cmt5j12a90003qobyx6kl3oll	2026-09-01	07:30	دعوا	\N	2026-09-01 07:18:03.34	2026-09-01 07:18:03.34
cmtichpqk000ctu2iqq1y85r9	cmt5j12a90003qobyx6kl3oll	2026-09-01	19:30	کتک	\N	2026-09-01 07:27:50.925	2026-09-01 07:27:50.925
\.


--
-- Data for Name: student_enrollment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_enrollment (id, "studentId", "schoolId", "academicYearId", "payeId", "reshtehTahsiliId", "klassId", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmsxoa8tk0002wp0ogqqae61b	cmsxggqmq0000wp0oa4ut0pkl	55733897	1	1	3	b652dc64-00bd-41d5-b53c-92e3882881a8	55733897@lms.local	2026-08-17 20:14:48.104	2026-08-17 20:14:48.104
cmt10zzyo0008wp0ote6m30lc	cmt10zy8r0006wp0os73sc758	55733897	1	1	3	7f402316-6169-4978-96b7-adec0396ee6c	55733897@lms.local	2026-08-20 04:34:03.596	2026-08-20 04:34:03.596
cmsxobayb0005wp0oq6bg5xco	cmsxobaul0003wp0oz5dx7i83	55733897	1	1	3	b652dc64-00bd-41d5-b53c-92e3882881a8	55733897@lms.local	2026-08-17 20:15:37.524	2026-08-20 06:07:24.949
cmt123yos000bwp0odvo10pex	cmt123wpl0009wp0obivfkwgf	55733897	1	1	3	b652dc64-00bd-41d5-b53c-92e3882881a8	55733897@lms.local	2026-08-20 05:05:08.185	2026-08-20 06:16:02.419
cmt5j12a90003qobyx6kl3oll	cmt5j11ft0001qoby5wdoc6ec	55733897	1	1	3	7f402316-6169-4978-96b7-adec0396ee6c	55733897@lms.local	2026-08-23 08:09:51.057	2026-08-23 08:09:51.057
\.


--
-- Data for Name: teacher; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher (id, "firstName", "lastName", "nationalCode", "personnelCode", phone, address, "lastEditedByUsername", "userId", "createdAt", "updatedAt") FROM stdin;
cmte388aa0000rr2dw9o16isd	سعید	باقری	0934399220	96327225	09365798460	بببب	55733897@lms.local	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	2026-08-29 07:57:27.154	2026-08-29 07:57:27.488
\.


--
-- Data for Name: teacher_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_assignment (id, "teacherId", "schoolId", "academicYearId", "isActive", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmte389d00002rr2dlm7azu0m	cmte388aa0000rr2dw9o16isd	55733897	1	t	55733897@lms.local	2026-08-29 07:57:28.549	2026-08-29 07:57:28.549
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, name, "firstName", "lastName", "isActive", "emailVerified", image, "createdAt", "updatedAt", "systemRole", "banExpires", "banReason", banned, role) FROM stdin;
3Ah73bL7B6l7IR4jxTm0iR1lbsibZoIJ	master@lms.local	سعید باقری	سعید	باقری	t	t	\N	2026-07-31 07:37:51.701	2026-07-31 07:40:20.077	MASTER	\N	\N	f	user
2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	0999999999@lms.local	تست پسو	تست	پسو	t	f	\N	2026-08-23 08:08:53.153	2026-08-23 08:08:53.153	USER	\N	\N	f	user
xh5IJlxmuqN6pTH77c5cwvgbx25az57B	55733897@lms.local	کاخکی	کاخکی	مدیر	t	f	\N	2026-08-03 16:15:20.567	2026-08-24 06:13:11.765	USER	\N	\N	f	admin
zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	0934399220@lms.local	سعید باقری	\N	\N	t	f	\N	2026-08-29 07:57:27.437	2026-08-29 07:57:27.437	USER	\N	\N	f	user
\.


--
-- Data for Name: user_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_assignment (id, "userId", "schoolId", "academicYearId", role, "isActive", "createdAt", "updatedAt") FROM stdin;
4	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	55733897	1	MANAGER	t	2026-08-03 16:15:20.633	2026-08-03 16:15:20.633
\.


--
-- Name: academic_year_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academic_year_id_seq', 1, false);


--
-- Name: user_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_assignment_id_seq', 4, true);


--
-- Name: DoreTahsili DoreTahsili_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoreTahsili"
    ADD CONSTRAINT "DoreTahsili_pkey" PRIMARY KEY (id);


--
-- Name: Paye Paye_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Paye"
    ADD CONSTRAINT "Paye_pkey" PRIMARY KEY (id);


--
-- Name: ReshtehTadris ReshtehTadris_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReshtehTadris"
    ADD CONSTRAINT "ReshtehTadris_pkey" PRIMARY KEY (id);


--
-- Name: ReshtehTahsili ReshtehTahsili_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReshtehTahsili"
    ADD CONSTRAINT "ReshtehTahsili_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: academic_year academic_year_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_year
    ADD CONSTRAINT academic_year_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: class_course class_course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_course
    ADD CONSTRAINT class_course_pkey PRIMARY KEY (id);


--
-- Name: dars_paye_reshteh dars_paye_reshteh_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dars_paye_reshteh
    ADD CONSTRAINT dars_paye_reshteh_pkey PRIMARY KEY (id);


--
-- Name: klass klass_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.klass
    ADD CONSTRAINT klass_pkey PRIMARY KEY (id);


--
-- Name: ostans ostans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ostans
    ADD CONSTRAINT ostans_pkey PRIMARY KEY (id);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: school school_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school
    ADD CONSTRAINT school_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: student_absence student_absence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_absence
    ADD CONSTRAINT student_absence_pkey PRIMARY KEY (id);


--
-- Name: student_disciplinary student_disciplinary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_disciplinary
    ADD CONSTRAINT student_disciplinary_pkey PRIMARY KEY (id);


--
-- Name: student_enrollment student_enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_enrollment
    ADD CONSTRAINT student_enrollment_pkey PRIMARY KEY (id);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (id);


--
-- Name: teacher_assignment teacher_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignment
    ADD CONSTRAINT teacher_assignment_pkey PRIMARY KEY (id);


--
-- Name: teacher teacher_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher
    ADD CONSTRAINT teacher_pkey PRIMARY KEY (id);


--
-- Name: user_assignment user_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_assignment
    ADD CONSTRAINT user_assignment_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: ReshtehTadris_title_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ReshtehTadris_title_key" ON public."ReshtehTadris" USING btree (title);


--
-- Name: _DoreTahsiliToPaye_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_DoreTahsiliToPaye_AB_unique" ON public."_DoreTahsiliToPaye" USING btree ("A", "B");


--
-- Name: _DoreTahsiliToPaye_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_DoreTahsiliToPaye_B_index" ON public."_DoreTahsiliToPaye" USING btree ("B");


--
-- Name: _DoreTahsiliToReshtehTahsili_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_DoreTahsiliToReshtehTahsili_AB_unique" ON public."_DoreTahsiliToReshtehTahsili" USING btree ("A", "B");


--
-- Name: _DoreTahsiliToReshtehTahsili_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_DoreTahsiliToReshtehTahsili_B_index" ON public."_DoreTahsiliToReshtehTahsili" USING btree ("B");


--
-- Name: account_providerId_accountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "account_providerId_accountId_key" ON public.account USING btree ("providerId", "accountId");


--
-- Name: account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "account_userId_idx" ON public.account USING btree ("userId");


--
-- Name: class_course_klassId_darsPayeReshtehId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "class_course_klassId_darsPayeReshtehId_key" ON public.class_course USING btree ("klassId", "darsPayeReshtehId");


--
-- Name: class_course_klassId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "class_course_klassId_idx" ON public.class_course USING btree ("klassId");


--
-- Name: class_course_teacherId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "class_course_teacherId_idx" ON public.class_course USING btree ("teacherId");


--
-- Name: dars_paye_reshteh_reshtehTahsiliId_payeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dars_paye_reshteh_reshtehTahsiliId_payeId_idx" ON public.dars_paye_reshteh USING btree ("reshtehTahsiliId", "payeId");


--
-- Name: dars_paye_reshteh_reshtehTahsiliId_payeId_reshtehTadrisId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "dars_paye_reshteh_reshtehTahsiliId_payeId_reshtehTadrisId_key" ON public.dars_paye_reshteh USING btree ("reshtehTahsiliId", "payeId", "reshtehTadrisId");


--
-- Name: klass_schoolId_academicYearId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "klass_schoolId_academicYearId_idx" ON public.klass USING btree ("schoolId", "academicYearId");


--
-- Name: klass_title_schoolId_academicYearId_payeId_reshtehTahsiliId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "klass_title_schoolId_academicYearId_payeId_reshtehTahsiliId_key" ON public.klass USING btree (title, "schoolId", "academicYearId", "payeId", "reshtehTahsiliId");


--
-- Name: session_activeAssignmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "session_activeAssignmentId_idx" ON public.session USING btree ("activeAssignmentId");


--
-- Name: session_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX session_token_key ON public.session USING btree (token);


--
-- Name: session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "session_userId_idx" ON public.session USING btree ("userId");


--
-- Name: student_absence_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_absence_date_idx ON public.student_absence USING btree (date);


--
-- Name: student_absence_studentEnrollmentId_date_startTime_endTime_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_absence_studentEnrollmentId_date_startTime_endTime_key" ON public.student_absence USING btree ("studentEnrollmentId", date, "startTime", "endTime");


--
-- Name: student_absence_studentEnrollmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_absence_studentEnrollmentId_idx" ON public.student_absence USING btree ("studentEnrollmentId");


--
-- Name: student_disciplinary_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_disciplinary_date_idx ON public.student_disciplinary USING btree (date);


--
-- Name: student_disciplinary_studentEnrollmentId_date_startTime_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_disciplinary_studentEnrollmentId_date_startTime_key" ON public.student_disciplinary USING btree ("studentEnrollmentId", date, "startTime");


--
-- Name: student_disciplinary_studentEnrollmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_disciplinary_studentEnrollmentId_idx" ON public.student_disciplinary USING btree ("studentEnrollmentId");


--
-- Name: student_enrollment_klassId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_enrollment_klassId_idx" ON public.student_enrollment USING btree ("klassId");


--
-- Name: student_enrollment_payeId_reshtehTahsiliId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_enrollment_payeId_reshtehTahsiliId_idx" ON public.student_enrollment USING btree ("payeId", "reshtehTahsiliId");


--
-- Name: student_enrollment_schoolId_academicYearId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_enrollment_schoolId_academicYearId_idx" ON public.student_enrollment USING btree ("schoolId", "academicYearId");


--
-- Name: student_enrollment_studentId_schoolId_academicYearId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_enrollment_studentId_schoolId_academicYearId_key" ON public.student_enrollment USING btree ("studentId", "schoolId", "academicYearId");


--
-- Name: student_lastEditedByUsername_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_lastEditedByUsername_idx" ON public.student USING btree ("lastEditedByUsername");


--
-- Name: student_nationalCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_nationalCode_key" ON public.student USING btree ("nationalCode");


--
-- Name: teacher_assignment_schoolId_academicYearId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teacher_assignment_schoolId_academicYearId_idx" ON public.teacher_assignment USING btree ("schoolId", "academicYearId");


--
-- Name: teacher_assignment_teacherId_schoolId_academicYearId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "teacher_assignment_teacherId_schoolId_academicYearId_key" ON public.teacher_assignment USING btree ("teacherId", "schoolId", "academicYearId");


--
-- Name: teacher_nationalCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "teacher_nationalCode_key" ON public.teacher USING btree ("nationalCode");


--
-- Name: teacher_personnelCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teacher_personnelCode_idx" ON public.teacher USING btree ("personnelCode");


--
-- Name: teacher_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX teacher_phone_idx ON public.teacher USING btree (phone);


--
-- Name: teacher_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "teacher_userId_key" ON public.teacher USING btree ("userId");


--
-- Name: user_assignment_academicYearId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_assignment_academicYearId_idx" ON public.user_assignment USING btree ("academicYearId");


--
-- Name: user_assignment_schoolId_academicYearId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_assignment_schoolId_academicYearId_idx" ON public.user_assignment USING btree ("schoolId", "academicYearId");


--
-- Name: user_assignment_schoolId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_assignment_schoolId_idx" ON public.user_assignment USING btree ("schoolId");


--
-- Name: user_assignment_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_assignment_userId_idx" ON public.user_assignment USING btree ("userId");


--
-- Name: user_assignment_userId_schoolId_academicYearId_role_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_assignment_userId_schoolId_academicYearId_role_key" ON public.user_assignment USING btree ("userId", "schoolId", "academicYearId", role);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: _DoreTahsiliToPaye _DoreTahsiliToPaye_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DoreTahsiliToPaye"
    ADD CONSTRAINT "_DoreTahsiliToPaye_A_fkey" FOREIGN KEY ("A") REFERENCES public."DoreTahsili"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DoreTahsiliToPaye _DoreTahsiliToPaye_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DoreTahsiliToPaye"
    ADD CONSTRAINT "_DoreTahsiliToPaye_B_fkey" FOREIGN KEY ("B") REFERENCES public."Paye"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DoreTahsiliToReshtehTahsili _DoreTahsiliToReshtehTahsili_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DoreTahsiliToReshtehTahsili"
    ADD CONSTRAINT "_DoreTahsiliToReshtehTahsili_A_fkey" FOREIGN KEY ("A") REFERENCES public."DoreTahsili"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DoreTahsiliToReshtehTahsili _DoreTahsiliToReshtehTahsili_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DoreTahsiliToReshtehTahsili"
    ADD CONSTRAINT "_DoreTahsiliToReshtehTahsili_B_fkey" FOREIGN KEY ("B") REFERENCES public."ReshtehTahsili"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: class_course class_course_darsPayeReshtehId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_course
    ADD CONSTRAINT "class_course_darsPayeReshtehId_fkey" FOREIGN KEY ("darsPayeReshtehId") REFERENCES public.dars_paye_reshteh(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: class_course class_course_klassId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_course
    ADD CONSTRAINT "class_course_klassId_fkey" FOREIGN KEY ("klassId") REFERENCES public.klass(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: class_course class_course_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_course
    ADD CONSTRAINT "class_course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public.teacher(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dars_paye_reshteh dars_paye_reshteh_payeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dars_paye_reshteh
    ADD CONSTRAINT "dars_paye_reshteh_payeId_fkey" FOREIGN KEY ("payeId") REFERENCES public."Paye"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dars_paye_reshteh dars_paye_reshteh_reshtehTadrisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dars_paye_reshteh
    ADD CONSTRAINT "dars_paye_reshteh_reshtehTadrisId_fkey" FOREIGN KEY ("reshtehTadrisId") REFERENCES public."ReshtehTadris"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dars_paye_reshteh dars_paye_reshteh_reshtehTahsiliId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dars_paye_reshteh
    ADD CONSTRAINT "dars_paye_reshteh_reshtehTahsiliId_fkey" FOREIGN KEY ("reshtehTahsiliId") REFERENCES public."ReshtehTahsili"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: klass klass_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.klass
    ADD CONSTRAINT "klass_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public.academic_year(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: klass klass_payeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.klass
    ADD CONSTRAINT "klass_payeId_fkey" FOREIGN KEY ("payeId") REFERENCES public."Paye"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: klass klass_reshtehTahsiliId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.klass
    ADD CONSTRAINT "klass_reshtehTahsiliId_fkey" FOREIGN KEY ("reshtehTahsiliId") REFERENCES public."ReshtehTahsili"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: klass klass_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.klass
    ADD CONSTRAINT "klass_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.school(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: regions regions_ostanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT "regions_ostanId_fkey" FOREIGN KEY ("ostanId") REFERENCES public.ostans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: school school_doreTahsiliId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school
    ADD CONSTRAINT "school_doreTahsiliId_fkey" FOREIGN KEY ("doreTahsiliId") REFERENCES public."DoreTahsili"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: session session_activeAssignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_activeAssignmentId_fkey" FOREIGN KEY ("activeAssignmentId") REFERENCES public.user_assignment(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_absence student_absence_studentEnrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_absence
    ADD CONSTRAINT "student_absence_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES public.student_enrollment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_disciplinary student_disciplinary_studentEnrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_disciplinary
    ADD CONSTRAINT "student_disciplinary_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES public.student_enrollment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_enrollment student_enrollment_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_enrollment
    ADD CONSTRAINT "student_enrollment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public.academic_year(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_enrollment student_enrollment_klassId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_enrollment
    ADD CONSTRAINT "student_enrollment_klassId_fkey" FOREIGN KEY ("klassId") REFERENCES public.klass(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_enrollment student_enrollment_payeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_enrollment
    ADD CONSTRAINT "student_enrollment_payeId_fkey" FOREIGN KEY ("payeId") REFERENCES public."Paye"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_enrollment student_enrollment_reshtehTahsiliId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_enrollment
    ADD CONSTRAINT "student_enrollment_reshtehTahsiliId_fkey" FOREIGN KEY ("reshtehTahsiliId") REFERENCES public."ReshtehTahsili"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_enrollment student_enrollment_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_enrollment
    ADD CONSTRAINT "student_enrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.school(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_enrollment student_enrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_enrollment
    ADD CONSTRAINT "student_enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.student(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_assignment teacher_assignment_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignment
    ADD CONSTRAINT "teacher_assignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public.academic_year(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teacher_assignment teacher_assignment_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignment
    ADD CONSTRAINT "teacher_assignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.school(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teacher_assignment teacher_assignment_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_assignment
    ADD CONSTRAINT "teacher_assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public.teacher(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher teacher_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher
    ADD CONSTRAINT "teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_assignment user_assignment_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_assignment
    ADD CONSTRAINT "user_assignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public.academic_year(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_assignment user_assignment_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_assignment
    ADD CONSTRAINT "user_assignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.school(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_assignment user_assignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_assignment
    ADD CONSTRAINT "user_assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Wp9jyQNyky31knILwFLyuvYhfEoM3qsB6Xpl9ZoYiDMtty16JXKa4fsXxFks61t

