drop database if exists designer;
create database designer;

use designer;



create TABLE sketchbook (
	id int not NULL auto_increment,
	user_id int not NULL,
	sketchbook_data text,
	INDEX user_id(user_id),
	PRIMARY KEY(id)
);

