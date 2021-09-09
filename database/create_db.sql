create database pocker;

create user pocker_root;

alter user "pocker_root" with password 'bohngiesahbooGee9phei7leiquieg9p';

revoke all on database pocker from pocker_root;
grant connect on database pocker to pocker_root;


-- psql --username=pocker_root --host=localhost pocker
