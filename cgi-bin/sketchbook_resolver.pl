#!/usr/bin/perl

$|=1;

use strict;
use Apache::Request;
use Apache::Constants qw(REDIRECT);
use Compose::local_lib;
use Compose::db_connection;

my $r         = Apache::Request->new(Apache->request);
my $local_lib = new Compose::local_lib();
my $dbh       = new Compose::db_connection('localhost','aes','apache','webconnect');
my $item      = $local_lib->fix_spaces($r->param('card'));

$r->send_http_header('text/javascript');

if ($r->method() eq "GET") {
	my %res = $dbh->queryRawDB(qq(
		SELECT 
			enc_content_id,
			textfield_0 AS title, 
			select_0    AS category, 
			CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/index.html")    AS page_loc, 
			CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/orig/",image_1) AS rotated_image
		FROM 
			content_data,
			clients.website 
		WHERE 
			clients.website.site_id = content_data.site_id AND 
			content_data.site_id = 1                       AND
			form_id = 48                                   AND
			moderation_status >= 3                         AND
			date_0 <= NOW()                                AND
			enc_content_id = "$item"                       AND
			!(textfield_5 is NULL or textfield_5 = "")     AND
			checkbox_2 != "Yes" 
	));

	print qq(
\({
	"cid"      : "$res{0}{'enc_content_id'}",
	"title"    : "$res{0}{'title'}",
	"category" : "$res{0}{'category'}",
	"url"      : "$res{0}{'page_loc'}",
	"chip"     : "$res{0}{'rotated_image'}"
}\)
	);
}