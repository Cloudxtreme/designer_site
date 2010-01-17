#!/usr/bin/perl

$|=1;

srand;

use strict;

use Apache::Request;
use Apache::Constants qw(REDIRECT);
use Benchmark::Timer;
use HTML::Template;
use Bit::Vector;
use Image::Magick;

use Compose::local_lib;
use Compose::db_connection;

my $r = Apache::Request->new(Apache->request);
$r->send_http_header('text/javascript');

my $tt = new Benchmark::Timer;
$tt->start('all');

my $local_lib = new Compose::local_lib();

my $dbh = new Compose::db_connection('localhost','aes','apache','webconnect');

my $form;
foreach my $key (sort $r->param) {
        $form->{$key} = $local_lib->fix_spaces($r->param($key));
}

# table=home

##################################################
#
#
if ($r->method() eq "GET") {

	if ($form->{'table'} eq "") {

		my $qry = qq(select distinct select_0 from content_data where  site_id=1 and form_id=48 and moderation_status=3 and date_0 <= NOW() );
		my %tables = $dbh->queryDB($qry,'select_0');

		print qq(
[
);
		my @list=();
		foreach my $table (sort { $a cmp $b } keys %tables) {
			push @list,"\t\"$table\"";
		}

		print join(",\n",@list) . qq(
]
);



	} elsif ($form->{'table'} ne "") {

		my $qry = "";

		my $ckb = "checkbox_1";
		if ($form->{'table'} eq "intro") {
			$ckb = "checkbox_0";
		}

		my $t = new Benchmark::Timer;

		$form->{'num_cards'} = 15; # if ($form->{'num_cards'} eq "");
		$form->{'w'} = 900 if ($form->{'w'} eq "" || $form->{'w'} < 900);
		$form->{'h'} = 400 if ($form->{'h'} eq "" || $form->{'h'} < 400);
		$form->{'max'} = 20 if ($form->{'max'} eq "");

		# get cards
		if ($form->{'table'} eq 'home') {
			$qry = qq( 
				SELECT
					content_id,
					enc_content_id,
					textfield_0                                                                                            AS title,
					select_0                                                                                               AS category,
					checkbox_4                                                                                             AS protected, 
					image_1_width                                                                                          AS rotated_width, 
					image_1_height                                                                                         AS rotated_height,
					image_2_width                                                                                          AS zdegree_width,
					image_2_height                                                                                         AS zdegree_height, 
					CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/index.html")           AS page_loc,
					CONCAT(clients.website.server_docroot, clients.website.publish_docroot,"/",human_dir,"/orig/",image_1) AS publish_loc, 
					CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/orig/",image_1)     AS rotated_image, 
					CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/orig/",image_2)        AS zdegree_image 
				FROM
					content_data,
					clients.website 
				 WHERE
					clients.website.site_id = content_data.site_id   AND
					content_data.site_id    = 1                      AND
					form_id                 = 48                     AND
					moderation_status      >= 3                      AND
					date_0                 <= NOW()                  AND
					checkbox_0              = "Yes"                  AND
					$ckb                    = "Yes"                  AND
					checkbox_2             != "Yes"                  AND
					!(textfield_5 is NULL or textfield_5 = "")
				ORDER BY
					last_modified_date
				LIMIT
					$form->{'num_cards'}
			);
		} else {
			#$qry = qq( select content_id,enc_content_id,textfield_0 as title, select_0 as category, image_1_height as rotated_height, image_2_width as zdegree_width, image_2_height as zdegree_height, CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/index.html") as page_loc , CONCAT(clients.website.server_docroot, clients.website.publish_docroot,"/",human_dir,"/orig/",image_1) as publish_loc, CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/orig/",image_1) as rotated_image, CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/orig/",image_2) as zdegree_image from content_data,clients.website where clients.website.site_id=content_data.site_id and content_data.site_id=1 and form_id=48 and moderation_status >=3 and date_0 <= NOW() and select_0="$form->{'table'}" and $ckb="Yes" and !(textfield_5 is NULL or textfield_5 = "") and checkbox_2 != "Yes" order by last_modified_date limit $form->{'num_cards'}) ;

			$qry = qq( 
				SELECT 
					content_id,
					enc_content_id,
					textfield_0                                                                                            AS title, 
					select_0                                                                                               AS category, 
					checkbox_4                                                                                             AS protected, 
					image_1_width                                                                                          AS rotated_width, 
					image_1_height                                                                                         AS rotated_height, 
					image_2_width                                                                                          AS zdegree_width, 
					image_2_height                                                                                         AS zdegree_height, 
					CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/index.html")           AS page_loc, 
					CONCAT(clients.website.server_docroot, clients.website.publish_docroot,"/",human_dir,"/orig/",image_1) AS publish_loc, 
					CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/orig/",image_1)     AS rotated_image, 
					CONCAT(clients.website.site_url,clients.website.publish_docroot,"/",human_dir,"/orig/",image_2)        AS zdegree_image 
				FROM 
					content_data,
					clients.website 
				WHERE 
					clients.website.site_id = content_data.site_id   AND
					content_data.site_id    = 1                      AND
					form_id                 = 48                     AND
					moderation_status      >= 3                      AND
					date_0                 <= NOW()                  AND
					select_0                = "$form->{'table'}"     AND
					$ckb                    = "Yes"                  AND
					checkbox_2             != "Yes"                  AND
					!(textfield_5 IS NULL OR textfield_5 = "")
				ORDER BY 
					last_modified_date 
				LIMIT
					$form->{'num_cards'}
			);

		}

		my %res = $dbh->queryRawDB($qry);

		my @master_v = new Bit::Vector($form->{'w'},$form->{'h'});
		my ($hei,$wid);
		my @rowM=();

		my $back_image;
		if ($form->{'gen'} ne "") {
			$back_image = Image::Magick->new(size=>"$form->{'w'} x $form->{'h'}");
			$back_image->ReadImage('xc:white');
		}

		my ($idx,$x,$y);

		print qq( [ \n);
		my $iter = 0;
		foreach $idx (sort {$a <=> $b} keys %res) {
		
			my $protected = ($res{$idx}{'protected'} eq 'Yes') ? 'true' : 'false';
		
			($x,$y,$back_image) = &place_data(\@master_v,$form->{'w'},$form->{'h'},$res{$idx}{'zdegree_image'},$res{$idx}{'rotated_image'},$res{$idx}{'rotated_width'},$res{$idx}{'rotated_height'},$res{$idx}{'publish_loc'},$back_image,$form->{'gen'},$form->{'max'});

			print qq(\t{
		"cid"       : "$res{$idx}{'enc_content_id'}",
		"title"     : "$res{$idx}{'title'}",
		"category"  : "$res{$idx}{'category'}",
		"locked"    : $protected,
		"x"         : "$x",
		"y"         : "$y",
		"chip"      : "$res{$idx}{'rotated_image'}"
	});
	print ",\n" if (++$iter != keys(%res));
	}
		print qq( \n ]);
	
		if ($form->{'gen'} ne "") {
			$back_image->Write("/usr/web/designer/docroot/test.png");	
		}

	}

}

