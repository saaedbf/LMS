--
-- PostgreSQL database dump
--

\restrict 3yKeeuGWyRop46TSW7cLRxiIQpkUw1dqwTpLvoQbeNmpR2tNUcGyRNuBpgkd3hT

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
-- Name: GradingType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GradingType" AS ENUM (
    'DESCRIPTIVE',
    'NUMERIC'
);


ALTER TYPE public."GradingType" OWNER TO postgres;

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
-- Name: grade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grade (
    id text NOT NULL,
    "studentEnrollmentId" text NOT NULL,
    "gradePeriodLessonId" text NOT NULL,
    score double precision,
    "descriptiveValue" text,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.grade OWNER TO postgres;

--
-- Name: grade_period; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grade_period (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "schoolId" integer NOT NULL,
    "academicYearId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.grade_period OWNER TO postgres;

--
-- Name: grade_period_klass; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grade_period_klass (
    id text NOT NULL,
    "gradePeriodId" text NOT NULL,
    "klassId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.grade_period_klass OWNER TO postgres;

--
-- Name: grade_period_lesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grade_period_lesson (
    id text NOT NULL,
    "gradePeriodId" text NOT NULL,
    "darsPayeReshtehId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "klassId" text NOT NULL
);


ALTER TABLE public.grade_period_lesson OWNER TO postgres;

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
-- Name: school_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_settings (
    id text NOT NULL,
    "schoolId" integer NOT NULL,
    "gradingType" public."GradingType" DEFAULT 'NUMERIC'::public."GradingType" NOT NULL,
    "showTuitionInStudentPanel" boolean DEFAULT true NOT NULL,
    "showDisciplinaryInStudentPanel" boolean DEFAULT true NOT NULL,
    "showAbsencesInStudentPanel" boolean DEFAULT true NOT NULL,
    "showReportCardsInStudentPanel" boolean DEFAULT true NOT NULL,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.school_settings OWNER TO postgres;

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
    "startTime" text,
    "endTime" text,
    "absenceType" public."AbsenceType" DEFAULT 'UNKNOWN'::public."AbsenceType" NOT NULL,
    reason text,
    "lastEditedByUsername" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isFullDay" boolean DEFAULT false NOT NULL
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
19	متوسطه اول
18	ابتدایی دوره اول
\.


--
-- Data for Name: Paye; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Paye" (id, title) FROM stdin;
1	اول
2	دوم
3	سوم
12	دوازدهم
7	هفتم
8	هشتم
9	نهم
\.


--
-- Data for Name: ReshtehTadris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReshtehTadris" (id, title) FROM stdin;
a4eacae1-24b6-4de3-ba55-997355cc1e36	ریاضی
b08cc6e3-bedb-45a7-b0e4-e57c10d2633e	فارسی
2f5bb07a-6519-4172-ba10-a44eea11ab4b	قرآن
4eea5788-efec-4896-b5b5-0fa7c49492c5	نگارش
09053e62-cac9-497a-b95a-b06bf14226cb	پیام های آسمانی
884c68e6-9e04-4503-b3d7-bda77fe68f16	عربی
a2dee3fe-3619-4011-9d07-66d852c7455d	زبان انگلیسی
41398dfb-d274-40f3-aaf1-c8b7ce749480	علوم تجربی
\.


--
-- Data for Name: ReshtehTahsili; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReshtehTahsili" (id, title) FROM stdin;
1	ابتدایی
2	متوسطه اول
3	برق
18	ابتدایی دوره اول
\.


--
-- Data for Name: _DoreTahsiliToPaye; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_DoreTahsiliToPaye" ("A", "B") FROM stdin;
1	1
1	2
19	7
19	8
19	9
18	1
18	2
18	3
\.


--
-- Data for Name: _DoreTahsiliToReshtehTahsili; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_DoreTahsiliToReshtehTahsili" ("A", "B") FROM stdin;
1	3
18	18
19	2
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
071f63eb-bbf9-4e68-be4a-e71f632c913b	cd8bac14a31699cca9deb3a90f7bd0c1516e35760e765b39f1d6231f21d197f4	2026-09-12 07:32:53.657639+00	20260912073253_add_klass_to_grade_period_lesson	\N	\N	2026-09-12 07:32:53.64094+00	1
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
dee555f5-eb7d-4208-8c55-ccfaba7b9707	9a00aadd5b2ea71af3de24e0d5b95646ecd1ac073b97b1a6133d7f3c34a87eef	2026-09-17 06:25:18.156631+00	20260917062518_add_school_settings	\N	\N	2026-09-17 06:25:18.131698+00	1
2c020468-5a3b-42dd-a087-382471ef3160	59cac334bf1371c825dfe805790a641e98755a2c16dc65ef27eef3e54be3561f	2026-09-01 03:43:58.185398+00	20260901034358_disciplinary	\N	\N	2026-09-01 03:43:58.175274+00	1
7b770669-da96-4acb-9af6-dc8c2e23a053	bd39e50766ef14667bdc73a42c99ccb46d12391de01ada733570eeed33b01a1f	2026-09-12 06:21:31.186305+00	20260912062131_add_grade_period	\N	\N	2026-09-12 06:21:31.15489+00	1
2a2fdec2-55cb-4505-9d17-7fb535c18dbd	eaf754ef3d4a9a15d942a4abd8c7638e8bd4673422b9a1e57c30cd739c6f5cd8	2026-09-17 08:32:56.100526+00	20260917083256_add_grade_model	\N	\N	2026-09-17 08:32:56.082449+00	1
d6f61fe8-ba16-41c3-8ed0-abfcba23a90b	312313a2261bf36f51faff7342f09bfd533c5754f8c8eb8fcb8aacd8b21a7a20	2026-09-22 03:39:28.393531+00	20260922033928_add_is_full_day_to_absence	\N	\N	2026-09-22 03:39:28.386905+00	1
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
p3o9HtmdcROYG6bUyqJKwlKzTS3TyMkf	credential	fk9XUpDWXPk9lnPdeeMzHEppuEi5E9y2	fk9XUpDWXPk9lnPdeeMzHEppuEi5E9y2	\N	\N	\N	\N	\N	\N	189a4f8cbfe14144b4105fca81071141:1be897d1cd98f52f876d0184c303c8e9697f5032ff43019beda6f4952ef25cebb3088a1eda5ed7081ab6d2f548698fa65be37075afc400be9907e545256d69fe	2026-09-17 16:56:46.355	2026-09-21 15:50:47.33
X95EtuMUe6BiQBSK2ctNQf4RfQmDSoVX	credential	2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	\N	\N	\N	\N	\N	\N	36d61dd3c6117983977a0d1cd0b333e2:68e87deba9989f64785c81ee23efe7425dbfb2cb50f122992fbd0fa6727639da41962b340ff62d151cb20fd97c511b34c4c365f5dc4cf909b7934fad5f2b2f9e	2026-08-23 08:08:53.178	2026-08-24 07:13:53.335
aYXaYHV7Z5kX7CzxAFqZLtijVIgmxeJN	credential	jElVFiMztMTDiqErvSwT3fkh1kba5CkX	jElVFiMztMTDiqErvSwT3fkh1kba5CkX	\N	\N	\N	\N	\N	\N	a619cb194de77b4ba5cef5b4de836798:d09bb0dcb36de4a89c296ec3bdab081faf6308670fb9a7e8a5fb3dbc2e58c200c66989327c9ff33c7a9ca5636484288a8ca871a62fcad178810ecda9553109db	2026-09-17 16:14:18.399	2026-09-17 16:14:18.399
FujCnPnG1VjhqpAy462ffdJDrFIpMGmn	credential	oa3Z9zVwoKEtYs0VufC4y05udlKXmcWc	oa3Z9zVwoKEtYs0VufC4y05udlKXmcWc	\N	\N	\N	\N	\N	\N	fe88c3466ef98b470e347a5fa6ee7570:1b5fece7d2bafa9295c79042c9cb266522126b747d3f30ac8b3277aa07f4ba099ba2632fd1bbef971783d79917c299bd7955e4489901cab1807baeea83e957b3	2026-09-17 16:30:17.485	2026-09-17 16:30:17.485
rOQ7yKAcao3wGxWR4GbdTqFaAnmauQTq	credential	zju8FqvtZ6KtgvJNr8ENijtb6RVjTuLt	zju8FqvtZ6KtgvJNr8ENijtb6RVjTuLt	\N	\N	\N	\N	\N	\N	b18677bf61d2ce134ae36c6dc9648768:2040420f567e97aa8e128165e2bb965578e7b82ed2cacdbce6e8d228689123d6938cf829e82e3f5e7f8700933df1ef744f59a272df404280ff53c1c97328da25	2026-09-17 16:31:32.209	2026-09-17 16:31:32.209
T7nYimu6pFrNt96XhMxEuzKwOAgEi1dW	credential	oZUoRvHnan0NgWI3LBYYQyznQXlhtPr0	oZUoRvHnan0NgWI3LBYYQyznQXlhtPr0	\N	\N	\N	\N	\N	\N	644fb3db7f763e06b9c9692653ea8323:0a107afed2f690e014d7d1fee6b0395a4bb96607fa1c93664d5963e2459edc2014ccdf3580e54172b6f561e0e5c4ec1321c11dd9053351fc66aac70aefbb7f80	2026-09-17 16:36:29.249	2026-09-17 16:36:29.249
mIx4R5SAtXjEOOpRj0MtWPCwGsgvryHH	credential	Q0Nmsbm8A81rzQ4HZf380ilI7n11fKNB	Q0Nmsbm8A81rzQ4HZf380ilI7n11fKNB	\N	\N	\N	\N	\N	\N	69badf00db076be5ae826096705fda68:255c101519eb40cfe262627e69992df30e76754bb4376a3a687be91fad2f200d766e2ed7ef8d94acdeef29e85f08ec282a4bff421188e290d1c574c02330e75c	2026-09-17 16:39:56.044	2026-09-17 16:39:56.044
BdmD39w6jFt40S9vXeYak05bpVUaVNPP	credential	oYfQ0fu0ujecxb0QjLlhYppkbzAebYor	oYfQ0fu0ujecxb0QjLlhYppkbzAebYor	\N	\N	\N	\N	\N	\N	a42afba66f74666ed9f5abda1375f605:baaf530d30c4cae647d2185b6e96a77e98c8709ab3acc8d4dca9ad532d8e2c6b7c043f646bc91e4a7e22f2c0407064a24dc669af17f7e04057a6dcbd6d85158e	2026-09-17 16:42:20.097	2026-09-17 16:42:20.097
5FbwFHSAQLbTahlImJGE3N4alhKVPxyZ	credential	aqFM9X2DxsVV4VfrHPzbeuZyleWXI1h4	aqFM9X2DxsVV4VfrHPzbeuZyleWXI1h4	\N	\N	\N	\N	\N	\N	d667c06328e9a0c2f2ad7aec61a3f85c:23056a3e9531f50dd59fc6d63d7489454d832c4cb54e9a2b4b86660765ce3453ffc023b458d44276525ebe377ef7dfff138c588e315010633c10a379c16162df	2026-09-17 16:48:41.88	2026-09-17 16:48:41.88
Wn78rRvO4O5WqI3Q8TbllC9bR3MAeTUm	credential	S3C9otnLLVd5y57PwhxnfXgmZUK3Lnuv	S3C9otnLLVd5y57PwhxnfXgmZUK3Lnuv	\N	\N	\N	\N	\N	\N	90018854f73b6a13d6931fa18a34d7c9:c13d1afd7264ac232cdbefbc6b5eec95d179ca8679edaff9926f26f140e1e9f346894c66b74be6659480a39d0be431abf8d5e0bb50be22dbc7c9ee85f788012a	2026-09-17 16:52:58.187	2026-09-17 16:52:58.187
xA2naQJchk4dUKcaZKKSVwBBgPAm5zp6	credential	U4edTOBSCx7M1murPora3YV0m7DsgyiW	U4edTOBSCx7M1murPora3YV0m7DsgyiW	\N	\N	\N	\N	\N	\N	eda0f016aa97d86b7c93f0910407dff1:eb545a9b57b536debfdbb8fdc6ad78c0f1704a197bb0abfbf5dd02a246ecae65f455d48d8ca2de9f06c2ccbb82a7cd3284ff3fd065e865594ad9f61fb61d9135	2026-09-20 16:01:54.041	2026-09-20 16:01:54.041
ASjdfxRNzpd02ITugUOJfddy4DGcYiF2	credential	1QjLIRIr1LVaaqUADYZTaRwkPh6QKIVG	1QjLIRIr1LVaaqUADYZTaRwkPh6QKIVG	\N	\N	\N	\N	\N	\N	5f2391f347811d3c287fb65432e0bb16:435502da118fc89207213143608fed4a037d8e76f75ec6aef23460720a4251e8cd4ffdfca98fe01ce0e27287376d9eef8a261d758e36b5a1b8d99ba6cc370c49	2026-09-20 16:01:54.423	2026-09-20 16:01:54.423
cAoR5sD4Gl54zNfqKP5NwlEPhACMfb7Y	credential	yjlJyg3zEMfpy37n8eHJcDjJoh9tBdge	yjlJyg3zEMfpy37n8eHJcDjJoh9tBdge	\N	\N	\N	\N	\N	\N	a4af69cf2b9601efa5d649a476639ed2:3ae78d1c1bed2e5bd0b06f890b8769d5dab3e6debb87bfce1ae9f27bc5b7ee18dd855a94d437a887ac990bb52c5756901cc1769e96f2b204667632b13ea6587c	2026-09-20 16:01:54.709	2026-09-20 16:01:54.709
nvNVd6bnpF4TwL73zBlQgSQ9ryJOMIT5	credential	Xn6uGm873BQL6uab93Pkz40X4lnSc69e	Xn6uGm873BQL6uab93Pkz40X4lnSc69e	\N	\N	\N	\N	\N	\N	8912a517502a3d9fc1bdc46ca53f3b1b:637a455f183372e017daac7044cc6f5f6ee4cf62e0a2fd68f7e540d91fb9a8597855b448ecd154aa8722f968edada18d02362f4a0bcc525a1b731d52e6a7ffda	2026-09-20 16:01:55.058	2026-09-20 16:01:55.058
xUBJ4tqZbgFInm3vufYUdQKOz3qTqm3p	credential	gRtpagal0cOSbte3xc5EI1htweWaQLC0	gRtpagal0cOSbte3xc5EI1htweWaQLC0	\N	\N	\N	\N	\N	\N	fc24a20377fe3bfd4203f132b00834a1:451274d87c204da363e82b07ae62c001c01f580924f136453ebd0566fbe236b9d6fde06c704fa283a8a2b477f6ab337b8343441fe56a67785fe3e94fe249e6c0	2026-09-20 16:01:55.889	2026-09-20 16:01:55.889
ixFPk6ZyHfRNxCxgng5rLkF0HsVvQYBS	credential	xCI4MPOmvC7IQxRR7WPyzgpDPdXmXTDS	xCI4MPOmvC7IQxRR7WPyzgpDPdXmXTDS	\N	\N	\N	\N	\N	\N	019e27e4992d0ec69e3f8d2f6f9332d7:499b5d02a7b228501a3244a396a2ad29a079529787b355fc16ae7e18b4daa381fd8473e2f066a4c03a9e01a6f4e875e85a78fa778259501d09be41e295e154e0	2026-09-17 16:15:08.132	2026-09-21 16:55:20.135
60JlAfmHhDuSjCx6PqDYDOFACxVEhLXK	credential	i5rwLQn71MDZnia58oAPHKHGUzMwyv8G	i5rwLQn71MDZnia58oAPHKHGUzMwyv8G	\N	\N	\N	\N	\N	\N	d29526f7b7e295d63aa64729fb64c1fa:42de004ac52af30044bf396d05adec33f0ec4aea31ee41bb9a9ab14c0a8f59cc072c63d9a8b2e42378076e51e339164d1843d495e8801d2e30b6c8164a28b44e	2026-09-20 16:01:55.62	2026-09-22 02:48:28.247
X5QZ5AUpAuFytG4JHay7hg2PUZvNqXCa	credential	06SdBc4GCiLFFHZCM9NumJg9jyFHDNsP	06SdBc4GCiLFFHZCM9NumJg9jyFHDNsP	\N	\N	\N	\N	\N	\N	4f89a7f703289be4c76813d6a54461f1:fc7dfe691d99d1b23a23a6e051cac6a5b9fa73768f76fbd61901f4fa2f5770f7a1467d5c7397d7b18d46bf90ce48e6f386b65d538aeeae3382e9d78feee03c99	2026-09-20 16:01:55.393	2026-09-22 02:48:35.873
yjT01KygpntZxtTztzO09mCd61xaTnfQ	credential	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	\N	\N	\N	\N	\N	\N	dfa9530a278165c57648a15316516577:e7e39001e0e5a36b97e74d84d9853fb3112cfb91516cca33c2e69adffd79be1c84ad895894f4519e8f90c2a23fd48c583fe3f27a4ca56eb17b1d7398d0703708	2026-08-29 07:57:27.454	2026-09-22 02:57:10.154
tWFAzJXxFsycRYoffUsOwTULysA5sj2W	credential	4z8dmrX64Z0nSulvE0RLOmDia7yd6cmb	4z8dmrX64Z0nSulvE0RLOmDia7yd6cmb	\N	\N	\N	\N	\N	\N	83cbf67f12aba48a80a9116dfae8a9c7:8104e29fd39c1f1b7bac042f67dad7271a47f4d53ab54eb6784a401853eaa485684eeeb063ac493b8ee8b2c83a59bc4f8c1db31a99b46486f6292a9584ff31dd	2026-09-20 16:01:56.162	2026-09-20 16:01:56.162
vC0HbKNURmRcglAxEmqtFYqN21aHranV	credential	diC7F2NUd2WVcaBiYMsFpAVZbeNQALhq	diC7F2NUd2WVcaBiYMsFpAVZbeNQALhq	\N	\N	\N	\N	\N	\N	52de35ba38bb5fb15840ad69deaa8d5b:3b79666d2e5f43d64180d459ab6d0bc1463ac4cbb5f069b25f170c249f81a1c4276c6ce19d3a7c140c8c0d820c60fb306d67a590cfd07354e865f6f1a900fab8	2026-09-22 03:07:43.725	2026-09-22 03:07:43.725
LuhWf2JH75nwmawp82h4s6UNeyFEpxNZ	credential	I1GeJj1E26xTkyGF5w11dDiPRc4ONi3O	I1GeJj1E26xTkyGF5w11dDiPRc4ONi3O	\N	\N	\N	\N	\N	\N	bb9403cf52f2f21cb19e0f793da34660:aa9903579d30e417bee1d5fbcb0da77ad647daaacfb00b348f2b4254c3e03f65307356241f450590d510882cd42f7b9ed208907e1caccbcb8ac180015fe8cb76	2026-09-22 03:07:43.45	2026-09-22 03:10:19.163
\.


--
-- Data for Name: class_course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class_course (id, "klassId", "darsPayeReshtehId", "teacherId", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmtwn78gn0001x9ctf54y4rve	8c1188f5-8191-4515-8ce5-5b5b677743ec	626afa8b-fadc-4df0-ab9f-3f30d7541101	\N	55733897@lms.local	2026-09-11 07:36:24.211	2026-09-11 07:36:31.967
cmtxyeedi0005x9ctjl2kqa0x	7f402316-6169-4978-96b7-adec0396ee6c	df2bc11f-9d68-474e-8bf1-cd7279dfe179	\N	55733897@lms.local	2026-09-12 05:37:40.422	2026-09-12 05:37:47.131
cmtwn7i480003x9ct2sdqt2aj	8c1188f5-8191-4515-8ce5-5b5b677743ec	df2bc11f-9d68-474e-8bf1-cd7279dfe179	\N	55733897@lms.local	2026-09-11 07:36:36.728	2026-09-12 06:05:36.466
cmtxzet1v0007x9ct7wt1ogu1	7f402316-6169-4978-96b7-adec0396ee6c	626afa8b-fadc-4df0-ab9f-3f30d7541101	cmte388aa0000rr2dw9o16isd	55733897@lms.local	2026-09-12 06:05:59.059	2026-09-12 06:05:59.059
cmu5rvcxy0013qkxvpw1m0lys	ba5c7272-591a-41e5-ab46-76d9148f03aa	c50e6862-799f-4bbc-b66e-cf3f9e49a3c7	cmu5ruz9k000zqkxvoejp3xa2	95115323@lms.local	2026-09-17 16:57:03.814	2026-09-17 16:57:03.814
cmu5rvhva0015qkxvoi7090md	33af7c58-9da7-4409-84f5-9bbf4bd0703e	348e3d4f-12f0-40c2-8913-d9bcfc723fc3	cmu5ruz9k000zqkxvoejp3xa2	95115323@lms.local	2026-09-17 16:57:10.198	2026-09-17 16:57:10.198
cmu5u7x9x0001vjyxyy2may9k	e88c07ff-fb70-4a16-be26-5a6a420e214d	348e3d4f-12f0-40c2-8913-d9bcfc723fc3	cmu5ruz9k000zqkxvoejp3xa2	95115323@lms.local	2026-09-17 18:02:49.269	2026-09-17 18:02:49.269
cmu5uz6kt000svjyxn9k59tja	e88c07ff-fb70-4a16-be26-5a6a420e214d	b9ba95cc-7ffc-4357-9735-b8050c458368	cmu5ruz9k000zqkxvoejp3xa2	95115323@lms.local	2026-09-17 18:24:01.037	2026-09-17 18:24:01.037
cmu5uz92z000uvjyxi7ifjlba	e88c07ff-fb70-4a16-be26-5a6a420e214d	3d3d6ec8-ce6a-4c56-a56e-75f6825971a4	cmu5ruz9k000zqkxvoejp3xa2	95115323@lms.local	2026-09-17 18:24:04.283	2026-09-17 18:24:04.283
cmu5v6hd8002dvjyxfl0ckw7r	e88c07ff-fb70-4a16-be26-5a6a420e214d	0cfbe98f-dfd2-4b8d-aa66-568b6f65aee4	cmu5ruz9k000zqkxvoejp3xa2	95115323@lms.local	2026-09-17 18:29:41.613	2026-09-17 18:29:41.613
\.


--
-- Data for Name: dars_paye_reshteh; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dars_paye_reshteh (id, units, "reshtehTahsiliId", "payeId", "reshtehTadrisId", "createdAt", "updatedAt") FROM stdin;
f1100b67-a895-4f0a-8ccd-b77418f30b8e	1	3	2	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-08-04 06:49:21.55	2026-08-04 06:49:21.55
df2bc11f-9d68-474e-8bf1-cd7279dfe179	2	3	1	b08cc6e3-bedb-45a7-b0e4-e57c10d2633e	2026-08-04 06:49:49.81	2026-08-04 06:49:49.81
550beea9-2b35-48ad-a4c3-8f2ebfa5822f	2	3	2	b08cc6e3-bedb-45a7-b0e4-e57c10d2633e	2026-08-04 07:05:30.836	2026-08-04 07:05:30.836
5fd911b5-e436-4c41-9402-f17d2f7f4b01	1	1	3	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-08-04 07:06:03.825	2026-08-04 07:06:03.825
626afa8b-fadc-4df0-ab9f-3f30d7541101	1	3	1	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-09-11 07:14:14.39	2026-09-11 07:14:14.39
bdc38633-1786-429b-8646-4350f8104ed0	2	2	7	2f5bb07a-6519-4172-ba10-a44eea11ab4b	2026-09-17 09:15:55.443	2026-09-17 09:15:55.443
3d3d6ec8-ce6a-4c56-a56e-75f6825971a4	2	2	7	09053e62-cac9-497a-b95a-b06bf14226cb	2026-09-17 09:16:01.713	2026-09-17 09:16:01.713
0cfbe98f-dfd2-4b8d-aa66-568b6f65aee4	2	2	7	b08cc6e3-bedb-45a7-b0e4-e57c10d2633e	2026-09-17 09:16:13.418	2026-09-17 09:16:13.418
b9ba95cc-7ffc-4357-9735-b8050c458368	4	2	7	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-09-17 09:16:23.165	2026-09-17 09:16:23.165
5b3e4562-caa4-43a5-bd60-a8ab243cac30	2	2	7	884c68e6-9e04-4503-b3d7-bda77fe68f16	2026-09-17 09:16:44.684	2026-09-17 09:16:44.684
9c126101-60ce-487c-bcd0-76ac601c5bd1	3	2	7	41398dfb-d274-40f3-aaf1-c8b7ce749480	2026-09-17 09:16:49.804	2026-09-17 09:16:49.804
348e3d4f-12f0-40c2-8913-d9bcfc723fc3	2	2	7	a2dee3fe-3619-4011-9d07-66d852c7455d	2026-09-17 09:16:54.014	2026-09-17 09:16:54.014
a3381f20-1cbb-4c0a-9f2a-d808475abc68	4	2	8	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-09-17 16:10:55.979	2026-09-17 16:10:55.979
c50e6862-799f-4bbc-b66e-cf3f9e49a3c7	2	2	8	a2dee3fe-3619-4011-9d07-66d852c7455d	2026-09-17 16:11:02.375	2026-09-17 16:11:02.375
5bc63f32-ad23-4e50-8599-d0f5f0405f83	2	2	8	4eea5788-efec-4896-b5b5-0fa7c49492c5	2026-09-17 16:11:25.119	2026-09-17 16:11:25.119
48ecfe22-b362-4511-abe5-b8fd70ec0ca8	2	18	1	09053e62-cac9-497a-b95a-b06bf14226cb	2026-09-17 16:12:41.287	2026-09-17 16:12:41.287
ae7d49af-5055-4187-b9aa-62da7e191b61	2	18	1	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-09-17 16:12:46.391	2026-09-17 16:12:46.391
63d4e6fd-c87b-4b97-a63e-a883cd91b742	2	18	1	b08cc6e3-bedb-45a7-b0e4-e57c10d2633e	2026-09-17 16:12:50.641	2026-09-17 16:12:50.641
77fd1417-65f3-4e7e-8224-6f6d38355c1e	2	18	2	09053e62-cac9-497a-b95a-b06bf14226cb	2026-09-17 16:12:55.769	2026-09-17 16:12:55.769
653d57e9-b799-411c-b407-745a5d2b9587	2	18	3	a4eacae1-24b6-4de3-ba55-997355cc1e36	2026-09-17 16:13:03.475	2026-09-17 16:13:03.475
\.


--
-- Data for Name: grade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grade (id, "studentEnrollmentId", "gradePeriodLessonId", score, "descriptiveValue", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmu5v0t6m0015vjyxqezqms2o	cmu5rq3wj000yqkxvljasr7nx	cmu5uzhxc0010vjyxsbi261i7	10	\N	3611232531@lms.local	2026-09-17 18:25:16.991	2026-09-17 18:25:24.985
cmu5v10m0001bvjyxg959722s	cmu5rq3wj000yqkxvljasr7nx	cmu5uzhxc0012vjyx94t2dcr7	11	\N	3611232531@lms.local	2026-09-17 18:25:26.616	2026-09-17 18:25:26.895
cmu5v127n001fvjyx1te60md3	cmu5rq3wj000yqkxvljasr7nx	cmu5uzhxc0013vjyx8nvlal47	12	\N	3611232531@lms.local	2026-09-17 18:25:28.692	2026-09-17 18:25:28.962
cmu5v12mq001jvjyxdt1fqj4x	cmu5r4z3z000jqkxvwr0kjukb	cmu5uzhxc0010vjyxsbi261i7	13	\N	3611232531@lms.local	2026-09-17 18:25:29.234	2026-09-17 18:25:29.528
cmu5v13qq001nvjyx9evl1c55	cmu5r4z3z000jqkxvwr0kjukb	cmu5uzhxc0012vjyx94t2dcr7	14	\N	3611232531@lms.local	2026-09-17 18:25:30.674	2026-09-17 18:25:30.967
cmu5v149k001rvjyxfa34k2o5	cmu5r4z3z000jqkxvwr0kjukb	cmu5uzhxc0013vjyx8nvlal47	15	\N	3611232531@lms.local	2026-09-17 18:25:31.352	2026-09-17 18:25:31.614
cmu5v15ff001vvjyx9rvz4pmy	cmu5qx35x000bqkxv6znmj92w	cmu5uzhxc0010vjyxsbi261i7	11	\N	3611232531@lms.local	2026-09-17 18:25:32.859	2026-09-17 18:25:33.129
cmu5v17pw001zvjyx2r1es5mj	cmu5qx35x000bqkxv6znmj92w	cmu5uzhxc0012vjyx94t2dcr7	10	\N	3611232531@lms.local	2026-09-17 18:25:35.828	2026-09-17 18:25:36.116
cmu5v18w00023vjyxp7v8fdv3	cmu5qx35x000bqkxv6znmj92w	cmu5uzhxc0013vjyx8nvlal47	8	\N	3611232531@lms.local	2026-09-17 18:25:37.344	2026-09-17 18:25:37.344
cmu5v1bd60025vjyx55ggzv3n	cmu5qym90000fqkxvy6galx2o	cmu5uzhxc0010vjyxsbi261i7	5	\N	3611232531@lms.local	2026-09-17 18:25:40.554	2026-09-17 18:25:40.554
cmu5v1dpn0027vjyx7o67x7ie	cmu5qym90000fqkxvy6galx2o	cmu5uzhxc0012vjyx94t2dcr7	6	\N	3611232531@lms.local	2026-09-17 18:25:43.595	2026-09-17 18:25:43.595
cmu5v1eso0029vjyx8mon6c7f	cmu5qym90000fqkxvy6galx2o	cmu5uzhxc0013vjyx8nvlal47	10	\N	3611232531@lms.local	2026-09-17 18:25:45.001	2026-09-17 18:25:45.299
cmu9xbvok002fvjyxj2fpa0fm	cmu5rq3wj000yqkxvljasr7nx	cmu5uzhxc0011vjyx5ai0bcbn	12	\N	3611232531@lms.local	2026-09-20 14:40:57.38	2026-09-20 14:40:57.958
cmu9xbx8m002jvjyxovbkvwql	cmu5r4z3z000jqkxvwr0kjukb	cmu5uzhxc0011vjyx5ai0bcbn	14.25	\N	3611232531@lms.local	2026-09-20 14:40:59.399	2026-09-20 14:41:00.516
cmu9xc1sd002rvjyxf6vtnql3	cmu5qx35x000bqkxv6znmj92w	cmu5uzhxc0011vjyx5ai0bcbn	5	\N	3611232531@lms.local	2026-09-20 14:41:05.293	2026-09-20 14:41:05.293
cmu9xc2ky002tvjyxuhruxr0p	cmu5qym90000fqkxvy6galx2o	cmu5uzhxc0011vjyx5ai0bcbn	10	\N	3611232531@lms.local	2026-09-20 14:41:06.323	2026-09-20 14:41:06.709
\.


--
-- Data for Name: grade_period; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grade_period (id, title, description, "schoolId", "academicYearId", "isActive", "startDate", "endDate", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmty2wljg0002qdilbz5va66s	مهر	\N	55733897	1	t	\N	\N	55733897@lms.local	2026-09-12 07:43:47.98	2026-09-12 07:44:28.966
cmty33xbl000nqdiltwoo8k76	آبان	\N	55733897	1	t	\N	\N	55733897@lms.local	2026-09-12 07:49:29.841	2026-09-12 07:49:36.711
cmu5umtht0004vjyx4ouqb4g2	مهر 2	\N	95115323	1	t	\N	\N	95115323@lms.local	2026-09-17 18:14:24.209	2026-09-17 18:24:15.716
\.


--
-- Data for Name: grade_period_klass; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grade_period_klass (id, "gradePeriodId", "klassId", "createdAt") FROM stdin;
cmty2xh67000iqdiln08l4u2q	cmty2wljg0002qdilbz5va66s	b652dc64-00bd-41d5-b53c-92e3882881a8	2026-09-12 07:44:28.976
cmty33xbr000oqdilzihrddgu	cmty33xbl000nqdiltwoo8k76	b652dc64-00bd-41d5-b53c-92e3882881a8	2026-09-12 07:49:29.848
cmty33xbr000pqdilidk1ves7	cmty33xbl000nqdiltwoo8k76	7f402316-6169-4978-96b7-adec0396ee6c	2026-09-12 07:49:29.848
cmu5uzhx5000wvjyxnhunhhoh	cmu5umtht0004vjyx4ouqb4g2	e88c07ff-fb70-4a16-be26-5a6a420e214d	2026-09-17 18:24:15.737
cmu5uzhx5000xvjyxegey62ta	cmu5umtht0004vjyx4ouqb4g2	ba5c7272-591a-41e5-ab46-76d9148f03aa	2026-09-17 18:24:15.737
\.


--
-- Data for Name: grade_period_lesson; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grade_period_lesson (id, "gradePeriodId", "darsPayeReshtehId", "createdAt", "klassId") FROM stdin;
cmty2xh6c000jqdilywzm6cd5	cmty2wljg0002qdilbz5va66s	626afa8b-fadc-4df0-ab9f-3f30d7541101	2026-09-12 07:44:28.981	b652dc64-00bd-41d5-b53c-92e3882881a8
cmty2xh6c000kqdilnh9qb2c8	cmty2wljg0002qdilbz5va66s	df2bc11f-9d68-474e-8bf1-cd7279dfe179	2026-09-12 07:44:28.981	b652dc64-00bd-41d5-b53c-92e3882881a8
cmu5uzhxb000yvjyxhb0pezpn	cmu5umtht0004vjyx4ouqb4g2	c50e6862-799f-4bbc-b66e-cf3f9e49a3c7	2026-09-17 18:24:15.744	ba5c7272-591a-41e5-ab46-76d9148f03aa
cmu5uzhxb000zvjyxs2h6ir4h	cmu5umtht0004vjyx4ouqb4g2	a3381f20-1cbb-4c0a-9f2a-d808475abc68	2026-09-17 18:24:15.744	ba5c7272-591a-41e5-ab46-76d9148f03aa
cmu5uzhxc0010vjyxsbi261i7	cmu5umtht0004vjyx4ouqb4g2	348e3d4f-12f0-40c2-8913-d9bcfc723fc3	2026-09-17 18:24:15.744	e88c07ff-fb70-4a16-be26-5a6a420e214d
cmu5uzhxc0011vjyx5ai0bcbn	cmu5umtht0004vjyx4ouqb4g2	0cfbe98f-dfd2-4b8d-aa66-568b6f65aee4	2026-09-17 18:24:15.744	e88c07ff-fb70-4a16-be26-5a6a420e214d
cmu5uzhxc0012vjyx94t2dcr7	cmu5umtht0004vjyx4ouqb4g2	b9ba95cc-7ffc-4357-9735-b8050c458368	2026-09-17 18:24:15.744	e88c07ff-fb70-4a16-be26-5a6a420e214d
cmu5uzhxc0013vjyx8nvlal47	cmu5umtht0004vjyx4ouqb4g2	3d3d6ec8-ce6a-4c56-a56e-75f6825971a4	2026-09-17 18:24:15.744	e88c07ff-fb70-4a16-be26-5a6a420e214d
\.


--
-- Data for Name: klass; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.klass (id, title, "schoolId", "academicYearId", "payeId", "reshtehTahsiliId", "createdAt", "updatedAt") FROM stdin;
b652dc64-00bd-41d5-b53c-92e3882881a8	102	55733897	1	1	3	2026-08-04 09:09:14.755	2026-08-04 09:09:14.755
7f402316-6169-4978-96b7-adec0396ee6c	107	55733897	1	1	3	2026-08-04 09:13:41.482	2026-08-04 09:13:41.482
8c1188f5-8191-4515-8ce5-5b5b677743ec	108	55733897	1	1	3	2026-08-24 06:18:51.007	2026-08-24 06:18:51.007
e88c07ff-fb70-4a16-be26-5a6a420e214d	701	95115323	1	7	2	2026-09-17 16:24:00.068	2026-09-17 16:24:00.068
33af7c58-9da7-4409-84f5-9bbf4bd0703e	702	95115323	1	7	2	2026-09-17 16:24:06.794	2026-09-17 16:24:06.794
ba5c7272-591a-41e5-ab46-76d9148f03aa	801	95115323	1	8	2	2026-09-17 16:24:11.71	2026-09-17 16:24:11.71
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
95115323	شهید کاخکی 1	t	2026-09-17 16:14:18.118	2026-09-17 16:14:18.118	19	کمال شمس آرا	Dolati	Boy	
95106473	رجایی	t	2026-09-17 16:15:07.899	2026-09-17 16:15:07.899	18	مجید تاتاری	Dolati	Boy	
\.


--
-- Data for Name: school_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.school_settings (id, "schoolId", "gradingType", "showTuitionInStudentPanel", "showDisciplinaryInStudentPanel", "showAbsencesInStudentPanel", "showReportCardsInStudentPanel", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmu571zme0001rtzj51ye5vxw	55733897	NUMERIC	t	t	t	t	55733897@lms.local	2026-09-17 07:14:21.204	2026-09-17 16:16:39.069
cmu5qh6280005qkxvz38pln2w	95115323	NUMERIC	t	t	t	t	95115323@lms.local	2026-09-17 16:18:02.097	2026-09-21 16:01:54.068
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (id, token, "expiresAt", "ipAddress", "userAgent", "userId", "createdAt", "updatedAt", "activeAssignmentId") FROM stdin;
ZD6o80X16hoUIsup4WUQstgf2iZPWAS0	ZvXIJ5x3uQTU1eU7z1GHwQ00JrX0qNCh	2026-08-30 08:08:53.186			2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	2026-08-23 08:08:53.186	2026-08-23 08:08:53.186	\N
mAhmFO7CDP8yznL9hx3JQB398XtmABbn	QLfzpxksnptuaSr6nxpJ3QxDNwIK8hhi	2026-09-27 16:01:54.059	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	U4edTOBSCx7M1murPora3YV0m7DsgyiW	2026-09-20 16:01:54.06	2026-09-20 16:01:54.06	\N
XiRsod5MSzr3f5OF6OTGb7FgyRdlkoGO	oO8VvbfRodinUgEk2qKlRJRAqr0X8916	2026-09-27 16:01:54.43	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	1QjLIRIr1LVaaqUADYZTaRwkPh6QKIVG	2026-09-20 16:01:54.431	2026-09-20 16:01:54.431	\N
bWTxqH0QLOgB5OSXp06gMaM943E2bnyt	qstWq4C13CIiMwlcckxjrsMb20Ro9jIb	2026-08-10 16:15:20.609			xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-03 16:15:20.609	2026-08-03 16:15:20.609	\N
YsX7Xr2u685LpsJvq01t2Or38H3nrsnf	ilzyzduSu6BErF7uZYGWVjtFVTBGiJnj	2026-09-27 16:01:54.719	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	yjlJyg3zEMfpy37n8eHJcDjJoh9tBdge	2026-09-20 16:01:54.72	2026-09-20 16:01:54.72	\N
5nrXKfCYWgewzDJlPh2ZHjKpa54rqN03	hjNUs83rv17nVY7lg6XhIBIOxHOUOdvD	2026-09-27 16:01:55.067	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	Xn6uGm873BQL6uab93Pkz40X4lnSc69e	2026-09-20 16:01:55.067	2026-09-20 16:01:55.067	\N
f5z80TKOjdpkOgqp13AuhMN4n2p4TMeB	u7e9S7sdvLdo1QT9YjMLMFNuNZB7nnE5	2026-08-17 07:16:07.91	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-04 09:08:20.128	2026-08-10 07:16:07.91	4
M1jQD8Xey5IeROoqyW00VHGtPuFEqf2I	B3Du3F18HIJ7psnTcLCZ062fgVMNixKM	2026-08-17 07:16:28.387	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	3Ah73bL7B6l7IR4jxTm0iR1lbsibZoIJ	2026-08-10 07:16:28.398	2026-08-10 07:16:28.398	\N
pbmEfI7NUzozIxjvz1vvQKuIcDlAMtNY	bYRDGhXuAhVZMESuKJmLwVSEgmxpPToz	2026-08-24 16:32:36.797	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-17 16:32:36.802	2026-08-17 16:32:43.72	4
y1Ili9q8qiPUWNOpvWHRcCgXhg6OHfbE	Plfu8jQPEMBZ35Hk2n9lcYjke8L5hWb2	2026-08-31 06:46:47.814	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-24 06:46:47.824	2026-08-24 06:47:01.849	4
wie1hRQ8UetykqOy6YUowYp3XN61cLDz	nv2h77nMGFedDmnAR2lSRH4ekMurM71U	2026-09-05 07:57:27.466			zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	2026-08-29 07:57:27.467	2026-08-29 07:57:27.467	\N
kEdCmslTd8jpgIYPqo89HipWw57UkcSM	GaI7z3DKf7Sj3EyMJIMSCcphAMB35DID	2026-09-24 16:14:18.41			jElVFiMztMTDiqErvSwT3fkh1kba5CkX	2026-09-17 16:14:18.411	2026-09-17 16:14:18.411	\N
hO8xDvnXH0gdJkgO0ahnDTL6fMAjWkG5	0W7YwpUSd0bgr1BgfCmCWy6Jq3ouRNzn	2026-09-24 16:15:08.137			xCI4MPOmvC7IQxRR7WPyzgpDPdXmXTDS	2026-09-17 16:15:08.138	2026-09-17 16:15:08.138	\N
dx6q1K8Ygyit1q1hiuqx9NZeqoTiLqpi	JUwLIIvgstk8lG6mpM4I61EvOPUDqZhQ	2026-09-08 07:17:15.264	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-08-29 07:53:01.885	2026-09-01 07:17:15.264	4
SkK37Qk5g7ljHZW8TPkEeMSudwaDuAYv	akujemuG5yzBr8BarAJi0cDvoniQyeQG	2026-09-24 07:13:23.628	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	2026-09-11 07:24:34.877	2026-09-17 07:13:23.628	4
ZZ0L9uxfhiXBUK23R779h4cKVO1j3mUj	Upnt78yfbjkXfNsxaRxcoIF2UZTTGRko	2026-09-24 08:39:34.646	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	2026-09-17 08:39:34.647	2026-09-17 08:39:34.647	\N
ZClQGiLDDuEjalpPgVP78IL10tyexSrU	m2z4UnaZM81y3xv1UBMTdBdCUd1D2N0I	2026-09-24 16:30:17.491			oa3Z9zVwoKEtYs0VufC4y05udlKXmcWc	2026-09-17 16:30:17.491	2026-09-17 16:30:17.491	\N
48TSyvUxi1jjjgdFvWuZLwOOkMsGcxhV	KQXKM7YLNDFZxa4e6fcz3wBTRInHcJFn	2026-09-24 16:31:32.213			zju8FqvtZ6KtgvJNr8ENijtb6RVjTuLt	2026-09-17 16:31:32.214	2026-09-17 16:31:32.214	\N
eyToQkoiQJfGhuKt8pS6LIyxuGBejPrY	ObkI7QDZXHdcIWFxEfllhCJnQzPKhf2U	2026-09-24 16:36:29.252			oZUoRvHnan0NgWI3LBYYQyznQXlhtPr0	2026-09-17 16:36:29.253	2026-09-17 16:36:29.253	\N
1ZNjSIMCud4E5bYKpR3Rc4tL9GjlEJgO	ysEpsgicpCJ0jVLdWGvQgUQLu3kPVcoL	2026-09-24 16:39:56.05			Q0Nmsbm8A81rzQ4HZf380ilI7n11fKNB	2026-09-17 16:39:56.05	2026-09-17 16:39:56.05	\N
XEsCtwUxRvQqzaiLG4nwaTxg90D6jZNW	pOUmhXwfvmdZZ9fo48TN3XsOkpadbLg3	2026-09-24 16:42:20.106			oYfQ0fu0ujecxb0QjLlhYppkbzAebYor	2026-09-17 16:42:20.107	2026-09-17 16:42:20.107	\N
lUPofjKvkKcBNGTx6XcJzQ6pC9uKpPCA	qntB6cBg9ySh0KrSnMnCCSKzZfXQ7Lp6	2026-09-24 16:48:41.888			aqFM9X2DxsVV4VfrHPzbeuZyleWXI1h4	2026-09-17 16:48:41.889	2026-09-17 16:48:41.889	\N
V0y0VxXbZyUlav3rDFVqnxYPRgPRMT1B	ACPGtIqpru1nHKyOf3RxEPl4lHQf4v1h	2026-09-24 16:52:58.197			S3C9otnLLVd5y57PwhxnfXgmZUK3Lnuv	2026-09-17 16:52:58.197	2026-09-17 16:52:58.197	\N
VZPwDAqB5bMsNuVlyoYBAITkQ2mhNa2k	BAEB6tUzUPzRZCLyurN38bmdWPaKKECW	2026-09-27 16:01:55.401	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	06SdBc4GCiLFFHZCM9NumJg9jyFHDNsP	2026-09-20 16:01:55.402	2026-09-20 16:01:55.402	\N
9ddzGp8ryaihvlczdNpcbRNfDfXN0irQ	wkUlT2hoieKsCkgdJGCA7iNCz2biLvwh	2026-09-27 16:01:55.627	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	i5rwLQn71MDZnia58oAPHKHGUzMwyv8G	2026-09-20 16:01:55.628	2026-09-20 16:01:55.628	\N
74tU3ljZ6qVHYU41bfItUXVI74eI6Wt4	eLGaXZRJpQ3ozyRXmKsdnLPsqoz1u3Md	2026-09-27 16:01:55.896	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	gRtpagal0cOSbte3xc5EI1htweWaQLC0	2026-09-20 16:01:55.897	2026-09-20 16:01:55.897	\N
4IXjpcJfqJJwWnjipfrEwKcASWIiPQam	BPzyASDqn4CHMb12ejhu43psGy5sOrGG	2026-09-27 16:01:56.169	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	4z8dmrX64Z0nSulvE0RLOmDia7yd6cmb	2026-09-20 16:01:56.169	2026-09-20 16:01:56.169	\N
NVMB4SZZtLjPV3mopu8ZBYWmSya6EOA2	avsqfzFU6FuZ6iThMgPTJgMZcZ36sdom	2026-09-29 03:07:43.466	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	I1GeJj1E26xTkyGF5w11dDiPRc4ONi3O	2026-09-22 03:07:43.467	2026-09-22 03:07:43.467	\N
i9hwaUr2BQG7lPblalufPu3SdpWW1ziM	3vRS5sho3MDYM9A66yDNNhE96nrgNeeJ	2026-09-29 03:07:43.733	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	diC7F2NUd2WVcaBiYMsFpAVZbeNQALhq	2026-09-22 03:07:43.735	2026-09-22 03:07:43.735	\N
pcAw5RLuHe7ubhy3FobQ24N1prhM9fAi	a61qh3S3QUJ4r4ic4o1Zq1oSV5ZqPFGs	2026-09-29 04:08:26.298	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	3Ah73bL7B6l7IR4jxTm0iR1lbsibZoIJ	2026-09-22 04:08:26.3	2026-09-22 04:08:26.3	\N
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
cmu5qylus000dqkxvpd4r36t2	سعید	دادرس	0922873951	09158670054	\N	مرتضي	95115323@lms.local	2026-09-17 16:31:35.717	2026-09-17 16:31:35.717
cmu5r4yo7000hqkxv674raomu	محمد	حسینی	0945581033	09158670054	\N	علی	95115323@lms.local	2026-09-17 16:36:32.264	2026-09-17 16:36:32.264
cmu5qx2ou0009qkxvr7x5ip10	مسهود	حمزه	3256908047	09153070988	\N	رضا	95115323@lms.local	2026-09-17 16:30:24.222	2026-09-17 16:38:58.925
cmu5r9epf000lqkxv9k9qzuk2	علی	شهرآشوب	0859311147	09159824604	\N	مرتضي	95115323@lms.local	2026-09-17 16:39:59.667	2026-09-17 16:39:59.667
cmu5rjer4000pqkxv814xoq95	رضا	رضایی	0935038167	09154175596	\N	رضا	95115323@lms.local	2026-09-17 16:47:46.289	2026-09-17 16:47:46.289
cmu5rouk3000tqkxvsxac3gi1	امین	امینی	0919346601	09159824604	\N	علی	95115323@lms.local	2026-09-17 16:52:00.051	2026-09-17 16:52:00.051
cmu5rq36s000wqkxv6d7gpojo	مجید	باقری	0829382607	09151597532	\N	مرتضي	95115323@lms.local	2026-09-17 16:52:57.893	2026-09-17 16:52:57.893
cmua07yvt002xvjyxz08ia1j2	مريم	كاظمي مقدم	9153222267	09153222267	\N	مريم	95115323@lms.local	2026-09-20 16:01:53.752	2026-09-20 16:01:53.752
cmua07z670031vjyxbszurosg	نجيمه	شعباني	9368988274	09368988274	\N	نجيمه	95115323@lms.local	2026-09-20 16:01:54.127	2026-09-20 16:01:54.127
cmua07zfw0035vjyx4v8hr6yb	هما	يعقوبي	9153106619	09153106619	\N	هما	95115323@lms.local	2026-09-20 16:01:54.476	2026-09-20 16:01:54.476
cmua07znx0039vjyxk4f5g6o1	فاطمه	كسنوي	9151031501	09151031501	\N	فاطمه	95115323@lms.local	2026-09-20 16:01:54.765	2026-09-20 16:01:54.765
cmua07zxu003dvjyx3ghyfnlu	مريم	دريادل	9156003089	09156003089	\N	مريم	95115323@lms.local	2026-09-20 16:01:55.122	2026-09-20 16:01:55.122
cmua0806j003hvjyxy082yd4p	منا	نبي زاده مقدم	9151111111	09151111111	\N	منا	95115323@lms.local	2026-09-20 16:01:55.436	2026-09-20 16:01:55.436
cmua080cp003lvjyxqxvfhbdh	مريم	رضامنش	9155187266	09155187266	\N	مريم	95115323@lms.local	2026-09-20 16:01:55.657	2026-09-20 16:01:55.657
cmua080k5003pvjyxvuxzwy0a	محبوبه	بيدل بقمچ	9151045636	09151045636	\N	محبوبه	95115323@lms.local	2026-09-20 16:01:55.925	2026-09-20 16:01:55.925
\.


--
-- Data for Name: student_absence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_absence (id, "studentEnrollmentId", date, "startTime", "endTime", "absenceType", reason, "lastEditedByUsername", "createdAt", "updatedAt", "isFullDay") FROM stdin;
cmtgvrwao0004xrkunh3mz7dk	cmt10zzyo0008wp0ote6m30lc	2026-08-31	07:30	09:00	EXCUSED	دعوا	\N	2026-08-31 06:52:06.337	2026-08-31 06:52:50.566	f
cmtgvrwa50002xrkuy7jg3glf	cmsxoa8tk0002wp0ogqqae61b	2026-08-31	07:30	09:00	EXCUSED	ss	\N	2026-08-31 06:52:06.317	2026-08-31 11:16:02.194	f
cmtgw5zre0007xrkusz656dpv	cmt5j12a90003qobyx6kl3oll	2026-08-31	07:30	09:00	EXCUSED	aaa	\N	2026-08-31 07:03:04.01	2026-08-31 11:23:16.948	f
cmth5ifxp000dxrkugr1w888m	cmsxoa8tk0002wp0ogqqae61b	2026-08-05	09:08	12:03	UNKNOWN	\N	\N	2026-08-31 11:24:41.389	2026-08-31 11:52:48.146	f
cmticctwk0007tu2i3xjhmw90	cmsxoa8tk0002wp0ogqqae61b	2026-08-31	09:32	10:00	UNKNOWN	\N	\N	2026-09-01 07:24:03.044	2026-09-01 07:24:03.044	f
cmticctww0009tu2i55rxjahp	cmt123yos000bwp0odvo10pex	2026-08-31	09:32	10:00	UNKNOWN	\N	\N	2026-09-01 07:24:03.057	2026-09-01 07:24:03.057	f
cmth65eeq000gxrku2sx34w48	cmsxoa8tk0002wp0ogqqae61b	2026-08-26	07:30	09:59	EXCUSED	ارا	\N	2026-08-31 11:42:32.498	2026-09-01 07:24:23.919	f
cmticm28k000ftu2i9nyajkcb	cmt5j12a90003qobyx6kl3oll	2026-09-01	07:30	09:00	UNKNOWN	\N	\N	2026-09-01 07:31:13.748	2026-09-01 07:31:13.748	f
cmuc51bd900023us7kpz01l1k	cmu5rjf6s000rqkxv86qyhhsc	2026-09-22	\N	\N	UNKNOWN	\N	\N	2026-09-22 03:52:13.772	2026-09-22 03:52:13.772	t
cmuc51bdp00043us76dzn9ujr	cmu5rov0l000vqkxv52wv3d0f	2026-09-20	\N	\N	EXCUSED	\N	\N	2026-09-22 03:52:13.79	2026-09-22 03:53:02.024	t
\.


--
-- Data for Name: student_disciplinary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_disciplinary (id, "studentEnrollmentId", date, "startTime", reason, "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmtic54bz0002tu2ievm7niwr	cmsxoa8tk0002wp0ogqqae61b	2026-09-01	07:30	دعوا	\N	2026-09-01 07:18:03.311	2026-09-01 07:18:03.311
cmtic54cr0004tu2iabxdvfuv	cmt5j12a90003qobyx6kl3oll	2026-09-01	07:30	دعوا	\N	2026-09-01 07:18:03.34	2026-09-01 07:18:03.34
cmtichpqk000ctu2iqq1y85r9	cmt5j12a90003qobyx6kl3oll	2026-09-01	19:30	کتک	\N	2026-09-01 07:27:50.925	2026-09-01 07:27:50.925
cmuc5kavj00073us7uzavey84	cmu5rjf6s000rqkxv86qyhhsc	2026-09-22	07:30	سر و صدا	\N	2026-09-22 04:06:59.599	2026-09-22 04:06:59.599
cmuc5kaw500093us785tt1m56	cmu5rov0l000vqkxv52wv3d0f	2026-09-22	07:30	سر و صدا	\N	2026-09-22 04:06:59.622	2026-09-22 04:06:59.622
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
cmu5qym90000fqkxvy6galx2o	cmu5qylus000dqkxvpd4r36t2	95115323	1	7	2	e88c07ff-fb70-4a16-be26-5a6a420e214d	95115323@lms.local	2026-09-17 16:31:36.228	2026-09-17 16:31:36.228
cmu5r4z3z000jqkxvwr0kjukb	cmu5r4yo7000hqkxv674raomu	95115323	1	7	2	e88c07ff-fb70-4a16-be26-5a6a420e214d	95115323@lms.local	2026-09-17 16:36:32.831	2026-09-17 16:36:32.831
cmu5qx35x000bqkxv6znmj92w	cmu5qx2ou0009qkxvr7x5ip10	95115323	1	7	2	e88c07ff-fb70-4a16-be26-5a6a420e214d	95115323@lms.local	2026-09-17 16:30:24.838	2026-09-17 16:39:00.071
cmu5r9f59000nqkxvotnoe086	cmu5r9epf000lqkxv9k9qzuk2	95115323	1	8	2	ba5c7272-591a-41e5-ab46-76d9148f03aa	95115323@lms.local	2026-09-17 16:40:00.237	2026-09-17 16:40:00.237
cmu5rjf6s000rqkxv86qyhhsc	cmu5rjer4000pqkxv814xoq95	95115323	1	8	2	ba5c7272-591a-41e5-ab46-76d9148f03aa	95115323@lms.local	2026-09-17 16:47:46.853	2026-09-17 16:47:46.853
cmu5rov0l000vqkxv52wv3d0f	cmu5rouk3000tqkxvsxac3gi1	95115323	1	8	2	ba5c7272-591a-41e5-ab46-76d9148f03aa	95115323@lms.local	2026-09-17 16:52:00.645	2026-09-17 16:52:00.645
cmu5rq3wj000yqkxvljasr7nx	cmu5rq36s000wqkxv6d7gpojo	95115323	1	7	2	e88c07ff-fb70-4a16-be26-5a6a420e214d	95115323@lms.local	2026-09-17 16:52:58.819	2026-09-17 16:52:58.819
cmua07yw2002zvjyxej2w41og	cmua07yvt002xvjyxz08ia1j2	95115323	1	7	2	33af7c58-9da7-4409-84f5-9bbf4bd0703e	95115323@lms.local	2026-09-20 16:01:53.761	2026-09-20 16:01:53.761
cmua07z6a0033vjyxw7n9nk8d	cmua07z670031vjyxbszurosg	95115323	1	7	2	33af7c58-9da7-4409-84f5-9bbf4bd0703e	95115323@lms.local	2026-09-20 16:01:54.131	2026-09-20 16:01:54.131
cmua07zfz0037vjyxpa2wnyb3	cmua07zfw0035vjyx4v8hr6yb	95115323	1	7	2	33af7c58-9da7-4409-84f5-9bbf4bd0703e	95115323@lms.local	2026-09-20 16:01:54.479	2026-09-20 16:01:54.479
cmua07zo2003bvjyxlhxiq00b	cmua07znx0039vjyxk4f5g6o1	95115323	1	7	2	33af7c58-9da7-4409-84f5-9bbf4bd0703e	95115323@lms.local	2026-09-20 16:01:54.77	2026-09-20 16:01:54.77
cmua07zxz003fvjyxpdvamywo	cmua07zxu003dvjyx3ghyfnlu	95115323	1	7	2	33af7c58-9da7-4409-84f5-9bbf4bd0703e	95115323@lms.local	2026-09-20 16:01:55.127	2026-09-20 16:01:55.127
cmua0806l003jvjyx7zn88v03	cmua0806j003hvjyxy082yd4p	95115323	1	7	2	33af7c58-9da7-4409-84f5-9bbf4bd0703e	95115323@lms.local	2026-09-20 16:01:55.437	2026-09-20 16:01:55.437
cmua080cr003nvjyxme630ec3	cmua080cp003lvjyxqxvfhbdh	95115323	1	7	2	33af7c58-9da7-4409-84f5-9bbf4bd0703e	95115323@lms.local	2026-09-20 16:01:55.659	2026-09-20 16:01:55.659
cmua080k7003rvjyxmer7rlcy	cmua080k5003pvjyxvuxzwy0a	95115323	1	7	2	33af7c58-9da7-4409-84f5-9bbf4bd0703e	95115323@lms.local	2026-09-20 16:01:55.927	2026-09-20 16:01:55.927
\.


--
-- Data for Name: teacher; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher (id, "firstName", "lastName", "nationalCode", "personnelCode", phone, address, "lastEditedByUsername", "userId", "createdAt", "updatedAt") FROM stdin;
cmu5ruz9k000zqkxvoejp3xa2	امیر	ابوذری	3611232531	16982143	09156441553	\N	95115323@lms.local	fk9XUpDWXPk9lnPdeeMzHEppuEi5E9y2	2026-09-17 16:56:46.086	2026-09-17 16:56:46.387
cmte388aa0000rr2dw9o16isd	سعید	باقری	0934399220	96327225	09365798460	بببب	95115323@lms.local	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	2026-08-29 07:57:27.154	2026-09-22 02:56:58.758
cmuc3g2r40003rlygqjj7brm8	علی	محمدی	0012345678	12345	09123456789	\N	95115323@lms.local	I1GeJj1E26xTkyGF5w11dDiPRc4ONi3O	2026-09-22 03:07:43.216	2026-09-22 03:07:43.488
cmuc3g2zn0007rlygzbug8owv	زهرا	احمدی	0987654321	12346	09129876543	\N	95115323@lms.local	diC7F2NUd2WVcaBiYMsFpAVZbeNQALhq	2026-09-22 03:07:43.523	2026-09-22 03:07:43.759
\.


--
-- Data for Name: teacher_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_assignment (id, "teacherId", "schoolId", "academicYearId", "isActive", "lastEditedByUsername", "createdAt", "updatedAt") FROM stdin;
cmte389d00002rr2dlm7azu0m	cmte388aa0000rr2dw9o16isd	55733897	1	t	55733897@lms.local	2026-08-29 07:57:28.549	2026-08-29 07:57:28.549
cmu5ruzye0011qkxvkhx299yf	cmu5ruz9k000zqkxvoejp3xa2	95115323	1	t	95115323@lms.local	2026-09-17 16:56:46.982	2026-09-17 16:56:46.982
cmuc32a0u0001rlygj9gynupi	cmte388aa0000rr2dw9o16isd	95115323	1	t	95115323@lms.local	2026-09-22 02:56:59.453	2026-09-22 02:56:59.453
cmuc3g2z90005rlyg0ijlja7p	cmuc3g2r40003rlygqjj7brm8	95115323	1	t	95115323@lms.local	2026-09-22 03:07:43.51	2026-09-22 03:07:43.51
cmuc3g36r0009rlygrp6ydzu1	cmuc3g2zn0007rlygzbug8owv	95115323	1	t	95115323@lms.local	2026-09-22 03:07:43.779	2026-09-22 03:07:43.779
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, name, "firstName", "lastName", "isActive", "emailVerified", image, "createdAt", "updatedAt", "systemRole", "banExpires", "banReason", banned, role) FROM stdin;
2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	0999999999@lms.local	تست پسو	تست	پسو	t	f	\N	2026-08-23 08:08:53.153	2026-08-23 08:08:53.153	USER	\N	\N	f	user
xh5IJlxmuqN6pTH77c5cwvgbx25az57B	55733897@lms.local	کاخکی	کاخکی	مدیر	t	f	\N	2026-08-03 16:15:20.567	2026-08-24 06:13:11.765	USER	\N	\N	f	admin
zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	0934399220@lms.local	سعید باقری	\N	\N	t	f	\N	2026-08-29 07:57:27.437	2026-08-29 07:57:27.437	USER	\N	\N	f	user
xCI4MPOmvC7IQxRR7WPyzgpDPdXmXTDS	95106473@lms.local	رجایی	رجایی	مدیر	t	f	\N	2026-09-17 16:15:08.125	2026-09-17 16:15:08.125	USER	\N	\N	f	user
oa3Z9zVwoKEtYs0VufC4y05udlKXmcWc	3256908047@lms.local	مسهود حمزه	مسهود	حمزه	t	f	\N	2026-09-17 16:30:17.478	2026-09-17 16:30:17.478	USER	\N	\N	f	user
zju8FqvtZ6KtgvJNr8ENijtb6RVjTuLt	0922873951@lms.local	سعید دادرس	سعید	دادرس	t	f	\N	2026-09-17 16:31:32.202	2026-09-17 16:31:32.202	USER	\N	\N	f	user
oZUoRvHnan0NgWI3LBYYQyznQXlhtPr0	0945581033@lms.local	محمد حسینی	محمد	حسینی	t	f	\N	2026-09-17 16:36:29.242	2026-09-17 16:36:29.242	USER	\N	\N	f	user
Q0Nmsbm8A81rzQ4HZf380ilI7n11fKNB	0859311147@lms.local	علی شهرآشوب	علی	شهرآشوب	t	f	\N	2026-09-17 16:39:56.033	2026-09-17 16:39:56.033	USER	\N	\N	f	user
oYfQ0fu0ujecxb0QjLlhYppkbzAebYor	0935038167@lms.local	محسن رضوانی	محسن	رضوانی	t	f	\N	2026-09-17 16:42:20.087	2026-09-17 16:42:20.087	USER	\N	\N	f	user
aqFM9X2DxsVV4VfrHPzbeuZyleWXI1h4	0919346601@lms.local	امین امینی	امین	امینی	t	f	\N	2026-09-17 16:48:41.869	2026-09-17 16:48:41.869	USER	\N	\N	f	user
S3C9otnLLVd5y57PwhxnfXgmZUK3Lnuv	0829382607@lms.local	مجید باقری	مجید	باقری	t	f	\N	2026-09-17 16:52:58.172	2026-09-17 16:52:58.172	USER	\N	\N	f	user
fk9XUpDWXPk9lnPdeeMzHEppuEi5E9y2	3611232531@lms.local	امیر ابوذری	\N	\N	t	f	\N	2026-09-17 16:56:46.344	2026-09-17 16:56:46.344	USER	\N	\N	f	user
U4edTOBSCx7M1murPora3YV0m7DsgyiW	9153222267@lms.local	مريم كاظمي مقدم	مريم	كاظمي مقدم	t	f	\N	2026-09-20 16:01:54.024	2026-09-20 16:01:54.024	USER	\N	\N	f	user
1QjLIRIr1LVaaqUADYZTaRwkPh6QKIVG	9368988274@lms.local	نجيمه شعباني	نجيمه	شعباني	t	f	\N	2026-09-20 16:01:54.415	2026-09-20 16:01:54.415	USER	\N	\N	f	user
yjlJyg3zEMfpy37n8eHJcDjJoh9tBdge	9153106619@lms.local	هما يعقوبي	هما	يعقوبي	t	f	\N	2026-09-20 16:01:54.702	2026-09-20 16:01:54.702	USER	\N	\N	f	user
Xn6uGm873BQL6uab93Pkz40X4lnSc69e	9151031501@lms.local	فاطمه كسنوي	فاطمه	كسنوي	t	f	\N	2026-09-20 16:01:55.048	2026-09-20 16:01:55.048	USER	\N	\N	f	user
06SdBc4GCiLFFHZCM9NumJg9jyFHDNsP	9156003089@lms.local	مريم دريادل	مريم	دريادل	t	f	\N	2026-09-20 16:01:55.385	2026-09-20 16:01:55.385	USER	\N	\N	f	user
i5rwLQn71MDZnia58oAPHKHGUzMwyv8G	9151111111@lms.local	منا نبي زاده مقدم	منا	نبي زاده مقدم	t	f	\N	2026-09-20 16:01:55.613	2026-09-20 16:01:55.613	USER	\N	\N	f	user
gRtpagal0cOSbte3xc5EI1htweWaQLC0	9155187266@lms.local	مريم رضامنش	مريم	رضامنش	t	f	\N	2026-09-20 16:01:55.88	2026-09-20 16:01:55.88	USER	\N	\N	f	user
4z8dmrX64Z0nSulvE0RLOmDia7yd6cmb	9151045636@lms.local	محبوبه بيدل بقمچ	محبوبه	بيدل بقمچ	t	f	\N	2026-09-20 16:01:56.155	2026-09-20 16:01:56.155	USER	\N	\N	f	user
jElVFiMztMTDiqErvSwT3fkh1kba5CkX	95115323@lms.local	شهید کاخکی 1	شهید کاخکی 1	مدیر	t	f	\N	2026-09-17 16:14:18.382	2026-09-21 16:55:11.125	USER	\N	\N	f	admin
3Ah73bL7B6l7IR4jxTm0iR1lbsibZoIJ	master@lms.local	سعید باقری	سعید	باقری	t	t	\N	2026-07-31 07:37:51.701	2026-09-21 16:55:11.125	MASTER	\N	\N	f	admin
I1GeJj1E26xTkyGF5w11dDiPRc4ONi3O	0012345678@lms.local	علی محمدی	علی	محمدی	t	f	\N	2026-09-22 03:07:43.436	2026-09-22 03:07:43.436	USER	\N	\N	f	user
diC7F2NUd2WVcaBiYMsFpAVZbeNQALhq	0987654321@lms.local	زهرا احمدی	زهرا	احمدی	t	f	\N	2026-09-22 03:07:43.714	2026-09-22 03:07:43.714	USER	\N	\N	f	user
\.


--
-- Data for Name: user_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_assignment (id, "userId", "schoolId", "academicYearId", role, "isActive", "createdAt", "updatedAt") FROM stdin;
4	xh5IJlxmuqN6pTH77c5cwvgbx25az57B	55733897	1	MANAGER	t	2026-08-03 16:15:20.633	2026-08-03 16:15:20.633
5	jElVFiMztMTDiqErvSwT3fkh1kba5CkX	95115323	1	MANAGER	t	2026-09-17 16:14:18.433	2026-09-17 16:14:18.433
6	xCI4MPOmvC7IQxRR7WPyzgpDPdXmXTDS	95106473	1	MANAGER	t	2026-09-17 16:15:08.152	2026-09-17 16:15:08.152
7	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	55733897	1	TEACHER	t	2026-09-17 17:37:17.866	2026-09-17 17:37:17.866
8	fk9XUpDWXPk9lnPdeeMzHEppuEi5E9y2	95115323	1	TEACHER	t	2026-09-17 17:37:17.876	2026-09-17 17:37:17.876
9	zeCGkP1s4Hc0cvp7HwDrBVVuTsSj9qwu	55733897	1	STUDENT	t	2026-09-17 17:37:17.89	2026-09-17 17:37:17.89
10	2HqvPOAnPbmTaMjgDiQjSseb1JFa1rIf	55733897	1	STUDENT	t	2026-09-17 17:37:17.91	2026-09-17 17:37:17.91
11	zju8FqvtZ6KtgvJNr8ENijtb6RVjTuLt	95115323	1	STUDENT	t	2026-09-17 17:37:17.919	2026-09-17 17:37:17.919
12	oZUoRvHnan0NgWI3LBYYQyznQXlhtPr0	95115323	1	STUDENT	t	2026-09-17 17:37:17.928	2026-09-17 17:37:17.928
13	oa3Z9zVwoKEtYs0VufC4y05udlKXmcWc	95115323	1	STUDENT	t	2026-09-17 17:37:17.937	2026-09-17 17:37:17.937
14	Q0Nmsbm8A81rzQ4HZf380ilI7n11fKNB	95115323	1	STUDENT	t	2026-09-17 17:37:17.947	2026-09-17 17:37:17.947
15	oYfQ0fu0ujecxb0QjLlhYppkbzAebYor	95115323	1	STUDENT	t	2026-09-17 17:37:17.954	2026-09-17 17:37:17.954
16	aqFM9X2DxsVV4VfrHPzbeuZyleWXI1h4	95115323	1	STUDENT	t	2026-09-17 17:37:17.963	2026-09-17 17:37:17.963
17	S3C9otnLLVd5y57PwhxnfXgmZUK3Lnuv	95115323	1	STUDENT	t	2026-09-17 17:37:17.971	2026-09-17 17:37:17.971
18	U4edTOBSCx7M1murPora3YV0m7DsgyiW	95115323	1	STUDENT	t	2026-09-20 16:01:54.093	2026-09-20 16:01:54.093
19	1QjLIRIr1LVaaqUADYZTaRwkPh6QKIVG	95115323	1	STUDENT	t	2026-09-20 16:01:54.461	2026-09-20 16:01:54.461
20	yjlJyg3zEMfpy37n8eHJcDjJoh9tBdge	95115323	1	STUDENT	t	2026-09-20 16:01:54.744	2026-09-20 16:01:54.744
21	Xn6uGm873BQL6uab93Pkz40X4lnSc69e	95115323	1	STUDENT	t	2026-09-20 16:01:55.101	2026-09-20 16:01:55.101
22	06SdBc4GCiLFFHZCM9NumJg9jyFHDNsP	95115323	1	STUDENT	t	2026-09-20 16:01:55.426	2026-09-20 16:01:55.426
23	i5rwLQn71MDZnia58oAPHKHGUzMwyv8G	95115323	1	STUDENT	t	2026-09-20 16:01:55.646	2026-09-20 16:01:55.646
24	gRtpagal0cOSbte3xc5EI1htweWaQLC0	95115323	1	STUDENT	t	2026-09-20 16:01:55.915	2026-09-20 16:01:55.915
25	4z8dmrX64Z0nSulvE0RLOmDia7yd6cmb	95115323	1	STUDENT	t	2026-09-20 16:01:56.189	2026-09-20 16:01:56.189
26	I1GeJj1E26xTkyGF5w11dDiPRc4ONi3O	95115323	1	TEACHER	t	2026-09-22 03:07:43.496	2026-09-22 03:07:43.496
27	diC7F2NUd2WVcaBiYMsFpAVZbeNQALhq	95115323	1	TEACHER	t	2026-09-22 03:07:43.772	2026-09-22 03:07:43.772
\.


--
-- Name: academic_year_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academic_year_id_seq', 1, false);


--
-- Name: user_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_assignment_id_seq', 27, true);


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
-- Name: grade_period_klass grade_period_klass_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period_klass
    ADD CONSTRAINT grade_period_klass_pkey PRIMARY KEY (id);


--
-- Name: grade_period_lesson grade_period_lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period_lesson
    ADD CONSTRAINT grade_period_lesson_pkey PRIMARY KEY (id);


--
-- Name: grade_period grade_period_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period
    ADD CONSTRAINT grade_period_pkey PRIMARY KEY (id);


--
-- Name: grade grade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade
    ADD CONSTRAINT grade_pkey PRIMARY KEY (id);


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
-- Name: school_settings school_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_settings
    ADD CONSTRAINT school_settings_pkey PRIMARY KEY (id);


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
-- Name: grade_gradePeriodLessonId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "grade_gradePeriodLessonId_idx" ON public.grade USING btree ("gradePeriodLessonId");


--
-- Name: grade_period_klass_gradePeriodId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "grade_period_klass_gradePeriodId_idx" ON public.grade_period_klass USING btree ("gradePeriodId");


--
-- Name: grade_period_klass_gradePeriodId_klassId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "grade_period_klass_gradePeriodId_klassId_key" ON public.grade_period_klass USING btree ("gradePeriodId", "klassId");


--
-- Name: grade_period_klass_klassId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "grade_period_klass_klassId_idx" ON public.grade_period_klass USING btree ("klassId");


--
-- Name: grade_period_lesson_darsPayeReshtehId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "grade_period_lesson_darsPayeReshtehId_idx" ON public.grade_period_lesson USING btree ("darsPayeReshtehId");


--
-- Name: grade_period_lesson_gradePeriodId_darsPayeReshtehId_klassId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "grade_period_lesson_gradePeriodId_darsPayeReshtehId_klassId_key" ON public.grade_period_lesson USING btree ("gradePeriodId", "darsPayeReshtehId", "klassId");


--
-- Name: grade_period_lesson_gradePeriodId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "grade_period_lesson_gradePeriodId_idx" ON public.grade_period_lesson USING btree ("gradePeriodId");


--
-- Name: grade_period_lesson_klassId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "grade_period_lesson_klassId_idx" ON public.grade_period_lesson USING btree ("klassId");


--
-- Name: grade_period_schoolId_academicYearId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "grade_period_schoolId_academicYearId_idx" ON public.grade_period USING btree ("schoolId", "academicYearId");


--
-- Name: grade_studentEnrollmentId_gradePeriodLessonId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "grade_studentEnrollmentId_gradePeriodLessonId_key" ON public.grade USING btree ("studentEnrollmentId", "gradePeriodLessonId");


--
-- Name: grade_studentEnrollmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "grade_studentEnrollmentId_idx" ON public.grade USING btree ("studentEnrollmentId");


--
-- Name: klass_schoolId_academicYearId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "klass_schoolId_academicYearId_idx" ON public.klass USING btree ("schoolId", "academicYearId");


--
-- Name: klass_title_schoolId_academicYearId_payeId_reshtehTahsiliId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "klass_title_schoolId_academicYearId_payeId_reshtehTahsiliId_key" ON public.klass USING btree (title, "schoolId", "academicYearId", "payeId", "reshtehTahsiliId");


--
-- Name: school_settings_schoolId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "school_settings_schoolId_key" ON public.school_settings USING btree ("schoolId");


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
-- Name: grade grade_gradePeriodLessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade
    ADD CONSTRAINT "grade_gradePeriodLessonId_fkey" FOREIGN KEY ("gradePeriodLessonId") REFERENCES public.grade_period_lesson(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grade_period grade_period_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period
    ADD CONSTRAINT "grade_period_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public.academic_year(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grade_period_klass grade_period_klass_gradePeriodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period_klass
    ADD CONSTRAINT "grade_period_klass_gradePeriodId_fkey" FOREIGN KEY ("gradePeriodId") REFERENCES public.grade_period(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grade_period_klass grade_period_klass_klassId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period_klass
    ADD CONSTRAINT "grade_period_klass_klassId_fkey" FOREIGN KEY ("klassId") REFERENCES public.klass(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grade_period_lesson grade_period_lesson_darsPayeReshtehId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period_lesson
    ADD CONSTRAINT "grade_period_lesson_darsPayeReshtehId_fkey" FOREIGN KEY ("darsPayeReshtehId") REFERENCES public.dars_paye_reshteh(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grade_period_lesson grade_period_lesson_gradePeriodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period_lesson
    ADD CONSTRAINT "grade_period_lesson_gradePeriodId_fkey" FOREIGN KEY ("gradePeriodId") REFERENCES public.grade_period(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grade_period_lesson grade_period_lesson_klassId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period_lesson
    ADD CONSTRAINT "grade_period_lesson_klassId_fkey" FOREIGN KEY ("klassId") REFERENCES public.klass(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grade_period grade_period_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade_period
    ADD CONSTRAINT "grade_period_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.school(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grade grade_studentEnrollmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grade
    ADD CONSTRAINT "grade_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES public.student_enrollment(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: school_settings school_settings_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_settings
    ADD CONSTRAINT "school_settings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.school(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

\unrestrict 3yKeeuGWyRop46TSW7cLRxiIQpkUw1dqwTpLvoQbeNmpR2tNUcGyRNuBpgkd3hT

