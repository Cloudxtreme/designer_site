/*
 * Material Experience - Santoprene Material Experience Namespace
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * 
 * The Santoprene Materials Experience Namespace holds all non-generic data 
 * and methods governing the working of this application.
 * 
 * There may be a lot of things set here that are used at runtime but I 
 * explicitly define them in the SME namespace so other developers can see 
 * exactly what is contained here. There are also some dynamically defined 
 * variables based on the current querystring.
 */

var SME = 
{
	/*
	 * Release version of the site. This has nothing to do with the SVN 
	 * version of the site. This is not used right now but should be 
	 * incremented with each production release of the site.
	 */
	releaseVersion: '1.2.2',
	
	/*
	 * The color table exists to provide aliases to the colors used in the 
	 * interface. This will make it much easier to change at a later date 
	 * should that ever be required. The color table should be used only 
	 * for default values.
	 */
	colors: 
	{
		blue   : 'rgb(100, 129, 145)',
		brown  : 'rgb(100, 065, 040)',
		green  : 'rgb(100, 150, 040)',
		grey   : 'rgb(100, 100, 100)',
		orange : 'rgb(225, 125, 010)',
		red    : 'rgb(150, 035, 020)'
	},

	/*
	 * The sizes table governs the size of the user interface elements. 
	 * This exists for much the same reason as the color table, to provide 
	 * an easy way to change sizes later. Note that the rest of the styles 
	 * in the interface should be set relatively so changing these 
	 * parameters should not destroy the interface.
	 */
	sizes: 
	{
		card      : { height: 520, width: 925  }, // Card Size
		innerCard : { height: 481, width: 914  }, // Inside Size of Card
		chipMax   : { height: 180, width: 143  }, // Maximum Chip Size
		windMin   : { height: 589, width: 1020 }  // Minimum Window Size
	},
	
	// URLs Used by the Application
	url: 
	{
		tableList    : 'data/card_tables.js',
		perisitChips : 'data/persist_chip.js', 
		loginScreen  : 'http://' + window.location.hostname + '/cgi-bin/login.pl',
		sketchBook   : 'http://' + window.location.hostname + '/cgi-bin/sketchbook.pl',
		sketchBookIN : 'http://' + window.location.hostname + '/cgi-bin/sketchbook.pl?interactive=false',
		manageAccount: 'http://www.santoprene.com/cgi-bin/protected/register/account.pl?template=designer_',
		introCards   : 'http://' + window.location.hostname + '/cgi-bin/sop_proxy.pl?site=http://www.santoprene.com/cms/designer_json/224fa06db73ece8a/index.html',
		cards        : new Template('http://' + window.location.hostname + '/cgi-bin/sop_proxy.pl?site=http://www.santoprene.com/cms/designer_card/#{card}/index.html'),
		sendToFriend : new Template('http://www.santoprene.com/cgi-bin/send_page/send.pl?tmpl=designer&title=#{title}&durl=#{durl}'),
		cardTables   : new Template('http://' + window.location.hostname + '/cgi-bin/card_table.pl?table=#{table}&h=#{h}&w=#{w}'),
		chipResolver : new Template('http://' + window.location.hostname + '/cgi-bin/sketchbook_resolver.pl?card=#{card}'),
		cardPreview  : new Template('http://' + window.location.hostname + '/cgi-bin/sop_preview_proxy.pl?site=http://admin.santoprene.com/cgi-bin/content/display_content.pl?form_id=48&content_id=#{card}&site_id=1'),
		
		// Debugging and Development URLS (removed by build system)
/*;;;*/		chipResolver : new Template('http://' + window.location.hostname + '/cgi-bin/sop_proxy.pl?site=http://materialexperience.santoprene.com/cgi-bin/sketchbook_resolver.pl?card=#{card}'),
/*;;;*/		cardTables   : new Template('http://' + window.location.hostname + '/cgi-bin/sop_proxy.pl?site=http://materialexperience.santoprene.com/cgi-bin/card_table.pl?table=#{table}&h=#{h}&w=#{w}'),
		// END Debugging and Development URLS

		// Dummy item terminates the list since the items above are 
		// removed by the build system and the trailing comma would
		// break in IE. Don't Remove this!
		dontRemove: null 
	},
	
	/* 
	 * Compose layout name to layout engine mapping. Allows us to add more 
	 * layout engines later a lot simpler than the previous method allowed.
	 */
	engineMapping : 
	{
		'narrow-left'  : Card.Layout.Primary,
		'narrow-right' : Card.Layout.Primary,
		'special'      : Card.Layout.Special,
		'intro'        : Card.Layout.Primary,
		'custom-menu'  : Card.Layout.Custom
	},
	
	/*
	 * When the page is called with a query string of debug then you will 
	 * be able to open a firebug console and view debugging messages. Also
	 * checks to make sure console.log() is actually defined to avoid 
	 * throwing errors on browsers w/out firebug.
	 */
	debug: /debug=.*(true)/.test(window.location.search) && !!(console.log),
	
	/*
	 * Skip the intro card because it wastes time during development.
	 */
	skipIntro: /.*intro=false.*/.test(window.location.search),
	
	/*
	 *
	 *		RUNTIME VARIABLES SECTION
	 *
	 * These are variables set at runtime but declared explicitly here
	 * so other developers can have a clear picture of what is in this
	 * namespace. 
	 *
	 * If you set a variable in this namespace at runtime please declare
	 * it explicitly here.
	 *
	 */
	
	// Array of all loaded tables.
	tables: [],
	
	// AJAX information bezel.
	AJAXBezel: null,

	// Currently active card table.
	currentTable: null,
	
	// Sketchbook.
	sketchbook: null,

	// History manager.
	history: null,

	// Card currently being displayed.
	currentCard: null
};
