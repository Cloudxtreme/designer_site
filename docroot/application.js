/*
 * Material Experience - Development Loader
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * 
 * Loads the designer site in the development environment,
 * this facilitates us having multiple class files. This
 * file is pre-processed by the build system to pull
 * out include files for building into the final site.
 * 
 * Thus, the require statements are magic :-)
 */

var DesignerSite = 
{
	Version: "$Revision$".match(/[0-9]+/),
	
	require: function(libraryName) 
	{
		document.write('<script type="text/javascript" src="' + libraryName + '"></script>');
	},
	
	load: function() 
	{
		// Prototype Stuff
		this.require("lib/prototype.js");

		// Script.aculo.us Stuff
		this.require("lib/scriptaculous/scriptaculous.js");
		this.require("lib/scriptaculous/effects.js");
		this.require("lib/scriptaculous/builder.js");
		this.require("lib/scriptaculous/dragdrop.js");
		this.require("lib/scriptaculous/slider.js");

		// Other 3rd Party Libraries
		this.require("lib/swfobject/swfobject.js");
		this.require("classes/decoder.module.js");
	
		// Application Code
		this.require("classes/utility.js");
		this.require("classes/chip.class.js");
		this.require("classes/cookie.class.js");
		this.require("classes/card.class.js");
		this.require("classes/bezel.class.js");
		this.require("classes/overlay.class.js");
		this.require("classes/roundcorners.class.js");
		this.require("classes/table.class.js");
		this.require("classes/history.class.js");
		this.require("classes/sketchbook.class.js");
		this.require("classes/application.js");

		// Layout Engines		
		this.require("classes/layout.class.js");
		this.require("classes/layouts/layout.error.class.js");
		this.require("classes/layouts/layout.primary.class.js");
		this.require("classes/layouts/layout.special.class.js");
		this.require("classes/layouts/layout.custom.class.js");
		
		// Namespaces and Data
		this.require("data/strings.en.js");
		this.require("classes/sme.namespace.js");
	}
};

DesignerSite.load();