#$tt->stop('all');
#print $tt->report() ." <br>";
#print qq(<img src="/test.png">) if ($form->{'gen'});

###########################################
# 

sub place_data {

	my $master_v = shift;
	my $page_width = shift;
	my $page_height = shift;
	my $image_data_zdegree_image = shift;
	my $image_data_rotated_image = shift;
	my $image_data_rotated_width = shift;
	my $image_data_rotated_height = shift;
	my $image_data_publish_loc = shift;
	my $back_image = shift;
	my $gen_image = shift;
	my $max_collide = shift;

	my $done = 0;
	my $attempts = 0;
	
        my $t = new Benchmark::Timer;

	my ($max_x,$max_y,$xpos,$ypos,$vector,$sdone,$start,$attempts,$sattempts,$min,$max,$collisions,$xrand,$yrand );

	while ((!$done) && $attempts < 500) {

		$xrand = int(rand($page_width-20-$image_data_rotated_width)+10);
		$yrand = int(rand($page_height-20-$image_data_rotated_height)+10);

		my $max_collide = int($image_data_rotated_width*$image_data_rotated_height*($max_collide/100));

		$max_x = $xrand+$image_data_rotated_width;
		$max_y = $yrand+$image_data_rotated_height;

        	$t->start('3.1');

        	$collisions = 0;

        	for ($ypos = $yrand;$ypos <= $max_y; $ypos++) {
                	$vector = @{$master_v}->[$ypos];

                	$sdone=0;
                	$start = $xrand;
                	$sattempts = 0;

                	while (!$sdone && $sattempts++ < 20) {
                        	($min,$max) = $vector->Interval_Scan_inc($start);

                        	if ($max+1 >= $page_width) {
                                	$sdone=1;
                        	}

                        	if ($min < $max_x && $max) {
                                	if ($max > $max_x || $max+1 >= $page_width) {
                                        	$collisions += $max_x - $min;
	                                        $sdone = 1;
					} else {
                                        	$collisions += $max - $min;
                                        	$start = $max+1;
                               		}

                        	} elsif ($min > $max_x || !$max || !$min) {
                                	$sdone=1;
                        	}
                	}
        	}

	        #$t->stop('3.1');
        	#print $t->report() . "<br>";


		if ($collisions < $max_collide) {

			# place image in master array

			my ($xpos,$ypos);
			my $max_x = $xrand+$image_data_rotated_width;
			my $max_y = $yrand+$image_data_rotated_height;	

			#$t->start('5.1');

			my $vector;	
			for ($ypos = $yrand;$ypos <= $max_y; $ypos++) {
				$vector = @{$master_v}->[$ypos];
				$vector->Interval_Fill($xrand,$max_x);
			}

			#$t->stop('5.1');
                        #print $t->report() . "<br>";

			$done = 1;
	
			if ($gen_image) {
	                	my $card_image = Image::Magick->new();
				$card_image->Read($image_data_publish_loc);
				$back_image->Composite(image=>$card_image, x=>$xrand,y=>$yrand);
			}

		} else {

			$attempts++;
		}
	}

	#print "ATTEMPTS: $attempts <br>";

	if ($attempts >= 499) {
		#print "UNABLE TO PLACE IMAGE <br>";
	}


	return ($xrand,$yrand,$back_image);
}

