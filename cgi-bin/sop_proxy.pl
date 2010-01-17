#!/usr/bin/perl

#
# Perl Based Same Origin Proxy
#

$|=1;

srand;
use strict;

use Apache::Request;
use LWP::Simple;

my $r = Apache::Request->new(Apache->request);
$r->send_http_header('text/javascript');

print get $r->param('site');
