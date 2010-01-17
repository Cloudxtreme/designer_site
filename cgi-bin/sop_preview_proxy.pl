#!/usr/bin/perl

#
# Perl Based Same Origin Proxy
#

$|=1;

srand;
use strict;

use Apache::Request;
use LWP::Simple;
use LWP::UserAgent;

my $r = Apache::Request->new(Apache->request);
$r->send_http_header('text/javascript');

my @url = split(/site=/,$r->parsed_uri()->unparse());

my $browser = LWP::UserAgent->new;
$browser->credentials(
	'admin.santoprene.com:80',
	'Admin',
	'DESIGNER_SOP_USER' => 'dsop4edit'
);

print $browser->get($url[1])->content;
