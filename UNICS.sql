CREATE TABLE IF NOT EXISTS public.generated_letters (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    request_id uuid UNIQUE,  -- FK + UK
    verification_code character varying(50) UNIQUE,
    download_count integer DEFAULT 0,
    CONSTRAINT generated_letters_pkey PRIMARY KEY (id),
    CONSTRAINT fk_generated_letters_request FOREIGN KEY (request_id) 
        REFERENCES public.letter_request (id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS public."user" (
    id bigserial PRIMARY KEY,
    email character varying(255) UNIQUE NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    role character varying(50) NOT NULL CHECK (role IN ('admin', 'student'))
);   


CREATE TABLE IF NOT EXISTS public.letter_request (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    student_id bigint,  -- FK to user
    template_id uuid,   -- FK to letter_template
    status character varying(20) DEFAULT 'pending',
    request_date timestamp DEFAULT CURRENT_TIMESTAMP,
    student_notes text,
    CONSTRAINT letter_request_pkey PRIMARY KEY (id),
    CONSTRAINT fk_letter_request_student FOREIGN KEY (student_id) 
        REFERENCES public.user (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_letter_request_template FOREIGN KEY (template_id) 
        REFERENCES public.letter_template (id)
        ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS public.letter_template (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(100) NOT NULL,
    description text,
    template_path character varying(255) NOT NULL,
    placeholders jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT letter_template_pkey PRIMARY KEY (id)
);

