
    create table bus_stops (
        has_bench boolean,
        has_shelter boolean,
        direction varchar(255) not null,
        location_id varchar(255) not null,
        municipal_code varchar(255) unique,
        primary key (location_id)
    );

    create table categories (
        created_at timestamp(6) with time zone not null,
        updated_at timestamp(6) with time zone not null,
        description TEXT,
        id varchar(255) not null,
        name varchar(255) not null unique,
        type varchar(255) not null check (type in ('RAMP','TACTILE_FLOOR','ELEVATOR','SIGNAGE','ACCESSIBILITY','INFRASTRUCTURE','OTHER')),
        primary key (id)
    );

    create table comments (
        created_at timestamp(6) with time zone not null,
        updated_at timestamp(6) with time zone not null,
        author_id varchar(255) not null,
        content TEXT not null,
        id varchar(255) not null,
        report_id varchar(255) not null,
        primary key (id)
    );

    create table evidences (
        size_kb integer,
        created_at timestamp(6) with time zone not null,
        id varchar(255) not null,
        mime_type varchar(255),
        original_filename varchar(255),
        report_id varchar(255) not null,
        type varchar(255) not null check (type in ('PHOTO','VIDEO','AUDIO','DOCUMENT')),
        url varchar(255) not null,
        primary key (id)
    );

    create table locations (
        latitude float(53) not null,
        longitude float(53) not null,
        created_at timestamp(6) with time zone not null,
        updated_at timestamp(6) with time zone not null,
        location_type varchar(31) not null,
        address varchar(255) not null,
        admin_id varchar(255),
        description TEXT,
        id varchar(255) not null,
        name varchar(255) not null,
        organization_id varchar(255),
        type varchar(255) not null,
        primary key (id)
    );

    create table metro_stations (
        has_accessibility boolean not null,
        has_elevator boolean,
        has_escalator boolean,
        line varchar(255) not null,
        location_id varchar(255) not null,
        platform varchar(255) not null,
        primary key (location_id)
    );

    create table notifications (
        is_read boolean not null,
        read_at timestamp(6) with time zone,
        sent_at timestamp(6) with time zone not null,
        channel varchar(255) not null check (channel in ('EMAIL','PUSH','SMS')),
        id varchar(255) not null,
        message TEXT not null,
        metadata TEXT,
        user_id varchar(255) not null,
        primary key (id)
    );

    create table organizations (
        created_at timestamp(6) with time zone not null,
        updated_at timestamp(6) with time zone not null,
        cnpj varchar(14) not null unique,
        description TEXT,
        id varchar(255) not null,
        main_contact varchar(255) not null,
        name varchar(255) not null,
        type varchar(255) not null,
        primary key (id)
    );

    create table reports (
        created_at timestamp(6) with time zone not null,
        updated_at timestamp(6) with time zone not null,
        author_id varchar(255) not null,
        category_id varchar(255) not null,
        description TEXT not null,
        id varchar(255) not null,
        image_url varchar(255),
        location_id varchar(255) not null,
        status varchar(255) not null check (status in ('PENDING','IN_ANALYSIS','RESOLVED_PROVISIONAL','RESOLVED_CONFIRMED','ARCHIVED')),
        title varchar(255) not null,
        primary key (id)
    );

    create table status_history (
        created_at timestamp(6) with time zone not null,
        comment TEXT,
        id varchar(255) not null,
        report_id varchar(255) not null,
        status varchar(255) not null check (status in ('PENDING','IN_ANALYSIS','RESOLVED_PROVISIONAL','RESOLVED_CONFIRMED','ARCHIVED')),
        updated_by varchar(255) not null,
        primary key (id)
    );

    create table users (
        created_at timestamp(6) with time zone not null,
        updated_at timestamp(6) with time zone not null,
        email varchar(255) not null unique,
        id varchar(255) not null,
        name varchar(255) not null,
        organization_id varchar(255),
        role varchar(255) not null check (role in ('PEDESTRIAN','ADMIN')),
        primary key (id)
    );

    create index idx_comment_report 
       on comments (report_id);

    create index idx_comment_author 
       on comments (author_id);

    create index idx_evidence_report 
       on evidences (report_id);

    create index idx_evidence_type 
       on evidences (type);

    create index idx_location_coords 
       on locations (latitude, longitude);

    create index idx_location_name 
       on locations (name);

    create index idx_notification_user 
       on notifications (user_id);

    create index idx_notification_read 
       on notifications (is_read);

    create index idx_notification_sent 
       on notifications (sent_at);

    create index idx_org_name 
       on organizations (name);

    create index idx_report_author 
       on reports (author_id);

    create index idx_report_location 
       on reports (location_id);

    create index idx_report_category 
       on reports (category_id);

    create index idx_report_status 
       on reports (status);

    create index idx_report_created 
       on reports (created_at);

    create index idx_status_history_report 
       on status_history (report_id);

    create index idx_status_history_created 
       on status_history (created_at);

    create index idx_user_email 
       on users (email);

    alter table if exists bus_stops 
       add constraint FKd98pusj8je6o1fmjvorormw6l 
       foreign key (location_id) 
       references locations;

    alter table if exists comments 
       add constraint FKn2na60ukhs76ibtpt9burkm27 
       foreign key (author_id) 
       references users;

    alter table if exists comments 
       add constraint FKcq6hwtukw527pld91vsq40l0 
       foreign key (report_id) 
       references reports;

    alter table if exists evidences 
       add constraint FKimo0i4vg6k100p7kv17qpc4c7 
       foreign key (report_id) 
       references reports;

    alter table if exists locations 
       add constraint FK8fwuq4w0irmi5d2wu2ag8l63e 
       foreign key (admin_id) 
       references users;

    alter table if exists locations 
       add constraint FKaqsettramfgqavosnnvi8vcq3 
       foreign key (organization_id) 
       references organizations;

    alter table if exists metro_stations 
       add constraint FKsiiovwuu6dpfbpjtu6kt6ieuu 
       foreign key (location_id) 
       references locations;

    alter table if exists notifications 
       add constraint FK9y21adhxn0ayjhfocscqox7bh 
       foreign key (user_id) 
       references users;

    alter table if exists reports 
       add constraint FKb6m0c7yr0xjys3y3uwhgopmao 
       foreign key (author_id) 
       references users;

    alter table if exists reports 
       add constraint FKp4vx7qodji1jawy8jcd94h5wj 
       foreign key (category_id) 
       references categories;

    alter table if exists reports 
       add constraint FKgb07j83q2r593c8yu9bijo5jj 
       foreign key (location_id) 
       references locations;

    alter table if exists status_history 
       add constraint FKhpg0mfetgbpnjt65je3frodfx 
       foreign key (report_id) 
       references reports;

    alter table if exists status_history 
       add constraint FKhqbyfson7ec8b29jidgbq33rw 
       foreign key (updated_by) 
       references users;

    alter table if exists users 
       add constraint FKqpugllwvyv37klq7ft9m8aqxk 
       foreign key (organization_id) 
       references organizations;