##################################################
#

sub check_collisions {

	my $master_v = shift;
	my $width = shift;
	my $height = shift;
	my $xrand = shift;
	my $yrand = shift;
	my $max_collide = shift;
	my $page_width = shift;


	my $t = new Benchmark::Timer;

	my $max_x = $xrand+$width;
	my $max_y = $yrand+$height;

	#$t->start('3.1');

	my $btot = 0;

	my ($xpos,$ypos,$vector,$sdone,$start,$attempts,$min,$max);

        for ($ypos = $yrand;$ypos <= $max_y; $ypos++) {
		$vector = @{$master_v}->[$ypos];

		$sdone=0;
		$start = $xrand;
		$attempts = 0;

		while (!$sdone && $attempts++ < 20) {	
			($min,$max) = $vector->Interval_Scan_inc($start);

			if ($max+1 >= $page_width) {
				$sdone=1;
			}

			if ($min < $max_x && $max) {
				if ($max > $max_x || $max+1 >= $page_width) {
					$btot += $max_x - $min;
					$sdone = 1;
				} else { 
					$btot += $max - $min;
					$start = $max+1;
				}

			} elsif ($min > $max_x || !$max || !$min) {
				$sdone=1;
			}
		}
        }

        #$t->stop('3.1');
        #print $t->report() . "<br>";

	return $btot;

}

