#!/usr/bin/perl

$|=1;

srand;

use strict;

use Apache::Request;
use Apache::Constants qw(REDIRECT);
use Benchmark::Timer;
use HTML::Template;
use MIME::Base64 qw(encode_base64 decode_base64);
use Compose::local_lib;
use Compose::db_connection;

my $r = Apache::Request->new(Apache->request);

my $local_lib = new Compose::local_lib();

my $dbh_aes = new Compose::db_connection('localhost','aes','apache','webconnect');
my $dbh = new Compose::db_connection('localhost','designer','apache','webconnect');

my $form;
foreach my $key (sort $r->param) {
        $form->{$key} = $local_lib->fix_spaces($r->param($key));
}

my %cookiejar = Apache::Cookie->new($r)->parse;
my $newcookie = Apache::Cookie->new($r);
my ($user, $password, %user_info, $qry, %user_info, %cookie_hash);

##################################################
#
unless ($cookiejar{'Site'}) {
        print "Content-type: text/html\n";
        print "Status: 403\n";
	exit(0);
##################################################
#
} elsif ( $cookiejar{'Site'} ) {

       	my @values = $cookiejar{'Site'}->value;

	for (my $i=0;$i<scalar(@values);$i+=2) {
            #print qq($values[$i] : $values[$i+1] <br>);
        	$cookie_hash{$values[$i]} = $values[$i+1];
	}

	($user, $password) = split /:/, decode_base64($cookie_hash{'Cookie'}), 2;

	$qry = qq(select * from admin_user_info where user_name="$user");

	%user_info = $dbh_aes->queryRawDB($qry);

	if ($user_info{'0'}{'id'} eq "") {
		print "Content-type: text/html\n";
                print "Status: 403\n";
                exit(0);
        } 
}



##################################################
#
if ($r->method() eq "GET") {

	$qry = qq(select * from sketchbook where user_id="$user_info{'0'}{'id'}");
	
	my %data = $dbh->queryRawDB($qry);

	if ($data{'0'}{'sketchbook_data'} eq "") {
		if ($form->{'interactive'} ne "false") {
			$r->send_http_header('text/html');
			print qq{
				<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
				<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
					<head>
						<title>Logged In</title>
						<style type="text/css">
							\@import url('http://www.santoprene.com/siteflow2/styles/designer.css');
							\@import url('http://materialexperience.santoprene.com/specialcases.css');
						</style>
					</head>

					<body>
						<h1>Logged In</h1>
						<p>Thanks for logging in. You can close this card now.</p>
					</body>
				</html><div style="display: none">
			};
		} else {
			print "Status: 404\n";
			print "Content-type: text/html\n";		
		}
		
	    exit(0);
	} else {
		if ($form->{'interactive'} ne "false") {
			$r->send_http_header('text/html');
			print qq{
				<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
				<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
					<head>
						<title>Logged In</title>
						<style type="text/css">
							\@import url('http://www.santoprene.com/siteflow2/styles/designer.css');
							\@import url('http://materialexperience.santoprene.com/specialcases.css');
						</style>
					</head>

					<body>
						<h1>Logged In</h1>
						<p>Thanks for logging in. You can close this card now.</p>
					</body>
				</html><div style="display: none">
			};
		} else {
			$r->send_http_header('text/javascript');
			print "$data{'0'}{'sketchbook_data'}\n";
		}
	}

##################################################
#
} else {

	if ($form->{'sketchbook_data'} ne "") {
		my $upd = qq(delete from sketchbook where user_id="$user_info{'0'}{'id'}");
        $dbh->updateDB($upd);

		$form->{'sketchbook_data'} =~ s/"/\\"/g;

		my $upd = qq(insert into sketchbook (sketchbook_data,user_id) values ("$form->{'sketchbook_data'}","$user_info{'0'}{'id'}"));
		my %data = $dbh->queryRawDB($upd);
	}

	print "Content-type: text/html\n\n";

}

