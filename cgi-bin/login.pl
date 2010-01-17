#!/usr/bin/perl

$|=1;

use strict;

use Apache::Request;
use Apache::Constants qw(REDIRECT);
use MIME::Base64 qw(encode_base64 decode_base64);
use HTML::Template;

use Compose::local_lib;
use Compose::site_user_lib;

$Apache::DBI::DEBUG=2;

my $r = Apache::Request->new(Apache->request);
#$r->send_http_header('text/html');

my $dbh = new Compose::db_connection('localhost','aes','apache','webconnect');

my $client_lib = new Compose::client_lib();
my $local_lib = new Compose::local_lib($client_lib,0);

my $client_id = 1;
$client_lib->setup_client($client_id);


my $site_user_lib = new Compose::site_user_lib($client_lib);

$client_lib->{'dbh'}{'debug'} = 2;

my ($form,$PASS);

foreach my $key (sort $r->param) {
        $form->{$key} = $local_lib->fix_spaces($r->param($key));
	#print "$key: $form->{$key} <br>";
}

my %cookiejar = Apache::Cookie->new($r)->parse;
my $newcookie = Apache::Cookie->new($r);

#####################################################
# Get the username and password from the cookie.

unless ($cookiejar{'Site'} || ($form->{'user'} && $form->{'password'})) {
	$r->send_http_header('text/html');

	my $template = HTML::Template->new( filename => "html/login.html",  path => [ "$client_lib->{'client'}->{'server_docroot'}" ], die_on_bad_params => 0);

	$template->param('user' => $form->{'user'});

	print $template->output();

	exit(0);
}

my %cookie_hash;

if ( $cookiejar{'Site'} ) {

	my @values = $cookiejar{'Site'}->value;

	for (my $i=0;$i<scalar(@values);$i+=2) {
		$cookie_hash{$values[$i]} = $values[$i+1];
	}
} else {
	$cookiejar{'Site'} = "";
}

my $errors = "";


if ($form->{'user'} && $form->{'password'}) {

	my $site_user = &get_user_info($form->{'user'},$dbh);

	if (lc $site_user->{'user_name'} eq lc $form->{'user'}) {
		if ($site_user->{'user_passwd'} eq $form->{'password'}) {
			&bake_cookie($r,$client_lib,$newcookie,\%cookie_hash,$form,$site_user,$dbh);
			exit(0);
		} else {
			$errors .= qq(The password you entered is incorrect. Please try again.<br>);
		}

	} else {
		$errors .= qq(The user name $form->{'user'} does not exist.<br>);
	}

} elsif ($cookie_hash{'Site'}) {


	my ($user, $password) = split /:/, decode_base64($cookie_hash{'Site'}), 2;

	if ($user eq "" ) {
		$errors .= qq($cookie_hash{'Site'} Cookie could not be read. <br>);

	} else {

		my $site_user = &get_user_info($user,$dbh);

		if (defined $site_user->{'user_name'} && lc $site_user->{'user_name'} eq lc $user ) {

                	if ($site_user->{'user_passwd'} eq $password) {
				&bake_cookie($r,$client_lib,$newcookie,\%cookie_hash,$form,$site_user,$dbh);
                        	exit(0);
                	} else {
				$errors .= qq(The password you entered is incorrect. Please try again.<br>);
                	}

        	} else {
			$errors .= qq(The user name $form->{'user'} does not exist.<br>) if ($form->{'user'});
        	}
	}
}


$r->send_http_header('text/html');

my $template = HTML::Template->new( filename => "html/login.html",  path => [ "$client_lib->{'client'}->{'server_docroot'}" ], die_on_bad_params => 0);

$template->param('user' => $form->{'user'});
$template->param('error' => "$errors");

print $template->output();


	
###################################

sub bake_cookie {

	my $r = shift;
	my $client_lib = shift;
	my $cookiejar = shift;
	my $cookie_hash = shift;
	my $form = shift;
	my $site_user = shift;
	my $dbh = shift;

	if ( ($cookie_hash->{uri} =~ /login.pl/) || $cookie_hash->{uri} eq "") {
		$cookie_hash->{uri} = "/";
	}
	$cookie_hash->{uri} = $form->{'redir'};


	# We have some valid credientials, so set an authorization cookie.
    my @values = (
    	uri => $cookie_hash->{uri},
    	Cookie => encode_base64(join ":", ($form->{'user'},$form->{'password'})),
    );

  	my $c = $r->connection;
	my $ip = $c->remote_ip;
	my $ins = qq(insert into logins (id,username,last_name,first_name,login_date,ip_address) values (NULL,"$site_user->{'user_name'}","$site_user->{'last_name'}","$site_user->{'first_name'}",NOW(),"$ip"));
	$dbh->updateDB($ins);


	$cookiejar->name('Site');
	$cookiejar->value(\@values);
    $cookiejar->path('/');
	$cookiejar->domain('.santoprene.com');
	$cookiejar->bake;


	$r->status(REDIRECT);
	$r->headers_out->set(Location => $cookie_hash->{uri});
	$r->send_http_header;

	

}
#######################

sub get_user_info {

        my $uid = shift;
	my $dbh = shift;

        my ($qry,$gqry,%user_info,%group_info);

        %user_info=%group_info=();

        ###########################
        # Internet User


	$qry = qq(select admin_user_info.*, DATE_FORMAT(created_on,'%c/%y') as format_created_on  from admin_user_info where user_name="$uid" and ((registrant=1 and verified=1) or registrant=0) ); 

	%user_info = $dbh->queryRawDB($qry);

        my %USER_INFO;

        foreach my $k (keys %{$user_info{'0'}}) {
                $USER_INFO{$k} = $user_info{'0'}{$k};
        }

        $USER_INFO{'FULL_NAME'} = "$USER_INFO{'first_name'} " if ($USER_INFO{'first_name'} ne "");
        $USER_INFO{'FULL_NAME'} .= "$USER_INFO{'last_name'} " if ($USER_INFO{'last_name'} ne "");

        foreach my $group (keys %group_info) {
                $USER_INFO{'group_info'}{$group_info{$group}{'group_id'}} = $group_info{$group};
                $USER_INFO{'groups'}{$group} = 1;
        }

        return \%USER_INFO;
}


